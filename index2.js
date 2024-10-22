import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const PORT = 3000;

// Configure Multer for image uploads
const upload = multer({ dest: 'uploads/' });

 const genAI = new GoogleGenerativeAI({
     apiKey: ''  // Replace with your actual API key
});

app.use(express.json());
app.use(cors());

app.post('/upload', upload.single('answerImage'), async (req, res) => {
    try {
        const imagePath = req.file.path;
        console.log(imagePath)
        const imageBuffer = fs.readFileSync(imagePath);

        // Use Gemini AI to extract text from the image (assuming an OCR method exists)
        const ocrResult = await genAI.extractTextFromImage(imageBuffer);
        const extractedText = ocrResult.text; // Adjust this based on actual API response

        // Respond with extracted text
        res.status(200).json({ text: extractedText });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        fs.unlinkSync(imagePath);
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
