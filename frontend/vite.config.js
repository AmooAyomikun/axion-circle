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
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'robots.txt'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'], // Precache app shell
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // Explicitly EXCLUDE the Render API from being cached
            urlPattern: /^https:\/\/cleanreport-api\.onrender\.com\/.*/i,
            handler: 'NetworkOnly',
          },
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
        theme_color: '#127C2F',
        background_color: '#FFFFFF',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/logo.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/logo.svg', sizes: '512x512', type: 'image/svg+xml' },
          { src: '/maskable_icon.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
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
    // Use esbuild (default, fast and safe) — no circular dep issues
    minify: 'esbuild',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Safe object-based chunk splitting — Rollup resolves load order correctly
        manualChunks: {
          // React core — always loaded, must be first
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Leaflet/maps — only loaded when map components are shown
          'map-vendor': ['leaflet', 'react-leaflet', 'leaflet.markercluster', '@changey/react-leaflet-markercluster'],
          // Google OAuth — only needed on login/register
          'google-auth': ['@react-oauth/google'],
          // Icons — shared across pages
          'icons': ['lucide-react'],
          // Analytics — deferred loaded after page interaction
          'analytics': ['react-ga4'],
          // Toast notifications
          'toast': ['react-hot-toast'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  css: {
    devSourcemap: false,
  },
});
