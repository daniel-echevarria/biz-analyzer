import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';

const client = new OpenAI();

function scoreRawText(text: string): number {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  const unique = new Set(words).size;
  const uniqueRatio = words.length > 0 ? unique / words.length : 0;
  const alphaRatio = text.length > 0
    ? (text.match(/[a-zA-Z]/g) ?? []).length / text.length
    : 0;

  // Raw text is inherently unstructured — cap at 45
  // Start low and only reward signal quality
  let score = 5;
  // Has meaningful length
  if (text.length > 300) score += 5;
  if (text.length > 1500) score += 5;
  // Good alpha ratio (not symbol/number soup)
  if (alphaRatio > 0.65) score += 8;
  else if (alphaRatio > 0.5) score += 4;
  // Vocabulary diversity (low = nav dump / repeated boilerplate)
  if (uniqueRatio > 0.55) score += 8;
  else if (uniqueRatio > 0.4) score += 4;
  else score -= 5;
  // Sentence structure signal: presence of punctuation
  const sentenceEnds = (text.match(/[.!?]/g) ?? []).length;
  if (sentenceEnds > 10) score += 7;
  else if (sentenceEnds > 3) score += 3;
  // No clear structure: no headings-like patterns, no labels
  score -= 8; // raw text always lacks structure by definition

  return Math.max(8, Math.min(45, Math.round(score)));
}

function scoreStructured(data: Record<string, unknown>): number {
  // Start from 55 — structuring always adds value over raw
  let score = 55;

  const name = typeof data.business_name === 'string' ? data.business_name : '';
  const desc = typeof data.description === 'string' ? data.description : '';
  const category = typeof data.category === 'string' ? data.category : '';
  const tags = Array.isArray(data.tags) ? data.tags : [];

  // Business name quality
  if (name.length > 2) score += 5;
  if (name.split(' ').length <= 5) score += 3; // concise

  // Description quality
  if (desc.length > 80) score += 6;
  if (desc.length > 150) score += 4;
  const sentences = desc.split(/[.!?]/).filter((s) => s.trim().length > 0);
  if (sentences.length >= 2) score += 4;

  // Category specificity
  if (category.length > 3) score += 4;

  // Tag quality
  if (tags.length >= 3) score += 5;
  if (tags.length >= 5) score += 3;
  const avgTagLength = tags.length > 0
    ? tags.reduce((s: number, t: unknown) => s + (typeof t === 'string' ? t.length : 0), 0) / tags.length
    : 0;
  if (avgTagLength >= 4) score += 3; // not single-letter tags

  return Math.max(55, Math.min(96, Math.round(score)));
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    let html: string;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BizAnalyzer/1.0)' },
        signal: AbortSignal.timeout(8000),
      });
      html = await res.text();
    } catch {
      return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 422 });
    }

    const $ = cheerio.load(html);
    $('script, style, noscript').remove();

    // Raw display text: preserve messy whitespace so the "before" panel looks real
    const rawDisplay = $('body').text().replace(/\t/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, 3500);

    // Clean text for AI: collapsed whitespace, tighter
    const forAI = rawDisplay.replace(/\s+/g, ' ').trim().slice(0, 4000);

    if (!forAI) {
      return NextResponse.json({ error: 'No readable content found' }, { status: 422 });
    }

    const rawScore = scoreRawText(forAI);

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are a data extraction assistant. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: `Extract business information from the following website text and return a JSON object with these fields:
- business_name: string
- description: string (2-3 sentence clean summary of what the business does)
- category: string (e.g. "E-commerce", "SaaS", "Restaurant", "Consulting")
- tags: string[] (3-6 relevant keywords)

Website text:
${forAI}`,
        },
      ],
    });

    const raw = response.choices[0].message.content ?? '';

    try {
      const structured = JSON.parse(raw);
      const structuredScore = scoreStructured(structured);
      return NextResponse.json({
        structured,
        rawText: rawDisplay,
        rawScore,
        structuredScore,
      });
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response', raw }, { status: 500 });
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('[analyze] unhandled error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
