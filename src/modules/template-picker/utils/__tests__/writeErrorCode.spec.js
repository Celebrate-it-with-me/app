import { describe, it, expect } from 'vitest'
import { writeErrorCode } from '../templatePicker'

const http = (status, data = {}) => ({ response: { status, data } })

describe('writeErrorCode', () => {
  it.each([
    [http(422, { errors: { status: ['event_archived'] } }), 'photo', 'event_archived'],
    [http(422, { errors: { photo: ['required'] } }), 'photo', 'required'],
    [http(409, { code: 'template_locked' }), undefined, 'template_locked'],
    [http(403, { code: 'template_not_available' }), undefined, 'template_not_available'],
    [http(403, {}), undefined, 'forbidden'],
    [http(429, {}), 'photo', 'too_many_attempts'],
    [http(500, {}), undefined, null],
    [new Error('offline'), undefined, null]
  ])('reads %#', (error, field, code) => expect(writeErrorCode(error, field)).toBe(code))
})
