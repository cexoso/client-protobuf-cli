import { defineConfig } from 'vite'
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/restful': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
})
