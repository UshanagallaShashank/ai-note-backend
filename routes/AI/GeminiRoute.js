const express = require('express');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
require('dotenv').config(); // Load environment variables from .env

const router = express.Router();

const model = new ChatGoogleGenerativeAI({
  model: 'gemini-pro',  // Ensure this model is supported
  maxOutputTokens: 2048,
  apiKey: process.env.GOOGLE_API_KEY // Use the API key from the .env file
});

router.post('/prompts', async (req, res) => {
  const { prompt } = req.body;
  try {
    const response = await generateResponse(prompt);
    res.status(200).json({ response: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  }
});

async function generateResponse(prompt) {
  try {
    const response = await model.invoke(prompt);
    console.log(response.content);
    return response.content;
  } catch (error) {
    console.error('Error invoking model:', error);
    throw new Error('Failed to generate response'); // Throwing error for proper handling
  }
}

// Function to list available models (for debugging purposes)
async function listAvailableModels() {
  try {
    const models = await model.listModels(); // Ensure `listModels` is available in the SDK
    console.log('Available Models:', models);
  } catch (error) {
    console.error('Error fetching models:', error);
  }
}

// Uncomment below if you want to see available models during testing
// listAvailableModels();

module.exports = router;