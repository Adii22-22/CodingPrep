import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function RegisterPage({ onNavigate }) {
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register(formData);
      onNavigate("learn");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", padding: "40px 0" }}>
      <div style={{ width: "450px", padding: "40px", backgroundColor: "#121212", borderRadius: "12px", border: "1px solid #333" }}>
        <h2 style={{ color: "#fff", textAlign: "center", marginBottom: "30px" }}>Create an Account</h2>
        {error && <div style={{ color: "#ef4444", marginBottom: "20px", fontSize: "14px", textAlign: "center" }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", color: "#888", marginBottom: "8px", fontSize: "14px" }}>First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                style={{
                  width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #444",
                  backgroundColor: "#1a1a1a", color: "#fff", fontSize: "16px", outline: "none", boxSizing: "border-box"
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", color: "#888", marginBottom: "8px", fontSize: "14px" }}>Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                style={{
                  width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #444",
                  backgroundColor: "#1a1a1a", color: "#fff", fontSize: "16px", outline: "none", boxSizing: "border-box"
                }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: "block", color: "#888", marginBottom: "8px", fontSize: "14px" }}>Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              style={{
                width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #444",
                backgroundColor: "#1a1a1a", color: "#fff", fontSize: "16px", outline: "none", boxSizing: "border-box"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", color: "#888", marginBottom: "8px", fontSize: "14px" }}>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #444",
                backgroundColor: "#1a1a1a", color: "#fff", fontSize: "16px", outline: "none", boxSizing: "border-box"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", color: "#888", marginBottom: "8px", fontSize: "14px" }}>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="8"
              style={{
                width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #444",
                backgroundColor: "#1a1a1a", color: "#fff", fontSize: "16px", outline: "none", boxSizing: "border-box"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", color: "#888", marginBottom: "8px", fontSize: "14px" }}>Confirm Password *</label>
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
              minLength="8"
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
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <p style={{ color: "#888", textAlign: "center", marginTop: "20px", fontSize: "14px" }}>
          Already have an account? <span onClick={() => onNavigate("login")} style={{ color: "#22c55e", cursor: "pointer" }}>Login</span>
        </p>
      </div>
    </div>
  );
}
