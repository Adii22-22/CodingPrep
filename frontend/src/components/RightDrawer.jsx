export default function RightDrawer({ topic, onClose, onReadLesson, onProblemClick }) {
  if (!topic) return null;

  const difficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case "easy":
        return "#22c55e";
      case "medium":
        return "#eab308";
      case "hard":
        return "#ef4444";
      default:
        return "#888";
    }
  };

  return (
    <>
      {/* Dimmed Background Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          zIndex: 999,
          cursor: "pointer",
        }}
      />

      {/* The Slide-Out Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "450px",
          height: "100vh",
          backgroundColor: "#111",
          borderLeft: "1px solid #333",
          zIndex: 1000,
          padding: "30px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "30px",
          boxSizing: "border-box",
        }}
      >
        {/* Header & Close Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                color: "#888",
                fontSize: "12px",
                letterSpacing: "1px",
                marginBottom: "8px",
              }}
            >
              LESSON DETAILS
            </div>
            <h2 style={{ color: "#fff", fontSize: "32px", margin: 0 }}>
              {topic.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "#222",
              border: "none",
              color: "#fff",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        <p style={{ color: "#aaa", lineHeight: "1.5", margin: 0 }}>
          Read the lesson to refresh {topic.title}, solve a few questions with
          it, then teach it back to your Protege to make it stick.
        </p>

        {/* Read Lesson Button */}
        <button
          onClick={onReadLesson}
          style={{
            backgroundColor: "#22c55e",
            color: "#000",
            border: "none",
            padding: "16px",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#16a34a")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#22c55e")
          }
        >
          <span>📖 Read the lesson</span>
          <span>↗</span>
        </button>

        {/* Practice Questions List */}
        <div>
          <div
            style={{
              color: "#888",
              fontSize: "12px",
              letterSpacing: "1px",
              marginBottom: "15px",
            }}
          >
            PRACTICE QUESTIONS
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {topic.problems?.length > 0 ? (
              topic.problems.map((problem) => (
                <div
                  key={problem.id}
                  onClick={() => onProblemClick && onProblemClick(problem)}
                  style={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "#555")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "#333")
                  }
                >
                  <span style={{ color: "#fff", fontSize: "14px" }}>
                    {problem.title}
                  </span>
                  <span
                    style={{
                      color: difficultyColor(problem.difficulty),
                      fontSize: "12px",
                      fontWeight: "bold",
                      textTransform: "capitalize",
                    }}
                  >
                    {problem.difficulty}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: "#555", fontSize: "14px" }}>
                No problems available.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
