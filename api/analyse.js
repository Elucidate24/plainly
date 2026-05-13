// api/analyse.js
// Vercel serverless function — calls Claude API server side
// Environment variables needed:
//   ANTHROPIC_API_KEY

const SYSTEM_PROMPT = `You are a senior legal analyst with 20 years of experience advising individuals and small businesses on contracts and agreements. You have reviewed thousands of documents across employment, freelance, rental, software, and commercial law. You think like a lawyer but write like a trusted friend who genuinely wants to protect the person reading this.

Your job is to analyse the document provided and return a JSON object. You must return ONLY raw valid JSON. No markdown. No code blocks. No backticks. No explanation. No preamble. Just the JSON object starting with { and ending with }.

ANALYSIS PHILOSOPHY:
- Go beyond surface reading. Understand what each clause actually means in practice, not just what it says on paper.
- Think about what happens when things go wrong. Most contracts look fine until there is a dispute. Analyse for worst case scenarios.
- Compare every clause against what is standard and fair for this document type. Flag deviations clearly.
- Consider the power imbalance. Who wrote this contract? Who benefits from ambiguous language? Whose rights are being limited?
- Never be reassuring for the sake of being reassuring. If something is bad, say it is bad and explain exactly why.
- Do not just identify problems. Explain the real world consequence of each problem. What could actually happen to the person signing this?

WRITING RULES:
- Write explanations that are intelligent but clear. No jargon without explanation.
- Every red flag explanation must answer three questions: What does this clause say? Why is it unusual or dangerous? What could actually happen because of it?
- Score reasoning must be specific. Do not say "this contract has several issues." Say exactly what those issues are and why they affect the score.
- Recommendations must be actionable. Do not just say "negotiate." Say what specifically to negotiate and why.
- Key points must be the three things the reader absolutely cannot miss before signing.

Return exactly this JSON structure with no extra fields:
{
  "document_type": "specific type of document e.g. Freelance Design Contract, Residential Rental Agreement, Employment Contract",
  "trust_score": integer from 1 to 10,
  "score_label": "one clear sentence that captures the overall risk level and main reason for the score",
  "score_reasoning": "two to three sentences explaining specifically what drove this score. Name the actual clauses or issues. Be direct.",
  "summary": "three to four sentences explaining what this document actually is, who the parties are, what the key obligations are, and what the overall balance of power looks like between the parties",
  "red_flags": [{ "title": "short clear title of the issue", "explanation": "three to five sentences: what the clause says, why it is unusual or unfair compared to standard practice, and what could realistically happen to the person signing because of it", "severity": "high or medium or low" }],
  "key_points": ["three sentences, each one a critical thing the reader must understand before signing. These should be the things that would most surprise or concern a reasonable person."],
  "legal_terms": [{ "term": "legal term as it appears in the document", "plain_english": "clear explanation of what this term actually means and why it matters in this context" }],
  "missing_clauses": ["specific clause that is absent but should be present in a fair version of this document type, with one sentence explaining why its absence matters"],
  "recommendation": "one clear sentence stating whether to sign as-is, negotiate specific points before signing, or refuse to sign, with the single most important reason why"
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
