const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, { useNewUrlParser: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Schema & Model
const systemPromptSchema = new mongoose.Schema({
    prompt: { type: String, required: true },
}, { timestamps: true });

const SystemPrompt = mongoose.model('SystemPrompt', systemPromptSchema);

// Create System Prompt
app.post('/system-prompt', async (req, res) => {
    try {
        const { prompt } = req.body;
        const existing = await SystemPrompt.findOne();

        if (existing) {
            return res.status(400).json({ message: 'System prompt already exists. Use PUT to update.' });
        }

        const newPrompt = new SystemPrompt({ prompt });
        await newPrompt.save();
        res.status(201).json(newPrompt);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get System Prompt
app.get('/system-prompt', async (req, res) => {
    try {
        const prompt = await SystemPrompt.findOne().sort({ createdAt: -1 });
        if (!prompt) return res.status(404).json({ message: 'System prompt not found' });
        res.json(prompt);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update System Prompt
app.put('/system-prompt', async (req, res) => {
    try {
        const { prompt } = req.body;
        const updated = await SystemPrompt.findOneAndUpdate({}, { prompt }, { new: true });
        if (!updated) return res.status(404).json({ message: 'System prompt not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});