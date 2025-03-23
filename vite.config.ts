import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // If you need any SCSS options
      }
    }
  },
  resolve: {
    dedupe: ['react', 'react-dom']
  }
})