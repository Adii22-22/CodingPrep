import { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "./components/Navbar";
import RightDrawer from "./components/RightDrawer";
import ReadingView from "./components/ReadingView";
import ProblemView from "./components/ProblemView";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import ProfilePage from "./components/ProfilePage";
import InterviewView from "./components/InterviewView";
import { fetchCategories } from "./api";

// ─── Hash Route Parser ───
function parseHash(hash) {
  const path = (hash || "").replace(/^#\/?/, "");
  if (!path) return { view: "learn" };

  const segments = path.split("/");
  switch (segments[0]) {
    case "learn":
      return { view: "learn" };
    case "practice":
      return { view: "practice" };
    case "interview":
      if (segments[1] === "active") {
        return { view: "active_interview", level: segments[2] || "easy" };
      }
      return { view: "interview" };
    case "problem":
      return { view: "problem", id: parseInt(segments[1], 10) };
    case "read":
      return { view: "read", topicId: parseInt(segments[1], 10) };
    case "login":
      return { view: "login" };
    case "register":
      return { view: "register" };
    case "profile":
      return { view: "profile" };
    default:
      return { view: "learn" };
  }
}

export default function App() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("learn");
  const [selectedTopicDrawer, setSelectedTopicDrawer] = useState(null);
  const [readingTopic, setReadingTopic] = useState(null);
  const [activeProblem, setActiveProblem] = useState(null);
  const [interviewLevel, setInterviewLevel] = useState("easy");
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  // Keep a ref for categories so hashchange handler always has fresh data
  const categoriesRef = useRef([]);
  useEffect(() => {
    categoriesRef.current = categories;
  }, [categories]);

  // ─── Apply the current hash route to state ───
  const applyRoute = useCallback((cats) => {
    const data = cats || categoriesRef.current;
    const parsed = parseHash(window.location.hash);

    switch (parsed.view) {
      case "problem": {
        if (data.length === 0) break;
        const allProbs = data.flatMap((cat) =>
          cat.topics.flatMap((t) =>
            (t.problems || []).map((p) => ({
              ...p,
              topicTitle: t.title,
              categoryTitle: cat.title,
            }))
          )
        );
        const found = allProbs.find((p) => p.id === parsed.id);
        if (found) {
          setActiveProblem(found);
          setReadingTopic(null);
        } else {
          // Problem not found — redirect to learn
          window.location.hash = "#/learn";
        }
        break;
      }
      case "read": {
        if (data.length === 0) break;
        let foundTopic = null;
        let catIdx = 0;
        for (let i = 0; i < data.length; i++) {
          const t = data[i].topics.find((topic) => topic.id === parsed.topicId);
          if (t) {
            foundTopic = t;
            catIdx = i;
            break;
          }
        }
        if (foundTopic) {
          setReadingTopic(foundTopic);
          setActiveProblem(null);
          setActiveCategoryIndex(catIdx);
          setActiveTab("learn");
        } else {
          window.location.hash = "#/learn";
        }
        break;
      }
      case "active_interview":
        setInterviewLevel(parsed.level || "easy");
        setActiveTab("active_interview");
        setActiveProblem(null);
        setReadingTopic(null);
        break;
      default:
        // Simple tab views: learn, practice, interview, login, register, profile
        setActiveTab(parsed.view);
        setActiveProblem(null);
        setReadingTopic(null);
        break;
    }
  }, []);

  // ─── Fetch categories, then apply the initial route ───
  useEffect(() => {
    fetchCategories()
      .then((data) => {
        setCategories(data);
        categoriesRef.current = data;
        setError(null);
        applyRoute(data);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError(
          "Could not connect to the server. Make sure the backend is running."
        );
        applyRoute([]);
      })
      .finally(() => setLoading(false));
  }, [applyRoute]);

  // ─── Listen for hash changes (browser back / forward) ───
  useEffect(() => {
    const handler = () => applyRoute();
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, [applyRoute]);

  // ─── Navigation helper ───
  const navigate = (hash) => {
    window.location.hash = hash;
  };

  const openDrawer = (topic) => setSelectedTopicDrawer(topic);
  const closeDrawer = () => setSelectedTopicDrawer(null);

  const startReading = () => {
    if (selectedTopicDrawer) {
      navigate(`#/read/${selectedTopicDrawer.id}`);
      closeDrawer();
    }
  };

  const openProblem = (problem) => {
    navigate(`#/problem/${problem.id}`);
    closeDrawer();
  };

  const handleTabChange = (tab) => {
    navigate(`#/${tab}`);
  };

  // Collect all problems across all categories/topics for the Practice tab
  const allProblems = categories.flatMap((cat) =>
    cat.topics.flatMap((t) =>
      (t.problems || []).map((p) => ({
        ...p,
        topicTitle: t.title,
        categoryTitle: cat.title,
      }))
    )
  );

  // ─── VIEWS ───

  if (activeProblem) {
    return (
      <div
        style={{
          backgroundColor: "#0a0a0a",
          minHeight: "100vh",
          fontFamily: "sans-serif",
        }}
      >
        <Navbar activeTab={activeTab} onNavigate={handleTabChange} />
        <ProblemView problem={activeProblem} />
      </div>
    );
  }

  if (activeTab === "active_interview") {
    return (
      <div
        style={{
          backgroundColor: "#0a0a0a",
          minHeight: "100vh",
          fontFamily: "sans-serif",
        }}
      >
        <Navbar activeTab="interview" onNavigate={handleTabChange} />
        <InterviewView level={interviewLevel} />
      </div>
    );
  }

  if (readingTopic) {
    return (
      <div
        style={{
          backgroundColor: "#0a0a0a",
          minHeight: "100vh",
          fontFamily: "sans-serif",
        }}
      >
        <Navbar activeTab={activeTab} onNavigate={handleTabChange} />
        <ReadingView
          topic={readingTopic}
          topics={categories[activeCategoryIndex]?.topics || []}
          onSelectTopic={(t) => navigate(`#/read/${t.id}`)}
          categoryTitle={categories[activeCategoryIndex]?.title || "Topics"}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#0a0a0a",
        minHeight: "100vh",
        fontFamily: "sans-serif",
        color: "#fff",
      }}
    >
      <Navbar activeTab={activeTab} onNavigate={handleTabChange} />

      <main
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "100px 24px 60px" }}
      >
        {/* LOGIN / REGISTER / PROFILE */}
        {activeTab === "login" && <LoginPage onNavigate={handleTabChange} />}
        {activeTab === "register" && (
          <RegisterPage onNavigate={handleTabChange} />
        )}
        {activeTab === "profile" && <ProfilePage onProblemClick={openProblem} />}

        {/* LEARN TAB */}
        {activeTab === "learn" && (
          <>
            <div style={{ marginBottom: "40px" }}>
              <h1
                style={{
                  color: "#fff",
                  fontSize: "42px",
                  fontWeight: "800",
                  margin: "0 0 10px 0",
                }}
              >
                Your path to a job
              </h1>
              <p style={{ color: "#888", fontSize: "16px", margin: 0 }}>
                From job search to advanced interview prep.
              </p>
            </div>

            <div
              style={{
                backgroundColor: "#121212",
                border: "1px solid #222",
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", minHeight: "550px" }}>
                {/* Left Column: Stage Selector Menu */}
                <div
                  style={{
                    width: "280px",
                    borderRight: "1px solid #222",
                    padding: "30px 0",
                    backgroundColor: "#0e0e0e",
                  }}
                >
                  <div
                    style={{
                      padding: "0 24px 20px 24px",
                      color: "#666",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    Curriculum Stages
                  </div>
                  {categories.map((cat, idx) => (
                    <div
                      key={cat.id}
                      onClick={() => setActiveCategoryIndex(idx)}
                      style={{
                        padding: "16px 24px",
                        borderLeft:
                          activeCategoryIndex === idx
                            ? "3px solid #22c55e"
                            : "3px solid transparent",
                        backgroundColor:
                          activeCategoryIndex === idx
                            ? "#181818"
                            : "transparent",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <div
                        style={{
                          color: "#888",
                          fontSize: "12px",
                          marginBottom: "4px",
                        }}
                      >
                        STAGE {String(idx + 1).padStart(2, "0")}
                      </div>
                      <div
                        style={{
                          color:
                            activeCategoryIndex === idx ? "#fff" : "#aaa",
                          fontSize: "15px",
                          fontWeight: "bold",
                        }}
                      >
                        {cat.title}
                      </div>
                    </div>
                  ))}
                  {categories.length === 0 && !loading && (
                    <div
                      style={{
                        padding: "16px 24px",
                        color: "#666",
                        fontSize: "14px",
                      }}
                    >
                      No stages found.
                    </div>
                  )}
                </div>

                {/* Right Column: Stage Content */}
                <div style={{ flex: 1, padding: "40px" }}>
                  {categories[activeCategoryIndex] && (
                    <>
                      <div
                        style={{
                          color: "#22c55e",
                          fontSize: "12px",
                          letterSpacing: "1.5px",
                          marginBottom: "8px",
                          fontWeight: "bold",
                        }}
                      >
                        STAGE{" "}
                        {String(activeCategoryIndex + 1).padStart(2, "0")} OF{" "}
                        {String(categories.length).padStart(2, "0")}
                      </div>
                      <h2
                        style={{
                          color: "#fff",
                          fontSize: "28px",
                          marginTop: 0,
                          marginBottom: "12px",
                        }}
                      >
                        {categories[activeCategoryIndex].title}
                      </h2>
                      <p
                        style={{
                          color: "#888",
                          fontSize: "15px",
                          marginBottom: "40px",
                          lineHeight: "1.5",
                        }}
                      >
                        {categories[activeCategoryIndex].description ||
                          "Dive into this stage and master the necessary skills."}
                      </p>

                      {/* Topic Cards Grid */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(280px, 1fr))",
                          gap: "16px",
                        }}
                      >
                        {categories[activeCategoryIndex].topics.length > 0 ? (
                          categories[activeCategoryIndex].topics.map(
                            (topic, index) => (
                              <div
                                key={topic.id}
                                onClick={() => openDrawer(topic)}
                                style={{
                                  border: "1px solid #262626",
                                  borderRadius: "10px",
                                  padding: "20px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "16px",
                                  backgroundColor: "#181818",
                                  transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.borderColor =
                                    "#22c55e")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.borderColor =
                                    "#262626")
                                }
                              >
                                <span
                                  style={{
                                    color: "#555",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                  }}
                                >
                                  {String(index + 1).padStart(2, "0")}
                                </span>
                                <span
                                  style={{
                                    color: "#fff",
                                    fontWeight: "600",
                                    fontSize: "15px",
                                  }}
                                >
                                  {topic.title}
                                </span>
                                <span
                                  style={{
                                    marginLeft: "auto",
                                    color: "#555",
                                    fontSize: "14px",
                                  }}
                                >
                                  →
                                </span>
                              </div>
                            )
                          )
                        ) : (
                          <p style={{ color: "#666" }}>
                            No topics found in this stage.
                          </p>
                        )}
                      </div>
                    </>
                  )}
                  {loading && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        color: "#666",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: "16px",
                          height: "16px",
                          border: "2px solid #444",
                          borderTopColor: "#22c55e",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      Loading stages...
                    </div>
                  )}
                  {error && (
                    <div
                      style={{
                        backgroundColor: "#1a1212",
                        border: "1px solid #3b1515",
                        borderRadius: "10px",
                        padding: "20px",
                        color: "#f87171",
                        fontSize: "14px",
                      }}
                    >
                      ⚠ {error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* PRACTICE TAB */}
        {activeTab === "practice" && (
          <div>
            <div style={{ marginBottom: "40px" }}>
              <h1
                style={{
                  color: "#fff",
                  fontSize: "42px",
                  fontWeight: "800",
                  margin: "0 0 10px 0",
                }}
              >
                Practice Problems
              </h1>
              <p style={{ color: "#888", fontSize: "16px", margin: 0 }}>
                Sharpen your skills with hands-on coding challenges.
              </p>
            </div>

            <div
              style={{
                backgroundColor: "#121212",
                border: "1px solid #222",
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "50px 1fr 140px 100px",
                  padding: "16px 28px",
                  borderBottom: "1px solid #222",
                  color: "#555",
                  fontSize: "12px",
                  fontWeight: "600",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                <span>#</span>
                <span>Title</span>
                <span>Topic</span>
                <span style={{ textAlign: "right" }}>Difficulty</span>
              </div>

              {loading ? (
                <div style={{ padding: "40px", color: "#666" }}>
                  Loading problems...
                </div>
              ) : allProblems.length > 0 ? (
                allProblems.map((problem, index) => (
                  <div
                    key={problem.id}
                    onClick={() => openProblem(problem)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "50px 1fr 140px 100px",
                      padding: "16px 28px",
                      borderBottom: "1px solid #1a1a1a",
                      cursor: "pointer",
                      transition: "background-color 0.15s",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#181818")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <span style={{ color: "#444", fontSize: "14px" }}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      style={{
                        color: "#fff",
                        fontSize: "15px",
                        fontWeight: "500",
                      }}
                    >
                      {problem.title}
                    </span>
                    <span style={{ color: "#666", fontSize: "13px" }}>
                      {problem.topicTitle}
                    </span>
                    <span
                      style={{
                        textAlign: "right",
                        fontSize: "12px",
                        fontWeight: "700",
                        textTransform: "capitalize",
                        color:
                          problem.difficulty === "easy"
                            ? "#22c55e"
                            : problem.difficulty === "medium"
                            ? "#eab308"
                            : "#ef4444",
                      }}
                    >
                      {problem.difficulty}
                    </span>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    padding: "60px 28px",
                    textAlign: "center",
                    color: "#555",
                  }}
                >
                  No problems available yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* INTERVIEW TAB */}
        {activeTab === "interview" && (
          <div
            style={{
              backgroundColor: "#121212",
              border: "1px solid #222",
              borderRadius: "16px",
              padding: "40px",
              minHeight: "400px",
            }}
          >
            <h1 style={{ color: "#fff", marginTop: 0 }}>
              Interview Preparation
            </h1>
            <p style={{ color: "#888", marginBottom: "30px" }}>
              Sharpen your skills with a simulated AI technical interview.
            </p>

            <div style={{ display: "flex", gap: "20px", marginBottom: "40px" }}>
              {["easy", "intermediate", "pro"].map((level) => (
                <div
                  key={level}
                  onClick={() => setInterviewLevel(level)}
                  style={{
                    flex: 1,
                    padding: "20px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    border:
                      interviewLevel === level
                        ? "2px solid #22c55e"
                        : "1px solid #333",
                    backgroundColor:
                      interviewLevel === level ? "#1a1a1a" : "#111",
                    transition: "all 0.2s",
                  }}
                >
                  <h3
                    style={{
                      color:
                        interviewLevel === level ? "#22c55e" : "#fff",
                      margin: "0 0 10px",
                      textTransform: "capitalize",
                    }}
                  >
                    {level}
                  </h3>
                  <p
                    style={{ color: "#888", fontSize: "13px", margin: 0 }}
                  >
                    {level === "easy" && "2 Easy Questions"}
                    {level === "intermediate" && "1 Easy, 1 Medium Question"}
                    {level === "pro" && "1 Medium, 1 Hard Question"}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() =>
                navigate(`#/interview/active/${interviewLevel}`)
              }
              style={{
                backgroundColor: "#22c55e",
                color: "#000",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#16a34a")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#22c55e")
              }
            >
              Start{" "}
              {interviewLevel.charAt(0).toUpperCase() +
                interviewLevel.slice(1)}{" "}
              Interview
            </button>
          </div>
        )}
      </main>

      <RightDrawer
        topic={selectedTopicDrawer}
        onClose={closeDrawer}
        onReadLesson={startReading}
        onProblemClick={openProblem}
      />
    </div>
  );
}
