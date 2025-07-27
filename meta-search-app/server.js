const express = require('express');
// const fetch = require('node-fetch');
const cheerio = require('cheerio');

const app = express();
const PORT = 3001;

// Middleware to handle CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    next();
});

app.get('/', (req, res) => {
    res.send('Meta Search API is running. Use /meta?url=...');
});

app.get('/meta', async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch the webpage');
        }
        const html = await response.text();
        const $ = cheerio.load(html);

        const title = $('title').text();
        const description = $('meta[name="description"]').attr('content') || '';
        const keywords = $('meta[name="keywords"]').attr('content') || '';

        res.json({ title, description, keywords });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Meta server running on http://localhost:${PORT}`);
});
