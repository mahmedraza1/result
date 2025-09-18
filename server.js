// Simple Express server to fetch and serve data from bisefsd.edu.pk
import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import cors from 'cors';

const app = express();
const PORT = 3001;


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

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
