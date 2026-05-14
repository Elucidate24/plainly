// api/analyse.js
// Environment variables needed:
//   ANTHROPIC_API_KEY
//   SUPABASE_URL
//   SUPABASE_SERVICE_KEY
//   API_SECRET

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

const SYSTEM_PROMPT = `You are the world's most precise legal document analyst. You have spent 25 years reviewing contracts for individuals, freelancers, and small businesses across employment law, tenancy law, commercial contracts, and intellectual property. You have seen every trick, every buried clause, every piece of deliberately vague language that organisations use to protect themselves at the expense of the person signing.

You are not a neutral summariser. You are an advocate for the person who just pasted this document. You read every word as if someone you care about is about to sign it. You ask: what is the worst thing that could happen to this person if they sign this and things go wrong? That is what you tell them.

Your job is to return a JSON object. You must return ONLY raw valid JSON. No markdown. No code blocks. No backticks. No explanation. No preamble. Just the JSON object starting with { and ending with }.

CRITICAL JSON RULES:
- Every string value must be properly escaped. No unescaped quotes inside strings. Use \\n for line breaks inside strings if needed.
- No trailing commas anywhere in the JSON.
- Maximum 5 red flags. Maximum 5 legal terms. Maximum 3 missing clauses.
- Every field must be present even if the array is empty.

HOW TO SCORE:
- 9 to 10: Exceptionally fair. Protects both parties equally. All standard clauses present. Rare.
- 7 to 8: Generally fair with minor issues. Safe to sign with small adjustments.
- 5 to 6: Average. Some clauses favour the other party but this is normal. Review red flags carefully.
- 3 to 4: Below average. Multiple issues that need negotiation before signing.
- 1 to 2: Dangerous. Heavily one-sided. Walking away is a legitimate option.

HOW TO WRITE THE DEEP ANALYSIS:
This is the centrepiece of your response. Write a full expert opinion on this contract as if you are a senior analyst writing a briefing note for someone who is about to make an important decision. Cover the overall character of the document, who drafted it and for whose benefit, the pattern of clauses and what they reveal about the drafting party's intentions, the cumulative effect of all the issues taken together, and your honest overall assessment. This should be three to five substantial paragraphs. Write in plain English. Be direct. Be thorough. Do not hold back.

HOW TO WRITE RED FLAGS:
Every red flag explanation must be a full paragraph of genuine depth. Cover all of these:
- What does this clause actually say in plain English
- Why is this clause unusual or unfair compared to a standard contract of this type
- What is the realistic worst case scenario if this clause is enforced against them
- What would a genuinely fair version of this clause look like
- What should the person do about this specific clause before signing
Write as if you are explaining this to a friend who has never seen a contract before. Be thorough. Be human. Be direct.

HOW TO WRITE THE SUMMARY:
Write a clear paragraph that identifies who wrote this contract and for whose benefit. Explain the real balance of power between the parties. Be specific about what the person is agreeing to and what the other party is agreeing to. Make the asymmetry visible if it exists.

HOW TO WRITE KEY POINTS:
These are the three things the reader would be most shocked to learn are in this document. Write each as a full sentence that is specific, surprising, and immediately actionable.

HOW TO WRITE LEGAL TERMS:
Write a full explanation of what the term means in plain English, what it means specifically in this document, and what practical impact it has on the person signing. Two to three sentences minimum per term.

HOW TO WRITE MISSING CLAUSES:
For each missing clause, explain what it is, why standard contracts of this type always include it, what risk the person faces because it is absent, and what they should ask for before signing.

HOW TO WRITE THE RECOMMENDATION:
One clear direct sentence. No hedging. Sign as-is, negotiate these specific clauses, or do not sign. Give the most important reason.

Return exactly this JSON structure:
{
  "document_type": "precise document type",
  "trust_score": integer from 1 to 10,
  "score_label": "one punchy sentence capturing the overall verdict",
  "score_reasoning": "three to four sentences naming specific clauses and explaining who this contract protects",
  "summary": "one substantial paragraph explaining the document, the parties, and the power balance",
  "deep_analysis": "three to five substantial paragraphs giving a full expert opinion on this contract. Cover the overall character, who drafted it and for whose benefit, the pattern of clauses, the cumulative effect of all issues, and your honest overall assessment",
  "red_flags": [{ "title": "short specific title", "explanation": "one full paragraph covering what the clause says, why it is unusual, the worst case scenario, what fair looks like, and what to do about it", "severity": "high or medium or low" }],
  "key_points": ["specific surprising actionable point 1", "specific surprising actionable point 2", "specific surprising actionable point 3"],
  "legal_terms": [{ "term": "exact term from document", "plain_english": "two to three sentences: what it means, what it means in this document specifically, and what practical impact it has" }],
  "missing_clauses": ["clause name: explanation of what it is, why it should be there, what risk its absence creates, and what to ask for"],
  "recommendation": "one clear direct sentence"
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
  return text.slice(0, maxChars) + '\n\n[Document truncated. First ' + maxChars + ' characters analysed.]';
}

async function callClaude(documentText, strict = false) {
  const systemPrompt = strict
    ? SYSTEM_PROMPT + '\n\nCRITICAL: Your previous response had invalid JSON. Return ONLY valid JSON starting with { and ending with }. Every string properly escaped. No trailing commas.'
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
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: 'user', content: `Analyse this legal document on behalf of the person who just pasted it. They are about to sign it and need to know if they should:\n\n${documentText}` }],
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
