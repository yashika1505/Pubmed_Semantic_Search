from typing import List, Optional, Dict, Any, Tuple
import os
import time
import logging
import requests
import xml.etree.ElementTree as ET
from functools import lru_cache

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:
    from sentence_transformers import SentenceTransformer
except Exception:
    SentenceTransformer = None  # type: ignore

try:
    import numpy as np
except Exception:
    np = None  # type: ignore

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pubmed-backend")

EUTILS_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

# ----------------------- MODELS -----------------------
class SearchRequest(BaseModel):
    query: str
    mode: str = Field("semantic", pattern="^(semantic|broad|exactTitle)$")
    use_mesh: bool = True
    max_results: int = 25
    retmax: int = 200

class ArticleRecord(BaseModel):
    title: str
    authors: str
    journal: Optional[str] = None
    year: Optional[int] = None
    abstract: Optional[str] = None
    mesh_terms: List[str] = []
    pmid: Optional[str] = None
    doi: Optional[str] = None
    pmcid: Optional[str] = None
    url_pubmed: Optional[str] = None
    url_full_text: Optional[str] = None

class ScoredRecord(BaseModel):
    score: float
    record: ArticleRecord

class SearchResponse(BaseModel):
    results_range: str
    total_results: int
    results: List[ScoredRecord]

# ----------------------- APP -----------------------
app = FastAPI(title="PubMed Semantic Search Backend", version="1.0.0")

frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin, "http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_model: Optional[SentenceTransformer] = None

def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        if SentenceTransformer is None:
            raise HTTPException(status_code=500, detail="sentence-transformers not installed")
        logger.info("Loading sentence-transformers model: all-mpnet-base-v2 ...")
        _model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")
    return _model

@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}

# ----------------------- PUBMED FUNCTIONS -----------------------
@lru_cache(maxsize=256)
def _resolve_mesh_descriptor(query: str) -> Optional[str]:
    """Resolve a free-text query to a MeSH descriptor using the MeSH database.

    Returns the canonical MeSH DescriptorName (e.g., 'Neoplasms' for 'cancer') if found.
    """
    try:
        # First find a MeSH record id matching the query
        esearch_params = {
            "db": "mesh",
            "term": query,
            "retmax": 1,
            "retmode": "json",
        }
        es_resp = requests.get(f"{EUTILS_BASE}/esearch.fcgi", params=esearch_params, timeout=20)
        es_resp.raise_for_status()
        idlist = es_resp.json().get("esearchresult", {}).get("idlist", [])
        if not idlist:
            return None

        mesh_id = idlist[0]
        # Fetch the MeSH record to get the DescriptorName
        efetch_params = {
            "db": "mesh",
            "id": mesh_id,
            "retmode": "xml",
        }
        ef_resp = requests.get(f"{EUTILS_BASE}/efetch.fcgi", params=efetch_params, timeout=20)
        ef_resp.raise_for_status()
        root = ET.fromstring(ef_resp.text)

        # Try modern MeSH XML path first, then a fallback
        # Common paths: DescriptorRecord/DescriptorName/String or DescriptorName
        name_el = root.find(".//DescriptorRecord/DescriptorName/String")
        if name_el is None:
            name_el = root.find(".//DescriptorName")
        mesh_term = (name_el.text or "").strip() if name_el is not None else ""
        return mesh_term or None
    except Exception:
        # Fail quietly; query expansion is best-effort
        return None


def _build_expanded_query(original_query: str) -> Tuple[str, Optional[str]]:
    """Build a PubMed search query expanded with MeSH descriptor when available.

    Returns a tuple of (expanded_query, mesh_descriptor_used).
    """
    mesh_descriptor = _resolve_mesh_descriptor(original_query)
    base = f"{original_query}[Title/Abstract]"
    if mesh_descriptor:
        return f"{base} OR {mesh_descriptor}[MeSH Terms]", mesh_descriptor
    return base, None


def esearch_pubmed(query: str, retmax: int) -> Tuple[List[str], int]:
    """Fetch PubMed IDs in batches with automatic MeSH-expanded query.

    Returns (ids, total_count) where total_count is the total number of results for the query.
    """
    # Ensure we always fetch at least 200 to have enough candidates for ranking
    target = max(200, retmax)
    all_ids = []
    retstart = 0
    expanded_query, _ = _build_expanded_query(query)
    total_count = 0

    while len(all_ids) < retmax:
        params = {
            "db": "pubmed",
            "term": expanded_query,
            "retmax": min(100, target - len(all_ids)),  # fetch in batches
            "retstart": retstart,
            "retmode": "json",
        }
        resp = requests.get(f"{EUTILS_BASE}/esearch.fcgi", params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json().get("esearchresult", {})
        if not total_count:
            try:
                total_count = int(data.get("count", "0"))
            except Exception:
                total_count = 0
        ids = data.get("idlist", [])
        if not ids:
            break
        all_ids.extend(ids)
        retstart += len(ids)
        if len(ids) < params["retmax"]:
            break  # no more results
    return all_ids[:target], total_count

def parse_authors(article_el: ET.Element) -> str:
    authors: List[str] = []
    for author in article_el.findall(".//AuthorList/Author"):
        last = author.findtext("LastName") or ""
        fore = author.findtext("ForeName") or ""
        collective = author.findtext("CollectiveName")
        if collective:
            authors.append(collective)
        else:
            name = (fore + " " + last).strip()
            if name:
                authors.append(name)
    return ", ".join(authors)

def parse_mesh_terms(article_el: ET.Element) -> List[str]:
    terms: List[str] = []
    for mh in article_el.findall(".//MeshHeadingList/MeshHeading/DescriptorName"):
        term = (mh.text or "").strip()
        if term:
            terms.append(term)
    return terms

def efetch_pubmed_details(pmids: List[str]) -> List[ArticleRecord]:
    if not pmids:
        return []
    params = {
        "db": "pubmed",
        "id": ",".join(pmids),
        "retmode": "xml",
    }
    try:
        resp = requests.get(f"{EUTILS_BASE}/efetch.fcgi", params=params, timeout=30)
        resp.raise_for_status()
        root = ET.fromstring(resp.text)
    except requests.RequestException as exc:
        logger.exception("EFetch failed: %s", exc)
        raise HTTPException(status_code=502, detail="PubMed EFetch request failed")
    except ET.ParseError as exc:
        logger.exception("EFetch XML parse failed: %s", exc)
        raise HTTPException(status_code=502, detail="Invalid XML from PubMed EFetch")

    records: List[ArticleRecord] = []
    for article in root.findall(".//PubmedArticle"):
        article_meta = article.find(".//Article")
        if article_meta is None:
            continue

        title = article_meta.findtext("ArticleTitle") or ""
        abstract = " ".join(
            [(abst.text or "").strip() for abst in article_meta.findall(".//Abstract/AbstractText") if abst is not None and (abst.text or "").strip()]
        ) or None
        journal = article_meta.findtext(".//Journal/Title")

        year_text = article_meta.findtext(".//Journal/JournalIssue/PubDate/Year")
        if not year_text:
            medline_date = article_meta.findtext(".//Journal/JournalIssue/PubDate/MedlineDate")
            if medline_date:
                year_text = medline_date.split(" ")[0]
        try:
            year = int(year_text) if year_text else None
        except ValueError:
            year = None

        authors = parse_authors(article_meta)
        mesh_terms = parse_mesh_terms(article)

        # Identifiers
        pmid = (article.findtext(".//MedlineCitation/PMID") or "").strip() or None
        doi = None
        pmcid = None
        # Prefer ArticleIdList entries
        for aid in article.findall('.//ArticleIdList/ArticleId'):
            idtype = (aid.get('IdType') or '').lower()
            val = (aid.text or '').strip()
            if idtype == 'doi' and val:
                doi = val
            elif idtype == 'pmc' and val:
                pmcid = val
            elif idtype == 'pubmed' and not pmid and val:
                pmid = val
        # Fallback DOI from ELocationID
        if not doi:
            for el in article_meta.findall('.//ELocationID'):
                if (el.get('EIdType') or '').lower() == 'doi':
                    candidate = (el.text or '').strip()
                    if candidate:
                        doi = candidate
                        break

        # Construct URLs
        url_pubmed = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/" if pmid else None
        url_pmc = f"https://www.ncbi.nlm.nih.gov/pmc/articles/{pmcid}/" if pmcid else None
        url_doi = f"https://doi.org/{doi}" if doi else None
        # Prefer free PMC full text, then DOI, then PubMed page
        url_full_text = url_pmc or url_doi or url_pubmed

        records.append(
            ArticleRecord(
                title=title,
                authors=authors,
                journal=journal,
                year=year,
                abstract=abstract,
                mesh_terms=mesh_terms,
                pmid=pmid,
                doi=doi,
                pmcid=pmcid,
                url_pubmed=url_pubmed,
                url_full_text=url_full_text,
            )
        )

    return records

# ----------------------- SEMANTIC RANKING -----------------------
def cosine_similarity(a: Any, b: Any) -> float:
    if np is None:
        raise HTTPException(status_code=500, detail="numpy not installed")
    a = np.asarray(a)
    b = np.asarray(b)
    denom = (np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)

def rank_records_semantically(query: str, records: List[ArticleRecord], use_mesh: bool, query_mesh_descriptor: Optional[str]) -> List[ScoredRecord]:
    if not records:
        return []
    model = get_model()

    doc_texts = []
    for r in records:
        parts = [r.title or "", r.abstract or ""]
        if use_mesh and r.mesh_terms:
            parts.append(" ".join(r.mesh_terms))
        doc_texts.append(". ".join([p for p in parts if p]))

    query_emb = model.encode([query], normalize_embeddings=True)[0]
    doc_embs = model.encode(doc_texts, normalize_embeddings=True)

    scored: List[ScoredRecord] = []
    query_lower = query.lower()
    for r, emb in zip(records, doc_embs):
        score = cosine_similarity(query_emb, emb)
        # MeSH boost: add significant boost if record contains the resolved MeSH descriptor
        if use_mesh and r.mesh_terms and query_mesh_descriptor:
            qmd = query_mesh_descriptor.strip().lower()
            if any((term or "").strip().lower() == qmd for term in r.mesh_terms):
                score += 0.3
        scored.append(ScoredRecord(score=max(0.0, min(1.0, score)), record=r))

    scored.sort(key=lambda x: x.score, reverse=True)
    return scored

def filter_by_mode(query: str, records: List[ArticleRecord], mode: str) -> List[ArticleRecord]:
    if mode == "broad":
        return records
    if mode == "exactTitle":
        q = query.strip().lower()
        return [r for r in records if r.title and r.title.strip().lower() == q]
    return records

# ----------------------- API ROUTES -----------------------
@app.post("/search", response_model=SearchResponse)
def search(req: SearchRequest) -> SearchResponse:
    start = time.time()
    if not req.query.strip():
        return []

    # ESearch: fetch IDs (with MeSH-expanded query)
    pmids, total_count = esearch_pubmed(req.query, req.retmax)
    if not pmids:
        return SearchResponse(results_range="0-0", total_results=0, results=[])

    # EFetch: fetch article details
    records = efetch_pubmed_details(pmids)
    records = filter_by_mode(req.query, records, req.mode)
    if not records:
        return SearchResponse(results_range="0-0", total_results=total_count, results=[])

    # Semantic ranking or basic scoring
    if req.mode == "semantic":
        # Use the same MeSH expansion logic to obtain the descriptor for boosting
        _, mesh_descriptor = _build_expanded_query(req.query)
        scored = rank_records_semantically(req.query, records, req.use_mesh, mesh_descriptor)
    else:
        scored = [ScoredRecord(score=0.5, record=r) for r in records]

    results = scored[: max(0, req.max_results)]
    elapsed = (time.time() - start) * 1000.0
    # Compute results range as 1-based index for this batch
    start_idx = 1 if results else 0
    end_idx = len(results)
    results_range = f"{start_idx}-{end_idx}"
    logger.info("Search completed: %d results in %.1f ms (total=%d)", len(results), elapsed, total_count)
    return SearchResponse(results_range=results_range, total_results=total_count, results=results)
