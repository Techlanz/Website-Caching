const express = require('express');
const https = require('https');
const fs = require('fs');
const NodeCache = require('node-cache');
const axios = require('axios');
const cors = require('cors');

const app = express();


const cache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

app.use(cors());

const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};

// Function to fetch data from APIv
const fetchDataFromAPI = async () => {
  const apiUrl = 'https://script.google.com/macros/s/AKfycbyjMf_GNiIUUVLauy4vQrN0GLKdhZ_b0enf3mNxGoj49vaGLKX0DJ47RO14XhGk-7qX/exec';
  
  try {
    const response = await axios.get(apiUrl);
    return response.data; 
  } catch (error) {
    console.error('Error fetching data from API:', error.message);
    throw new Error('Failed to fetch data from API');
  }
};

// Middleware for caching
const cacheMiddleware = async (req, res, next) => {
  const key = req.originalUrl;
  let cachedData = cache.get(key);

  if (!cachedData) {
    
    try {
      cachedData = await fetchDataFromAPI(); 
      cache.set(key, cachedData);          
    } catch (error) {
      console.error('Error in cache middleware:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  
  return res.json(cachedData);
};

app.get('/api', cacheMiddleware, async (req, res) => {});


https.createServer(options, app).listen(3001, () => {
  console.log('HTTPS Server running on https://localhost:3001');
});
