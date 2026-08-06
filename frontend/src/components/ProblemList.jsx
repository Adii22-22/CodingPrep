export default function ProblemList({ problems }) {
  return (
    <div>
      <h2 style={{ color: "#fff", marginTop: 0 }}>Practice Problems</h2>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}
      >
        {problems?.map((problem) => (
          <div
            key={problem.id}
            style={{
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "15px",
              backgroundColor: "#111",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#fff", fontSize: "14px" }}>
              {problem.title}
            </span>
            <span style={{ color: "#22c55e", fontSize: "12px" }}>
              {problem.difficulty}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
