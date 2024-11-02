const express = require('express');
const NodeCache = require('node-cache');
const axios = require('axios');
const cors = require('cors');

const app = express();

const cache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

app.use(cors());


const fetchDataFromAPI = async () => {
  const response = await axios.get('https://script.googleusercontent.com/a/macros/techlanz.com/echo?user_content_key=R08S-abfE_P4lBKGkLqW9tHur6jIyiknYCE8cm716ZidTq4DUO1TE3IomVmbEBH-Tfsu5q9CNnrbimp8yle9vENIxmNnrPs5m5_BxDlH2jW0nuo2oDemN9CCS2h10ox_nRPgeZU6HP9AdwD2XibBk81PedSSoqWwelfDA88TH5rtO8GlEA1VYHi7y5lsuJ4fSlHC1Wk9DtshgR2d8nH29KMeOz7Dv3EfmY4nEHTpvx8GEo7GgEJf7SvDsw_8uExXLTgYGTHWhnE&lib=MgMlderQUy5a6rIvmCM6Y13NiaCb_EVGq');
  return response.data; 
};

const cacheMiddleware = async (req, res, next) => {
  const key = req.originalUrl;
  let cachedData = cache.get(key);


  if (!cachedData) {
    console.log('Cache is empty. Fetching new data...');
    try {
      cachedData = await fetchDataFromAPI(); 
      cache.set(key, cachedData);          
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch data from API' });
    }
  }

  console.log('Serving from cache:', key);
  return res.json(cachedData);
};


app.get('/api/webinar/data', cacheMiddleware, async (req, res) => {

});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
