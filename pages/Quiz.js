import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuiz, getQuizQuestions } from "../services/quizService";
import { submitQuiz } from "../services/resultService";
import QuestionCard from "../components/QuestionCard";
import Timer from "../components/Timer";
import "../styles/Quiz.css";

export default function Quiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const elapsedRef = useRef(0);

  useEffect(() => {
    async function load() {
      try {
        const [qRes, qsRes] = await Promise.all([getQuiz(quizId), getQuizQuestions(quizId)]);
        setQuiz(qRes.data);
        setQuestions(qsRes.data);
      } catch { setError("Failed to load quiz."); }
      finally { setLoading(false); }
    }
    load();
  }, [quizId]);

  const handleSelect = (questionId, option) => setAnswers(prev => ({ ...prev, [questionId]: option }));

  const handleSubmit = async () => {
    if (!window.confirm("Submit your answers? This cannot be undone.")) return;
    setSubmitting(true);
    try {
      const payload = {
        quiz_id: parseInt(quizId),
        time_taken_seconds: elapsedRef.current,
        answers: questions.map(q => ({ question_id: q.id, selected_option: answers[q.id] || null }))
      };
      const res = await submitQuiz(payload);
      navigate(`/results/${res.data.result_id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Submission failed.");
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner"/><p>Loading quiz…</p></div>;
  if (error && !quiz) return <div className="page-content"><div className="error-banner">{error}</div></div>;

  const answered = Object.keys(answers).length;
  const total = questions.length;

  if (!started) {
    return (
      <div className="quiz-start-page">
        <div className="quiz-start-card">
          <h2>{quiz?.title}</h2>
          <p className="quiz-desc">{quiz?.description}</p>
          <div className="quiz-info-grid">
            <div className="info-item"><span className="info-val">{total}</span><span className="info-label">Questions</span></div>
            <div className="info-item"><span className="info-val">{quiz?.duration_minutes}</span><span className="info-label">Minutes</span></div>
            <div className="info-item"><span className="info-val">{questions.reduce((a,q)=>a+q.marks,0)}</span><span className="info-label">Total Marks</span></div>
          </div>
          <div className="quiz-rules">
            <p>📌 Read each question carefully before answering.</p>
            <p>⏱ Timer starts when you click Start.</p>
            <p>🔒 Answers cannot be changed after submission.</p>
          </div>
          <button className="btn-primary btn-large" onClick={() => setStarted(true)}>Start Quiz →</button>
          <button className="btn-ghost" onClick={() => navigate("/dashboard")}>← Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <div className="quiz-sidebar">
        <Timer durationMinutes={quiz.duration_minutes} onTimeUp={handleSubmit} onTick={e => { elapsedRef.current = e; }} />
        <div className="progress-section">
          <p className="progress-label">Progress</p>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${(answered/total)*100}%` }} /></div>
          <p className="progress-text">{answered} of {total} answered</p>
        </div>
        <div className="q-nav">
          {questions.map((q, i) => (
            <button key={q.id} className={`q-nav-btn ${current===i?"active":""} ${answers[q.id]?"answered":""}`} onClick={() => setCurrent(i)}>{i+1}</button>
          ))}
        </div>
        <button className="btn-submit" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Submitting…" : "Submit Quiz"}
        </button>
      </div>
      <div className="quiz-main">
        {questions.length === 0 ? (
          <div className="empty-state"><h3>No questions in this quiz yet.</h3></div>
        ) : (
          <>
            <QuestionCard question={questions[current]} index={current} total={total} selected={answers[questions[current]?.id]} onSelect={handleSelect} />
            <div className="quiz-nav-btns">
              <button className="btn-ghost" onClick={() => setCurrent(c => Math.max(c-1,0))} disabled={current===0}>← Previous</button>
              <button className="btn-primary" onClick={() => setCurrent(c => Math.min(c+1,total-1))} disabled={current===total-1}>Next →</button>
            </div>
          </>
        )}
        {error && <div className="error-banner">{error}</div>}
      </div>
    </div>
  );
}
