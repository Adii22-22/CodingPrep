import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar({ activeTab, onNavigate }) {
  const { user, logout } = useContext(AuthContext);

  const tabs = [
    { label: "Learn", key: "learn" },
    { label: "Practice", key: "practice" },
    { label: "Interview", key: "interview" },
  ];

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 100,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 40px",
        backgroundColor: "#0a0a0a",
        borderBottom: "1px solid #222",
        boxSizing: "border-box",
      }}
    >
      {/* Left Side: Logo and Working Tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
        <h2
          onClick={() => onNavigate("learn")}
          style={{
            margin: 0,
            color: "#22c55e",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            cursor: "pointer",
          }}
        >
          <span style={{ color: "#fff" }}>Code</span> Prep
        </h2>
        <nav style={{ display: "flex", gap: "10px" }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <span
                key={tab.key}
                onClick={() => onNavigate(tab.key)}
                style={{
                  color: isActive ? "#fff" : "#aaa",
                  backgroundColor: isActive ? "#222" : "transparent",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontWeight: isActive ? "bold" : "normal",
                  transition: "all 0.2s",
                }}
              >
                {tab.label}
              </span>
            );
          })}
        </nav>
      </div>

      {/* Right Side */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        {user ? (
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "15px" }}>
            <span
              onClick={() => onNavigate("profile")}
              style={{ cursor: "pointer", fontSize: "14px", color: "#ddd", fontWeight: "bold" }}
            >
              {user.username}
            </span>
            <div
              onClick={() => onNavigate("profile")}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "#22c55e",
                color: "#000",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {user.username[0].toUpperCase()}
            </div>
            <button
              onClick={() => {
                logout();
                onNavigate("login");
              }}
              style={{
                background: "transparent",
                border: "1px solid #444",
                color: "#aaa",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => onNavigate("login")}
              style={{
                padding: "6px 16px",
                borderRadius: "20px",
                backgroundColor: "transparent",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Login
            </button>
            <button
              onClick={() => onNavigate("register")}
              style={{
                padding: "6px 16px",
                borderRadius: "20px",
                backgroundColor: "#22c55e",
                color: "#000",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
