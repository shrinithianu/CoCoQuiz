import axios from "axios";
const API = "http://localhost:5000/auth";
export const registerUser = (data) => axios.post(`${API}/register`, data);
export const loginUser = (data) => axios.post(`${API}/login`, data);
export const saveAuth = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};
export const getUser = () => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } };
export const getToken = () => localStorage.getItem("token");
export const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); };
