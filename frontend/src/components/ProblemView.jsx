import { useState, useEffect, useRef, useCallback, useContext } from "react";
import Editor from "@monaco-editor/react";
import { fetchSampleTestCases, submitCode, runCode, loadSavedCode, saveCode } from "../api";
import { AuthContext } from "../context/AuthContext";

const LANGUAGES = [
  { value: "python", label: "Python 3", icon: "🐍", editorLanguage: "python" },
  { value: "java", label: "Java", icon: "☕", editorLanguage: "java" },
  { value: "c", label: "C", icon: "ⓒ", editorLanguage: "c" },
];

function getStarterCode(problem, language) {
  const fnName = problem.function_name || "solution";
  const parameterNames = Array.isArray(problem.parameter_names)
    ? problem.parameter_names
    : [];
  const parameterTypes = Array.isArray(problem.parameter_types)
    ? problem.parameter_types
    : parameterNames.map(() => "int");
  const returnType = problem.return_type || "int";
  const javaTypes = {
    int: "int",
    long: "long",
    double: "double",
    boolean: "boolean",
    string: "String",
    "int[]": "int[]",
  };
  const javaReturnType = javaTypes[returnType] || "int";
  const defaultReturn = {
    boolean: "false",
    double: "0.0",
    string: '""',
    "int[]": "new int[0]",
  }[returnType] || "0";

  if (language === "java") {
    const params = parameterNames
      .map((name, index) => `${javaTypes[parameterTypes[index]] || "int"} ${name}`)
      .join(", ");
    return `import java.util.*;\n\nclass Solution {\n    public static ${javaReturnType} ${fnName}(${params}) {\n        // Write your solution here\n        return ${defaultReturn};\n    }\n}\n`;
  }

  if (language === "c") {
    const cTypes = { int: "int", long: "long", double: "double" };
    const params = parameterNames
      .map((name, index) => `${cTypes[parameterTypes[index]] || "int"} ${name}`)
      .join(", ");
    return `#include <stdio.h>\n\n${returnType} ${fnName}(${params}) {\n    // Write your solution here\n    return 0;\n}\n`;
  }

  const paramStr = parameterNames.join(", ");
  return `def ${fnName}(${paramStr}):\n    # Write your solution here\n    pass\n`;
}

export default function ProblemView({ problem }) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const codeByLanguage = useRef({});
  const [testCases, setTestCases] = useState([]);
  const [result, setResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState("testcases");

  // ─── Resizable Panel State ───
  const [leftPanelWidth, setLeftPanelWidth] = useState(45); // percentage
  const [editorHeight, setEditorHeight] = useState(65); // percentage of right panel
  const containerRef = useRef(null);
  const rightPanelRef = useRef(null);
  const isDraggingV = useRef(false);
  const isDraggingH = useRef(false);

  const { user } = useContext(AuthContext);

  // ─── Load Code ───
  useEffect(() => {
    let isMounted = true;

    async function initializeCode() {
      if (problem) {
        setResult(null);
        setActiveResultTab("testcases");

        codeByLanguage.current = {};
        const defaultCode = getStarterCode(problem, "python");

        if (user) {
          try {
            const savedData = await loadSavedCode(problem.id);
            if (isMounted) {
              if (savedData && savedData.code) {
                const savedLanguage = LANGUAGES.some(
                  ({ value }) => value === savedData.language
                )
                  ? savedData.language
                  : "python";
                codeByLanguage.current[savedLanguage] = savedData.code;
                setLanguage(savedLanguage);
                setCode(savedData.code);
              } else {
                setLanguage("python");
                setCode(defaultCode);
              }
            }
          } catch (e) {
            console.error("Failed to load saved code", e);
            if (isMounted) {
              setLanguage("python");
              setCode(defaultCode);
            }
          }
        } else {
          setLanguage("python");
          setCode(defaultCode);
        }
      }
    }

    initializeCode();

    return () => {
      isMounted = false;
    };
  }, [problem, user]);

  // ─── Debounced Auto-Save ───
  useEffect(() => {
    if (!user || !problem || !code) return;

    const timerId = setTimeout(() => {
      saveCode(problem.id, code, language).catch(err => console.error("Auto-save failed", err));
    }, 2000);

    return () => clearTimeout(timerId);
  }, [code, language, user, problem]);

  // ─── Fetch sample test cases ───
  useEffect(() => {
    if (problem) {
      fetchSampleTestCases(problem.id)
        .then(setTestCases)
        .catch(() => setTestCases([]));
    }
  }, [problem]);

  // ─── Run (sample test cases only) ───
  const handleRun = async () => {
    setIsRunning(true);
    setActiveResultTab("result");
    try {
      const res = await runCode(problem.id, code, language);
      setResult(res);
    } catch {
      setResult({
        status: "ERROR",
        error_message: "Network error. Is the backend running?",
      });
    } finally {
      setIsRunning(false);
    }
  };

  // ─── Submit (all test cases) ───
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setActiveResultTab("result");
    setResult({
      status: "RUNNING",
      passed_test_cases: 0,
      total_test_cases: 0,
      runtime: 0,
      error_message: "Submitting to worker queue...",
    });
    try {
      const res = await submitCode(problem.id, code, language, (statusUpdate) => {
        setResult(statusUpdate);
      });
      setResult(res);
    } catch {
      setResult({
        status: "ERROR",
        error_message: "Network error. Is the backend running?",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = isRunning || isSubmitting;

  const handleLanguageChange = (nextLanguage) => {
    codeByLanguage.current[language] = code;
    const nextCode =
      codeByLanguage.current[nextLanguage] || getStarterCode(problem, nextLanguage);
    setLanguage(nextLanguage);
    setCode(nextCode);
  };

  // ─── Vertical Drag (left/right panels) ───
  const handleVerticalDragStart = useCallback((e) => {
    e.preventDefault();
    isDraggingV.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handleHorizontalDragStart = useCallback((e) => {
    e.preventDefault();
    isDraggingH.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingV.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const pct = ((e.clientX - rect.left) / rect.width) * 100;
        setLeftPanelWidth(Math.min(Math.max(pct, 20), 75));
      }
      if (isDraggingH.current && rightPanelRef.current) {
        const rect = rightPanelRef.current.getBoundingClientRect();
        const pct = ((e.clientY - rect.top) / rect.height) * 100;
        // Subtract toolbar height (~45px) from calculation
        setEditorHeight(Math.min(Math.max(pct, 25), 85));
      }
    };

    const handleMouseUp = () => {
      if (isDraggingV.current || isDraggingH.current) {
        isDraggingV.current = false;
        isDraggingH.current = false;
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

  const difficultyColor = {
    easy: "#22c55e",
    medium: "#eab308",
    hard: "#ef4444",
  };

  const statusStyles = {
    ACCEPTED: { color: "#22c55e", label: "Accepted", icon: "✓" },
    WRONG_ANSWER: { color: "#ef4444", label: "Wrong Answer", icon: "✗" },
    RUNTIME_ERROR: { color: "#f97316", label: "Runtime Error", icon: "⚠" },
    TIME_LIMIT_EXCEEDED: { color: "#eab308", label: "Time Limit Exceeded", icon: "⏱" },
    COMPILE_ERROR: { color: "#f97316", label: "Compile Error", icon: "⚠" },
    ERROR: { color: "#ef4444", label: "Error", icon: "✗" },
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        height: "calc(100vh - 61px)",
        marginTop: "61px",
        backgroundColor: "#0a0a0a",
        position: "relative",
      }}
    >
      {/* ─── LEFT PANEL: Problem Description ─── */}
      <div
        style={{
          width: `${leftPanelWidth}%`,
          minWidth: "250px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Problem Header */}
        <div
          style={{
            padding: "20px 28px",
            borderBottom: "1px solid #1e1e1e",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <h2 style={{ margin: 0, color: "#fff", fontSize: "22px" }}>
              {problem.title}
            </h2>
            <span
              style={{
                color: difficultyColor[problem.difficulty] || "#888",
                fontSize: "12px",
                fontWeight: "700",
                backgroundColor:
                  (difficultyColor[problem.difficulty] || "#888") + "18",
                padding: "4px 12px",
                borderRadius: "20px",
                textTransform: "capitalize",
                letterSpacing: "0.5px",
              }}
            >
              {problem.difficulty}
            </span>
          </div>
        </div>

        {/* Problem Body — Scrollable */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "28px",
          }}
        >
          {/* Description */}
          <div
            style={{
              color: "#ccc",
              fontSize: "15px",
              lineHeight: "1.8",
              whiteSpace: "pre-wrap",
              marginBottom: "32px",
            }}
          >
            {problem.description}
          </div>

          {/* Sample Test Cases */}
          {testCases.length > 0 && (
            <div>
              <h3
                style={{
                  color: "#888",
                  fontSize: "12px",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  marginBottom: "16px",
                  fontWeight: "600",
                }}
              >
                Examples
              </h3>
              {testCases.map((tc, i) => (
                <div
                  key={tc.id}
                  style={{
                    backgroundColor: "#141414",
                    border: "1px solid #1e1e1e",
                    borderRadius: "10px",
                    padding: "18px 20px",
                    marginBottom: "14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#555",
                      marginBottom: "12px",
                      fontWeight: "600",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Example {i + 1}
                  </div>
                  {/* Show each parameter as a named input */}
                  {tc.input_data &&
                    typeof tc.input_data === "object" &&
                    Object.entries(tc.input_data).map(([key, val]) => (
                      <div key={key} style={{ marginBottom: "6px" }}>
                        <span
                          style={{
                            color: "#666",
                            fontSize: "13px",
                            fontWeight: "600",
                          }}
                        >
                          {key} ={" "}
                        </span>
                        <code
                          style={{
                            color: "#22c55e",
                            fontSize: "13px",
                            fontFamily: "'Fira Code', 'Consolas', monospace",
                          }}
                        >
                          {JSON.stringify(val)}
                        </code>
                      </div>
                    ))}
                  <div style={{ marginTop: "10px" }}>
                    <span
                      style={{
                        color: "#666",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      Output:{" "}
                    </span>
                    <code
                      style={{
                        color: "#60a5fa",
                        fontSize: "13px",
                        fontFamily: "'Fira Code', 'Consolas', monospace",
                      }}
                    >
                      {JSON.stringify(tc.expected_output)}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── VERTICAL DRAG HANDLE ─── */}
      <div
        onMouseDown={handleVerticalDragStart}
        style={{
          width: "6px",
          cursor: "col-resize",
          backgroundColor: "transparent",
          position: "relative",
          zIndex: 10,
          flexShrink: 0,
          transition: "background-color 0.15s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#22c55e40")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "transparent")
        }
      >
        {/* Visible line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "2px",
            width: "2px",
            backgroundColor: "#1e1e1e",
          }}
        />
      </div>

      {/* ─── RIGHT PANEL: Code Editor + Results ─── */}
      <div
        ref={rightPanelRef}
        style={{
          flex: 1,
          minWidth: "300px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Editor Toolbar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 20px",
            borderBottom: "1px solid #1e1e1e",
            backgroundColor: "#111",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={isBusy}
              style={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #2a2a2a",
                borderRadius: "6px",
                padding: "6px 14px",
                color: "#ccc",
                fontSize: "13px",
                fontWeight: "500",
                cursor: isBusy ? "not-allowed" : "pointer",
              }}
            >
              {LANGUAGES.map(({ value, label, icon }) => (
                <option key={value} value={value}>
                  {icon} {label}
                </option>
              ))}
            </select>
          </div>

          {/* ─── Run + Submit Buttons (always visible) ─── */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {/* Run Button */}
            <button
              onClick={handleRun}
              disabled={isBusy}
              style={{
                backgroundColor: isBusy ? "#1a1a1a" : "#1a1a1a",
                color: isBusy ? "#555" : "#ccc",
                border: "1px solid #333",
                padding: "8px 20px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: isBusy ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!isBusy) {
                  e.currentTarget.style.backgroundColor = "#252525";
                  e.currentTarget.style.borderColor = "#555";
                }
              }}
              onMouseLeave={(e) => {
                if (!isBusy) {
                  e.currentTarget.style.backgroundColor = "#1a1a1a";
                  e.currentTarget.style.borderColor = "#333";
                }
              }}
            >
              {isRunning ? (
                <>
                  <span
                    style={{
                      display: "inline-block",
                      width: "14px",
                      height: "14px",
                      border: "2px solid #555",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  Running...
                </>
              ) : (
                <>▶ Run</>
              )}
            </button>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isBusy}
              style={{
                backgroundColor: isBusy ? "#166534" : "#22c55e",
                color: isBusy ? "#aaa" : "#000",
                border: "none",
                padding: "8px 24px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: isBusy ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!isBusy) e.currentTarget.style.backgroundColor = "#16a34a";
              }}
              onMouseLeave={(e) => {
                if (!isBusy) e.currentTarget.style.backgroundColor = "#22c55e";
              }}
            >
              {isSubmitting ? (
                <>
                  <span
                    style={{
                      display: "inline-block",
                      width: "14px",
                      height: "14px",
                      border: "2px solid #aaa",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  Submitting...
                </>
              ) : (
                <>⬆ Submit</>
              )}
            </button>
          </div>
        </div>

        {/* Monaco Code Editor — resizable height */}
        <div style={{ height: `${editorHeight}%`, minHeight: "100px" }}>
          <Editor
            height="100%"
            language={LANGUAGES.find((item) => item.value === language).editorLanguage}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || "")}
            options={{
              fontSize: 14,
              fontFamily: "'Fira Code', 'Consolas', monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 16 },
              lineNumbers: "on",
              renderLineHighlight: "gutter",
              automaticLayout: true,
              tabSize: 4,
              wordWrap: "on",
            }}
          />
        </div>

        {/* ─── HORIZONTAL DRAG HANDLE ─── */}
        <div
          onMouseDown={handleHorizontalDragStart}
          style={{
            height: "6px",
            cursor: "row-resize",
            backgroundColor: "transparent",
            position: "relative",
            zIndex: 10,
            flexShrink: 0,
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#22c55e40")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "2px",
              height: "2px",
              backgroundColor: "#1e1e1e",
            }}
          />
        </div>

        {/* ─── Bottom: Results Panel ─── */}
        <div
          style={{
            flex: 1,
            borderTop: "none",
            backgroundColor: "#111",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            minHeight: "80px",
          }}
        >
          {/* Result Tabs */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #1e1e1e",
              padding: "0 16px",
              flexShrink: 0,
            }}
          >
            {["testcases", "result"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveResultTab(tab)}
                style={{
                  background: "none",
                  border: "none",
                  borderBottom:
                    activeResultTab === tab
                      ? "2px solid #22c55e"
                      : "2px solid transparent",
                  color: activeResultTab === tab ? "#fff" : "#666",
                  fontSize: "13px",
                  padding: "12px 16px",
                  cursor: "pointer",
                  fontWeight: activeResultTab === tab ? "600" : "400",
                  textTransform: "capitalize",
                  transition: "all 0.2s",
                }}
              >
                {tab === "testcases" ? "Test Cases" : "Result"}
                {tab === "result" && result && (
                  <span
                    style={{
                      marginLeft: "8px",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      display: "inline-block",
                      backgroundColor:
                        statusStyles[result.status]?.color || "#666",
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: "16px 20px", flex: 1, overflowY: "auto" }}>
            {activeResultTab === "testcases" && (
              <div>
                {testCases.length > 0 ? (
                  testCases.map((tc, i) => (
                    <div
                      key={tc.id}
                      style={{
                        display: "flex",
                        gap: "20px",
                        padding: "10px 14px",
                        backgroundColor: "#1a1a1a",
                        borderRadius: "8px",
                        marginBottom: "8px",
                        fontSize: "13px",
                        fontFamily: "'Consolas', monospace",
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ color: "#555", minWidth: "60px" }}>
                        Case {i + 1}
                      </span>
                      <span style={{ color: "#888" }}>
                        Input: {JSON.stringify(tc.input_data)}
                      </span>
                      <span style={{ color: "#888", marginLeft: "auto" }}>
                        Expected: {JSON.stringify(tc.expected_output)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#555", fontSize: "14px", margin: 0 }}>
                    No sample test cases available for this problem.
                  </p>
                )}
              </div>
            )}

            {activeResultTab === "result" && (
              <div>
                {isBusy ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      color: "#888",
                      fontSize: "14px",
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
                    {isRunning
                      ? "Running against sample test cases..."
                      : "Judging your code against all test cases..."}
                  </div>
                ) : result ? (
                  <div>
                    {/* Status Badge */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        marginBottom: "16px",
                      }}
                    >
                      <span
                        style={{
                          color:
                            statusStyles[result.status]?.color || "#888",
                          fontSize: "20px",
                          fontWeight: "800",
                        }}
                      >
                        {statusStyles[result.status]?.icon || ""}{" "}
                        {statusStyles[result.status]?.label || result.status}
                      </span>
                      {result.runtime != null && (
                        <span
                          style={{
                            color: "#555",
                            fontSize: "13px",
                          }}
                        >
                          Runtime: {result.runtime.toFixed(1)}ms
                        </span>
                      )}
                    </div>

                    {/* Pass/Fail Count */}
                    {result.total_test_cases > 0 && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "14px",
                        }}
                      >
                        <span
                          style={{ color: "#aaa", fontSize: "14px" }}
                        >
                          Test Cases:
                        </span>
                        <span
                          style={{
                            color:
                              result.passed_test_cases ===
                              result.total_test_cases
                                ? "#22c55e"
                                : "#ef4444",
                            fontSize: "15px",
                            fontWeight: "700",
                          }}
                        >
                          {result.passed_test_cases} / {result.total_test_cases}{" "}
                          passed
                        </span>

                        {/* Progress bar */}
                        <div
                          style={{
                            flex: 1,
                            height: "6px",
                            backgroundColor: "#1e1e1e",
                            borderRadius: "3px",
                            overflow: "hidden",
                            maxWidth: "200px",
                          }}
                        >
                          <div
                            style={{
                              width: `${
                                (result.passed_test_cases /
                                  result.total_test_cases) *
                                100
                              }%`,
                              height: "100%",
                              backgroundColor:
                                result.passed_test_cases ===
                                result.total_test_cases
                                  ? "#22c55e"
                                  : "#ef4444",
                              borderRadius: "3px",
                              transition: "width 0.4s ease",
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {result.error_message && (
                      <div
                        style={{
                          backgroundColor: "#1a1212",
                          border: "1px solid #3b1515",
                          borderRadius: "8px",
                          padding: "14px 16px",
                          color: "#f87171",
                          fontSize: "13px",
                          fontFamily: "'Consolas', monospace",
                          whiteSpace: "pre-wrap",
                          lineHeight: "1.5",
                        }}
                      >
                        {result.error_message}
                      </div>
                    )}

                    {/* Stdout */}
                    {result.stdout && !result.error_message && (
                      <div
                        style={{
                          backgroundColor: "#111a11",
                          border: "1px solid #1a3b1a",
                          borderRadius: "8px",
                          padding: "14px 16px",
                          color: "#86efac",
                          fontSize: "13px",
                          fontFamily: "'Consolas', monospace",
                          whiteSpace: "pre-wrap",
                          lineHeight: "1.5",
                        }}
                      >
                        {result.stdout}
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ color: "#555", fontSize: "14px", margin: 0 }}>
                    Click <strong>Run</strong> to test against sample cases, or{" "}
                    <strong>Submit</strong> to judge against all test cases.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spinner keyframe animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
