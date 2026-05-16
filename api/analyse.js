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
  const max = 10;
  if (!rateLimitMap.has(ip)) { rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs }); return false; }
  const e = rateLimitMap.get(ip);
  if (now > e.resetAt) { rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs }); return false; }
  if (e.count >= max) return true;
  e.count++;
  return false;
}

const SYSTEM_PROMPT = `You are the world's foremost legal document analyst. You have spent 30 years reviewing contracts for individuals, freelancers, small businesses and executives across every jurisdiction in the English-speaking world. You have personally reviewed over 50,000 contracts. You know every trick, every buried clause, every piece of deliberately ambiguous language that the drafting party uses to protect themselves at the expense of the person signing.

You are not neutral. You are an advocate for the person who just pasted this document. You read every word as if someone you deeply care about is about to sign it and their financial security depends on your analysis being right.

Your job is to return a JSON object. You must return ONLY raw valid JSON. No markdown. No code blocks. No backticks. No explanation. No preamble. Just the JSON object starting with { and ending with }.

CRITICAL JSON RULES:
- Every string value must be properly escaped. No unescaped quotes inside strings.
- No trailing commas anywhere in the JSON.
- Every field must be present even if the array is empty.
- Maximum 6 clauses. Maximum 5 red flags. Maximum 5 legal terms. Maximum 3 missing clauses.

HOW TO SCORE (be precise and calibrated):
- 9 to 10: Exceptionally fair. Genuinely protects both parties. All standard clauses present and balanced. Extremely rare.
- 7 to 8: Generally fair with one or two minor issues. Safe to sign with small adjustments.
- 5 to 6: Average. Multiple clauses favour the other party but commercially normal.
- 3 to 4: Below average. Several clauses create meaningful risk. Negotiation strongly advisable.
- 1 to 2: Dangerous. Heavily one-sided. Walking away is a legitimate option.

HOW TO WRITE CLAUSES:
For every significant clause explain what it says, its legal effect, whether it is standard or restrictive, the worst-case scenario if enforced, and a ready-to-use negotiation script.

HOW TO WRITE RED FLAGS:
Full analytical paragraph covering exact language, why it is unusual, realistic consequence, what fair looks like, and what to do. Plus a negotiation script.

HOW TO WRITE THE DEEP ANALYSIS:
4 to 6 substantial paragraphs. Cover the overall character, who drafted it, the pattern of clauses, cumulative risks, non-obvious risks, and honest overall assessment.

HOW TO WRITE NEGOTIATION SCRIPTS:
Write the exact words they can copy and paste into an email or say on a call. Be specific, confident and professional.

HOW TO WRITE THE NEGOTIATION EMAIL:
A complete professional email requesting the key changes. Include specific clause references. Write it ready to send with [brackets] for details they need to fill in.

Return exactly this JSON structure:
{
  "document_type": "precise document type",
  "trust_score": integer from 1 to 10,
  "score_label": "one punchy sentence capturing the overall verdict",
  "score_reasoning": "three to four sentences naming specific clauses and explaining precisely who this contract protects and why the score is what it is",
  "summary": "one substantial paragraph explaining the document, the parties, their core obligations, and the real balance of power",
  "deep_analysis": "four to six substantial paragraphs giving a complete expert opinion covering character, drafting intent, clause patterns, cumulative risks, non-obvious risks, and honest overall assessment",
  "clauses": [{ "title": "clause title", "what_it_says": "plain English explanation of what this clause says and its legal effect", "standard": "standard or restrictive or very restrictive or unusually aggressive", "worst_case": "realistic worst-case scenario if enforced", "negotiation_script": "exact words to say or write to push back. Ready to copy and paste." }],
  "red_flags": [{ "title": "short specific title", "explanation": "full analytical paragraph covering exact language, why unusual, realistic consequence, what fair looks like, and what to do", "severity": "high or medium or low", "industry_comparison": "one sentence starting with one of: This is standard for OR This is more restrictive than standard OR This is significantly more restrictive than standard OR This is unusually aggressive. Then explain what standard looks like with specific examples.", "negotiation_script": "exact words to use when pushing back on this clause. Ready to copy and paste." }],
  "key_points": ["most surprising thing buried in this contract", "second critical point", "third critical point"],
  "legal_terms": [{ "term": "exact term from the document", "plain_english": "two to three sentences: what it means, what it means in this specific document, and its practical impact on the signing party" }],
  "missing_clauses": ["clause name: what it is, why standard contracts include it, what risk its absence creates, and exactly what to ask for"],
  "negotiation_email": "complete professional email ready to send requesting the key changes. Include specific clause references. Use [brackets] for details they need to fill in.",
  "recommendation": "one clear direct sentence: sign as-is, negotiate clause X and Y before signing, or do not sign because Z"
}`;

function sanitiseJSON(raw) {
  let text = raw.trim();
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  text = text.replace(/^`|`$/g, '');
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON found');
  text = text.slice(start, end + 1);
  text = text.replace(/[\x00-\x1F\x7F]/g, c => {
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

function truncate(text, max = 12000) {
  if (text.length <= max) return text;
  return text.slice(0, max) + '\n\n[Document truncated. First ' + max + ' characters analysed.]';
}

async function callClaude(documentText, strict = false, systemPrompt = SYSTEM_PROMPT) {
  const system = strict
    ? systemPrompt + '\n\nCRITICAL: Return ONLY valid JSON starting with { and ending with }. No other text.'
    : systemPrompt;

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
      system,
      messages: [{ role: 'user', content: `Analyse this legal document on behalf of the person who just pasted it. They are about to sign it:\n\n${documentText}` }],
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-plainly-secret');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = req.headers['x-plainly-secret'];
  if (process.env.API_SECRET && secret !== process.env.API_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please try again in an hour.' });
  }

  const { text, userId, chatMode, lang } = req.body;

  const langInstructions = {
    nl: "BELANGRIJK: Schrijf ALLE velden in de JSON uitsluitend in het Nederlands. Geen enkel veld mag in het Engels zijn. Alle uitleg, analyses, aanbevelingen, onderhandelingsscripts en e-mails moeten volledig in het Nederlands worden geschreven.",
    es: "IMPORTANTE: Escribe TODOS los campos del JSON exclusivamente en español. Ningún campo debe estar en inglés. Todas las explicaciones, análisis, recomendaciones, guiones de negociación y correos electrónicos deben estar completamente en español.",
    en: ""
  };

  const langInstruction = langInstructions[lang] || "";
  const SYSTEM_PROMPT_LANG = langInstruction
    ? SYSTEM_PROMPT + "\n\n" + langInstruction
    : SYSTEM_PROMPT;

  // Chat mode — plain conversational reply, no JSON structure needed
  if (chatMode) {
    try {
      const chatLangInstruction = lang === "nl"
        ? "Beantwoord de vraag volledig in het Nederlands."
        : lang === "es"
        ? "Responde la pregunta completamente en español."
        : "";
      const chatSystem = chatLangInstruction
        ? "You are a helpful legal assistant. " + chatLangInstruction
        : "You are a helpful legal assistant.";
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 1000,
          system: chatSystem,
          messages: [{ role: 'user', content: text }],
        }),
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || 'I could not answer that. Please try rephrasing.';
      return res.status(200).json({ chatReply: reply });
    } catch (e) {
      return res.status(500).json({ chatReply: 'Something went wrong. Please try again.' });
    }
  }

  if (!text || text.trim().length < 50) {
    return res.status(400).json({ error: 'Document is too short to analyse.' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API not configured.' });
  }

  if (userId) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_pro, usage_count')
        .eq('id', userId)
        .single();
      if (profile && !profile.is_pro && (profile.usage_count || 0) >= FREE_LIMIT) {
        return res.status(403).json({ error: 'Free limit reached.', limitReached: true });
      }
    } catch (e) {}
  }

  try {
    const clean = truncate(sanitise(text.trim()));
    let raw = await callClaude(clean, false, SYSTEM_PROMPT_LANG);
    let parsed;

    try {
      parsed = sanitiseJSON(raw);
    } catch {
      raw = await callClaude(clean, true, SYSTEM_PROMPT_LANG);
      try {
        parsed = sanitiseJSON(raw);
      } catch {
        throw new Error('Analysis could not be completed. Please try a shorter section.');
      }
    }

    if (!parsed.document_type || !parsed.trust_score || !parsed.summary) {
      throw new Error('Analysis returned incomplete results. Please try again.');
    }

    // Save to history and update usage count
    if (userId) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('usage_count')
          .eq('id', userId)
          .single();

        await supabase.from('profiles').update({
          usage_count: (profile?.usage_count || 0) + 1
        }).eq('id', userId);

        // Save to history
        await supabase.from('analysis_history').insert({
          user_id: userId,
          document_type: parsed.document_type,
          trust_score: parsed.trust_score,
          score_label: parsed.score_label,
          recommendation: parsed.recommendation,
          result: parsed,
          created_at: new Date().toISOString()
        });
      } catch (e) {}
    }

    return res.status(200).json({ result: parsed });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Analysis failed. Please try again.' });
  }
};

//   const response = await fetch('https://api.anthropic.com/v1/messages', { ... simple chat ... })
//   return res.status(200).json({ chatReply: plainTextResponse });
// }
