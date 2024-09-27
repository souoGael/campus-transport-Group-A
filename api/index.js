// Import Express.js
const express = require("express");

// Initialize the Express app
const app = express();

// Define a route for the root URL
app.get("/test", (req, res) => {
  res.send("Express on Vercel");
});

// Start the server and listen on port 3000
app.listen(3000, () => {
  console.log("Server ready on port 3000.");
});

// Export the app for Vercel to use
module.exports = app;
