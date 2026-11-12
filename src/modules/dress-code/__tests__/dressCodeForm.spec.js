import { describe, it, expect } from 'vitest'
import {
  TYPES,
  MAX_FILE_BYTES,
  bankKeyFor,
  bankUrl,
  bankFor,
  fileProblem,
  buildFormData,
  formFromApi,
  emptyForm
} from '../utils/dressCodeForm'

const manifest = { formal: [{ file: 'largo.webp', credit: 'Ana / CC0' }], cocktail: [] }

describe('dress code form helpers', () => {
  it('offers the six types of the API', () => {
    expect(TYPES).toEqual(['black-tie', 'formal', 'semi-formal', 'cocktail', 'smart-casual', 'thematic'])
  })

  it('builds bank keys and urls from the manifest', () => {
    expect(bankKeyFor('formal', 'largo.webp')).toBe('formal/largo')
    expect(bankUrl(manifest, 'formal/largo')).toBe('/dress-code-bank/formal/largo.webp')
    expect(bankUrl(manifest, 'formal/otro')).toBeNull()
    expect(bankFor(manifest, 'formal')).toEqual([
      { key: 'formal/largo', url: '/dress-code-bank/formal/largo.webp', credit: 'Ana / CC0' }
    ])
    expect(bankFor(manifest, 'thematic')).toEqual([])
  })

  it('rejects files by type and size', () => {
    expect(fileProblem({ type: 'image/gif', size: 10 })).toBe('type')
    expect(fileProblem({ type: 'image/png', size: MAX_FILE_BYTES + 1 })).toBe('size')
    expect(fileProblem({ type: 'image/webp', size: 10 })).toBeNull()
  })

  it('reads the API answer and fills the gaps', () => {
    expect(formFromApi(null)).toEqual(emptyForm())
    expect(formFromApi({ dressCodeType: 'formal', description: null, reservedColors: ['#fff'] })).toEqual({
      dressCodeType: 'formal', description: '', reservedColors: ['#fff'], suggestedColors: []
    })
  })

  it('sends arrays as repeated fields', () => {
    const file = new File(['x'], 'a.png', { type: 'image/png' })
    const body = buildFormData(
      { dressCodeType: 'cocktail', description: 'Hola', reservedColors: ['#ffffff'], suggestedColors: ['#111111', '#222222'] },
      { keepImageIds: [4], bankImages: ['formal/largo'], files: [file] }
    )
    expect(body.get('dressCodeType')).toBe('cocktail')
    expect(body.getAll('suggestedColors[]')).toEqual(['#111111', '#222222'])
    expect(body.getAll('keepImageIds[]')).toEqual(['4'])
    expect(body.getAll('bankImages[]')).toEqual(['formal/largo'])
    expect(body.getAll('dressCodeImages[]')).toHaveLength(1)
  })
})
