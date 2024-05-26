import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';
import User from './models/user.model.js';


const app = express();
app.use(express.json());
app.use(cors());


let PORT = process.env.PORT || 6000;

// Routes
app.post('/submit-score', async (req, res, next) => {
    try {
        const { name, score } = req.body;
        if (!name || typeof score !== 'number') {
            return res.status(400).json({ error: 'Invalid data format' });
        }
        const user = new User({ name, score });
        await user.save();
        res.status(201).json({ message: 'Score submitted successfully' });
    } catch (error) {
        next(error); // Pass error to the error handling middleware
    }
});

app.get('/leaderboard', async (req, res, next) => {
    try {
        const leaderboard = await User.find().sort({ score: -1 }).limit(10);
        res.json(leaderboard);
    } catch (error) {
        next(error); // Pass error to the error handling middleware
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Internal server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Connect to MongoDB using environment variable
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        // Start the server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(error => console.error('Error connecting to MongoDB:', error));
