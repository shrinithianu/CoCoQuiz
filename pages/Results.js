import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMyResults, getResultDetail } from "../services/resultService";

export default function Results() {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [detail, setDetail] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        if (resultId) {
          const res = await getResultDetail(resultId);
          setDetail(res.data.result);
          setAnswers(res.data.answers);
        } else {
          const res = await getMyResults();
          setResults(res.data);
        }
      } catch { setError("Failed to load results."); }
      finally { setLoading(false); }
    }
    load();
  }, [resultId]);

  const grade = (pct) => {
    if (pct >= 90) return { label: "Excellent", color: "#10b981" };
    if (pct >= 75) return { label: "Good", color: "#3b82f6" };
    if (pct >= 50) return { label: "Average", color: "#f59e0b" };
    return { label: "Needs Work", color: "#ef4444" };
  };

  if (loading) return <div className="page-loading"><div className="spinner"/><p>Loading…</p></div>;
  if (error) return <div className="page-content"><div className="error-banner">{error}</div></div>;

  if (resultId && detail) {
    const g = grade(detail.percentage);
    const mins = Math.floor(detail.time_taken_seconds/60);
    const secs = detail.time_taken_seconds%60;
    return (
      <main className="page-content">
        <button className="btn-back" onClick={() => navigate("/results")}>← All Results</button>
        <div className="result-detail-header">
          <h2>{detail.quiz_title}</h2>
          <div className="score-circle" style={{ borderColor: g.color }}>
            <span className="score-pct" style={{ color: g.color }}>{detail.percentage}%</span>
            <span className="score-raw">{detail.score}/{detail.total_marks}</span>
          </div>
          <div className="result-stats">
            <span className="grade-badge" style={{ background: g.color }}>{g.label}</span>
            <span>⏱ {mins}m {secs}s</span>
            <span>📅 {new Date(detail.submitted_at).toLocaleDateString()}</span>
          </div>
        </div>
        <h3 className="section-title">Answer Review</h3>
        <div className="answer-review">
          {answers.map((a, i) => (
            <div key={i} className={`answer-card ${a.is_correct?"correct":"incorrect"}`}>
              <div className="answer-header">
                <span className="q-number">Q{i+1}</span>
                <span className="answer-status">{a.is_correct ? "✓ Correct" : "✗ Incorrect"}</span>
                <span className="q-marks">{a.marks} mark{a.marks>1?"s":""}</span>
              </div>
              <p className="question-text">{a.question_text}</p>
              <div className="answer-opts">
                {["a","b","c","d"].map(opt => {
                  const isCorrect = a.correct_option === opt.toUpperCase();
                  const isSelected = a.selected_option === opt.toUpperCase();
                  return (
                    <div key={opt} className={`ans-opt ${isCorrect?"opt-correct":""} ${isSelected&&!isCorrect?"opt-wrong":""}`}>
                      <strong>{opt.toUpperCase()}.</strong> {a[`option_${opt}`]}
                      {isCorrect && " ✓"}{isSelected && !isCorrect && " ✗"}
                    </div>
                  );
                })}
              </div>
              {!a.selected_option && <p className="not-answered">Not answered</p>}
            </div>
          ))}
        </div>
        <div className="result-actions">
          <button className="btn-primary" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-content">
      <h2>My Results</h2>
      <p className="subtitle">Your exam history and scores</p>
      {results.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📊</span>
          <h3>No results yet</h3>
          <p>Complete a quiz to see your results here.</p>
          <button className="btn-primary" onClick={() => navigate("/dashboard")}>Browse Quizzes</button>
        </div>
      ) : (
        <div className="results-grid">
          {results.map(r => {
            const g = grade(r.percentage);
            return (
              <div key={r.id} className="result-card" onClick={() => navigate(`/results/${r.id}`)}>
                <div className="result-card-top">
                  <h3>{r.quiz_title}</h3>
                  <span className="grade-badge" style={{ background: g.color }}>{g.label}</span>
                </div>
                <div className="result-score-row">
                  <span className="result-pct" style={{ color: g.color }}>{r.percentage}%</span>
                  <span className="result-raw">{r.score}/{r.total_marks} marks</span>
                </div>
                <div className="result-meta">
                  <span>📅 {new Date(r.submitted_at).toLocaleDateString()}</span>
                  <span>⏱ {Math.floor(r.time_taken_seconds/60)}m {r.time_taken_seconds%60}s</span>
                </div>
                <button className="btn-view">View Details →</button>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
