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

const fetchDataFromAPI = async () => {
  const response = await axios.get(
    "https://script.google.com/macros/s/AKfycbyjMf_GNiIUUVLauy4vQrN0GLKdhZ_b0enf3mNxGoj49vaGLKX0DJ47RO14XhGk-7qX/exec"
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

app.get("/api/webinar/data", cacheMiddleware, async (req, res) => {});

const PORT = 3001;

// Load self-signed certificate
const options = {
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.cert"),
};

// Redirect HTTP requests to HTTPS
http
  .createServer((req, res) => {
    res.writeHead(301, {
      Location: `https://${req.headers.host}:${PORT}${req.url}`,
    });
    res.end();
  })
  .listen(80);

https.createServer(options, app).listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on dev.techlanz.com:${PORT}`);
});
