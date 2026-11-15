/**
 * AST → vnodes. No v-html, no template compiler: every node goes through `h()` after being
 * checked against the closed lists in policy.js and blocks.js.
 *
 * Node shapes (produced by the server from the package HTML):
 *   { t:'el',   tag, attrs?, children? }       attrs values: string | { t:'var', path, filter? }
 *   { t:'text', v }
 *   { t:'q',    name, props?, children? }      name: 'q-rsvp', 'q-names', …
 *   { t:'var',  path, filter? }
 *   { t:'if',   path, filter?, children }       draws children only when the variable is not empty
 */
import { Fragment, h } from 'vue'
import { BLOCKS } from './blocks'
import { LIMITS, TAGS, VAR_ATTRS, VOID_TAGS, cleanAttr } from './policy'
import { resolveVar } from './variables'
import PackageCarousel from './PackageCarousel'

const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v)

/** @param {{ ctx:object, base:string, warnings?:string[] }} env */
export function renderAst(root, env) {
  const state = { nodes: 0, stop: false }
  const warnings = env.warnings ?? []
  const warn = msg => {
    warnings.push(msg)
    if (import.meta.env?.DEV && !import.meta.env?.VITEST) console.warn(`[invitation package] ${msg}`)
  }

  function attrValue(raw) {
    if (isObject(raw) && raw.t === 'var' && typeof raw.path === 'string') return resolveVar(raw.path, raw.filter, env.ctx, warn)
    return raw
  }

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
        const block = typeof node.name === 'string' && Object.hasOwn(BLOCKS, node.name) ? BLOCKS[node.name] : null
        if (!block) {
          warn(`unknown block "${String(node.name).slice(0, 40)}": ignored`)
          return null
        }
        const props = {}
        for (const [key, validate] of Object.entries(block.props)) {
          if (isObject(node.props) && Object.hasOwn(node.props, key)) {
            const value = validate(attrValue(node.props[key]))
            if (value !== undefined) props[key] = value
          }
        }
        for (const key of Object.keys(isObject(node.props) ? node.props : {})) {
          if (!(key in block.props)) warn(`prop "${key}" is not allowed on ${node.name}: dropped`)
        }
        const kids = () => {
          const list = children(node.children, depth)
          return list.length ? list : undefined
        }
        return block.render(props, env, kids)
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

  function element(node, depth) {
    const tag = typeof node.tag === 'string' ? node.tag.toLowerCase() : ''
    if (!TAGS.has(tag)) {
      warn(`tag "${String(node.tag).slice(0, 30)}" is not allowed: node ignored`)
      return null
    }
    const props = {}
    const raw = isObject(node.attrs) ? node.attrs : {}
    for (const [name, value] of Object.entries(raw)) {
      const lower = name.toLowerCase()
      const resolved = isObject(value) ? (VAR_ATTRS.has(lower) ? attrValue(value) : undefined) : value
      const clean = cleanAttr(tag, lower, resolved, env.base)
      if (clean === undefined) warn(`attribute "${name.slice(0, 30)}" on <${tag}> dropped`)
      else props[lower] = clean
    }
    if (tag === 'a') {
      if (!props.href) delete props.target
      if (props.target === '_blank') props.rel = 'noopener noreferrer'
    }
    if (tag === 'img' && props.alt === undefined) props.alt = ''
    if (props['data-delay'] !== undefined) props.style = { '--pk-delay': props['data-delay'] }
    if (VOID_TAGS.has(tag)) return h(tag, props)
    const kids = children(node.children, depth)
    if ('data-carousel' in props) {
      delete props['data-carousel']
      const labels = { carousel: env.ctx.tt('gallery.carousel'), previous: env.ctx.tt('gallery.previous'), next: env.ctx.tt('gallery.next') }
      return h(PackageCarousel, { tag, labels, ...props }, () => kids.slice(0, LIMITS.carouselSlides))
    }
    return h(tag, props, kids)
  }

  return walk(root, 0)
}
