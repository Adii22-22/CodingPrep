import { useState, useEffect, useRef, useCallback, useContext } from "react";
import Editor from "@monaco-editor/react";
import { startInterview, sendInterviewChat, getNextProblemPrompt, gradeInterview, runCode, submitCode } from "../api";
import { AuthContext } from "../context/AuthContext";
import AIChatWidget from "./AIChatWidget";
import ReactMarkdown from "react-markdown";

// ─── Custom Markdown Components for Colorful Report ───
const reportComponents = {
  h1: ({ children }) => (
    <h1 style={{
      color: "#22c55e", fontSize: "28px", fontWeight: "800",
      borderBottom: "2px solid rgba(34,197,94,0.2)", paddingBottom: "14px",
      marginTop: "32px", marginBottom: "16px",
    }}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 style={{
      color: "#60a5fa", fontSize: "22px", fontWeight: "700",
      marginTop: "28px", marginBottom: "12px",
      display: "flex", alignItems: "center", gap: "8px",
    }}>
      <span style={{
        width: "4px", height: "22px", borderRadius: "2px",
        background: "linear-gradient(180deg, #60a5fa, #3b82f6)",
        display: "inline-block", flexShrink: 0,
      }} />
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 style={{
      color: "#a78bfa", fontSize: "18px", fontWeight: "600",
      marginTop: "20px", marginBottom: "10px",
    }}>
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p style={{
      color: "#bbb", lineHeight: "1.85", marginBottom: "14px", fontSize: "15px",
    }}>
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong style={{ color: "#fff", fontWeight: "700" }}>{children}</strong>
  ),
  em: ({ children }) => (
    <em style={{ color: "#fbbf24", fontStyle: "italic" }}>{children}</em>
  ),
  li: ({ children }) => (
    <li style={{
      color: "#ccc", marginBottom: "8px", lineHeight: "1.7", fontSize: "15px",
      paddingLeft: "4px",
    }}>
      {children}
    </li>
  ),
  ul: ({ children }) => (
    <ul style={{ paddingLeft: "20px", margin: "8px 0 16px" }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ paddingLeft: "20px", margin: "8px 0 16px" }}>{children}</ol>
  ),
  blockquote: ({ children }) => (
    <blockquote style={{
      borderLeft: "3px solid #22c55e",
      backgroundColor: "rgba(34,197,94,0.06)",
      padding: "14px 20px", margin: "16px 0",
      borderRadius: "0 10px 10px 0",
    }}>
      {children}
    </blockquote>
  ),
  code({ node, inline, className, children, ...props }) {
    return inline ? (
      <code style={{
        backgroundColor: "rgba(34,197,94,0.12)", padding: "2px 8px",
        borderRadius: "4px", color: "#22c55e", fontSize: "13px",
        fontFamily: "'Fira Code', 'Consolas', monospace",
      }} {...props}>
        {children}
      </code>
    ) : (
      <pre style={{
        backgroundColor: "#0a0a0a", padding: "18px",
        borderRadius: "10px", border: "1px solid #222",
        overflowX: "auto", margin: "12px 0",
      }}>
        <code style={{
          color: "#e2e8f0", fontSize: "13px",
          fontFamily: "'Fira Code', 'Consolas', monospace",
        }} {...props}>
          {children}
        </code>
      </pre>
    );
  },
  hr: () => (
    <hr style={{
      border: "none", height: "1px", margin: "28px 0",
      background: "linear-gradient(90deg, transparent, #333, transparent)",
    }} />
  ),
};

export default function InterviewView({ level = "easy" }) {
  const [problems, setProblems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [code, setCode] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  
  // Grading State
  const [isFinished, setIsFinished] = useState(false);
  const [gradeReport, setGradeReport] = useState(null);
  const [fullTranscript, setFullTranscript] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  
  // Resizable Panel State
  const [leftPanelWidth, setLeftPanelWidth] = useState(45);
  const containerRef = useRef(null);
  const isDraggingV = useRef(false);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    let isMounted = true;
    startInterview(level).then((res) => {
      if (isMounted) {
        setProblems(res.problems);
        setAiMessage(res.initial_message);
        setChatHistory([{ role: "model", content: res.initial_message }]);
        setFullTranscript(`[Problem 1: ${res.problems[0].title}]\nAI: ${res.initial_message}\n`);
        setupCodeEditor(res.problems[0]);
        setIsLoading(false);
      }
    }).catch(err => {
      console.error(err);
      if (isMounted) {
        setAiMessage("Failed to start interview.");
        setIsLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [level]);

  const setupCodeEditor = (prob) => {
    const fnName = prob.function_name || "solution";
    const params = prob.parameter_names;
    const paramStr = Array.isArray(params) && params.length > 0 ? params.join(", ") : "";
    setCode(`def ${fnName}(${paramStr}):\n    # Write your solution here\n    pass\n`);
  };

  const advanceToNextOrGrade = async (currentTranscript) => {
    if (currentIndex + 1 < problems.length) {
      const nextProb = problems[currentIndex + 1];
      setIsAiTyping(true);
      try {
        const res = await getNextProblemPrompt(nextProb.id);
        setCurrentIndex(currentIndex + 1);
        setupCodeEditor(nextProb);
        setAiMessage(res.initial_message);
        setChatHistory([{ role: "model", content: res.initial_message }]);
        setFullTranscript(currentTranscript + `\n\n[Problem ${currentIndex + 2}: ${nextProb.title}]\nAI: ${res.initial_message}\n`);
      } catch (err) {
        setAiMessage("Failed to load next problem.");
      } finally {
        setIsAiTyping(false);
      }
    } else {
      setIsFinished(true);
      setIsAiTyping(true);
      try {
        const res = await gradeInterview(currentTranscript);
        setGradeReport(res.grade_report);
      } catch (err) {
        setGradeReport("Failed to generate grading report.");
      } finally {
        setIsAiTyping(false);
      }
    }
  };

  const handleSendMessage = async (msg) => {
    const updatedHistory = [...chatHistory, { role: "user", content: msg }];
    setChatHistory(updatedHistory);
    setIsAiTyping(true);
    
    let currentTranscript = fullTranscript + `User: ${msg}\n`;
    
    try {
      const res = await sendInterviewChat(problems[currentIndex].id, updatedHistory, code, msg);
      let responseText = res.response;
      
      const shouldAdvance = responseText.includes("[[NEXT]]");
      if (shouldAdvance) {
        responseText = responseText.replace("[[NEXT]]", "").trim();
      }
      
      setAiMessage(responseText);
      setChatHistory([...updatedHistory, { role: "model", content: responseText }]);
      currentTranscript += `AI: ${responseText}\n`;
      setFullTranscript(currentTranscript);
      
      if (shouldAdvance) {
        setTimeout(() => advanceToNextOrGrade(currentTranscript), 3000);
      }
      
    } catch (err) {
      setAiMessage("Error communicating with AI. Please try again.");
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleTestCode = async (isSubmit) => {
    if (!problems[currentIndex]) return;
    setIsTesting(true);
    try {
      const apiCall = isSubmit ? submitCode : runCode;
      const res = await apiCall(problems[currentIndex].id, code);
      
      const statusMsg = `Code Execution Result (${isSubmit ? 'Submit' : 'Run'}):\nStatus: ${res.status}\nPassed: ${res.passed_test_cases}/${res.total_test_cases}\nRuntime: ${res.runtime}ms\nOutput: ${res.stdout}\nError: ${res.error_message}`;
      
      // Auto-send this to AI
      handleSendMessage(`[System: The user ran tests.]\n${statusMsg}`);
      
    } catch (err) {
      alert("Failed to run code: " + err.message);
    } finally {
      setIsTesting(false);
    }
  };

  const handleVerticalDragStart = useCallback((e) => {
    e.preventDefault();
    isDraggingV.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingV.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const pct = ((e.clientX - rect.left) / rect.width) * 100;
        setLeftPanelWidth(Math.min(Math.max(pct, 20), 75));
      }
    };
    const handleMouseUp = () => {
      if (isDraggingV.current) {
        isDraggingV.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  if (isLoading) return (
    <div style={{ padding: "100px", textAlign: "center", marginTop: "61px" }}>
      <div style={{
        width: "40px", height: "40px", border: "3px solid #222",
        borderTopColor: "#22c55e", borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        margin: "0 auto 20px",
      }} />
      <div style={{ color: "#888", fontSize: "16px" }}>Setting up your interview room...</div>
    </div>
  );
  
  if (!problems.length) return <div style={{ padding: "100px", color: "#ef4444", textAlign: "center" }}>Failed to load problems.</div>;

  // ─── INTERVIEW COMPLETED — COLORFUL RESULTS PAGE ───
  if (isFinished) {
    return (
      <div style={{ padding: "40px 20px", maxWidth: "900px", margin: "80px auto 0", animation: "fadeIn 0.5s ease-out" }}>
        {/* ─── Header Card with Gradient ─── */}
        <div style={{
          background: "linear-gradient(135deg, #0d1f17 0%, #0a1a2e 50%, #1a0d2e 100%)",
          borderRadius: "20px", padding: "50px 40px", textAlign: "center",
          border: "1px solid #1a3a2a", marginBottom: "30px",
          position: "relative", overflow: "hidden",
        }}>
          {/* Decorative orbs */}
          <div style={{
            position: "absolute", top: "-40px", right: "-40px",
            width: "160px", height: "160px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(34,197,94,0.12), transparent)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: "-30px", left: "-30px",
            width: "100px", height: "100px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(96,165,250,0.08), transparent)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", top: "20px", left: "30px",
            width: "60px", height: "60px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(167,139,250,0.06), transparent)",
            pointerEvents: "none",
          }} />

          {/* Trophy */}
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px", fontSize: "36px",
            boxShadow: "0 0 40px rgba(34,197,94,0.25), 0 0 80px rgba(34,197,94,0.1)",
          }}>
            🏆
          </div>

          <h1 style={{
            color: "#fff", fontSize: "36px", fontWeight: "800",
            margin: "0 0 10px", letterSpacing: "-0.5px",
          }}>
            Interview Complete!
          </h1>
          <p style={{ color: "#888", fontSize: "16px", margin: 0, lineHeight: "1.6" }}>
            Here's your detailed performance evaluation
          </p>

          {/* Level Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            marginTop: "20px", padding: "8px 20px", borderRadius: "20px",
            backgroundColor: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
          }}>
            <span style={{ fontSize: "12px", color: "#888", textTransform: "uppercase", letterSpacing: "1px" }}>
              Level
            </span>
            <span style={{ fontSize: "14px", color: "#22c55e", fontWeight: "700", textTransform: "capitalize" }}>
              {level}
            </span>
          </div>
        </div>

        {/* ─── Report Card ─── */}
        {isAiTyping && !gradeReport ? (
          <div style={{
            backgroundColor: "#111", borderRadius: "16px", padding: "60px 40px",
            border: "1px solid #222", textAlign: "center",
          }}>
            <div style={{
              width: "36px", height: "36px", border: "3px solid #222",
              borderTopColor: "#22c55e", borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 24px",
            }} />
            <p style={{ color: "#888", fontSize: "16px", margin: 0 }}>
              Generating your evaluation report...
            </p>
            <p style={{ color: "#555", fontSize: "13px", marginTop: "8px" }}>
              Our AI is analyzing your performance across all problems
            </p>
          </div>
        ) : (
          <div style={{
            backgroundColor: "#111", borderRadius: "16px",
            border: "1px solid #222", overflow: "hidden",
          }}>
            {/* Report Content */}
            <div style={{ padding: "40px 48px" }}>
              <ReactMarkdown components={reportComponents}>
                {gradeReport}
              </ReactMarkdown>
            </div>

            {/* Footer Actions */}
            <div style={{
              borderTop: "1px solid #1a1a1a", padding: "24px 48px",
              display: "flex", justifyContent: "center", gap: "16px",
              backgroundColor: "#0d0d0d",
            }}>
              <button
                onClick={() => window.location.hash = "#/interview"}
                style={{
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  color: "#000", border: "none", padding: "14px 36px",
                  borderRadius: "12px", fontSize: "15px", fontWeight: "700",
                  cursor: "pointer", transition: "all 0.2s",
                  boxShadow: "0 4px 15px rgba(34,197,94,0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(34,197,94,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(34,197,94,0.3)";
                }}
              >
                ← Back to Interview Hub
              </button>
              <button
                onClick={() => window.location.hash = "#/learn"}
                style={{
                  background: "transparent", color: "#888",
                  border: "1px solid #333", padding: "14px 36px",
                  borderRadius: "12px", fontSize: "15px", fontWeight: "600",
                  cursor: "pointer", transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#555";
                  e.currentTarget.style.color = "#ccc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#333";
                  e.currentTarget.style.color = "#888";
                }}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── ACTIVE INTERVIEW VIEW ───
  const problem = problems[currentIndex];
  const difficultyColor = { easy: "#22c55e", medium: "#eab308", hard: "#ef4444" };

  return (
    <div ref={containerRef} style={{ display: "flex", height: "calc(100vh - 61px)", marginTop: "61px", backgroundColor: "#0a0a0a", position: "relative" }}>
      {/* ─── LEFT PANEL ─── */}
      <div style={{ width: `${leftPanelWidth}%`, minWidth: "250px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "20px 28px", borderBottom: "1px solid #1e1e1e" }}>
          <div style={{ color: "#888", fontSize: "12px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
            Problem {currentIndex + 1} of {problems.length}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <h2 style={{ margin: 0, color: "#fff", fontSize: "22px" }}>{problem.title}</h2>
            <span style={{ color: difficultyColor[problem.difficulty] || "#888", fontSize: "12px", fontWeight: "700", backgroundColor: (difficultyColor[problem.difficulty] || "#888") + "18", padding: "4px 12px", borderRadius: "20px", textTransform: "capitalize" }}>
              {problem.difficulty}
            </span>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "28px" }}>
          <div style={{ color: "#ccc", fontSize: "15px", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
            {problem.description}
          </div>
        </div>
      </div>

      <div onMouseDown={handleVerticalDragStart} style={{ width: "6px", cursor: "col-resize", backgroundColor: "transparent", position: "relative", zIndex: 10, flexShrink: 0 }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: "2px", width: "2px", backgroundColor: "#1e1e1e" }} />
      </div>

      {/* ─── RIGHT PANEL ─── */}
      <div style={{ flex: 1, minWidth: "300px", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        <div style={{ padding: "10px 20px", borderBottom: "1px solid #1e1e1e", backgroundColor: "#111", display: "flex", alignItems: "center", gap: "10px", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "6px", padding: "6px 14px", color: "#ccc", fontSize: "13px", fontWeight: "500" }}>
              🐍 Python 3
            </span>
            <span style={{ color: "#888", fontSize: "12px", marginLeft: "10px" }}>
              Interview Mode
            </span>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              onClick={() => handleTestCode(false)}
              disabled={isTesting}
              style={{ backgroundColor: "#333", color: "#fff", border: "none", padding: "6px 16px", borderRadius: "6px", fontSize: "13px", cursor: isTesting ? "not-allowed" : "pointer" }}
            >
              Run Code
            </button>
            <button 
              onClick={() => handleTestCode(true)}
              disabled={isTesting}
              style={{ backgroundColor: "#22c55e", color: "#000", border: "none", padding: "6px 16px", borderRadius: "6px", fontSize: "13px", fontWeight: "bold", cursor: isTesting ? "not-allowed" : "pointer" }}
            >
              Submit
            </button>
          </div>
        </div>
        
        <div style={{ flex: 1 }}>
          <Editor
            height="100%"
            language="python"
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || "")}
            options={{
              fontSize: 14,
              fontFamily: "'Fira Code', 'Consolas', monospace",
              minimap: { enabled: false },
              padding: { top: 16 },
              wordWrap: "on",
            }}
          />
        </div>
        
        <AIChatWidget 
           aiMessage={aiMessage} 
           onSendMessage={handleSendMessage} 
           isLoading={isAiTyping} 
        />
      </div>
    </div>
  );
}
