import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';

dotenv.config();

const { Pool } = pkg;

const app = express();
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

app.get('/api/health', async (req, res) => {
    try {
        const client = await pool.connect();
        res.status(200).json({ status: 'UP' });
        client.release();
    } catch (err) {
        res.status(500).json({ status: 'DOWN', error: err.message });
    }
});

app.post('/api/submit-score', async (req, res) => {
    const { name, score } = req.body;
    try {
        const client = await pool.connect();
        await client.query('INSERT INTO scores (name, score) VALUES ($1, $2)', [name, score]);
        client.release();
        res.status(200).json({ status: 'success' });
    } catch (err) {
        console.error('Database query error:', err.message);
        res.status(500).json({ status: 'ERROR', error: err.message });
    }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT name, score FROM scores ORDER BY score DESC LIMIT 10');
        client.release();
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Database query error:', err.message);
        res.status(500).json({ status: 'ERROR', error: err.message });
    }
});

// Directory name workaround for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default app;
