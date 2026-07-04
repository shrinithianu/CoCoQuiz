import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import "../styles/Login.css";

const ROLES = [
  { value: "student", icon: "🎓", label: "Student", desc: "Take quizzes and view your scores" },
  { value: "teacher", icon: "👨‍🏫", label: "Teacher", desc: "Create quizzes and track student performance" },
  { value: "admin",   icon: "👑", label: "Admin",   desc: "Full access to all platform activity" },
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "", role: "student" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await registerUser({ username: form.username, email: form.email, password: form.password, role: form.role });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <span className="auth-logo">🧠</span>
          <h1>CoCoQuiz</h1>
          <p>Create your account</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {/* Role Selector */}
        <div className="role-selector">
          <label className="role-selector-label">I am a…</label>
          <div className="role-cards">
            {ROLES.map(r => (
              <div
                key={r.value}
                className={`role-card ${form.role === r.value ? "role-card-selected" : ""}`}
                onClick={() => setForm({ ...form, role: r.value })}
              >
                <span className="role-card-icon">{r.icon}</span>
                <span className="role-card-label">{r.label}</span>
                <span className="role-card-desc">{r.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label>Username</label>
              <input name="username" type="text" placeholder="Choose a username"
                value={form.username} onChange={e=>setForm({...form,username:e.target.value})} required autoFocus />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" placeholder="Your email address"
                value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input name="password" type="password" placeholder="Min 6 characters"
                value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input name="confirm" type="password" placeholder="Repeat password"
                value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})} required />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating account…" : `Register as ${ROLES.find(r=>r.value===form.role)?.label}`}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
