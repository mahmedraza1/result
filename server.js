// Express server to fetch data and serve frontend
import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Helper to fetch result HTML
async function fetchResult(rollNumber) {
  const url = `https://bisefsd.edu.pk/results/${rollNumber}.html`;
  try {
    const { data } = await axios.get(url);
    // Return the entire HTML so frontend can parse it
    return { rollNumber, result: data };
  } catch (error) {
    console.error(`Error fetching roll number ${rollNumber}:`, error);
    return { rollNumber, error: 'Not found or error fetching data.' };
  }
}

app.get('/api/result/:roll', async (req, res) => {
  const roll = req.params.roll;
  const result = await fetchResult(roll);
  res.json(result);
});

// Serve static assets from the dist directory (after building the frontend)
app.use(express.static(path.join(__dirname, 'dist')));

// For any route that doesn't match an API route or static files, serve the index.html
app.use((req, res, next) => {
  // If the request is for the API, continue to the next middleware
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  // Otherwise serve the index.html file
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`- API: http://result.mahmedraza.fun:5000/api/result/{roll-number}`);
  console.log(`- Frontend: http://result.mahmedraza.fun:5000/`);
});
