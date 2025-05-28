// src/hooks/useAuth.ts
import { useUser } from "../contexts/userContext";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_SERVER_URL;

export function useAuth() {
  const { setUser, setToken } = useUser();
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Login failed");
    const data = await res.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    setToken(data.token);
    navigate("/");
  };

  const register = async (email: string, password: string, pseudo: string) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, pseudo }),
    });
    if (!res.ok) throw new Error("Register failed");
    const data = await res.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    setToken(data.token);
    navigate("/");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    navigate("/login");
  };

  return { login, register, logout };
}
