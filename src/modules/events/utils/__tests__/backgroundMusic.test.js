import { describe, it, expect } from 'vitest'
import { MUSIC_MAX_BYTES, formatBytes, musicErrorCodes, validateMusicFile } from '../backgroundMusic'

const file = (name, type, size = 1000) => ({ name, type, size })

describe('validateMusicFile', () => {
  it('accepts mp3, m4a, aac and ogg', () => {
    expect(validateMusicFile(file('a.mp3', 'audio/mpeg'))).toBeNull()
    expect(validateMusicFile(file('a.m4a', 'audio/x-m4a'))).toBeNull()
    expect(validateMusicFile(file('a.m4a', 'audio/mp4'))).toBeNull()
    expect(validateMusicFile(file('a.aac', 'audio/aac'))).toBeNull()
    expect(validateMusicFile(file('a.ogg', 'audio/ogg'))).toBeNull()
  })
  it('accepts a known extension when the browser gives no type', () => {
    expect(validateMusicFile(file('song.MP3', ''))).toBeNull()
  })
  it('rejects wav and anything else', () => {
    expect(validateMusicFile(file('a.wav', 'audio/wav'))).toBe('invalid_type')
    expect(validateMusicFile(file('a.mp3', 'text/html'))).toBe('invalid_type')
    expect(validateMusicFile(file('a.php', ''))).toBe('invalid_type')
  })
  it('rejects files over 10 MB and accepts exactly 10 MB', () => {
    expect(validateMusicFile(file('a.mp3', 'audio/mpeg', MUSIC_MAX_BYTES + 1))).toBe('too_large')
    expect(validateMusicFile(file('a.mp3', 'audio/mpeg', MUSIC_MAX_BYTES))).toBeNull()
  })
  it('asks for a file', () => {
    expect(validateMusicFile(null)).toBe('required')
  })
})

describe('musicErrorCodes', () => {
  it('reads the contract codes from a 422', () => {
    const error = { response: { data: { errors: { songFile: ['too_large'], title: ['too_long'] } } } }
    expect(musicErrorCodes(error)).toEqual({ songFile: 'too_large', title: 'too_long' })
  })
  it('falls back to invalid_type for unknown song codes and ignores no errors', () => {
    expect(musicErrorCodes({ response: { data: { errors: { songFile: ['mimetypes'] } } } })).toEqual({ songFile: 'invalid_type' })
    expect(musicErrorCodes({})).toEqual({})
  })
})

describe('formatBytes', () => {
  it('formats KB and MB', () => {
    expect(formatBytes(3.2 * 1024 * 1024)).toBe('3.2 MB')
    expect(formatBytes(480 * 1024)).toBe('480 KB')
  })
})
