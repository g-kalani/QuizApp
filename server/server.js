const nodeFetch = require('node-fetch');
if (!global.fetch) {
    global.fetch = nodeFetch;
    global.Headers = nodeFetch.Headers; // Ensure Headers available
}
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 
    
    if (!token) return res.status(403).json({ message: "A token is required" });
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next(); 
    } catch (err) {
        return res.status(401).json({ message: "Invalid or Expired Token" });
    }
};

// MongoDB schema
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true },
    quizCompleted: { type: Boolean, default: false }
});
const User = mongoose.model('User', UserSchema);

// Request validation
const emailSchema = Joi.object({
    email: Joi.string().email().required()
});

// API routes
app.post('/api/start', async (req, res) => {
    const { error } = emailSchema.validate(req.body); 
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        let user = await User.findOne({ email: req.body.email });
        if (!user) {
            user = new User({ email: req.body.email });
            await user.save();
        }
        
        const token = jwt.sign(
            { userId: user._id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '30m' } 
        );
        res.json({ token, email: user.email });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Gemini explanation route 
const fetch = require('node-fetch');

app.post('/api/explain', verifyToken, async (req, res) => {
    const { question, correctAnswer } = req.body;
    
    try {
        // Initialize model
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const prompt = `Act as a helpful tutor. Explain in 2 sentences why "${correctAnswer}" is the correct answer to: "${question}".`;


        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ explanation: text });
    } catch (err) {
        console.error("DETAILED ERROR:", err);
        
        // Fallback error response
        res.status(500).json({ 
            message: "AI service currently busy.", 
            details: err.message 
        });
    }
});
app.post('/api/submit', verifyToken, async (req, res) => { 
    console.log("Saving results for:", req.user.email);
    res.status(200).json({ message: "Results saved successfully" });
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => app.listen(process.env.PORT, () => console.log(`Server on ${process.env.PORT}`)));