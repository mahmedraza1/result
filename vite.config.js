import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Base path - use '/' for both development and production
  base: '/',
  build: {
    // Output directory for production build
    outDir: 'dist',
    // Generate source maps for better debugging
    sourcemap: true,
    // Optimize output for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    // Use port 5000 in development
    port: 5000,
    // Proxy API requests in development
    proxy: {
      '/api': {
        // Dynamically set the target based on hostname
        target: process.env.NODE_ENV === 'production' ? 'http://result.mahmedraza.fun:5000' : 'http://localhost:5000',
        changeOrigin: true,
      },
    },
    // Allow access from any hostname
    host: '0.0.0.0',
  },
})
