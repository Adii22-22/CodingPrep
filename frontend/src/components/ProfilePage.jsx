import { useState, useEffect } from "react";
import { fetchProfile, fetchUserSubmissions } from "../api";

export default function ProfilePage({ onProblemClick }) {
  const [profile, setProfile] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([fetchProfile(), fetchUserSubmissions()])
      .then(([profData, subData]) => {
        setProfile(profData);
        setSubmissions(subData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "100px", textAlign: "center", color: "#888" }}>
        Loading profile...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ padding: "100px", textAlign: "center", color: "#ef4444" }}>
        {error || "Failed to load profile"}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "100px 24px 60px" }}>
      <div style={{ display: "flex", gap: "30px", alignItems: "flex-start" }}>
        
        {/* Left Column: User Card */}
        <div style={{ width: "320px", backgroundColor: "#121212", borderRadius: "16px", padding: "30px", border: "1px solid #222" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
            <div style={{
              width: "80px", height: "80px", borderRadius: "12px", backgroundColor: "#22c55e",
              color: "#000", fontSize: "32px", fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center"
            }}>
              {profile.username[0].toUpperCase()}
            </div>
            <div>
              <h2 style={{ margin: "0 0 5px 0", color: "#fff", fontSize: "24px" }}>{profile.username}</h2>
              <div style={{ color: "#888", fontSize: "14px" }}>{profile.first_name} {profile.last_name}</div>
            </div>
          </div>
          <div style={{ color: "#aaa", fontSize: "14px", borderTop: "1px solid #333", paddingTop: "15px", marginTop: "15px" }}>
            <div>Joined: {new Date(profile.date_joined).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Right Column: Stats & Submissions */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "30px" }}>
          
          {/* Stats Cards */}
          <div style={{ display: "flex", gap: "20px" }}>
            <div style={{ flex: 1, backgroundColor: "#121212", borderRadius: "16px", padding: "24px", border: "1px solid #222", display: "flex", alignItems: "center", gap: "30px" }}>
              
              {/* Total Solved Ring Placeholder */}
              <div style={{ width: "100px", height: "100px", borderRadius: "50%", border: "8px solid #22c55e", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <span style={{ color: "#fff", fontSize: "24px", fontWeight: "bold" }}>{profile.total_solved}</span>
                <span style={{ color: "#888", fontSize: "10px", textTransform: "uppercase" }}>Solved</span>
              </div>

              {/* Difficulty Breakdown */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "15px" }}>
                {(() => {
                  const maxSolved = Math.max(profile.easy_solved, profile.medium_solved, profile.hard_solved, 1);
                  const difficulties = [
                    { label: "Easy", color: "#22c55e", count: profile.easy_solved },
                    { label: "Medium", color: "#eab308", count: profile.medium_solved },
                    { label: "Hard", color: "#ef4444", count: profile.hard_solved },
                  ];
                  return difficulties.map(({ label, color, count }) => (
                    <div key={label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "13px" }}>
                        <span style={{ color }}>{label}</span>
                        <span style={{ color: "#fff", fontWeight: "bold" }}>{count}</span>
                      </div>
                      <div style={{ height: "6px", backgroundColor: "#1a1a1a", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{
                          width: `${(count / maxSolved) * 100}%`,
                          height: "100%",
                          backgroundColor: color,
                          borderRadius: "3px",
                          transition: "width 0.6s ease",
                        }} />
                      </div>
                    </div>
                  ));
                })()}
              </div>

            </div>

            {/* General Stats */}
            <div style={{ width: "250px", backgroundColor: "#121212", borderRadius: "16px", padding: "24px", border: "1px solid #222", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ marginBottom: "20px" }}>
                <div style={{ color: "#888", fontSize: "12px", textTransform: "uppercase", marginBottom: "4px" }}>Total Submissions</div>
                <div style={{ color: "#fff", fontSize: "28px", fontWeight: "bold" }}>{profile.total_submissions}</div>
              </div>
              <div>
                <div style={{ color: "#888", fontSize: "12px", textTransform: "uppercase", marginBottom: "4px" }}>Acceptance Rate</div>
                <div style={{ color: "#fff", fontSize: "28px", fontWeight: "bold" }}>{profile.acceptance_rate}%</div>
              </div>
            </div>
          </div>

          {/* Recent Submissions */}
          <div style={{ backgroundColor: "#121212", borderRadius: "16px", padding: "24px", border: "1px solid #222" }}>
            <h3 style={{ color: "#fff", margin: "0 0 20px 0", fontSize: "18px" }}>Recent Submissions</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {submissions.length > 0 ? submissions.map(sub => (
                <div 
                  key={sub.id} 
                  onClick={() => onProblemClick({ id: sub.problem, title: sub.problem_title, difficulty: sub.problem_difficulty, topicTitle: sub.topic_title })}
                  style={{ 
                    display: "flex", justifyContent: "space-between", alignItems: "center", 
                    padding: "16px", backgroundColor: "#1a1a1a", borderRadius: "8px", 
                    cursor: "pointer", border: "1px solid transparent", transition: "border 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.border = "1px solid #333"}
                  onMouseLeave={(e) => e.currentTarget.style.border = "1px solid transparent"}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ color: "#fff", fontWeight: "500", fontSize: "15px" }}>{sub.problem_title}</div>
                    <div style={{ color: "#888", fontSize: "12px" }}>{new Date(sub.created_at).toLocaleString()}</div>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <span style={{ 
                      color: sub.status === "ACCEPTED" ? "#22c55e" : "#ef4444", 
                      fontSize: "13px", fontWeight: "bold" 
                    }}>
                      {sub.status.replace("_", " ")}
                    </span>
                    <span style={{ 
                      backgroundColor: "#2a2a2a", padding: "4px 10px", borderRadius: "12px", 
                      color: "#ccc", fontSize: "12px" 
                    }}>
                      {sub.language}
                    </span>
                  </div>
                </div>
              )) : (
                <div style={{ color: "#666", padding: "20px", textAlign: "center" }}>No submissions yet. Start practicing!</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
