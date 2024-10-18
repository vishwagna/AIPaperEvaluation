// src/api.js
import axios from 'axios';

const API_KEY = import.meta.env.OPENAI_API_KEY;  // Use environment variable for API key
const BASE_URL = 'https://api.openai.com/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Function to get sentiment analysis
export const analyzeSentiment = async (text) => {
  try {
    const response = await api.post('/completions', {
      model: 'text-davinci-003',
      prompt: `Analyze the sentiment of the following text: "${text}"`,
      max_tokens: 60,
    });
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw error;
  }
};
