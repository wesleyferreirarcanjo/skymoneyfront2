import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Force cache busting for assets
    rollupOptions: {
      output: {
        // Add timestamp to chunk names for cache busting
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Clear build directory before building
    emptyOutDir: true,
    // Disable source maps in production for smaller builds
    sourcemap: false
  },
  // Clear cache on each build
  cacheDir: 'node_modules/.vite'
})
