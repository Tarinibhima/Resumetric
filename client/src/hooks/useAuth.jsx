/**
 * useAuth — lightweight auth context
 * Stores JWT in memory (sessionStorage for tab persistence).
 */

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const API = axios.create({
  baseURL:
    (import.meta.env.VITE_API_URL ||
      "https://resumetric-buuc.onrender.com") + "/api",
});

console.log("API BASE:",
import.meta.env.VITE_API_URL);

// Attach JWT to every request
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("rt_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("rt_token");
    if (!token) { setLoading(false); return; }
    API.get("/auth/me")
      .then(({ data }) => setUser(data.user))
      .catch(() => sessionStorage.removeItem("rt_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });
    sessionStorage.setItem("rt_token", data.token);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await API.post("/auth/register", { name, email, password });
    sessionStorage.setItem("rt_token", data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    sessionStorage.removeItem("rt_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, API }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export { API };
