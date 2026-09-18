import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        navigateFallbackDenylist: [/^\/ia/],
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'Della Vita - Urabá País',
        short_name: 'DellaVita',
        description: 'Plataforma para Gestión Humanitaria',
        theme_color: '#063630',
        background_color: '#F2F6F5',
        display: 'standalone',
        icons: [
          {
            src: '/logos/fadv.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logos/fadv.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
