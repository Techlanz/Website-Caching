const express = require("express");
const NodeCache = require("node-cache");
const axios = require("axios");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const tls = require("tls");

const app = express();
const cache = new NodeCache({ stdTTL: 0, checkperiod: 3600 });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const API_PASSWORD = "glf!!R*PhoK_0as20&Ub";

const passwordProtectionMiddleware = (req, res, next) => {
  const password = req.body.password;

  if (password === API_PASSWORD) {
    next();
  } else {
    return res.status(403).json({ error: "Unauthorized: Incorrect password" });
  }
};

const fetchDataFromAPI = async () => {
  try {
    const response = await axios.get(
      "https://script.googleusercontent.com/macros/echo?user_content_key=Ia3NNolpzDpodAZNC78njI2A3XuIqoNtUuMsLxyg_PwxGt4OMEUifXoX0PjW4gDYKqcrkEHetNOU8GcUiFcXaZK68wV2Xrpcm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnHep0rK6S7k5BSWUi5sczp9UkV5Qbw7OJNJHmdEXpWQE_l3vH2pe06Aqrwq9ZkikIuGpsMsXKI-NuIEyKn5uKi0m9-RyHTObhw&lib=MgMlderQUy5a6rIvmCM6Y13NiaCb_EVGq"
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch data from API:", error.message);
    throw error;
  }
};

const cacheMiddleware = async (req, res, next) => {
  const key = "/api/webinar/data";
  let cachedData = cache.get(key);

  if (cachedData) {
    return res.json(cachedData);
  } else {
    try {
      cachedData = await fetchDataFromAPI();
      cache.set(key, cachedData);
      return res.json(cachedData);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch data from API" });
    }
  }
};

// Cache refresh interval
setInterval(async () => {
  try {
    const data = await fetchDataFromAPI();
    if (data) {
      cache.set("/api/webinar/data", data);
    } else {
      console.warn("No data returned from fetchDataFromAPI");
    }
  } catch (error) {
    console.error("Failed to refresh cache:", error.message);
  }
}, 900000);

app.post("/api/webinar/data", passwordProtectionMiddleware, cacheMiddleware);

const PORT = 3001;
const options = {
  key: fs.readFileSync("/etc/letsencrypt/live/techlanz.com/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/techlanz.com/cert.pem"),
  SNICallback: (domain, cb) => {
    let cert;
    switch (domain) {
      case "www.techlanz.com":
        cert = {
          key: fs.readFileSync(
            "/etc/letsencrypt/live/www.techlanz.com/privkey.pem"
          ),
          cert: fs.readFileSync(
            "/etc/letsencrypt/live/www.techlanz.com/cert.pem"
          ),
        };
        break;
      case "ved.techlanz.com":
        cert = {
          key: fs.readFileSync(
            "/etc/letsencrypt/live/ved.techlanz.com/privkey.pem"
          ),
          cert: fs.readFileSync(
            "/etc/letsencrypt/live/ved.techlanz.com/cert.pem"
          ),
        };
        break;
      default:
        cert = {
          key: fs.readFileSync(
            "/etc/letsencrypt/live/techlanz.com/privkey.pem"
          ),
          cert: fs.readFileSync("/etc/letsencrypt/live/techlanz.com/cert.pem"),
        };
    }
    cb(null, tls.createSecureContext(cert));
  },
};
https.createServer(options, app).listen(PORT, "0.0.0.0", () => {
  console.log(`Secure server running on https://techlanz.com:${PORT}`);
});
