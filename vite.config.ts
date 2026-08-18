import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { rmSync } from 'node:fs'
import { resolve } from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const configuredUrl = (env.VITE_PUBLIC_SITE_URL || '').trim().replace(/\/+$/, '')
  const publicSiteUrl = /^https:\/\//i.test(configuredUrl) ? configuredUrl : ''
  const configuredBase = (env.VITE_BASE_PATH || '/').trim()
  const base = configuredBase === '/' ? '/' : `/${configuredBase.replace(/^\/+|\/+$/g, '')}/`
  const largeMediaBase = (env.VITE_LARGE_MEDIA_BASE_URL || '').trim().replace(/\/+$/, '')

  const pagesMediaPlugin: Plugin | null = largeMediaBase ? {
    name: 'qiongverse-pages-media-cdn',
    transform(source: string, id: string) {
      if (!/\.(?:ts|tsx)$/.test(id) || id.includes('node_modules')) return null
      const rewritten = source.replace(/(['"`])\/(assets|shellsong|luoyin|draco)(\/[^'"`]*)\1/g, (_match: string, quote: string, root: string, rest: string) => `${quote}${largeMediaBase}/${root}${rest}${quote}`)
      return rewritten === source ? null : { code: rewritten, map: null }
    },
  } : null

  return {
    base,
    plugins: [react(), pagesMediaPlugin, {
      name: 'qiongverse-public-share-metadata',
      transformIndexHtml: (html) => html.replaceAll('%PUBLIC_SITE_URL%', publicSiteUrl),
    }, {
      name: 'qiongverse-prune-unreferenced-source-models',
      writeBundle: (options) => {
        // Keep the original high-resolution GLBs in the repository, but do not
        // copy them to static hosting: ShellSong loads the checked-in web
        // delivery derivatives under /shellsong/models/web/ instead.
        const outputDirectory = options.dir || resolve('.', 'dist')
        for (const file of [
          'luoyin_awakened.glb',
          'luoyin_awakened2.glb',
          'luoyin_body.glb',
          'luoyin_celebration.glb',
          'luoyin_flying.glb',
          'luoyin_resonance.glb',
          'luoyin_shell_closed.glb',
        ]) {
          rmSync(resolve(outputDirectory, 'shellsong/models', file), { force: true })
        }
      },
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
