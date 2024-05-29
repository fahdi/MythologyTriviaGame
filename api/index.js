import express from 'express';
import serverless from 'serverless-http';
import dotenv from 'dotenv';
import pkg from 'pg';

const { Pool } = pkg;

dotenv.config();

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
        res.status(500).json({ status: 'ERROR', error: err.message });
    }
});

app.listen(process.env.PORT || 6000, () => {
    console.log(`Server is running on port ${process.env.PORT || 6000}`);
});

export default serverless(app);
