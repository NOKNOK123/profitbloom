import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: Number(process.env.WEB_PORT) || 5173,
    proxy: { '/api': 'http://localhost:3001' },
  },
  resolve: {
    alias: [
      // Figma Make image imports (figma:asset/<hash>.png) → local files in src/assets
      { find: /^figma:asset\/(.*)$/, replacement: path.resolve(__dirname, './src/assets/$1') },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
})
