import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 6000;

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

app.use(express.json());

app.get('/health-check', async (req, res) => {
    try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        res.status(200).json({ status: 'OK' });
    } catch (err) {
        res.status(500).json({ status: 'ERROR', error: err.message });
    }
});

app.post('/submit-score', async (req, res) => {
    const { name, score } = req.body;
    try {
        const client = await pool.connect();
        await client.query('INSERT INTO scores (name, score) VALUES ($1, $2)', [name, score]);
        client.release();
        res.status(200).json({ status: 'SUCCESS' });
    } catch (err) {
        res.status(500).json({ status: 'ERROR', error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
