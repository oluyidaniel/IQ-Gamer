// questions.js

async function fetchQuestions(topic = "general knowledge", difficulty = "easy") {
  try {
    const response = await fetch("http://localhost:5000/generate-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, difficulty }),
    });

    const data = await response.json();

    if (data.success) {
      return data.questions; // Return questions array
    } else {
      throw new Error("Failed to generate questions");
    }
  } catch (err) {
    console.error("Error fetching questions:", err.message);
    return []; // fallback to empty
  }
}
