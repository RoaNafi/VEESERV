const express = require('express');
const app = express();
const port = 5000;

// Import chatbot data from questionsAnswers.js
const chatbotData = require('./questionsAnswers');

// Middleware to parse JSON requests
app.use(express.json());

// Endpoint for handling user input
app.post('/chat', (req, res) => {
  const userInput = req.body.message;

  const cleanedInput = userInput.toLowerCase().trim(); // Clean up user input
  const match = chatbotData.find(data => cleanedInput.includes(data.keyword.toLowerCase()));

  if (match) {
    return res.json({ response: match.answer });
  } else {
    return res.json({ response: "Oops 😅 I didn't catch that. Can you rephrase or give me more details?" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Chatbot server is running at http://localhost:${port}`);
});
