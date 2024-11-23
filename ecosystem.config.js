module.exports = {
  apps: [
    {
      name: "Website-Caching", // Name of the app (can be anything you like)
      script: "./index.js", // Path to the entry file (e.g., server.js)
      env: {
        NODE_ENV: "production", // Set environment to production
        PORT: 3001, // Set the port (match your server's port)
      },
   max_memory_restart: "1G", // Automatically restart if memory usage exceeds 1GB
    },
  ],
};
