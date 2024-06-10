const express = require('express');
const axios = require('axios');
const { JSDOM } = require('jsdom');

const app = express();
const PORT = process.env.PORT || 3000;

// Function to fetch and parse Amazon search results
const fetchAmazonResults = async (keyword) => {
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        const dom = new JSDOM(response.data);
        const document = dom.window.document;

        const products = [];
        document.querySelectorAll('.s-main-slot .s-result-item').forEach(item => {
            const title = item.querySelector('h2 a span')?.textContent.trim();
            const rating = item.querySelector('.a-icon-alt')?.textContent.trim();
            const reviews = item.querySelector('.a-size-base')?.textContent.trim();
            const image = item.querySelector('.s-image')?.src;

            if (title && rating && reviews && image) {
                products.push({
                    title,
                    rating,
                    reviews,
                    image
                });
            }
        });

        return products;
    } catch (error) {
        console.error('Error fetching Amazon results:', error);
        throw new Error('Failed to scrape Amazon');
    }
};

// Endpoint to scrape Amazon search results
app.get('/api/scrape', async (req, res) => {
    const keyword = req.query.keyword;
    if (!keyword) {
        return res.status(400).json({ error: 'Keyword query parameter is required' });
    }

    try {
        const products = await fetchAmazonResults(keyword);
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

