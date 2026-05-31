# GM Research Suite — Data & AI Integrations

## Live API connections (no key required unless noted)

| Source | Feature |
|--------|---------|
| **Semantic Scholar** | Papers, citations, related studies (`SEMANTIC_SCHOLAR_API_KEY` optional) |
| **OpenAlex** | Researchers, institutions, publications |
| **Crossref** | DOI lookup, citation verification |
| **PubMed** | Medical & health research |
| **arXiv** | IT, AI, math, engineering preprints |
| **World Bank Open Data** | Development indicators |
| **OpenAI (ChatGPT)** | Writing, tutor (`OPENAI_API_KEY`) |
| **Google Gemini** | Alternative AI (`GEMINI_API_KEY`) |
| **Grok (xAI)** | Alternative AI (`XAI_API_KEY`) |

## Browser links (no public API)

These open official search in a new tab from **Literature Review**:

- Google Scholar
- CORE
- UN Data, WHO, UNICEF, ILO
- Namibia Statistics Agency, Bank of Namibia, MOHSS, NUST, UNAM

> **Google Scholar** has no official API. Use **OpenAlex** + **Semantic Scholar** for automated results.

## Vercel environment variables

Add in Vercel → Environment Variables:

```env
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...          # optional — https://ai.google.dev
XAI_API_KEY=...             # optional — https://console.x.ai
SEMANTIC_SCHOLAR_API_KEY=   # optional — higher rate limits
```

Redeploy after adding keys.

## Where to use in the app

- **Literature Review** (`/student/literature` or `/analysis/literature`) — multi-source search
- **Citations** — Crossref DOI verify
- **Writing / Tutor** — OpenAI (Gemini/Grok when configured)
