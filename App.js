import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import Navbar from "./components/Navbar";
import { getUser } from "./services/authService";

function PrivateRoute({ children, roles }) {
  const token = localStorage.getItem("token");
  const user = getUser();
  if (!token) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function DashboardRouter() {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <><Navbar /><AdminDashboard /></>;
  if (user.role === "teacher") return <><Navbar /><TeacherDashboard /></>;
  return <><Navbar /><StudentDashboard /></>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardRouter /></PrivateRoute>} />
        <Route path="/quiz/:quizId" element={<PrivateRoute roles={["student"]}><Quiz /></PrivateRoute>} />
        <Route path="/results" element={<PrivateRoute roles={["student"]}><Navbar /><Results /></PrivateRoute>} />
        <Route path="/results/:resultId" element={<PrivateRoute roles={["student"]}><Navbar /><Results /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}
