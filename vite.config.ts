import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const configuredUrl = (loadEnv(mode, '.', '').VITE_PUBLIC_SITE_URL || '').trim().replace(/\/+$/, '')
  const publicSiteUrl = /^https:\/\//i.test(configuredUrl) ? configuredUrl : ''
  const configuredBase = (loadEnv(mode, '.', '').VITE_BASE_PATH || '/').trim()
  const base = configuredBase === '/' ? '/' : `/${configuredBase.replace(/^\/+|\/+$/g, '')}/`

  return {
    base,
    plugins: [react(), {
      name: 'qiongverse-public-share-metadata',
      transformIndexHtml: (html) => html.replaceAll('%PUBLIC_SITE_URL%', publicSiteUrl),
    }],
    server: {
      host: '127.0.0.1',
      port: 5173,
      proxy: { '/api': 'http://127.0.0.1:8787' },
      // Large SPZ/GLB files can be locked by Windows while Vite is watching.
      // They are still served normally; immersive routes load them on demand.
      watch: { ignored: ['**/assets/3d/**'] },
    },
    preview: { host: '127.0.0.1', port: 4173 },
  }
})
