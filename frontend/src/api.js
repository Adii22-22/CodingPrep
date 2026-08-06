const API_BASE = "http://127.0.0.1:8000";

// --- Helper: authenticated fetch ---
export async function authFetch(url, options = {}) {
  let token = localStorage.getItem("access_token");
  
  if (!options.headers) {
    options.headers = {};
  }

  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }
  options.headers["Content-Type"] = "application/json";

  let res = await fetch(url, options);

  // Simple token refresh logic
  if (res.status === 401 && token) {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      const refreshRes = await fetch(`${API_BASE}/api/accounts/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        localStorage.setItem("access_token", data.access);
        options.headers["Authorization"] = `Bearer ${data.access}`;
        res = await fetch(url, options); // Retry
      } else {
        // Refresh failed, clear tokens
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
      }
    }
  }

  return res;
}

// --- Curriculum ---
export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/api/categories/`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function fetchTopics() {
  const res = await fetch(`${API_BASE}/api/topics/`);
  if (!res.ok) throw new Error("Failed to fetch topics");
  return res.json();
}

export async function fetchProblem(id) {
  const res = await fetch(`${API_BASE}/api/problems/${id}/`);
  if (!res.ok) throw new Error("Failed to fetch problem");
  return res.json();
}

export async function fetchSampleTestCases(problemId) {
  const res = await fetch(`${API_BASE}/api/engine/testcases/${problemId}/`);
  if (!res.ok) throw new Error("Failed to fetch test cases");
  return res.json();
}

// --- Engine ---
export async function submitCode(problemId, code, language = "python") {
  const res = await authFetch(`${API_BASE}/api/engine/submit/`, {
    method: "POST",
    body: JSON.stringify({
      problem_id: problemId,
      code: code,
      language: language,
    }),
  });
  if (!res.ok) throw new Error("Submission failed");
  return res.json();
}

export async function runCode(problemId, code) {
  const res = await fetch(`${API_BASE}/api/engine/run/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      problem_id: problemId,
      code: code,
    }),
  });
  if (!res.ok) throw new Error("Run failed");
  return res.json();
}

export async function loadSavedCode(problemId) {
  const res = await authFetch(`${API_BASE}/api/engine/saved-code/${problemId}/`);
  if (!res.ok) return null;
  return res.json();
}

export async function saveCode(problemId, code, language = "python") {
  const res = await authFetch(`${API_BASE}/api/engine/saved-code/${problemId}/`, {
    method: "PUT",
    body: JSON.stringify({ code, language }),
  });
  if (!res.ok) throw new Error("Failed to save code");
  return res.json();
}

// --- Interview ---
export async function startInterview(level = "easy") {
  const res = await authFetch(`${API_BASE}/api/engine/interview/start/`, {
    method: "POST",
    body: JSON.stringify({ level }),
  });
  if (!res.ok) throw new Error("Failed to start interview");
  return res.json();
}

export async function sendInterviewChat(problemId, chatHistory, currentCode, newMessage) {
  const res = await authFetch(`${API_BASE}/api/engine/interview/chat/`, {
    method: "POST",
    body: JSON.stringify({
      problem_id: problemId,
      chat_history: chatHistory,
      current_code: currentCode,
      new_message: newMessage,
    }),
  });
  if (!res.ok) throw new Error("Failed to send chat");
  return res.json();
}

export async function getNextProblemPrompt(problemId) {
  const res = await authFetch(`${API_BASE}/api/engine/interview/next/${problemId}/`);
  if (!res.ok) throw new Error("Failed to load next problem");
  return res.json();
}

export async function gradeInterview(transcript) {
  const res = await authFetch(`${API_BASE}/api/engine/interview/grade/`, {
    method: "POST",
    body: JSON.stringify({ transcript }),
  });
  if (!res.ok) throw new Error("Failed to grade interview");
  return res.json();
}

// --- Auth ---
export async function loginUser(username, password) {
  const res = await fetch(`${API_BASE}/api/accounts/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Login failed");
  }
  return res.json();
}

export async function registerUser(data) {
  const res = await fetch(`${API_BASE}/api/accounts/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    const errorMsg = Object.values(err)[0];
    throw new Error(Array.isArray(errorMsg) ? errorMsg[0] : "Registration failed");
  }
  return res.json();
}

export async function fetchProfile() {
  const res = await authFetch(`${API_BASE}/api/accounts/profile/`);
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function fetchUserSubmissions() {
  const res = await authFetch(`${API_BASE}/api/accounts/submissions/`);
  if (!res.ok) throw new Error("Failed to fetch submissions");
  return res.json();
}
