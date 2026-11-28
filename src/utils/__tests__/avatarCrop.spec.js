import { describe, it, expect, vi, afterEach } from 'vitest'
import { avatarFileProblem, centerSquare, cropSquareToFile, AVATAR_PICK_MAX_BYTES } from '../avatarCrop'

const file = (type, size) => ({ type, size })

describe('avatarFileProblem', () => {
  it('accepts JPG, PNG and WebP', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp']) expect(avatarFileProblem(file(type, 1000))).toBeNull()
  })
  it('rejects other types and a missing file', () => {
    expect(avatarFileProblem(file('image/gif', 10))).toBe('type')
    expect(avatarFileProblem(file('application/pdf', 10))).toBe('type')
    expect(avatarFileProblem(null)).toBe('type')
  })
  it('rejects a file over the pick limit', () => {
    expect(avatarFileProblem(file('image/png', AVATAR_PICK_MAX_BYTES + 1))).toBe('size')
    expect(avatarFileProblem(file('image/png', AVATAR_PICK_MAX_BYTES))).toBeNull()
  })
})

describe('centerSquare', () => {
  it('takes the middle of a landscape image', () => expect(centerSquare(400, 200)).toEqual({ sx: 100, sy: 0, side: 200 }))
  it('takes the middle of a portrait image', () => expect(centerSquare(200, 500)).toEqual({ sx: 0, sy: 150, side: 200 }))
  it('keeps a square as it is', () => expect(centerSquare(300, 300)).toEqual({ sx: 0, sy: 0, side: 300 }))
})

describe('cropSquareToFile', () => {
  afterEach(() => vi.restoreAllMocks())
  const stubCanvas = ({ context, blob }) => {
    const ctx = context === undefined ? { fillRect: vi.fn(), drawImage: vi.fn(), fillStyle: '' } : context
    const canvas = { width: 0, height: 0, getContext: () => ctx, toBlob: cb => cb(blob) }
    vi.spyOn(document, 'createElement').mockReturnValue(canvas)
    return { ctx, canvas }
  }

  it('draws the centred square into a 512 px JPEG file', async () => {
    const { ctx, canvas } = stubCanvas({ blob: new Blob(['x'], { type: 'image/jpeg' }) })
    const out = await cropSquareToFile({ naturalWidth: 400, naturalHeight: 200 })
    expect(ctx.drawImage).toHaveBeenCalledWith(expect.anything(), 100, 0, 200, 200, 0, 0, 512, 512)
    expect(canvas.width).toBe(512)
    expect(out).toBeInstanceOf(File)
    expect(out.type).toBe('image/jpeg')
  })
  it('rejects when there is no 2d context', async () => {
    stubCanvas({ context: null, blob: null })
    await expect(cropSquareToFile({ width: 10, height: 10 })).rejects.toThrow('canvas-unavailable')
  })
  it('rejects when the browser cannot encode', async () => {
    stubCanvas({ blob: null })
    await expect(cropSquareToFile({ naturalWidth: 10, naturalHeight: 10 })).rejects.toThrow('encode-failed')
  })
})
