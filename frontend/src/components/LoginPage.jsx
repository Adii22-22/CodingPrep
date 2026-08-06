import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function LoginPage({ onNavigate }) {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      onNavigate("learn");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <div style={{ width: "400px", padding: "40px", backgroundColor: "#121212", borderRadius: "12px", border: "1px solid #333" }}>
        <h2 style={{ color: "#fff", textAlign: "center", marginBottom: "30px" }}>Welcome Back</h2>
        {error && <div style={{ color: "#ef4444", marginBottom: "20px", fontSize: "14px", textAlign: "center" }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", color: "#888", marginBottom: "8px", fontSize: "14px" }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #444",
                backgroundColor: "#1a1a1a", color: "#fff", fontSize: "16px", outline: "none", boxSizing: "border-box"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", color: "#888", marginBottom: "8px", fontSize: "14px" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #444",
                backgroundColor: "#1a1a1a", color: "#fff", fontSize: "16px", outline: "none", boxSizing: "border-box"
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "10px", padding: "14px", backgroundColor: "#22c55e", color: "#000",
              border: "none", borderRadius: "6px", fontSize: "16px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p style={{ color: "#888", textAlign: "center", marginTop: "20px", fontSize: "14px" }}>
          Don't have an account? <span onClick={() => onNavigate("register")} style={{ color: "#22c55e", cursor: "pointer" }}>Sign up</span>
        </p>
      </div>
    </div>
  );
}
