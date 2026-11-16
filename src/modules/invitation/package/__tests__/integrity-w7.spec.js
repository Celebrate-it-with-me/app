import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { checkIntegrity, samplePoints, viewportMeasurable } from '../integrity'
import { installBoxModel, rsvpBlock, VH, VW } from './boxmodel'

/**
 * Wave 7 (security audit N-1..N-5 and verification I-3): hostile cases must fall back to Clásica, and the legitimate
 * look-alikes must not. The package CSS here is injected straight into the DOM (the server sanitiser rejects most of it
 * at the source; the guard is the second layer).
 */
let env
beforeEach(() => {
  env = installBoxModel()
})
afterEach(() => env.uninstall())

const reasons = result => result.problems.map(p => `${p.block}:${p.reason}`)
const overlay = (box, style = '') => `<a class="pkg-ov" href="https://evil.example/login" data-box="${box}" style="position:absolute;z-index:30;opacity:0;${style}"></a>`

describe('N-1: a transparent link over part of a control', () => {
  it('the clean RSVP passes', () => {
    expect(checkIntegrity(env.page('', rsvpBlock())).problems).toEqual([])
  })

  it('falls back when the link covers a strip of the button (the centre is still the button)', () => {
    const root = env.page('', `${rsvpBlock()}${overlay('40,230,350,246')}`)
    expect(reasons(checkIntegrity(root))).toEqual(['rsvp:control-covered'])
  })

  it('falls back when the link covers a side column of the button', () => {
    const root = env.page('', `${rsvpBlock()}${overlay('40,230,64,280')}`)
    expect(reasons(checkIntegrity(root))).toEqual(['rsvp:control-covered'])
  })

  it('falls back when the link covers only the bottom edge of an input', () => {
    const input = '<input type="text" data-box="40,150,350,200"><button type="submit" data-box="40,230,350,280">Enviar</button>'
    const root = env.page('', `${rsvpBlock(input)}${overlay('40,194,350,200')}`)
    expect(reasons(checkIntegrity(root))[0]).toMatch(/^rsvp:(control-)?covered$/)
  })

  it('does not fall back for a link that sits below the block (z-index 10), or lets clicks through', () => {
    expect(checkIntegrity(env.page('', `${rsvpBlock()}${overlay('40,230,350,246', 'z-index:10')}`)).problems).toEqual([])
    expect(checkIntegrity(env.page('', `${rsvpBlock()}${overlay('40,230,350,246', 'pointer-events:none')}`)).problems).toEqual([])
  })

  it('does not fall back for the block\'s own markup around a rounded button (corners fall on the wrapper)', () => {
    const root = env.page('', rsvpBlock())
    const hit = document.elementFromPoint
    // Pill button: the four corner samples land on the block, not on the button.
    document.elementFromPoint = (x, y) => ((x < 50 || x > 340) && (y < 240 || y > 270) ? root.querySelector('form') : hit(x, y))
    expect(checkIntegrity(root).problems).toEqual([])
  })

  it('does not fall back for a second control of the same block (a "map" link beside the button)', () => {
    const inner = '<button type="submit" data-box="40,230,200,280">Enviar</button><a href="https://maps.example/x" data-box="210,230,350,280">Mapa</a>'
    expect(checkIntegrity(env.page('', rsvpBlock(inner))).problems).toEqual([])
  })

  it('uses 9 points: centre, 4 corners and 4 side midpoints, inset from the edge', () => {
    const points = samplePoints(0, 0, 100, 40)
    expect(points).toHaveLength(9)
    expect(points).toContainEqual([50, 20])
    expect(points).toContainEqual([3, 3])
    expect(points).toContainEqual([97, 37])
    expect(points).toContainEqual([50, 3])
    expect(points).toContainEqual([3, 20])
  })

  it('ignores the part of a control that is off screen, and a sliver under the fold', () => {
    const below = `<div class="inv-q inv-q--rsvp" data-q="rsvp" data-box="0,${VH - 25},390,${VH + 200}" style="position:relative;z-index:20"><form><button data-box="40,${VH - 25},350,${VH + 30}">Enviar</button></form></div>`
    expect(checkIntegrity(env.page('', `${below}${overlay(`40,${VH - 25},350,${VH + 30}`)}`)).problems).toEqual([])
  })
})

describe('N-2: a frame that cuts a control down', () => {
  const framed = (frame, buttonBox = '40,230,350,280') =>
    `<div class="inv-q inv-q--rsvp" data-q="rsvp" data-box="0,100,390,300" ${'style="position:relative;z-index:20"'}><form><label>Nombre</label><div class="pkg-frame" data-box="${frame}" style="overflow:hidden"><button type="submit" data-box="${buttonBox}">Enviar</button></div></form></div>`

  it('falls back for an 8 px container with overflow hidden around the button', () => {
    const root = env.page('', framed('40,230,350,238'))
    expect(reasons(checkIntegrity(root))).toEqual(['rsvp:control-clipped'])
  })

  it('falls back for an 8 px frame around the whole block', () => {
    const root = env.page('', `<div class="pkg-frame" data-box="0,100,390,108" style="overflow:hidden">${rsvpBlock()}</div>`)
    expect(reasons(checkIntegrity(root))).toEqual(['rsvp:clipped'])
  })

  it('falls back for a frame that leaves a 20 px sliver of the button', () => {
    expect(reasons(checkIntegrity(env.page('', framed('40,230,350,250'))))).toEqual(['rsvp:control-clipped'])
  })

  it('keeps a button inside a roomy frame (rounded card)', () => {
    expect(checkIntegrity(env.page('', framed('30,220,360,290'))).problems).toEqual([])
  })

  it('does not count a scrolling list (overflow auto): its items are reached by scrolling', () => {
    const root = env.page('', framed('40,200,350,250').replace('overflow:hidden', 'overflow:auto'))
    expect(checkIntegrity(root).problems).toEqual([])
  })

  it('falls back for a button shrunk to a speck, but not for a small link, a checkbox or a visually hidden input', () => {
    expect(reasons(checkIntegrity(env.page('', rsvpBlock('<button data-box="40,230,50,240">x</button>'))))).toEqual(['rsvp:control-too-small'])
    const fine = '<button data-box="40,230,350,280">Enviar</button><a href="https://example.com/x" data-box="40,285,140,297">Ver mapa</a><input type="checkbox" data-box="10,150,24,164"><input type="text" class="sr-only" data-box="0,0,1,1">'
    expect(checkIntegrity(env.page('', rsvpBlock(fine))).problems).toEqual([])
  })

  it('MIN_BOX follows the 48 px floor of the server', async () => {
    const { MIN_BOX } = await import('../integrity')
    expect(MIN_BOX).toBe(48)
  })
})

describe('N-3: a system block on top of another is not "system UI"', () => {
  const names = '<div class="inv-q inv-q--names" data-q="names" data-box="0,100,390,300" style="position:relative;z-index:20">Ana y Luis</div>'

  it('falls back when a block with names sits over the RSVP (grid-area trick)', () => {
    const result = checkIntegrity(env.page('', `${rsvpBlock()}${names}`))
    expect(result.ok).toBe(false)
    expect(reasons(result)).toContain('rsvp:covered')
  })

  it('also when the covering block is a built-in section', () => {
    const native = '<div data-inv-section="gallery" data-inv-native="true" data-box="0,100,390,300" style="position:relative;z-index:20"><section><img alt="" data-box="0,100,390,300"></section></div>'
    expect(reasons(checkIntegrity(env.page('', `${rsvpBlock()}${native}`)))).toContain('rsvp:covered')
  })

  it('does not fall back for floating system UI over the RSVP: music, dialogs, popovers, app chrome', () => {
    const floating = [
      '<div class="inv-music" data-box="0,100,390,300" style="position:fixed;z-index:50"><button>Play</button></div>',
      '<div role="dialog" data-box="0,100,390,300" style="position:fixed;z-index:50">Galería</div>',
      '<div data-inv-system-ui data-box="0,100,390,300" style="position:fixed;z-index:50">x</div>',
      '<div data-reka-popper-content-wrapper data-box="0,100,390,300" style="position:fixed;z-index:50">x</div>'
    ]
    for (const html of floating) expect(checkIntegrity(env.page('', `${rsvpBlock()}${html}`)).problems).toEqual([])
    // A toast teleported to <body>, outside the package page.
    env.page('', rsvpBlock())
    document.body.insertAdjacentHTML('beforeend', '<div class="toaster" data-box="0,100,390,300" style="position:fixed;z-index:100">Guardado</div>')
    expect(checkIntegrity(document.querySelector('.inv-root')).problems).toEqual([])
  })

  it('keeps B-1: a block that only peeks in under another one is not judged yet', () => {
    const peeking = `<div class="inv-q inv-q--rsvp" data-q="rsvp" data-box="0,${VH - 25},390,${VH + 175}" style="position:relative;z-index:20"><form><label>x</label></form></div>`
    const cover = `<div class="inv-q inv-q--names" data-q="names" data-box="0,${VH - 60},390,${VH + 175}" style="position:relative;z-index:20">Ana</div>`
    expect(checkIntegrity(env.page('', `${peeking}${cover}`)).problems).toEqual([])
  })

  it('a control that lets the click fall through is a violation, unless it is disabled', () => {
    const root = env.page('', rsvpBlock('<button style="pointer-events:none" data-box="40,230,350,280">Enviar</button>'))
    expect(reasons(checkIntegrity(root))).toEqual(['rsvp:control-pointer-events-none'])
    const disabled = env.page('', rsvpBlock('<button disabled style="pointer-events:none" data-box="40,230,350,280">Enviar</button>'))
    expect(checkIntegrity(disabled).problems).toEqual([])
  })
})

describe('N-4: an overlay that exists only in a pointer/focus state', () => {
  it('is caught at the next measure, once the overlay is up', () => {
    const css = '.pkg-ov{display:none}.pkg-ov.is-on{display:block}'
    const root = env.page(css, `${rsvpBlock()}${overlay('0,100,390,300')}`)
    expect(checkIntegrity(root).problems).toEqual([]) // pointer elsewhere: nothing on top
    root.querySelector('.pkg-ov').classList.add('is-on') // `:hover` / `:focus-within` / `:active` kicks in
    expect(reasons(checkIntegrity(root))).toContain('rsvp:covered')
  })
})

describe('N-5: the music control stays fixed', () => {
  const music = (wrapperStyle = '', playerStyle = 'position:fixed;z-index:20') =>
    `<div class="pkg-w" data-reveal="rise" style="${wrapperStyle}"><div class="inv-q inv-q--music" data-q="music" data-box="0,0,390,0"><div class="inv-music" style="${playerStyle}"><button data-box="330,740,380,790">Play</button></div></div></div>`

  it('passes with a fixed player on a plain page', () => {
    expect(checkIntegrity(env.page('', music())).problems).toEqual([])
  })

  it.each([
    ['translate left behind by a data-reveal entrance', 'translate:0px 0px'],
    ['a transform', 'transform:translateY(0px)'],
    ['a scale', 'scale:1.01'],
    ['a filter', 'filter:blur(0.1px)'],
    ['containment', 'contain:paint'],
    ['will-change', 'will-change:transform']
  ])('falls back when an ancestor has %s (the player would scroll away)', (_name, style) => {
    expect(reasons(checkIntegrity(env.page('', music(style))))).toEqual(['music:music-not-fixed'])
  })

  it('falls back when the player is not position:fixed any more', () => {
    expect(reasons(checkIntegrity(env.page('', music('', 'position:absolute'))))).toEqual(['music:music-not-fixed'])
  })

  it('falls back when the player ends up off the screen', () => {
    const html = music().replace('data-box="330,740,380,790"', 'data-box="330,6944,380,6994"')
    expect(reasons(checkIntegrity(env.page('', html)))).toEqual(['music:music-off-screen'])
  })

  it('does not fall back for ancestors with none/auto values', () => {
    expect(checkIntegrity(env.page('', music('transform:none;translate:none;filter:none;contain:none;will-change:auto'))).problems).toEqual([])
  })
})

describe('I-3: a document without size is not judged, with the document box and not innerWidth', () => {
  const resize = (w, h) => {
    Object.defineProperty(document.documentElement, 'clientWidth', { value: w, configurable: true })
    Object.defineProperty(document.documentElement, 'clientHeight', { value: h, configurable: true })
  }

  it('a hidden iframe keeps its old innerWidth AND documentElement size, but its body has no box: skipped', () => {
    const root = env.page('[data-q]{display:none}', rsvpBlock())
    document.body.setAttribute('data-box', '0,0,0,0') // what Chromium reports for the body of a display:none iframe
    expect(window.innerWidth).toBe(VW)
    expect(document.documentElement.clientWidth).toBe(VW)
    expect(viewportMeasurable(window, document)).toBe(false)
    expect(checkIntegrity(root)).toMatchObject({ ok: true, skipped: 'no-viewport' })
    document.body.removeAttribute('data-box')
    expect(viewportMeasurable(window, document)).toBe(true)
    expect(checkIntegrity(root).ok).toBe(false) // judged again once it is back
  })

  it('a width without a height (collapsed iframe) is skipped as well', () => {
    resize(VW, 0)
    expect(viewportMeasurable(window, document)).toBe(false)
    resize(VW, VH)
  })

  it('a package that hides the root of a visible document is still judged (not mistaken for a hidden tab)', () => {
    const root = env.page('.inv-root{display:none}', rsvpBlock())
    expect(checkIntegrity(root).ok).toBe(false)
  })
})

describe('engine.css: wave 7 pins (defence in depth)', () => {
  const css = readFileSync('src/modules/invitation/package/engine.css', 'utf8').replace(/\r\n/g, '\n')
  const body = selector => {
    const at = css.indexOf(selector)
    expect(at).toBeGreaterThan(-1)
    return css.slice(css.indexOf('{', at), css.indexOf('}', at))
  }

  it('the containers of blocks cannot cut, mask, stack or move them (only under a drawn package)', () => {
    const rule = body('.inv-root[data-inv-pkg] :is(:has(> .inv-q:not(.inv-q--cover-photo)), :has(> [data-inv-native])):not(.inv-q, [data-inv-native]) {')
    for (const decl of ['isolation: auto', 'z-index: auto', 'overflow: visible', 'clip-path: none', 'mask: none', 'filter: none', 'backdrop-filter: none', 'grid-area: auto', 'order: 0']) {
      expect(rule).toContain(`${decl} !important`)
    }
    expect(body('.inv-root[data-inv-pkg] :is(:has(> .inv-q:not(.inv-q--cover-photo)), :has(> [data-inv-native])):not(.inv-q, [data-inv-native], [data-reveal]) {')).toContain('opacity: 1 !important')
  })

  it('the blocks themselves cannot be moved by a grid/flex/float layout', () => {
    const rule = body('.inv-root[data-inv-pkg] .inv-q,\n.inv-root[data-inv-pkg] [data-inv-native] {')
    for (const decl of ['grid-area: auto', 'order: 0', 'float: none']) expect(rule).toContain(`${decl} !important`)
  })

  it('nothing above the music player can become its containing block', () => {
    const rule = body('.inv-root[data-inv-pkg] :has(.inv-music) {')
    for (const decl of ['transform: none', 'perspective: none', 'filter: none', 'contain: none', 'will-change: auto', 'animation: none']) {
      expect(rule).toContain(`${decl} !important`)
    }
    // translate/scale/rotate are pinned apart from `transform` so the production minifier cannot fold them into a non-none transform.
    expect(rule).not.toMatch(/(^|\s)(translate|scale|rotate):/)
    const apart = body('.inv-root[data-inv-pkg] :has(.inv-music):not(.pk-none) {')
    for (const decl of ['translate: none', 'scale: none', 'rotate: none']) expect(apart).toContain(`${decl} !important`)
    expect(apart).not.toContain('transform:')
    expect(css).toContain('.inv-root[data-inv-pkg] .inv-music { position: fixed !important; }')
  })
})
