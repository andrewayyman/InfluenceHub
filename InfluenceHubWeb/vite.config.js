import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

const backendTarget = 'https://localhost:7248'
const proxyConfig = {
  '/api': {
    target: backendTarget,
    changeOrigin: true,
    secure: false,
  },
  '/uploads': {
    target: backendTarget,
    changeOrigin: true,
    secure: false,
  },
}

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    proxy: proxyConfig,
  },
  preview: {
    proxy: proxyConfig,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (id.includes('react-router')) {
            return 'router'
          }

          if (id.includes('lucide-react')) {
            return 'icons'
          }

          return undefined
        },
      },
    },
  },
})
