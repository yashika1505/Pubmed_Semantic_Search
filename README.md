# React + Vite

## Backend (FastAPI)

1) Create and activate a virtual environment (optional but recommended).

2) Install dependencies:

```bash
pip install -r requirements.txt
```

3) Run the backend server:

```bash
uvicorn main:app --reload
```

The backend will start at `http://localhost:8000`. Health check at `GET /health`.

Search endpoint: `POST /search`

Request JSON body example:

```json
{
  "query": "cancer immunotherapy",
  "mode": "semantic",
  "use_mesh": true,
  "max_results": 10,
  "retmax": 100
}
```

Response shape:

```json
[
  {
    "score": 0.87,
    "record": {
      "title": "...",
      "authors": "...",
      "journal": "...",
      "year": 2023,
      "abstract": "...",
      "mesh_terms": ["..."]
    }
  }
]
```

Make sure your frontend origin is allowed by CORS. Default allowed origins include `http://localhost:5173`.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
