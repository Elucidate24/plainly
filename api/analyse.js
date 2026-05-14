// api/analyse.js
// Environment variables needed:
//   ANTHROPIC_API_KEY
//   SUPABASE_URL
//   SUPABASE_SERVICE_KEY
//   API_SECRET (set this to any random string in Vercel)

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const FREE_LIMIT = 1;

const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const maxRequests = 10;
  if (!rateLimitMap.has(ip)) { rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs }); return false; }
  const entry = rateLimitMap.get(ip);
  if (now > entry.resetAt) { rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs }); return false; }
  if (entry.count >= maxRequests) return true;
  entry.count++;
  return false;
}

const SYSTEM_PROMPT = `You are a senior legal analyst with 20 years of experience advising individuals and small businesses on contracts and agreements. You think like a lawyer but write like a trusted friend who genuinely wants to protect the person reading this.

Your job is to analyse the document provided and return a JSON object. You must return ONLY raw valid JSON. No markdown. No code blocks. No backticks. No explanation. No preamble. Just the JSON object starting with { and ending with }.

CRITICAL JSON RULES:
- Every string value must be properly escaped. No unescaped quotes inside strings.
- No trailing commas anywhere in the JSON.
- Keep individual string values under 300 characters to avoid truncation.
- Maximum 5 red flags. Maximum 5 legal terms. Maximum 3 missing clauses.

ANALYSIS PHILOSOPHY:
- Go beyond surface reading. Understand what each clause means in practice.
- Think about what happens when things go wrong.
- Compare clauses against what is standard for this document type.
- Be honest about risk. Never soften bad clauses.
- Explain real world consequences not just legal definitions.

Return exactly this JSON structure:
{
  "document_type": "specific type e.g. Freelance Design Contract",
  "trust_score": integer from 1 to 10,
  "score_label": "one sentence capturing overall risk and main reason",
  "score_reasoning": "two sentences explaining what drove this score with specific clause references",
  "summary": "two to three sentences on what this document is who the parties are and the power balance",
  "red_flags": [{ "title": "short title", "explanation": "two to three sentences what it says why risky what could happen", "severity": "high or medium or low" }],
  "key_points": ["critical point 1", "critical point 2", "critical point 3"],
  "legal_terms": [{ "term": "term from document", "plain_english": "what it means and why it matters" }],
  "missing_clauses": ["missing clause and why its absence matters"],
  "recommendation": "one sentence sign as-is negotiate X before signing or do not sign because Y"
}`;

function sanitiseJSON(raw) {
  let text = raw.trim();
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  text = text.replace(/^`|`$/g, '');
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in response');
  text = text.slice(start, end + 1);
  text = text.replace(/[\x00-\x1F\x7F]/g, (c) => {
    if (c === '\n') return '\\n';
    if (c === '\r') return '\\r';
    if (c === '\t') return '\\t';
    return '';
  });
  return JSON.parse(text);
}

function sanitise(text) {
  return text.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, '');
}

function truncateDocument(text, maxChars = 12000) {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + '\n\n[Document truncated for analysis.]';
}

async function callClaude(documentText, strict = false) {
  const systemPrompt = strict
    ? SYSTEM_PROMPT + '\n\nCRITICAL: Return ONLY valid JSON starting with { and ending with }. Keep all string values short and properly escaped.'
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
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: `Analyse this legal document:\n\n${documentText}` }],
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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-plainly-secret');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = req.headers['x-plainly-secret'];
  if (process.env.API_SECRET && secret !== process.env.API_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please try again in an hour.' });
  }

  const { text, userId } = req.body;

  if (!text || text.trim().length < 50) {
    return res.status(400).json({ error: 'Document is too short to analyse.' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API not configured. Please contact support.' });
  }

  if (userId) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_pro, usage_count')
        .eq('id', userId)
        .single();

      if (profile && !profile.is_pro && (profile.usage_count || 0) >= FREE_LIMIT) {
        return res.status(403).json({ error: 'Free limit reached. Please upgrade to Pro for unlimited analyses.', limitReached: true });
      }
    } catch (e) {}
  }

  try {
    const clean = truncateDocument(sanitise(text.trim()));
    let raw = await callClaude(clean);
    let parsed;

    try {
      parsed = sanitiseJSON(raw);
    } catch (firstErr) {
      raw = await callClaude(clean, true);
      try {
        parsed = sanitiseJSON(raw);
      } catch (secondErr) {
        throw new Error('Analysis could not be completed. Please try a shorter section of the document.');
      }
    }

    if (!parsed.document_type || !parsed.trust_score || !parsed.summary) {
      throw new Error('Analysis returned incomplete results. Please try again.');
    }

    if (userId) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('usage_count')
          .eq('id', userId)
          .single();
        await supabase
          .from('profiles')
          .update({ usage_count: (profile?.usage_count || 0) + 1 })
          .eq('id', userId);
      } catch (e) {}
    }

    return res.status(200).json({ result: parsed });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Analysis failed. Please try again.' });
  }
};
