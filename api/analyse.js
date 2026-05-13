// api/analyse.js
// Vercel serverless function — calls Claude API server side
// Environment variables needed:
//   ANTHROPIC_API_KEY

const SYSTEM_PROMPT = `You are an expert legal document analyst with 20 years of experience reviewing contracts, agreements, and legal documents for individuals and small businesses.

Your job is to analyse the document provided and return a JSON object. You must return ONLY raw valid JSON. No markdown. No code blocks. No backticks. No explanation. No preamble. Just the JSON object starting with { and ending with }.

Use plain English that a 16-year-old can understand. Be honest about risk. Do not soften bad clauses. Do not reassure. Flag anything unusual compared to standard agreements of this type. Never make up information not in the document.

Return exactly this JSON structure with no extra fields:
{
  "document_type": "string identifying the type of document",
  "trust_score": integer from 1 to 10,
  "score_label": "one sentence explaining the score",
  "score_reasoning": "two sentences explaining why this score was given",
  "summary": "two to three sentences summarising what this document says in plain English",
  "red_flags": [{ "title": "string", "explanation": "string", "severity": "high" | "medium" | "low" }],
  "key_points": ["string", "string", "string"],
  "legal_terms": [{ "term": "string", "plain_english": "string" }],
  "missing_clauses": ["string naming something that should be in this document type but is not"],
  "recommendation": "one sentence: sign as-is, negotiate before signing, or do not sign"
}`;

function parseJSON(raw) {
  let text = raw.trim();
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  text = text.replace(/^`|`$/g, '');
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON found in response');
  return JSON.parse(text.slice(start, end + 1));
}

function sanitise(text) {
  return text.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, '');
}

async function callClaude(documentText, strict = false) {
  const systemPrompt = strict
    ? SYSTEM_PROMPT + '\n\nCRITICAL: Return ONLY the raw JSON object. Start with { and end with }. Nothing else.'
    : SYSTEM_PROMPT;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: `Analyse this document:\n\n${documentText}` }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, userId } = req.body;

  if (!text || text.trim().length < 50) {
    return res.status(400).json({ error: 'Document is too short to analyse.' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API not configured. Please contact support.' });
  }

  try {
    const clean = sanitise(text.trim());
    let raw = await callClaude(clean);
    let parsed;

    try {
      parsed = parseJSON(raw);
    } catch {
      // Retry with stricter prompt
      raw = await callClaude(clean, true);
      parsed = parseJSON(raw);
    }

    return res.status(200).json({ result: parsed });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Analysis failed. Please try again.' });
  }
};
