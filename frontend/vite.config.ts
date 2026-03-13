import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    esbuild: {
        logOverride: { 
            'this-is-undefined-in-esm': 'silent' 
        }
    },
    server: {
        host: '0.0.0.0', // Listen on all network interfaces
        port: 5173,
        strictPort: false,
    },
})
