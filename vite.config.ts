import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        cleanupOutdatedCaches: true,
        sourcemap: false
      },
      includeAssets: ['favicon.png', 'manifest.json'],
      manifest: {
        name: 'The Daily Grind - Chore Checklist',
        short_name: 'Daily Grind',
        description: 'A gamified chore checklist app to make daily tasks fun and rewarding',
        theme_color: '#8b5cf6',
        background_color: '#1a1a1a',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'favicon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'favicon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // More conservative chunking to avoid circular dependencies
          if (id.includes('node_modules')) {
            // React core - must be first
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('scheduler/')) {
              return 'vendor-react'
            }
            // Large libraries that are independent
            if (id.includes('framer-motion')) {
              return 'vendor-animation'
            }
            // Convex - large and independent
            if (id.includes('convex') || id.includes('@convex-dev')) {
              return 'vendor-convex'
            }
            // Keep everything else together to avoid circular deps
            // Vite will handle the rest automatically
          }
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    }
  },
  define: {
    __dirname: JSON.stringify(__dirname)
  }
})
