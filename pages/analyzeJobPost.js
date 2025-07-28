// pages/api/analyzeJobPost.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { jobPostText } = req.body;

  if (!jobPostText) {
    return res.status(400).json({ error: 'Missing job post text' });
  }

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a job post risk analyzer. Scan any job post for red flags. Use the framework below. For each flag found, output:

1. Red Flag Category
2. Severity (1–5)
3. Explanation (why it's a problem)
4. Trust Score (0–100 for overall post)
5. Final Recommendation

Framework:
${yourRedFlagFrameworkHere}  // Insert all your categories, red flags, academic section, etc.
`,
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

    const data = await openaiResponse.json();
    const aiText = data.choices[0]?.message?.content || '';

    res.status(200).json({ analysis: aiText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to analyze job post' });
  }
}
