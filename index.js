const express = require("express");
const NodeCache = require("node-cache");
const axios = require("axios");
const cors = require("cors");
const http = require("http");
const https = require("https");
const fs = require("fs");

const app = express();
const cache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 


const API_PASSWORD = "glf!!R*PhoK_0as20&Ub";

const passwordProtectionMiddleware = (req, res, next) => {
  const password = req.query.password;

  if (password === API_PASSWORD) {
    next(); 
  } else {
    return res.status(403).json({ error: "Unauthorized: Incorrect password" });
  }
};

const fetchDataFromAPI = async () => {
  const response = await axios.get(
    "https://script.googleusercontent.com/macros/echo?user_content_key=Ia3NNolpzDpodAZNC78njI2A3XuIqoNtUuMsLxyg_PwxGt4OMEUifXoX0PjW4gDYKqcrkEHetNOU8GcUiFcXaZK68wV2Xrpcm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnHep0rK6S7k5BSWUi5sczp9UkV5Qbw7OJNJHmdEXpWQE_l3vH2pe06Aqrwq9ZkikIuGpsMsXKI-NuIEyKn5uKi0m9-RyHTObhw&lib=MgMlderQUy5a6rIvmCM6Y13NiaCb_EVGq"
  );
  return response.data;
};

const cacheMiddleware = async (req, res, next) => {
  const key = req.originalUrl;
  let cachedData = cache.get(key);

  if (!cachedData) {
    console.log("Cache is empty. Fetching new data...");
    try {
      cachedData = await fetchDataFromAPI();
      cache.set(key, cachedData);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch data from API" });
    }
  }

  console.log("Serving from cache:", key);
  return res.json(cachedData);
};



app.get("/api/webinar/data", passwordProtectionMiddleware, cacheMiddleware, async (req, res) => {});

const PORT = 3001;


const options = {
  key: fs.readFileSync("/etc/letsencrypt/live/dev.techlanz.com/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/dev.techlanz.com/cert.pem"),
};

// Redirect HTTP requests to HTTPS
// http.createServer((req, res) => {
//   res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
//   res.end();
// }).listen(80);

// HTTPS server setup
https.createServer(options, app).listen(PORT, "0.0.0.0", () => {
  console.log(`Secure server running on https://dev.techlanz.com:${PORT}`);
});
