// File: analyzeJobPostAPI.js (Fantasy name) – Real name for GitHub: /pages/api/analyzeJobPost.js

import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in Vercel Environment Variables
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { jobPostText } = req.body;

  if (!jobPostText) {
    return res.status(400).json({ error: "Missing job post text" });
  }

  try {
    const prompt = `
You are a Red Flag Job Posting Analyst AI.
Analyze the following job post using this red flag framework (summarized):
1. List categorized red flags.
2. Severity score for each (1–5).
3. Human-readable explanation.
4. Overall trust score (0–100).
5. Recommendations for job seeker.
6. Final summary with strengths/weaknesses.

Job Post:
"""${jobPostText}"""
    
Return output in JSON with this structure:
{
  redFlags: [
    {
      category: "Compensation & Benefits Missing",
      severity: 3,
      explanation: "No salary or benefits listed.",
      recommendation: "Ask for salary in writing before applying."
    },
    ...
  ],
  trustScore: 67,
  summary: "This job post has moderate concerns around compensation and vague responsibilities.",
  finalRecommendation: "Proceed with caution. Clarify key details before applying."
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Or gpt-4, adjust based on availability
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const rawText = completion.choices[0].message.content;

    // Try to parse JSON from AI output
    let parsedOutput;
    try {
      parsedOutput = JSON.parse(rawText);
    } catch (e) {
      return res.status(500).json({
        error: "Failed to parse response from AI. Raw output:",
        rawOutput: rawText,
      });
    }

    res.status(200).json(parsedOutput);
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({ error: "AI analysis failed" });
  }
}
