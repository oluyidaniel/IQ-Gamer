const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/api/generate-question', async (req, res) => {
  const { topic, difficulty } = req.body;

  const prompt = `Generate one multiple choice quiz question about ${topic} for a ${difficulty} level student. 
Include 4 options (A, B, C, D) and indicate the correct answer. Format as JSON like this:
{
  "question": "...",
  "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
  "answer": "B"
}`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { role: "user", content: prompt }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const aiReply = response.data.choices[0]?.message?.content;

    let questionData;
    try {
      questionData = JSON.parse(aiReply);
    } catch (err) {
      return res.status(500).json({ error: "AI response couldn't be parsed." });
    }

    res.json(questionData);
  } catch (error) {
    console.error("Error from OpenRouter:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate question." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
