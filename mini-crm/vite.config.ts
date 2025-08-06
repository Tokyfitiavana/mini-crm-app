import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import "tailwindcss";

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
  
})
