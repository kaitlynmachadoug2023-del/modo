// Tells the app whether the AI features are switched on (i.e. an API key is configured).
export default function handler(req, res) {
  res.setHeader('cache-control', 'no-store');
  res.status(200).json({ ai: !!process.env.ANTHROPIC_API_KEY });
}
