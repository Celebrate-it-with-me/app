import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

const TYPES = { css: 'text/css', json: 'application/json', svg: 'image/svg+xml', woff2: 'font/woff2', webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg' }

/**
 * Development only: serves the example template packages in dev-packages/ at /template-packages/<slug>/<version>/…
 * (payload.json is assembled from package.json + ast.json + strings.json). `apply: 'serve'` keeps them out of every build.
 */
function devTemplatePackages() {
  const root = fileURLToPath(new URL('./dev-packages', import.meta.url))
  return {
    name: 'dev-template-packages',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/template-packages', (req, res, next) => {
        const match = /^\/([a-z][a-z0-9-]{1,31})\/(\d+\.\d+\.\d+)\/([a-z0-9][a-z0-9._/-]*)$/.exec((req.url ?? '').split('?')[0])
        if (!match || match[3].includes('..')) return next()
        const [, slug, version, file] = match
        const dir = path.join(root, slug, version)
        try {
          if (file === 'payload.json') {
            const read = name => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'))
            const meta = read('package.json')
            const ast = read('ast.json')
            const base = `/template-packages/${slug}/${version}/`
            const body = {
              slug, version, engineMin: meta.engineMin ?? 1, cssUrl: `${base}theme.css`,
              preload: (meta.preload ?? []).map(item => ({ ...item, url: base + item.path })),
              templates: ast.templates, layout: ast.layout ?? null, strings: fs.existsSync(path.join(dir, 'strings.json')) ? read('strings.json') : undefined,
              devTheme: meta.devTheme
            }
            res.setHeader('Content-Type', TYPES.json)
            return res.end(JSON.stringify(body))
          }
          const target = path.join(dir, file)
          if (!target.startsWith(dir + path.sep) || !fs.statSync(target).isFile()) return next()
          if (file === 'theme.css') {
            // The server writes the @font-face rules from tokens.json and puts them before the package CSS.
            const tokens = JSON.parse(fs.readFileSync(path.join(dir, 'tokens.json'), 'utf8'))
            const faces = Object.values(tokens.fonts ?? {}).flatMap(role =>
              (role.files ?? []).map(f => `@font-face { font-family: '${role.family}'; font-weight: ${f.weight}; font-style: ${f.style}; font-display: swap; src: url(${f.file}) format('woff2'); }`)
            )
            res.setHeader('Content-Type', TYPES.css)
            return res.end(`${[...new Set(faces)].join('\n')}\n${fs.readFileSync(target, 'utf8')}`)
          }
          res.setHeader('Content-Type', TYPES[path.extname(target).slice(1)] ?? 'application/octet-stream')
          return fs.createReadStream(target).pipe(res)
        } catch {
          return next()
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [
    vue({
      compilerOptions: {
        isCustomElement: tag => tag.startsWith('add-')
      }
    }),
    tailwindcss(),
    devTemplatePackages()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    commonjsOptions: {
      esmExternals: true
    }
  },
  server: {
    allowedHosts: ['dev.app.cwm.com'],
    host: true,
    port: 8080,
    strictPort: true,
    hmr: { overlay: false }
  }
})
