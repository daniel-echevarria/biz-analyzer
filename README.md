# DataReady

**Turn messy web data into AI-ready structured data.**

DataReady is a minimal full-stack prototype that takes any business URL, scrapes its content, and uses AI to extract clean, structured information — ready to feed into a database, CRM, or AI pipeline.

Built as a rapid MVP to demonstrate product thinking around a real problem: unstructured web data is everywhere, but almost none of it is directly usable by AI systems.

---

## What it does

1. Fetches the raw HTML of any business URL
2. Strips noise (scripts, styles, boilerplate) using Cheerio
3. Sends the extracted text to GPT-4o-mini
4. Returns structured JSON: business name, description, category, and tags
5. Shows a before/after split view with an AI Readiness Score

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Scraping | Cheerio |
| AI | OpenAI GPT-4o-mini |
| Deployment | Vercel |

---

## Getting started

```bash
pnpm install
```

Create a `.env.local` file:

```
OPENAI_API_KEY=your-key-here
```

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## API

### `POST /api/analyze`

**Body**
```json
{ "url": "https://example.com" }
```

**Response**
```json
{
  "structured": {
    "business_name": "Example Co",
    "description": "Example Co provides...",
    "category": "SaaS",
    "tags": ["saas", "productivity", "b2b"]
  },
  "rawText": "Skip to content Example Co...",
  "rawScore": 28,
  "structuredScore": 84
}
```

---

## Known limitations

- **JS-rendered SPAs** (e.g. Airbnb, React-heavy sites) return very little scraped text — a headless browser like Playwright would be needed for those
- **AI fallback on prior knowledge** — when scraped text is thin, GPT may fill in gaps from training data rather than the actual page content
- **AI Readiness Score** is heuristic-based, not a formal metric — it rewards text quality signals (vocabulary diversity, sentence structure) and penalises noise
- **No caching** — the same URL analyzed twice costs two API calls
- **No rate limiting** — the API route is open; not suitable for production without auth
- **Bot protection** — sites with Cloudflare or aggressive rate limiting will fail to scrape

---

## What's next

- Playwright scraper for JS-heavy sites
- Prompt grounding to prevent AI from using prior knowledge instead of scraped content
- Batch URL processing (paste a list, get a CSV)
- Confidence scores per extracted field
- Caching layer (Redis or edge KV)
