import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout, getUser } from "../services/authService";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  const handleLogout = () => { logout(); navigate("/login"); };
  const isActive = (path) => location.pathname === path ? "nav-link active" : "nav-link";

  const roleIcon = { admin: "👑", teacher: "👨‍🏫", student: "🎓" };
  const roleLabel = { admin: "Admin", teacher: "Teacher", student: "Student" };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="brand-icon">🧠</span>
        <span className="brand-name">CoCoQuiz</span>
      </div>
      <div className="nav-links">
        <Link to="/dashboard" className={isActive("/dashboard")}>Dashboard</Link>
        {user?.role === "student" && (
          <Link to="/results" className={isActive("/results")}>My Results</Link>
        )}
      </div>
      <div className="nav-user">
        <span className={`role-badge role-${user?.role}`}>
          {roleIcon[user?.role]} {roleLabel[user?.role]}
        </span>
        <span className="username">{user?.username}</span>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </div>
    </nav>
  );
}
