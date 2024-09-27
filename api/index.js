// Import required modules
const express = require('express');
const cors = require('cors');

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 3000; // Use PORT from environment variables or default to 3000

// Middleware to handle CORS and JSON requests
app.use(cors());
app.use(express.json());

// Example route: GET request
app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// Example route: POST request
app.post('/api/submit', (req, res) => {
  const { name } = req.body;
  res.json({ message: `Hello, ${name}!` });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // For Vercel deployments
