import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import viteCompression from 'vite-plugin-compression';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      workbox: {
        // Cache strategies for better offline performance
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'gstatic-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'cloudinary-images', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
        ],
      },
      manifest: {
        name: 'CleanReport',
        short_name: 'CleanReport',
        description: 'Community Waste & Sanitation Issue Reporting',
        theme_color: '#0E7C66',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/logo.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/logo.svg', sizes: '512x512', type: 'image/svg+xml' },
        ],
      },
    }),
    viteCompression({ algorithm: 'gzip', ext: '.gz' }),
    viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Target modern browsers for smaller output
    target: ['es2020', 'chrome87', 'firefox78', 'safari14'],
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,   // Remove all console.* calls in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn', 'console.info'],
        passes: 2,
      },
      mangle: { safari10: true },
    },
    // Warn when individual chunks exceed 500kB
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Granular vendor splitting — each library loads only when needed
        manualChunks(id) {
          // React core - always needed
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
            return 'react-vendor';
          }
          // Leaflet and map libraries - ONLY loaded with map pages
          if (id.includes('node_modules/leaflet') || id.includes('node_modules/react-leaflet') || id.includes('node_modules/@changey')) {
            return 'map-vendor';
          }
          // Google OAuth - only loaded on login/register
          if (id.includes('node_modules/@react-oauth')) {
            return 'google-auth';
          }
          // Google Analytics - deferred load
          if (id.includes('node_modules/react-ga4')) {
            return 'analytics';
          }
          // Phone input (country data is large) - only on profile
          if (id.includes('node_modules/react-phone-number-input') || id.includes('node_modules/libphonenumber-js')) {
            return 'phone-input';
          }
          // Axios - HTTP library
          if (id.includes('node_modules/axios')) {
            return 'axios';
          }
          // Icons - shared across pages
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          // Toast notifications
          if (id.includes('node_modules/react-hot-toast')) {
            return 'toast';
          }
          // Other vendor libraries
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
        },
        // Ensure chunks have stable names for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  // Optimize CSS
  css: {
    devSourcemap: false,
  },
});
