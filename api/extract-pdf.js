// api/extract-pdf.js
// Vercel serverless function — extracts text from uploaded PDF server side
// Uses pdf-parse which is reliable in Node.js environments
// Install: npm install pdf-parse

const pdfParse = require('pdf-parse');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Expect base64 encoded PDF in body
    const { base64, fileName } = req.body;

    if (!base64) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const buffer = Buffer.from(base64, 'base64');
    const data = await pdfParse(buffer);

    if (!data.text || data.text.trim().length < 50) {
      return res.status(400).json({ error: 'Could not extract text from this PDF. It may be a scanned image. Please try copying and pasting the text instead.' });
    }

    return res.status(200).json({
      text: data.text,
      pages: data.numpages,
      fileName,
    });
  } catch (e) {
    return res.status(500).json({ error: 'Could not read this PDF. Please try copying and pasting the text instead.' });
  }
};
