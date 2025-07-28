export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { jobPostText } = req.body;

  if (!jobPostText || typeof jobPostText !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid job post text' });
  }

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a job post risk analyzer. Use this structure:

1. Category
2. Severity (1–5)
3. Explanation
4. Trust Score (0–100)
5. Final Recommendation

Framework:
- Compensation Red Flags
- Language Red Flags
- Scam Indicators
- Unrealistic Requirements
- Academic Bias`,
          },
          {
            role: 'user',
            content: jobPostText,
          },
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    if (!openaiRes.ok) {
      const errMsg = await openaiRes.text();
      console.error('OpenAI error:', errMsg);
      return res.status(500).json({ error: 'OpenAI API failed' });
    }

    const data = await openaiRes.json();
    const result = data.choices?.[0]?.message?.content || 'No response from AI.';

    return res.status(200).json({ analysis: result });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error occurred' });
  }
}
