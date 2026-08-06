export default function LessonList({ lessons }) {
  return (
    <div style={{ marginBottom: "40px" }}>
      <h2 style={{ color: "#fff", marginTop: 0 }}>Lessons</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {lessons?.map((lesson) => (
          <div
            key={lesson.id}
            style={{
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "15px",
              backgroundColor: "#111",
            }}
          >
            <h4 style={{ color: "#fff", margin: "0 0 10px 0" }}>
              {lesson.title}
            </h4>
            <p
              style={{
                color: "#aaa",
                fontSize: "14px",
                margin: 0,
                whiteSpace: "pre-wrap",
              }}
            >
              {lesson.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
