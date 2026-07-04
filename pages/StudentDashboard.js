import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllQuizzes } from "../services/quizService";
import { getMyResults } from "../services/resultService";
import { getUser } from "../services/authService";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("quizzes");

  useEffect(() => {
    async function load() {
      try {
        const [qRes, rRes] = await Promise.all([getAllQuizzes(), getMyResults()]);
        setQuizzes(qRes.data);
        setResults(rRes.data);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const attemptedIds = new Set(results.map(r => r.quiz_id));
  const grade = (pct) => {
    if (pct >= 90) return { label: "Excellent", color: "#10b981" };
    if (pct >= 75) return { label: "Good", color: "#3b82f6" };
    if (pct >= 50) return { label: "Average", color: "#f59e0b" };
    return { label: "Needs Work", color: "#ef4444" };
  };

  if (loading) return <div className="page-loading"><div className="spinner"/><p>Loading…</p></div>;

  return (
    <main className="page-content">
      <div className="dashboard-header">
        <div>
          <h2>Welcome, {user?.username} 👋</h2>
          <p className="subtitle">Browse quizzes and test your knowledge!</p>
        </div>
        <div className="stat-pills">
          <div className="stat-pill"><span className="stat-num">{quizzes.length}</span><span className="stat-lbl">Quizzes</span></div>
          <div className="stat-pill"><span className="stat-num">{results.length}</span><span className="stat-lbl">Attempted</span></div>
          <div className="stat-pill"><span className="stat-num">{results.length > 0 ? Math.round(results.reduce((a,r)=>a+r.percentage,0)/results.length) : 0}%</span><span className="stat-lbl">Avg Score</span></div>
        </div>
      </div>

      <div className="tab-bar">
        <button className={`tab-btn ${tab==="quizzes"?"active":""}`} onClick={()=>setTab("quizzes")}>📋 Available Quizzes</button>
        <button className={`tab-btn ${tab==="results"?"active":""}`} onClick={()=>setTab("results")}>📊 My Results</button>
      </div>

      {tab === "quizzes" && (
        quizzes.length === 0 ? (
          <div className="empty-state"><span className="empty-icon">📋</span><h3>No quizzes yet</h3><p>Your teacher hasn't created any quizzes yet.</p></div>
        ) : (
          <div className="quiz-grid">
            {quizzes.map(q => {
              const attempted = attemptedIds.has(q.id);
              const full = q.max_participants && q.participant_count >= q.max_participants;
              return (
                <div key={q.id} className="quiz-card">
                  <div className="quiz-card-body">
                    <div className="quiz-card-top-row">
                      <h3>{q.title}</h3>
                      {attempted && <span className="badge-done">✓ Done</span>}
                      {full && !attempted && <span className="badge-full">Full</span>}
                    </div>
                    <p className="quiz-desc">{q.description || "No description."}</p>
                    <div className="quiz-meta">
                      <span>⏱ {q.duration_minutes} min</span>
                      <span>❓ {q.question_count} questions</span>
                      {q.max_participants && <span>👥 {q.participant_count}/{q.max_participants}</span>}
                      <span>👨‍🏫 {q.created_by_name}</span>
                    </div>
                  </div>
                  <div className="quiz-card-actions">
                    <button className="btn-start"
                      disabled={full && !attempted}
                      onClick={() => navigate(`/quiz/${q.id}`)}>
                      {attempted ? "Retake Quiz →" : full ? "Quiz Full" : "Start Quiz →"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {tab === "results" && (
        results.length === 0 ? (
          <div className="empty-state"><span className="empty-icon">📊</span><h3>No results yet</h3><p>Complete a quiz to see your scores here.</p></div>
        ) : (
          <div className="results-grid">
            {results.map(r => {
              const g = grade(r.percentage);
              return (
                <div key={r.id} className="result-card" onClick={()=>navigate(`/results/${r.id}`)}>
                  <div className="result-card-top">
                    <h3>{r.quiz_title}</h3>
                    <span className="grade-badge" style={{background:g.color}}>{g.label}</span>
                  </div>
                  <div className="result-score-row">
                    <span className="result-pct" style={{color:g.color}}>{r.percentage}%</span>
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
        )
      )}
    </main>
  );
}
