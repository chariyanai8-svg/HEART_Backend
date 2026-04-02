require('dotenv').config();
console.log("Key Loaded:", process.env.GEMINI_API_KEY ? "YES" : "NO");

const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();


const app = express();
app.use(express.json()); // Essential for receiving data from the frontend
const port = 8000;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 🟢 Route 1: Home Check
app.get('/', (req, res) => {
  res.send({ 
    message: "HEART Backend is Online!",
    engine: "Node.js",
    status: "Ready for data"
  });
});

// 🟠 Route 2: Receive Data (The "Ingestion" API)
app.post('/api/telemetry', async (req, res) => {
    const { steps, heartRate, userId } = req.body;
    
    console.log(`Analyzing data for User: ${userId}`);

    // Ask Gemini to make a decision
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
        Elderly User Data: ${steps} steps today, Heart Rate: ${heartRate} bpm.
        In 1 sentence, provide a medical routing action: 
        (Monitor, Ask family to check, Visit clinic, or Call 999).
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const advice = response.text();
        
        res.send({
            received: { steps, heartRate },
            recommendation: advice
        });
    } catch (error) {
        // This is the most important line for debugging!
        console.error("DEBUG ERROR:", error); 
        
        res.status(500).send({ 
            error: "Gemini connection failed.",
            message: error.message, // This will tell you IF the key is invalid
            stack: error.statusText // This often shows "Unauthorized" or "Forbidden"
        });
    }
});

app.listen(port, () => {
  console.log(`HEART server listening at http://localhost:${port}`);
});