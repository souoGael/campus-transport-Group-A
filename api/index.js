// Import required modules
import express from 'express';
import cors from 'cors';

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 3000; // Use PORT from environment variables or default to 3000

// Middleware to handle CORS and JSON requests
app.use(cors());
app.use(express.json());

// Example route: GET request
app.get('/rahhhhh', (req, res) => {
  res.send( 'Hello from the backend!' );
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // For Vercel deployments
