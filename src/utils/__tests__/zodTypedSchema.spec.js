import { describe, it, expect } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '../zodTypedSchema'

const schema = toTypedSchema(
  z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    notes: z.string().optional(),
    kind: z.enum(['a', 'b'], {
      error: issue => (issue.input === undefined ? 'Pick one' : undefined)
    }),
    guests: z.array(z.object({ first: z.string().min(1, 'First name is required') }))
  })
)

const valid = {
  name: 'Valentina',
  email: 'vale@example.com',
  kind: 'a',
  guests: [{ first: 'Rosa' }]
}

describe('toTypedSchema (zod 4 adapter)', () => {
  it('returns the parsed value and no errors when the data is valid', async () => {
    const result = await schema.parse(valid)

    expect(result.errors).toEqual([])
    expect(result.value).toEqual(valid)
  })

  it('uses the custom message set on the rule', async () => {
    const { errors } = await schema.parse({ ...valid, name: '', email: 'nope' })
    const byPath = Object.fromEntries(errors.map(e => [e.path, e.errors]))

    expect(byPath.name).toEqual(['Name is required'])
    expect(byPath.email).toEqual(['Invalid email address'])
  })

  it('keeps the Zod 3 "Required" message for missing values', async () => {
    const { errors } = await schema.parse({})
    const byPath = Object.fromEntries(errors.map(e => [e.path, e.errors]))

    expect(byPath.name).toEqual(['Required'])
    expect(byPath.email).toEqual(['Required'])
  })

  it('supports the zod 4 "error" option on enums', async () => {
    const missing = await schema.parse({ ...valid, kind: undefined })
    const invalid = await schema.parse({ ...valid, kind: 'z' })

    expect(missing.errors.find(e => e.path === 'kind').errors).toEqual(['Pick one'])
    expect(invalid.errors.find(e => e.path === 'kind').errors[0]).not.toBe('Pick one')
  })

  it('builds vee-validate paths for arrays and nested objects', async () => {
    const { errors } = await schema.parse({ ...valid, guests: [{ first: 'Rosa' }, { first: '' }] })

    expect(errors.map(e => e.path)).toEqual(['guests[1].first'])
  })

  it('collects the issues of every union branch', async () => {
    const union = toTypedSchema(
      z.object({ phone: z.union([z.string().min(5, 'too short'), z.number()]) })
    )
    const { errors } = await union.parse({ phone: true })

    expect(errors.length).toBeGreaterThan(0)
    expect(errors.every(e => e.path === 'phone')).toBe(true)
  })

  it('describes required and optional fields', () => {
    expect(schema.describe('name')).toEqual({ required: true, exists: true })
    expect(schema.describe('notes')).toEqual({ required: false, exists: true })
    expect(schema.describe('guests[0].first')).toEqual({ required: true, exists: true })
    expect(schema.describe('missing')).toEqual({ required: false, exists: false })
  })

  it('casts valid values and returns invalid ones untouched', () => {
    expect(schema.cast(valid)).toEqual(valid)
    expect(schema.cast({ name: 1 })).toEqual({ name: 1 })
  })

  it('reports object-level refinements on the given path (password confirmation)', async () => {
    const reset = toTypedSchema(
      z
        .object({
          password: z.string({ message: 'Password is required' }).min(8, { message: 'Too short' }),
          confirmPassword: z.string({ message: 'Confirm is required' }).min(8)
        })
        .refine(data => data.password === data.confirmPassword, {
          message: 'Passwords must match',
          path: ['confirmPassword']
        })
    )

    const mismatch = await reset.parse({ password: '12345678', confirmPassword: '87654321' })
    expect(mismatch.errors).toEqual([{ path: 'confirmPassword', errors: ['Passwords must match'] }])

    const ok = await reset.parse({ password: '12345678', confirmPassword: '12345678' })
    expect(ok.errors).toEqual([])
  })

  it('keeps the message passed to the constructor for missing values', async () => {
    const reset = toTypedSchema(z.object({ password: z.string({ message: 'Password is required' }) }))
    const { errors } = await reset.parse({})

    expect(errors).toEqual([{ path: 'password', errors: ['Password is required'] }])
  })

  it('applies defaults for optional booleans', async () => {
    const prefs = toTypedSchema(
      z.object({ remember: z.boolean().optional().default(false), tips: z.boolean().default(true) })
    )
    const { value, errors } = await prefs.parse({})

    expect(errors).toEqual([])
    expect(value).toEqual({ remember: false, tips: true })
  })

  it('works as a vee-validate validationSchema', async () => {
    let form
    const Form = defineComponent({
      setup() {
        form = useForm({ validationSchema: schema, initialValues: { ...valid, name: '' } })
        return () => h('div')
      }
    })
    mount(Form)

    const result = await form.validate()

    expect(result.valid).toBe(false)
    expect(form.errors.value.name).toBe('Name is required')

    form.setFieldValue('name', 'Valentina')
    expect((await form.validate()).valid).toBe(true)
  })
})

describe('toTypedSchema messages follow the app language', () => {
  const required = toTypedSchema(z.object({ name: z.string() }))

  it('answers "Required" in English and "Obligatorio" in Spanish for a missing value', async () => {
    const { default: i18n } = await import('@/locales/i18n')
    const previous = i18n.global.locale.value

    i18n.global.locale.value = 'en'
    expect((await required.parse({})).errors[0].errors).toEqual(['Required'])

    i18n.global.locale.value = 'es'
    expect((await required.parse({})).errors[0].errors).toEqual(['Obligatorio'])

    i18n.global.locale.value = previous
  })

  it('translates the built-in Zod messages', async () => {
    const { default: i18n } = await import('@/locales/i18n')
    const previous = i18n.global.locale.value
    const min = toTypedSchema(z.object({ name: z.string().min(3) }))

    i18n.global.locale.value = 'es'
    const [spanish] = (await min.parse({ name: 'a' })).errors[0].errors
    i18n.global.locale.value = 'en'
    const [english] = (await min.parse({ name: 'a' })).errors[0].errors

    expect(spanish).not.toBe(english)
    expect(spanish).toMatch(/caracteres|corto|menos/i)
    i18n.global.locale.value = previous
  })
})
