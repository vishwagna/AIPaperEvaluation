import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';

const client = new ImageAnnotatorClient({credentials });
 
const app = express();
const PORT = 3000;
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
// const API_KEY='AIzaSyADjwY4tBVVk4JgzFL80739Q5gUwpABWNU';


app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    console.log(filePath);

    // Perform text detection
    const [result] = await client.textDetection(filePath);

    // Extract text annotations
    const textAnnotations = result.textAnnotations;

    // Check if textAnnotations is an array and has elements
    if (!Array.isArray(textAnnotations) || textAnnotations.length === 0) {
      throw new Error('No text annotations found');
    }

    // Sort the text annotations based on position (if needed)
    const sortedAnnotations = textAnnotations.slice(1).sort((a, b) => {
      const aY = a.boundingPoly.vertices.reduce((sum, vertex) => sum + vertex.y, 0) / a.boundingPoly.vertices.length;
      const bY = b.boundingPoly.vertices.reduce((sum, vertex) => sum + vertex.y, 0) / b.boundingPoly.vertices.length;

      if (aY !== bY) {
        return aY - bY;
      }

      const aX = a.boundingPoly.vertices.reduce((sum, vertex) => sum + vertex.x, 0) / a.boundingPoly.vertices.length;
      const bX = b.boundingPoly.vertices.reduce((sum, vertex) => sum + vertex.x, 0) / b.boundingPoly.vertices.length;

      return aX - bX;
    });

    // Combine the sorted text into a single string
    const extractedText = sortedAnnotations.map(annotation => annotation.description).join(' ');

    console.log(extractedText);

    // Send the extracted text back to the client
    res.json({ text: extractedText });

    // Delete the file from the server
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error('Error during text extraction:', error);
    res.status(500).send('Failed to extract text');
  }
});

app.post('/', async (req, res) => {
    const ans = req.body.answer; // Assuming ans is part of the request body
    
    console.log(req.body);
    
    const genAI = new GoogleGenerativeAI(API_KEY);

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

       
        const prompt=`
        You are an intelligent and helpful evaluation assistant named EvalMate, designed to assess students' answers in higher education courses with great attention to detail. Your primary goal is to provide accurate and constructive feedback based on the given question, student's answer, and rubric (if provided).
        When evaluating an answer, carefully analyze the student's response and consider the following aspects:
        Relevance: Assess how well the student's answer addresses the given question and its key points.
        Accuracy: Evaluate the correctness and accuracy of the information provided in the answer.
        Clarity and Coherence: Check if the answer is well-structured, clearly expressed, and logically coherent. Minor spelling errors due to OCR extraction should be ignored as long as they do not hinder understanding. Correct any obvious errors that can be attributed to OCR mistakes.
        Depth of Understanding: Gauge the student's level of understanding and ability to apply relevant concepts and knowledge.
        Evidence and Examples: Look for the presence of relevant evidence, examples, or supporting details that strengthen the answer.
        Correction Step: Before evaluation, correct any OCR-induced errors, especially in the order of words or common spelling mistakes that could affect understanding.
        Your task is to evaluate the answer and return a JSON object with exactly two keys: "score" and "feedback." The "score" should be a whole number out of 10, reflecting how well the student's answer meets the evaluation criteria. The "feedback" should provide constructive comments on the strengths and areas for improvement in the student's response.
        
        Input:
        
        Question: Explain the process of photosynthesis.
        Maximum Score: 10
        Keywords: chlorophyll, sunlight, carbon dioxide, water, oxygen, glucose
        Sample Answers:
        Sample Answer 1: "Photosynthesis is the process by which green plants use sunlight to synthesize foods with chlorophyll in their leaves. It involves the conversion of carbon dioxide and water into glucose and oxygen." - Score: 9
        Sample Answer 2: "The process of photosynthesis involves plants using light energy to convert water and carbon dioxide into sugar and oxygen." - Score: 8
        Sample Answer 3: "Plants make their own food through photosynthesis, using sunlight to transform carbon dioxide and water into oxygen and glucose, facilitated by chlorophyll." - Score: 10
        User Answer: "${ans}"
        Output:
        
        The response should be in JSON format, containing only the keys "score" and "feedback":
      
        {
          "score": <calculated_score>,
          "feedback": "<constructive_feedback>"
        }
        `;
        const result = await model.generateContent(prompt);
        const responseText = await result.response.text(); // Await response.text()
        console.log(responseText)
        // Extract score and feedback from response
        const scoreMatch = responseText.match(/"score":\s*(\d+)/);
        const feedbackMatch = responseText.match(/"feedback":\s*"([^"]*)"/);

        const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
        const feedback = feedbackMatch ? feedbackMatch[1] : 'No feedback provided';

        console.log('Score:', score);
        console.log('Feedback:', feedback);
        
        // Send score and feedback in JSON format
        res.status(200).json({ score, feedback });}

        catch (error) {
            console.error('Error:', error);
            res.status(500).send('Internal Server Error');
        }
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
