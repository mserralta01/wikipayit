import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/email': {
        target: 'https://api.sendgrid.com/v3/mail/send',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/email/, ''),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    },
  },
})
