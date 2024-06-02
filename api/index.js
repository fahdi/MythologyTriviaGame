import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: 'your_username',
    host: 'your_host',
    database: 'your_database',
    password: 'your_password',
    port: 5432,
});

export default async function handler(req, res) {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM your_table');
        res.status(200).json(result.rows);
        client.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database query error' });
    }
}
