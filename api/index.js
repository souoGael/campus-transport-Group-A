// Import required modules
const express = require('express');
const cors = require('cors');

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 3000; // Use PORT from environment variables or default to 3000

// Middleware to handle CORS and JSON requests
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Lets go boy' );
});

// Add route for /rahhhhh
app.get('/rahhhhh', (req, res) => {
  res.json({ message: 'You have reached the /rahhhhh endpoint' });
});

// Catch-all route for undefined paths
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // For Vercel deployments
