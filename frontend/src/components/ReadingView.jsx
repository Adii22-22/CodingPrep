import { useState } from "react";

export default function ReadingView({ topic, topics, onBack, onSelectTopic }) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div
      style={{
        display: "flex",
        maxWidth: "1400px",
        margin: "0 auto",
        paddingTop: "80px",
        minHeight: "100vh",
      }}
    >
      {/* Column 1: Left Navigation Sidebar */}
      <div
        style={{
          width: "260px",
          borderRight: "1px solid #222",
          padding: "40px 20px",
          position: "fixed",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <button
          onClick={onBack}
          style={{
            backgroundColor: "transparent",
            color: "#aaa",
            border: "none",
            cursor: "pointer",
            marginBottom: "30px",
            fontSize: "14px",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#aaa")}
        >
          ← Back to Dashboard
        </button>
        <div
          style={{
            color: "#888",
            fontSize: "11px",
            letterSpacing: "1px",
            marginBottom: "20px",
          }}
        >
          PILLAR
        </div>
        <div
          style={{
            color: "#fff",
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "30px",
          }}
        >
          {"</>"} DSA
        </div>

        <div
          style={{
            color: "#ccc",
            fontSize: "14px",
            fontWeight: "bold",
            marginBottom: "15px",
          }}
        >
          Data Structures
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          {topics.map((t) => {
            const isActive = t.id === topic.id;
            return (
              <div
                key={t.id}
                onClick={() => onSelectTopic && onSelectTopic(t)}
                style={{
                  padding: "10px 15px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  backgroundColor: isActive ? "#1a1a1a" : "transparent",
                  color: isActive ? "#fff" : "#888",
                  transition: "all 0.15s",
                  borderLeft: isActive ? "2px solid #22c55e" : "2px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "#ccc";
                    e.currentTarget.style.backgroundColor = "#141414";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "#888";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                {t.title}
              </div>
            );
          })}
        </div>
      </div>

      {/* Column 2: Main Article Content */}
      <div
        style={{
          flex: 1,
          marginLeft: "260px",
          marginRight: "260px",
          padding: "60px 80px",
        }}
      >
        <h1 style={{ fontSize: "56px", margin: "0 0 20px 0", color: "#fff" }}>
          {topic.title}
        </h1>
        <div
          style={{
            color: "#888",
            fontSize: "14px",
            marginBottom: "50px",
            display: "flex",
            gap: "15px",
            alignItems: "center",
          }}
        >
          <span>August 24, 2026</span> | <span>5 min read</span>
          <span
            style={{
              border: "1px solid #333",
              padding: "4px 10px",
              borderRadius: "15px",
              fontSize: "11px",
              letterSpacing: "1px",
            }}
          >
            DEEP DIVE
          </span>
        </div>

        {topic.lessons?.map((lesson) => (
          <div key={lesson.id} id={`lesson-${lesson.id}`} style={{ marginBottom: "40px" }}>
            <h2
              style={{
                color: "#fff",
                borderBottom: "1px solid #222",
                paddingBottom: "15px",
              }}
            >
              {lesson.title}
            </h2>
            <p
              style={{
                color: "#ccc",
                fontSize: "18px",
                lineHeight: "1.7",
                whiteSpace: "pre-wrap",
              }}
            >
              {lesson.content}
            </p>
          </div>
        ))}
      </div>

      {/* Column 3: Table of Contents (Right Side) */}
      <div
        style={{
          width: "260px",
          borderLeft: "1px solid #222",
          padding: "40px 20px",
          position: "fixed",
          right: 0,
          height: "100vh",
        }}
      >
        <div
          style={{
            color: "#888",
            fontSize: "12px",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          On this page
        </div>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            color: "#aaa",
            fontSize: "14px",
            lineHeight: "2",
          }}
        >
          {topic.lessons?.map((lesson) => (
            <li
              key={lesson.id}
              onClick={() => {
                const el = document.getElementById(`lesson-${lesson.id}`);
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                cursor: "pointer",
                color: hoveredId === lesson.id ? "#fff" : "#aaa",
                transition: "color 0.15s",
              }}
              onMouseEnter={() => setHoveredId(lesson.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {lesson.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
