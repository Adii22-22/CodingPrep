import { useState, useEffect, useRef } from "react";
import Draggable from "react-draggable";
import ReactMarkdown from "react-markdown";

export default function AIChatWidget({ aiMessage, onSendMessage, isLoading }) {
  const [inputValue, setInputValue] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const recognitionRef = useRef(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    // Initialize SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInputValue((prev) => prev + " " + finalTranscript.trim());
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setInputValue(""); // optionally clear before new recording
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue("");
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }
  };

  return (
    <Draggable handle=".drag-handle" nodeRef={widgetRef}>
      <div ref={widgetRef} style={{
        position: "fixed",
        bottom: "40px",
        right: "40px",
        width: "420px",
        backgroundColor: "#1e1e1e",
        border: "1px solid #333",
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Header / Drag Handle */}
        <div className="drag-handle" style={{
          padding: "12px 16px",
          backgroundColor: "#252525",
          borderBottom: "1px solid #333",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          cursor: "grab",
          userSelect: "none",
        }}>
          {/* Drag dots icon */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", opacity: 0.5 }}>
            <div style={{ display: "flex", gap: "2px" }}><div style={dotStyle}/><div style={dotStyle}/></div>
            <div style={{ display: "flex", gap: "2px" }}><div style={dotStyle}/><div style={dotStyle}/></div>
            <div style={{ display: "flex", gap: "2px" }}><div style={dotStyle}/><div style={dotStyle}/></div>
          </div>
          
          <div style={{ color: "#22c55e", fontSize: "12px", fontWeight: "bold", letterSpacing: "1px", flex: 1 }}>
            AI INTERVIEWER
          </div>
          
          <button 
            onClick={() => setIsMinimized(!isMinimized)} 
            style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "16px" }}
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? "▲" : "▼"}
          </button>
        </div>
        
        {!isMinimized && (
          <>
            {/* AI Message Area */}
            <div style={{
              padding: "24px",
              maxHeight: "350px",
              overflowY: "auto",
              color: "#ddd",
              fontSize: "14px",
              lineHeight: "1.7",
              fontFamily: "sans-serif",
            }}>
              {isLoading ? (
                 <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#888" }}>
                   <span style={spinnerStyle} />
                   Thinking...
                 </div>
              ) : (
                <ReactMarkdown
                  components={{
                    code({ inline, children, ...props }) {
                      return inline ? (
                        <code style={{backgroundColor: "#333", padding: "2px 6px", borderRadius: "4px"}} {...props}>
                          {children}
                        </code>
                      ) : (
                        <pre style={{backgroundColor: "#111", padding: "12px", borderRadius: "6px", overflowX: "auto"}}>
                          <code {...props}>{children}</code>
                        </pre>
                      )
                    }
                  }}
                >
                  {aiMessage || "Waiting for interview to start..."}
                </ReactMarkdown>
              )}
            </div>
            
            {/* Input Area */}
            <div style={{
              padding: "12px 16px",
              borderTop: "1px solid #333",
              backgroundColor: "#151515",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              position: "relative"
            }}>
              <button 
                onClick={toggleRecording}
                style={{
                  ...iconButtonStyle, 
                  color: isRecording ? "#ef4444" : "#888",
                  position: "relative"
                }} 
                title="Voice Command"
              >
                🎤
                {isRecording && (
                  <span style={{
                    position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                    width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "rgba(239, 68, 68, 0.3)",
                    animation: "pulse 1.5s infinite"
                  }}/>
                )}
              </button>
              
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={isRecording ? "Listening..." : "Reply to AI..."}
                style={{
                  flex: 1,
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#fff",
                  outline: "none",
                  fontSize: "14px",
                }}
              />
              <button 
                onClick={handleSend} 
                style={{...iconButtonStyle, color: inputValue.trim() ? "#22c55e" : "#555"}} 
                disabled={isLoading || !inputValue.trim()}
              >
                ➤
              </button>
            </div>
            {isRecording && (
              <div style={{ backgroundColor: "#151515", padding: "0 16px 12px", display: "flex", justifyContent: "center", gap: "4px" }}>
                 <div className="wave-bar"></div>
                 <div className="wave-bar" style={{ animationDelay: "0.1s" }}></div>
                 <div className="wave-bar" style={{ animationDelay: "0.2s" }}></div>
                 <div className="wave-bar" style={{ animationDelay: "0.3s" }}></div>
                 <div className="wave-bar" style={{ animationDelay: "0.4s" }}></div>
              </div>
            )}
          </>
        )}
        <style>{`
          .wave-bar {
            width: 4px; height: 12px; background-color: #ef4444; border-radius: 2px;
            animation: wave 1s ease-in-out infinite;
          }
          @keyframes wave {
            0%, 100% { transform: scaleY(1); }
            50% { transform: scaleY(2); }
          }
        `}</style>
      </div>
    </Draggable>
  );
}

const dotStyle = { width: "3px", height: "3px", backgroundColor: "#fff", borderRadius: "50%" };
const iconButtonStyle = {
  background: "none", border: "none", color: "#888", fontSize: "16px", cursor: "pointer", padding: "4px",
  display: "flex", alignItems: "center", justifyContent: "center"
};
const spinnerStyle = {
  display: "inline-block", width: "16px", height: "16px", border: "2px solid #555",
  borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite"
};
