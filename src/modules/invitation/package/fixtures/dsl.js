/** Tiny builders so fixtures read like the HTML the server turns into the AST. Output is plain JSON. */
export const el = (tag, attrs = {}, ...children) => ({ t: 'el', tag, attrs, children: children.flat().map(c => (typeof c === 'string' ? { t: 'text', v: c } : c)) })
export const text = v => ({ t: 'text', v })
export const v = (path, filter) => ({ t: 'var', path, ...(filter ? { filter } : {}) })
export const q = (name, props = {}, ...children) => ({ t: 'q', name, props, children: children.flat() })
export const when = (path, ...children) => ({ t: 'if', path, children: children.flat() })
