module.exports = {
  apps: [
    {
      name: "Website-Caching", // Name of the app (can be anything you like)
      script: "./index.js", // Path to the entry file (e.g., server.js)
      env: {
        NODE_ENV: "production", // Set environment to production
        PORT: 3001, // Set the port (match your server's port)
      },
      // Optional: If you want PM2 to automatically restart your app on changes:
      watch: true, // Enable watching for file changes (optional)
      instances: 1, // Number of instances you want to run (e.g., 1)
      autorestart: true, // Enable auto-restart for crashes
      max_memory_restart: "1G", // Automatically restart if memory usage exceeds 1GB
    },
  ],
};
