// Configuration for the application
// This file helps with environment detection and configuration

// Define environment variables directly
// Detect if we're in production environment based on hostname
const isProd = typeof window !== 'undefined' ? 
  window.location.hostname === 'result.mahmedraza.fun' : 
  process.env.NODE_ENV === 'production';

// Base URLs for API endpoints
const API_BASE_URL = isProd ? 
  'https://result.mahmedraza.fun/api' : 
  'http://localhost:5000/api';

// Get the hostname based on environment
export function getHostname() {
  if (typeof window !== 'undefined') {
    // Client-side
    return window.location.hostname;
  } else {
    // Server-side
    return isProd ? 'result.mahmedraza.fun' : 'localhost';
  }
}

// Get the base API URL
export function getApiBaseUrl() {
  // Use relative URL in production when on the same domain
  if (isProd && typeof window !== 'undefined' && 
      window.location.hostname === 'result.mahmedraza.fun') {
    return '';
  }
  
  // Return the base of our API URL without the /api part
  return API_BASE_URL.replace('/api', '');
}

// Default configuration
export default {
  port: 5000,
  apiBaseUrl: getApiBaseUrl(),
  hostname: getHostname(),
  isProd,
  retryCount: 3,
  batchSize: 10,
  defaultStartId: 409360,
  defaultTotal: 100,
  biseUrl: 'https://www.bisesargodha.edu.pk'
};
