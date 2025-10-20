import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr' 

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/covers': 'https://archive.redbuld.net',
      '/api': 'http://localhost:8000',
      '/download': 'https://archive.redbuld.net',
    },
  },
  plugins: [
    react({
      babel: {
        plugins: [["module:@preact/signals-react-transform"]],
      },
    }),
    svgr({ 
      svgrOptions: {
        // svgr options
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@swiper': './node_modules/swiper',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react','react-dom','react-dom/client','react-router']
        }
      }
    }
  }
})
