import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/sppd/', // Mengarahkan jalur aset ke nama repositori Anda
})