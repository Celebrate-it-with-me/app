/**
 * AST → vnodes. No v-html, no template compiler: every node goes through `h()` after being
 * checked against the closed lists in policy.js and blocks.js.
 *
 * Node shapes (produced by the server from the package HTML):
 *   { t:'el',   tag, attrs?, children? }       attrs values: string | { t:'var', path, filter? }
 *   { t:'text', v }
 *   { t:'q',    name, props?, attrs?, children? }   name: 'rsvp', 'names', … (a 'q-' prefix is tolerated)
 *   { t:'var',  path, filter? }
 *   { t:'if',   path, filter?, children }       draws children only when the variable is not empty
 * Attribute values: string | { tpl:[text|var…] } | { asset } | { assets:[{path,w}] } | { t:'var', path, filter }
 */
import { Fragment, cloneVNode, h } from 'vue'
import { BLOCKS } from './blocks'
import { LIMITS, TAGS, VAR_ATTRS, VOID_TAGS, astBytes, cleanAttr } from './policy'
import { resolveVar } from './variables'
import PackageCarousel from './PackageCarousel'

const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v)

/** @param {{ ctx:object, base:string, warnings?:string[] }} env */
export function renderAst(root, env) {
  const state = { nodes: 0, stop: false }
  const warnings = env.warnings ?? []
  if (astBytes(root) > LIMITS.astBytes) {
    warnings.push(`AST larger than ${LIMITS.astBytes} bytes: section ignored`)
    return null
  }
  const warn = msg => {
    warnings.push(msg)
    if (import.meta.env?.DEV && !import.meta.env?.VITEST) console.warn(`[invitation package] ${msg}`)
  }

  /** Resolves an attribute value to a string (or undefined). Asset forms are resolved against the package base. */
  function attrValue(raw) {
    if (!isObject(raw)) return raw
    if (raw.t === 'var' && typeof raw.path === 'string') return resolveVar(raw.path, raw.filter, env.ctx, warn)
    if (Array.isArray(raw.tpl)) {
      return raw.tpl
        .slice(0, 40)
        .map(part => (part?.t === 'var' && typeof part.path === 'string' ? resolveVar(part.path, part.filter, env.ctx, warn) : part?.t === 'text' ? String(part.v ?? '') : ''))
        .join('')
    }
    if (typeof raw.asset === 'string') return raw.asset
    if (Array.isArray(raw.assets)) {
      return raw.assets
        .slice(0, 6)
        .map(item => (typeof item?.path === 'string' && /^\d{2,4}$/.test(String(item.w)) && safeAsset(item.path) ? `${safeAsset(item.path)} ${item.w}w` : null))
        .filter(Boolean)
        .join(', ')
    }
    return undefined
  }

  const safeAsset = path => (/^assets\/[a-z0-9][a-z0-9._/-]{0,120}$/.test(path) && !path.includes('..') && !path.includes('//') && env.base ? env.base + path : '')

  function children(list, depth) {
    if (!Array.isArray(list)) return []
    const out = []
    for (const child of list) {
      if (state.stop) break
      const node = walk(child, depth + 1)
      if (node !== null && node !== undefined) out.push(node)
    }
    return out
  }

  function walk(node, depth) {
    if (!isObject(node)) return null
    if (depth > LIMITS.depth) {
      warn(`depth limit (${LIMITS.depth}) exceeded: subtree ignored`)
      return null
    }
    if (++state.nodes > LIMITS.nodes) {
      if (!state.stop) warn(`node limit (${LIMITS.nodes}) exceeded: the rest is ignored`)
      state.stop = true
      return null
    }

    switch (node.t) {
      case 'text':
        return typeof node.v === 'string' ? node.v.slice(0, LIMITS.text) : null
      case 'var':
        return typeof node.path === 'string' ? resolveVar(node.path, node.filter, env.ctx, warn) : null
      case 'q': {
        const name = typeof node.name === 'string' ? node.name.replace(/^q-/, '') : ''
        const block = Object.hasOwn(BLOCKS, name) ? BLOCKS[name] : null
        if (!block) {
          warn(`unknown block "${String(node.name).slice(0, 40)}": ignored`)
          return null
        }
        const props = {}
        const given = isObject(node.props) ? node.props : {}
        for (const [key, validate] of Object.entries(block.props)) {
          if (Object.hasOwn(given, key)) {
            const value = validate(attrValue(given[key]))
            if (value !== undefined) props[key] = value
          }
        }
        for (const key of Object.keys(given)) {
          if (!(key in block.props)) warn(`prop "${key}" is not allowed on q-${name}: dropped`)
        }
        const kids = () => {
          const list = children(node.children, depth)
          return list.length ? list : undefined
        }
        const vnode = block.render(props, env, kids)
        if (!vnode) return null
        const attrs = cleanAttrs('div', node.attrs)
        return Object.keys(attrs).length ? cloneVNode(vnode, attrs) : vnode
      }
      case 'if': {
        // Declarative condition: draw the children only when the variable is not empty. No logic beyond that.
        const value = typeof node.path === 'string' ? resolveVar(node.path, node.filter, env.ctx, warn) : ''
        if (value === '') return null
        const list = children(node.children, depth)
        return list.length ? h(Fragment, null, list) : null
      }
      case 'el':
        return element(node, depth)
      default:
        warn(`unknown node type "${String(node.t).slice(0, 20)}": ignored`)
        return null
    }
  }

  /** Attribute map of an element or block wrapper: every entry goes through the closed policy. */
  function cleanAttrs(tag, rawAttrs) {
    const props = {}
    const raw = isObject(rawAttrs) ? rawAttrs : {}
    for (const [name, value] of Object.entries(raw)) {
      const lower = name.toLowerCase()
      const resolved = isObject(value) ? (VAR_ATTRS.has(lower) || ['src', 'srcset'].includes(lower) ? attrValue(value) : undefined) : value
      const clean = cleanAttr(tag, lower, resolved, env.base)
      if (clean === undefined) warn(`attribute "${name.slice(0, 30)}" on <${tag}> dropped`)
      else props[lower] = clean
    }
    if (props['data-reveal-delay'] !== undefined) props.style = { '--pk-delay': `${props['data-reveal-delay']}ms` }
    return props
  }

  function element(node, depth) {
    const tag = typeof node.tag === 'string' ? node.tag.toLowerCase() : ''
    if (!TAGS.has(tag)) {
      warn(`tag "${String(node.tag).slice(0, 30)}" is not allowed: node ignored`)
      return null
    }
    const props = cleanAttrs(tag, node.attrs)
    if (tag === 'a') {
      if (!props.href) delete props.target
      if (props.target === '_blank') props.rel = 'noopener noreferrer'
    }
    if (tag === 'img' && props.alt === undefined) props.alt = ''
    if (VOID_TAGS.has(tag)) return h(tag, props)
    const kids = children(node.children, depth)
    if (props['data-carousel']) {
      const labels = { carousel: env.ctx.tt('gallery.carousel'), previous: env.ctx.tt('gallery.previous'), next: env.ctx.tt('gallery.next') }
      return h(PackageCarousel, { tag, labels, controls: props['data-carousel-controls'] ?? 'arrows', peek: props['data-carousel-peek'] === 'on', ...props }, () => kids.slice(0, LIMITS.carouselSlides))
    }
    return h(tag, props, kids)
  }

  return walk(root, 0)
}
