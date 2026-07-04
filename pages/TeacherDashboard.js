import React, { useEffect, useState } from "react";
import { getAllQuizzes, createQuiz, deleteQuiz, addQuestion, deleteQuestion, getParticipants, getQuizQuestions } from "../services/quizService";
import { getUser } from "../services/authService";

export default function TeacherDashboard() {
  const user = getUser();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("quizzes");
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [error, setError] = useState("");

  const [quizForm, setQuizForm] = useState({ title: "", description: "", duration_minutes: 10, max_participants: "" });
  const [qForm, setQForm] = useState({ question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "A", marks: 1 });

  const fetchQuizzes = async () => {
    try {
      const res = await getAllQuizzes();
      setQuizzes(res.data);
    } catch { setError("Failed to load quizzes."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchQuizzes(); }, []);

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      await createQuiz({ ...quizForm, max_participants: quizForm.max_participants || null });
      setQuizForm({ title: "", description: "", duration_minutes: 10, max_participants: "" });
      setShowCreateQuiz(false);
      fetchQuizzes();
    } catch (err) { setError(err.response?.data?.error || "Failed to create quiz."); }
  };

  const handleDeleteQuiz = async (id) => {
    if (!window.confirm("Delete this quiz and all its questions?")) return;
    try { await deleteQuiz(id); fetchQuizzes(); setSelectedQuiz(null); }
    catch { alert("Failed to delete quiz."); }
  };

  const handleSelectQuiz = async (quiz) => {
    setSelectedQuiz(quiz);
    setTab("manage");
    setShowAddQuestion(false);
    try {
      const [pRes, qRes] = await Promise.all([getParticipants(quiz.id), getQuizQuestions(quiz.id)]);
      setParticipants(pRes.data);
      setQuestions(qRes.data);
    } catch { setParticipants([]); setQuestions([]); }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await addQuestion(selectedQuiz.id, qForm);
      setQForm({ question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "A", marks: 1 });
      setShowAddQuestion(false);
      const res = await getQuizQuestions(selectedQuiz.id);
      setQuestions(res.data);
    } catch (err) { alert(err.response?.data?.error || "Failed to add question."); }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await deleteQuestion(qId);
      setQuestions(questions.filter(q => q.id !== qId));
    } catch { alert("Failed to delete question."); }
  };

  const grade = (pct) => {
    if (pct >= 90) return "#10b981";
    if (pct >= 75) return "#3b82f6";
    if (pct >= 50) return "#f59e0b";
    return "#ef4444";
  };

  if (loading) return <div className="page-loading"><div className="spinner"/><p>Loading…</p></div>;

  return (
    <main className="page-content">
      <div className="dashboard-header">
        <div>
          <h2>Teacher Panel 👨‍🏫</h2>
          <p className="subtitle">Create quizzes, manage questions, and track student performance.</p>
        </div>
        <div className="stat-pills">
          <div className="stat-pill"><span className="stat-num">{quizzes.length}</span><span className="stat-lbl">My Quizzes</span></div>
          <div className="stat-pill"><span className="stat-num">{quizzes.reduce((a,q)=>a+(q.participant_count||0),0)}</span><span className="stat-lbl">Total Attempts</span></div>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="tab-bar">
        <button className={`tab-btn ${tab==="quizzes"?"active":""}`} onClick={()=>setTab("quizzes")}>📋 My Quizzes</button>
        {selectedQuiz && <button className={`tab-btn ${tab==="manage"?"active":""}`} onClick={()=>setTab("manage")}>⚙️ {selectedQuiz.title}</button>}
      </div>

      {/* ── My Quizzes Tab ── */}
      {tab === "quizzes" && (
        <>
          <div className="section-action-row">
            <h3 className="section-title">My Quizzes</h3>
            <button className="btn-primary" onClick={() => setShowCreateQuiz(!showCreateQuiz)}>
              {showCreateQuiz ? "Cancel" : "+ Create Quiz"}
            </button>
          </div>

          {showCreateQuiz && (
            <form className="card create-form" onSubmit={handleCreateQuiz}>
              <h3>Create New Quiz</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input value={quizForm.title} onChange={e=>setQuizForm({...quizForm,title:e.target.value})} placeholder="Quiz title" required />
                </div>
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input type="number" min="1" max="180" value={quizForm.duration_minutes} onChange={e=>setQuizForm({...quizForm,duration_minutes:Number(e.target.value)})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Description</label>
                  <input value={quizForm.description} onChange={e=>setQuizForm({...quizForm,description:e.target.value})} placeholder="Optional description" />
                </div>
                <div className="form-group">
                  <label>Max Participants (optional)</label>
                  <input type="number" min="1" value={quizForm.max_participants} onChange={e=>setQuizForm({...quizForm,max_participants:e.target.value})} placeholder="Leave blank for unlimited" />
                </div>
              </div>
              <button type="submit" className="btn-primary">Create Quiz</button>
            </form>
          )}

          {quizzes.length === 0 ? (
            <div className="empty-state"><span className="empty-icon">📋</span><h3>No quizzes yet</h3><p>Create your first quiz above.</p></div>
          ) : (
            <div className="quiz-grid">
              {quizzes.map(q => (
                <div key={q.id} className="quiz-card">
                  <div className="quiz-card-body">
                    <h3>{q.title}</h3>
                    <p className="quiz-desc">{q.description || "No description."}</p>
                    <div className="quiz-meta">
                      <span>⏱ {q.duration_minutes} min</span>
                      <span>❓ {q.question_count} questions</span>
                      <span>👥 {q.participant_count || 0}{q.max_participants ? `/${q.max_participants}` : ""} students</span>
                    </div>
                  </div>
                  <div className="quiz-card-actions">
                    <button className="btn-start" onClick={()=>handleSelectQuiz(q)}>Manage →</button>
                    <button className="btn-danger" onClick={()=>handleDeleteQuiz(q.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Manage Quiz Tab ── */}
      {tab === "manage" && selectedQuiz && (
        <>
          <div className="manage-quiz-header">
            <div>
              <h3>{selectedQuiz.title}</h3>
              <p className="subtitle">⏱ {selectedQuiz.duration_minutes} min &nbsp;·&nbsp; {questions.length} questions &nbsp;·&nbsp; {participants.length}{selectedQuiz.max_participants ? `/${selectedQuiz.max_participants}` : ""} participants</p>
            </div>
            <button className="btn-primary" onClick={()=>setShowAddQuestion(!showAddQuestion)}>
              {showAddQuestion ? "Cancel" : "+ Add Question"}
            </button>
          </div>

          {showAddQuestion && (
            <form className="card create-form" onSubmit={handleAddQuestion}>
              <h3>Add Question</h3>
              <div className="form-group">
                <label>Question Text *</label>
                <textarea value={qForm.question_text} onChange={e=>setQForm({...qForm,question_text:e.target.value})} rows={2} required placeholder="Enter your question" />
              </div>
              <div className="form-row four-col">
                {["a","b","c","d"].map(opt=>(
                  <div className="form-group" key={opt}>
                    <label>Option {opt.toUpperCase()} *</label>
                    <input value={qForm[`option_${opt}`]} onChange={e=>setQForm({...qForm,[`option_${opt}`]:e.target.value})} placeholder={`Option ${opt.toUpperCase()}`} required />
                  </div>
                ))}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Correct Answer</label>
                  <select value={qForm.correct_option} onChange={e=>setQForm({...qForm,correct_option:e.target.value})}>
                    {["A","B","C","D"].map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Marks</label>
                  <input type="number" min="1" value={qForm.marks} onChange={e=>setQForm({...qForm,marks:Number(e.target.value)})} />
                </div>
              </div>
              <button type="submit" className="btn-primary">Add Question</button>
            </form>
          )}

          {/* Questions List */}
          <h4 className="section-title">Questions ({questions.length})</h4>
          {questions.length === 0 ? (
            <div className="empty-state"><span className="empty-icon">❓</span><h3>No questions yet</h3><p>Add questions using the button above.</p></div>
          ) : (
            <div className="admin-questions">
              {questions.map((q,i)=>(
                <div key={q.id} className="admin-q-card">
                  <div className="admin-q-header">
                    <span className="q-number">Q{i+1}</span>
                    <span className="q-marks">{q.marks} mark{q.marks>1?"s":""}</span>
                    <button className="btn-danger small" onClick={()=>handleDeleteQuestion(q.id)}>Delete</button>
                  </div>
                  <p className="question-text">{q.question_text}</p>
                  <div className="admin-options">
                    {["a","b","c","d"].map(opt=>(
                      <span key={opt} className={`admin-opt ${q.correct_option===opt.toUpperCase()?"correct-opt":""}`}>
                        <strong>{opt.toUpperCase()}.</strong> {q[`option_${opt}`]} {q.correct_option===opt.toUpperCase()&&"✓"}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Participants / Scores */}
          <h4 className="section-title" style={{marginTop:"2rem"}}>Student Scores ({participants.length})</h4>
          {participants.length === 0 ? (
            <div className="empty-state"><span className="empty-icon">👥</span><h3>No attempts yet</h3><p>Students haven't taken this quiz yet.</p></div>
          ) : (
            <div className="participants-table-wrap">
              <table className="participants-table">
                <thead>
                  <tr><th>Student</th><th>Score</th><th>Percentage</th><th>Time Taken</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {participants.map(p=>(
                    <tr key={p.id}>
                      <td><strong>{p.username}</strong><br/><small>{p.email}</small></td>
                      <td>{p.score}/{p.total_marks}</td>
                      <td><span className="pct-badge" style={{background:grade(p.percentage)}}>{p.percentage}%</span></td>
                      <td>{Math.floor(p.time_taken_seconds/60)}m {p.time_taken_seconds%60}s</td>
                      <td>{new Date(p.submitted_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </main>
  );
}
