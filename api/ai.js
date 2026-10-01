// One small proxy to Claude. The API key stays on the server; the browser only sends a prompt (+ optional photo).
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ error: 'AI is not configured' });

  const { prompt, image } = req.body || {};
  if (typeof prompt !== 'string' || prompt.length > 6000) return res.status(400).json({ error: 'Bad prompt' });

  const content = [];
  if (typeof image === 'string' && image.startsWith('data:image/')) {
    const [head, data] = image.split(',');
    if (data.length > 2_500_000) return res.status(413).json({ error: 'Photo too large' });
    const media_type = (head.match(/data:(image\/[a-z]+);/) || [])[1] || 'image/jpeg';
    content.push({ type: 'image', source: { type: 'base64', media_type, data } });
  }
  content.push({ type: 'text', text: prompt + '\n\nReply with only the JSON. No markdown fences.' });

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: 900, messages: [{ role: 'user', content }] }),
    });
    const j = await r.json();
    if (!r.ok) return res.status(502).json({ error: j.error?.message || 'Upstream error' });
    const text = (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return res.status(502).json({ error: 'No JSON in reply' });
    res.status(200).json({ data: JSON.parse(match[0]) });
  } catch (e) {
    res.status(500).json({ error: 'AI call failed' });
  }
}
