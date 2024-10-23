// server.js

const express = require('express');
const NodeCache = require('node-cache');
const axios = require('axios');
const cors = require('cors');

const app = express();
const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 }); // stdTTL = 100 seconds, checkperiod = 120 seconds

// Use CORS middleware to enable CORS for all routes
app.use(cors());

// Sample data fetching function (replace with your actual API)
const fetchDataFromAPI = async () => {
  const response = await axios.get('https://script.google.com/macros/s/AKfycbyjMf_GNiIUUVLauy4vQrN0GLKdhZ_b0enf3mNxGoj49vaGLKX0DJ47RO14XhGk-7qX/exec'); // Placeholder API
  return response.data; 
};


const cacheMiddleware = (req, res, next) => {
  const key = req.originalUrl; 
  const cachedData = cache.get(key);

  if (cachedData) {
    console.log('Serving from cache:', key);
    return res.json(cachedData); 
  } else {
    next(); 
  }
};

// Route using cache
app.get('/api/webinar/data', cacheMiddleware, async (req, res) => {
  try {
    const data = await fetchDataFromAPI();


    cache.set(req.originalUrl, data);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

