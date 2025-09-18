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

// Determine environment
const isProd = process.env.NODE_ENV === 'production';
const hostname = isProd ? 'result.mahmedraza.fun' : 'localhost';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Add request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Helper to fetch result HTML with retries and browser-like headers
async function fetchResult(rollNumber, retryCount = 0, useProxy = false) {
  const directUrl = `https://bisefsd.edu.pk/results/${rollNumber}.html`;
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(directUrl)}`;
  
  // Use proxy on retry or if explicitly requested
  const url = useProxy || retryCount > 0 ? proxyUrl : directUrl;
  const MAX_RETRIES = 3;
  
  // Browser-like headers to avoid being blocked
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Referer': 'https://bisefsd.edu.pk/',
    'sec-ch-ua': '"Chromium";v="116", "Not A Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Dest': 'document',
    'Upgrade-Insecure-Requests': '1'
  };
  
  try {
    console.log(`Fetching result for roll number ${rollNumber}, attempt ${retryCount + 1}/${MAX_RETRIES + 1}`);
    
    const response = await axios.get(url, { 
      headers,
      timeout: 10000, // 10 second timeout
      maxRedirects: 5
    });
    
    // Return the entire HTML so frontend can parse it
    return { rollNumber, result: response.data };
  } catch (error) {
    console.error(`Error fetching roll number ${rollNumber}:`, error.message);
    
    // If we have retries left, wait a bit and try again
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying roll number ${rollNumber} in 1 second...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // On first retry, switch to proxy if not already using it
      const shouldUseProxy = !useProxy && retryCount === 0;
      if (shouldUseProxy) {
        console.log(`Switching to proxy for roll number ${rollNumber}`);
      }
      
      return fetchResult(rollNumber, retryCount + 1, shouldUseProxy || useProxy);
    }
    
    // Handle specific error cases
    let errorMessage = 'Error fetching data.';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 403) {
        errorMessage = 'Access forbidden. The server is blocking our requests.';
      } else {
        errorMessage = `Server responded with status ${error.response.status}.`;
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response received from server.';
    }
    
    return { 
      rollNumber, 
      error: errorMessage,
      errorDetail: `${error.message}` 
    };
  }
}

app.get('/api/result/:roll', async (req, res) => {
  const roll = req.params.roll;
  try {
    // Check if proxy should be used from query params
    const useProxy = req.query.proxy === 'true';
    
    if (useProxy) {
      console.log(`Using proxy for roll ${roll} as requested by client`);
    }
    
    const result = await fetchResult(roll, 0, useProxy);
    res.json(result);
  } catch (error) {
    console.error(`Endpoint error for roll ${roll}:`, error);
    res.status(500).json({ 
      rollNumber: roll,
      error: 'Server error while fetching data',
      errorDetail: error.message
    });
  }
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
  console.log(`- API: http://${hostname}:${PORT}/api/result/{roll-number}`);
  console.log(`- Frontend: http://${hostname}:${PORT}/`);
  console.log(`Environment: ${isProd ? 'Production' : 'Development'}`);
});
