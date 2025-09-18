# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# BISE Faisalabad Results Viewer

A web application to fetch and display examination results from the BISE Faisalabad board website.

## Features

- Fetch results for a range of roll numbers
- Batch processing for better performance
- Adjustable batch size for network optimization
- Clean UI with progress tracking

## Setup and Deployment

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Local Development

1. Clone the repository:
   ```
   git clone https://github.com/mahmedraza1/result.git
   cd result
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   # In one terminal - start the backend API
   node server.js
   
   # In another terminal - start the frontend dev server
   npm run dev
   ```

### Production Deployment

1. Build and run in production mode:
   ```
   npm run deploy
   ```

   This will:
   - Build the frontend with optimizations
   - Start the server that serves both the API and static files

2. The application will be available at:
   - http://result.mahmedraza.fun:5000/

## Configuration

- The API endpoint is automatically configured based on the environment
- In development, it points to `http://result.mahmedraza.fun:5000/api/result/{id}`
- In production, it uses relative URLs to work with the same server

## Made with ❤️ by Mark Maverick
