// File: pages/index.js

import { useState } from "react";

export default function Home() {
  const [jobPostText, setJobPostText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeJobPost = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyzeJobPost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobPostText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "API Error");
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>🔍 Job Post Red Flag Analyzer</h1>
      <textarea
        rows={10}
        cols={80}
        placeholder="Paste a job post here..."
        value={jobPostText}
        onChange={(e) => setJobPostText(e.target.value)}
        style={{ width: "100%", marginTop: "1rem", padding: "1rem", fontSize: "1rem" }}
      />
      <button
        onClick={analyzeJobPost}
        disabled={loading || !jobPostText}
        style={{
          marginTop: "1rem",
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Analyzing..." : "Analyze Job Post"}
      </button>

      {error && (
        <div style={{ color: "red", marginTop: "1rem" }}>
          ❌ Error: {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: "2rem" }}>
          <h2>🧾 Analysis Summary</h2>
          <p><strong>Trust Score:</strong> {result.trustScore}/100</p>
          <p><strong>Summary:</strong> {result.summary}</p>
          <p><strong>Final Recommendation:</strong> {result.finalRecommendation}</p>

          <h3 style={{ marginTop: "1.5rem" }}>🚩 Red Flags:</h3>
          <ul>
            {result.redFlags.map((flag, index) => (
              <li key={index} style={{ marginBottom: "1rem" }}>
                <strong>{flag.category}</strong> <br />
                Severity: {flag.severity}/5 <br />
                📝 {flag.explanation} <br />
                ✅ Recommendation: {flag.recommendation}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
