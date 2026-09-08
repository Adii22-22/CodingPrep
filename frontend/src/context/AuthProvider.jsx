import { useState } from "react";
import { loginUser as apiLogin, registerUser as apiRegister } from "../api";
import { AuthContext } from "./AuthContext";

function getStoredUser() {
  const storedUser = localStorage.getItem("user");
  const storedToken = localStorage.getItem("access_token");
  if (!storedUser || !storedToken) return null;

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Failed to parse user from local storage", error);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  const login = async (username, password) => {
    const data = await apiLogin(username, password);
    localStorage.setItem("access_token", data.tokens.access);
    localStorage.setItem("refresh_token", data.tokens.refresh);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await apiRegister(userData);
    localStorage.setItem("access_token", data.tokens.access);
    localStorage.setItem("refresh_token", data.tokens.refresh);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
}
