import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: { '/api': 'http://127.0.0.1:8787' },
    // Large SPZ/GLB files can be locked by Windows while Vite is watching.
    // They are still served normally; immersive routes load them on demand.
    watch: { ignored: ['**/assets/3d/**'] },
  },
  preview: { host: '127.0.0.1', port: 4173 },
})
