import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaMicroscope, FaHome, FaFilter, FaSort, FaBookOpen, FaDownload, FaHeart, FaExternalLinkAlt, FaSpinner } from 'react-icons/fa';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('semantic');
  const [useMesh, setUseMesh] = useState(true);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [filters, setFilters] = useState({
    year: '',
    journal: '',
    sortBy: 'relevance'
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const resp = await fetch('http://localhost:8000/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: searchQuery,
          mode: mode,
          use_mesh: useMesh,
          max_results: 25,
          retmax: 200
        })
      });

      if (!resp.ok) {
        console.error('Search failed', resp.status);
        setSearchResults([]);
      } else {
        const data = await resp.json();
        // Support both old (array) and new (object with results) shapes
        const list = Array.isArray(data) ? data : (data?.results || []);
        // Map backend response to UI
        const mapped = (list || []).map((item, idx) => ({
          id: idx + 1,
          title: item.record?.title || '',
          authors: item.record?.authors || '',
          journal: item.record?.journal || '',
          year: item.record?.year || '',
          abstract: item.record?.abstract || '',
          relevanceScore: item.score || 0,
          mesh_terms: item.record?.mesh_terms || [],
          url_full_text: item.record?.url_full_text || null,
          url_pubmed: item.record?.url_pubmed || null
        }));
        setSearchResults(mapped);
        // Store meta (optional): attach to window for now to avoid state sprawl
        window.__searchMeta = {
          total_results: data?.total_results,
          results_range: data?.results_range,
        };
      }
    } catch (err) {
      console.error('Network error', err);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl group-hover:scale-105 transition-transform duration-200">
                <FaMicroscope className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PubMed Semantic
                </h1>
                <p className="text-sm text-gray-600">Advanced Research Search</p>
              </div>
            </Link>
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
            >
              <FaHome />
              <span>Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="card p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Semantic Research Search
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover relevant biomedical literature using AI-powered semantic understanding. 
              Our advanced search goes beyond keywords to understand meaning and context.
            </p>
          </div>
          
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="relative">
              <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-3">
                Research Query
              </label>
              <div className="relative">
                {/* <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" /> */}
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter your research question (e.g., 'machine learning applications in cancer diagnosis')"
                  className="input-modern pl-12 pr-4 py-4 text-lg"
                  required
                />
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaFilter className="inline mr-2" />
                  Publication Year
                </label>
                <select 
                  value={filters.year}
                  onChange={(e) => setFilters({...filters, year: e.target.value})}
                  className="input-modern"
                >
                  <option value="">Any Year</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  <option value="2020">2020</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Journal Type
                </label>
                <select 
                  value={filters.journal}
                  onChange={(e) => setFilters({...filters, journal: e.target.value})}
                  className="input-modern"
                >
                  <option value="">Any Journal</option>
                  <option value="nature">Nature</option>
                  <option value="science">Science</option>
                  <option value="cell">Cell</option>
                  <option value="lancet">The Lancet</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaSort className="inline mr-2" />
                  Sort By
                </label>
                <select 
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                  className="input-modern"
                >
                  <option value="relevance">Relevance</option>
                  <option value="date">Publication Date</option>
                  <option value="citations">Citations</option>
                  <option value="journal">Journal Impact</option>
                </select>
              </div>
            </div>

            {/* Search Mode and MeSH */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search Mode
                </label>
                <select 
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="input-modern"
                >
                  <option value="semantic">Semantic</option>
                  <option value="broad">Broad</option>
                  <option value="exactTitle">Exact Title</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="inline-flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    className="form-checkbox h-5 w-5 text-blue-600" 
                    checked={useMesh} 
                    onChange={(e) => setUseMesh(e.target.checked)}
                  />
                  <span className="text-sm font-semibold text-gray-700">Use MeSH boost</span>
                </label>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary text-lg py-4 rounded-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <FaSearch />
                  <span>Search Literature</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">
                Search Results
              </h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {window.__searchMeta?.total_results ?? searchResults.length} papers found
                  {window.__searchMeta?.results_range ? ` (showing ${window.__searchMeta.results_range})` : ''}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
                    <option>Relevance</option>
                    <option>Date</option>
                    <option>Citations</option>
                  </select>
                </div>
              </div>
            </div>
            
            {searchResults.map((result, index) => (
              <div key={result.id} className="card p-8 hover:shadow-xl transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                      {result.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span className="font-medium">Authors:</span>
                      <span>{result.authors}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span className="font-medium">Journal:</span>
                      <span className="font-semibold text-blue-600">{result.journal}</span>
                      <span>({result.year})</span>
                      <span className="text-gray-500">•</span>
                      <span>{result.citations} citations</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
                      {Math.round(result.relevanceScore * 100)}% match
                    </span>
                  {result.mesh_terms && result.mesh_terms.length > 0 && (
                    <span className="text-xs text-gray-500">MeSH: {result.mesh_terms.slice(0,4).join(', ')}</span>
                  )}
                  </div>
                </div>
                
                <p
                  className="text-gray-700 leading-relaxed mb-6"
                  style={expandedIds.has(result.id) ? {} : {
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {result.abstract}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        setExpandedIds(prev => {
                          const next = new Set(prev);
                          if (next.has(result.id)) next.delete(result.id); else next.add(result.id);
                          return next;
                        });
                      }}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                    >
                      <FaBookOpen />
                      <span>{expandedIds.has(result.id) ? 'Show Less' : 'Read Full Text'}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200">
                      <FaDownload />
                      <span>Download PDF</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200">
                      <FaHeart />
                      <span>Save to Library</span>
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      if (result.url_pubmed) {
                        window.open(result.url_pubmed, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200 disabled:opacity-50"
                    disabled={!result.url_pubmed}
                  >
                    <FaExternalLinkAlt />
                    <span>View on PubMed</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {searchResults.length === 0 && !isLoading && searchQuery && (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaSearch className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Results Found</h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any papers matching "{searchQuery}". Try adjusting your search terms or filters.
              </p>
              <div className="space-y-3 text-left max-w-md mx-auto">
                <p className="text-sm text-gray-600 font-medium">Search Tips:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Try broader or more specific terms</li>
                  <li>• Use synonyms or related concepts</li>
                  <li>• Check your spelling</li>
                  <li>• Remove filters to expand results</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
              <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Searching Literature</h3>
              <p className="text-gray-600">
                Analyzing your query and finding the most relevant papers...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
