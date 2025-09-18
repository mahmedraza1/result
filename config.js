// Configuration for environment detection and API settings

// Detect if we're in production environment
export const isProd = window.location.hostname === 'result.mahmedraza.fun';

// Base URLs for API endpoints
export const API_BASE_URL = isProd 
  ? 'https://result.mahmedraza.fun/api' 
  : 'http://localhost:5000/api';

// BISE website URL
export const BISE_URL = 'https://www.bisesargodha.edu.pk';

// Log the current environment for debugging
console.log(`Running in ${isProd ? 'production' : 'development'} mode`);
console.log(`API base URL: ${API_BASE_URL}`);

// Helper function to construct API URLs
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}/${endpoint}`;
};
