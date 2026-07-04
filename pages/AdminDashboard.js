import React, { useEffect, useState } from "react";
import { getAdminStats, getAdminUsers, getAdminQuizzes, getAdminResults } from "../services/resultService";
import { getUser } from "../services/authService";

export default function AdminDashboard() {
  const user = getUser();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sRes, uRes, qRes, rRes] = await Promise.all([
          getAdminStats(), getAdminUsers(), getAdminQuizzes(), getAdminResults()
        ]);
        setStats(sRes.data);
        setUsers(uRes.data);
        setQuizzes(qRes.data);
        setResults(rRes.data);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const grade = (pct) => {
    if (pct >= 90) return "#10b981";
    if (pct >= 75) return "#3b82f6";
    if (pct >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const roleIcon = { admin: "👑", teacher: "👨‍🏫", student: "🎓" };

  if (loading) return <div className="page-loading"><div className="spinner"/><p>Loading…</p></div>;

  return (
    <main className="page-content">
      <div className="dashboard-header">
        <div>
          <h2>Admin Dashboard 👑</h2>
          <p className="subtitle">Full visibility into all platform activity.</p>
        </div>
      </div>

      <div className="tab-bar">
        <button className={`tab-btn ${tab==="overview"?"active":""}`} onClick={()=>setTab("overview")}>📊 Overview</button>
        <button className={`tab-btn ${tab==="users"?"active":""}`} onClick={()=>setTab("users")}>👥 Users ({users.length})</button>
        <button className={`tab-btn ${tab==="quizzes"?"active":""}`} onClick={()=>setTab("quizzes")}>📋 Quizzes ({quizzes.length})</button>
        <button className={`tab-btn ${tab==="results"?"active":""}`} onClick={()=>setTab("results")}>🏆 All Results ({results.length})</button>
      </div>

      {/* ── Overview Tab ── */}
      {tab === "overview" && stats && (
        <>
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-card-icon">👥</div><div className="stat-card-val">{stats.total_users}</div><div className="stat-card-lbl">Total Users</div></div>
            <div className="stat-card"><div className="stat-card-icon">🎓</div><div className="stat-card-val">{stats.total_students}</div><div className="stat-card-lbl">Students</div></div>
            <div className="stat-card"><div className="stat-card-icon">👨‍🏫</div><div className="stat-card-val">{stats.total_teachers}</div><div className="stat-card-lbl">Teachers</div></div>
            <div className="stat-card"><div className="stat-card-icon">📋</div><div className="stat-card-val">{stats.total_quizzes}</div><div className="stat-card-lbl">Quizzes</div></div>
            <div className="stat-card"><div className="stat-card-icon">✍️</div><div className="stat-card-val">{stats.total_attempts}</div><div className="stat-card-lbl">Attempts</div></div>
            <div className="stat-card"><div className="stat-card-icon">📈</div><div className="stat-card-val">{stats.avg_score}%</div><div className="stat-card-lbl">Avg Score</div></div>
          </div>

          <h3 className="section-title">Recent Activity</h3>
          <div className="activity-list">
            {results.slice(0,10).map(r=>(
              <div key={r.id} className="activity-item">
                <span className="activity-icon">✍️</span>
                <div className="activity-body">
                  <strong>{r.username}</strong> completed <strong>{r.quiz_title}</strong>
                  <span className="activity-meta"> · {new Date(r.submitted_at).toLocaleString()}</span>
                </div>
                <span className="pct-badge" style={{background:grade(r.percentage)}}>{r.percentage}%</span>
              </div>
            ))}
            {results.length === 0 && <p className="text-muted">No activity yet.</p>}
          </div>
        </>
      )}

      {/* ── Users Tab ── */}
      {tab === "users" && (
        <div className="participants-table-wrap">
          <table className="participants-table">
            <thead>
              <tr><th>#</th><th>Username</th><th>Email</th><th>Role</th><th>Joined</th></tr>
            </thead>
            <tbody>
              {users.map((u,i)=>(
                <tr key={u.id}>
                  <td>{i+1}</td>
                  <td><strong>{u.username}</strong></td>
                  <td>{u.email}</td>
                  <td><span className={`role-badge role-${u.role}`}>{roleIcon[u.role]} {u.role}</span></td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <div className="empty-state"><h3>No users found</h3></div>}
        </div>
      )}

      {/* ── Quizzes Tab ── */}
      {tab === "quizzes" && (
        <div className="participants-table-wrap">
          <table className="participants-table">
            <thead>
              <tr><th>#</th><th>Quiz Title</th><th>Teacher</th><th>Questions</th><th>Duration</th><th>Participants</th><th>Max</th><th>Created</th></tr>
            </thead>
            <tbody>
              {quizzes.map((q,i)=>(
                <tr key={q.id}>
                  <td>{i+1}</td>
                  <td><strong>{q.title}</strong></td>
                  <td>{q.created_by_name || "—"}</td>
                  <td>{q.question_count}</td>
                  <td>{q.duration_minutes} min</td>
                  <td>{q.participant_count || 0}</td>
                  <td>{q.max_participants || "∞"}</td>
                  <td>{new Date(q.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {quizzes.length === 0 && <div className="empty-state"><h3>No quizzes found</h3></div>}
        </div>
      )}

      {/* ── Results Tab ── */}
      {tab === "results" && (
        <div className="participants-table-wrap">
          <table className="participants-table">
            <thead>
              <tr><th>#</th><th>Student</th><th>Quiz</th><th>Teacher</th><th>Score</th><th>%</th><th>Time</th><th>Date</th></tr>
            </thead>
            <tbody>
              {results.map((r,i)=>(
                <tr key={r.id}>
                  <td>{i+1}</td>
                  <td><strong>{r.username}</strong></td>
                  <td>{r.quiz_title}</td>
                  <td>{r.teacher_name || "—"}</td>
                  <td>{r.score}/{r.total_marks}</td>
                  <td><span className="pct-badge" style={{background:grade(r.percentage)}}>{r.percentage}%</span></td>
                  <td>{Math.floor(r.time_taken_seconds/60)}m {r.time_taken_seconds%60}s</td>
                  <td>{new Date(r.submitted_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {results.length === 0 && <div className="empty-state"><h3>No results yet</h3></div>}
        </div>
      )}
    </main>
  );
}
