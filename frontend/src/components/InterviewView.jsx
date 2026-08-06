import { useState, useEffect, useRef, useCallback, useContext } from "react";
import Editor from "@monaco-editor/react";
import { startInterview, sendInterviewChat, getNextProblemPrompt, gradeInterview, runCode, submitCode } from "../api";
import { AuthContext } from "../context/AuthContext";
import AIChatWidget from "./AIChatWidget";
import ReactMarkdown from "react-markdown";

export default function InterviewView({ level = "easy", onBack }) {
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

  if (isLoading) return <div style={{ padding: "100px", color: "#fff", textAlign: "center", fontSize: "18px" }}>Setting up your interview room...</div>;
  if (!problems.length) return <div style={{ padding: "100px", color: "#ef4444", textAlign: "center" }}>Failed to load problems.</div>;

  if (isFinished) {
    return (
      <div style={{ padding: "60px 40px", maxWidth: "800px", margin: "60px auto 0", color: "#fff", backgroundColor: "#111", borderRadius: "12px", border: "1px solid #333" }}>
        <h1 style={{ color: "#22c55e", textAlign: "center", marginBottom: "40px" }}>Interview Completed!</h1>
        {isAiTyping && !gradeReport ? (
          <div style={{ textAlign: "center", color: "#888" }}>Generating your final evaluation report...</div>
        ) : (
          <div style={{ lineHeight: "1.8", fontSize: "16px" }}>
            <ReactMarkdown>{gradeReport}</ReactMarkdown>
            <div style={{ textAlign: "center", marginTop: "40px" }}>
              <button onClick={onBack} style={{ backgroundColor: "#22c55e", color: "#000", padding: "10px 24px", borderRadius: "6px", border: "none", fontWeight: "bold", cursor: "pointer" }}>Back to Dashboard</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const problem = problems[currentIndex];
  const difficultyColor = { easy: "#22c55e", medium: "#eab308", hard: "#ef4444" };

  return (
    <div ref={containerRef} style={{ display: "flex", height: "calc(100vh - 61px)", marginTop: "61px", backgroundColor: "#0a0a0a", position: "relative" }}>
      {/* ─── LEFT PANEL ─── */}
      <div style={{ width: `${leftPanelWidth}%`, minWidth: "250px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "20px 28px 0", borderBottom: "1px solid #1e1e1e" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "13px", padding: "0 0 16px 0", display: "flex", alignItems: "center", gap: "6px" }}>
            ← Leave Interview
          </button>
          <div style={{ color: "#888", fontSize: "12px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
            Problem {currentIndex + 1} of {problems.length}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", paddingBottom: "20px" }}>
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
