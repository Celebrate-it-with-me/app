import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'
import { createPinia } from 'pinia'
import { useToast } from '@/ui'

const service = vi.hoisted(() => ({ importTemplate: vi.fn(), importPreview: vi.fn(), importGuests: vi.fn() }))
vi.mock('../services/RosterService', () => ({ default: service }))
import GuestImportModal from '../components/GuestImportModal.vue'

const rows = [
  { line: 2, name: 'Ana Perez', phone: '+13055550111', phoneRaw: '+13055550111', phoneNote: null, email: 'ana@x.com', family: 'Perez', problems: [], duplicate: false },
  { line: 3, name: 'Luis Perez', phone: '+13055550112', phoneRaw: '305 555 0112', phoneNote: 'assumed_us', email: null, family: 'Perez', problems: [], duplicate: false },
  { line: 4, name: 'Bad Phone', phone: null, phoneRaw: '12ab', phoneNote: 'invalid', email: null, family: null, problems: ['phone_invalid'], duplicate: false },
  { line: 5, name: 'Demo', phone: '+13055550101', phoneRaw: '+13055550101', phoneNote: null, email: null, family: null, problems: [], duplicate: true }
]
let wrapper
const body = () => document.body.textContent
const button = text => [...document.body.querySelectorAll('button')].find(b => b.textContent.trim().startsWith(text))
const toasts = () => useToast().toasts.map(x => x.title)
const input = () => document.body.querySelector('[data-testid="import-file"]')
const alertText = () => document.body.querySelector('[role="alert"]')?.textContent.trim()

async function pickFile(file) {
  const el = input()
  Object.defineProperty(el, 'files', { value: [file], configurable: true })
  el.dispatchEvent(new Event('change'))
  await flushPromises()
}
const csv = (name = 'g.csv', size = 10) => {
  const f = new File(['x'], name)
  Object.defineProperty(f, 'size', { value: size })
  return f
}
async function toPreview(extra = rows) {
  service.importPreview.mockResolvedValue({ rows: extra })
  await pickFile(csv())
}
const mountModal = (props = {}) => {
  wrapper = mount(GuestImportModal, { props: { open: true, eventId: 7, ...props }, global: { plugins: [i18n, createPinia()] }, attachTo: document.body })
  return flushPromises()
}
beforeEach(() => {
  setLocale('es')
  Object.values(service).forEach(fn => fn.mockReset())
  useToast().toasts.map(x => x.id).forEach(id => useToast().dismiss(id))
})
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('GuestImportModal: choosing a file', () => {
  it('rejects a wrong type or size without calling the API', async () => {
    await mountModal()
    await pickFile(csv('g.pdf'))
    expect(alertText()).toContain('Ese formato no sirve')
    await pickFile(csv('g.csv', 3 * 1024 * 1024))
    expect(alertText()).toContain('más de 2 MB')
    expect(service.importPreview).not.toHaveBeenCalled()
  })

  it('shows the API reason when the file cannot be read, and stays on the picker', async () => {
    await mountModal()
    service.importPreview.mockRejectedValue({ response: { status: 422, data: { errors: { file: ['missing_name_column'] } } } })
    await pickFile(csv())
    expect(alertText()).toContain('columna de nombre')
    expect(button('Elegir archivo')).toBeTruthy()
  })

  it('says so when the file has no rows', async () => {
    await mountModal()
    service.importPreview.mockResolvedValue({ rows: [] })
    await pickFile(csv())
    expect(alertText()).toContain('no tiene invitados')
    service.importPreview.mockResolvedValue({})
    await pickFile(csv())
    expect(alertText()).toContain('no tiene invitados')
  })

  it('ignores an empty file selection', async () => {
    await mountModal()
    const el = input()
    Object.defineProperty(el, 'files', { value: [], configurable: true })
    el.dispatchEvent(new Event('change'))
    await flushPromises()
    expect(service.importPreview).not.toHaveBeenCalled()
  })

  it('accepts a dropped file and highlights the zone while dragging', async () => {
    await mountModal()
    const zone = document.body.querySelector('.border-dashed')
    zone.dispatchEvent(new Event('dragover', { cancelable: true, bubbles: true }))
    await flushPromises()
    expect(zone.className).toContain('border-rose-400')
    zone.dispatchEvent(new Event('dragleave', { cancelable: true, bubbles: true }))
    await flushPromises()
    expect(zone.className).not.toContain('border-rose-400')
    service.importPreview.mockResolvedValue({ rows })
    const drop = new Event('drop', { cancelable: true, bubbles: true })
    drop.dataTransfer = { files: [csv()] }
    zone.dispatchEvent(drop)
    await flushPromises()
    expect(service.importPreview).toHaveBeenCalledWith(7, expect.any(File))
    // A drop with no file does nothing more.
    wrapper.unmount()
    await mountModal()
    service.importPreview.mockClear()
    const empty = new Event('drop', { cancelable: true, bubbles: true })
    empty.dataTransfer = { files: [] }
    document.body.querySelector('.border-dashed').dispatchEvent(empty)
    await flushPromises()
    expect(service.importPreview).not.toHaveBeenCalled()
  })

  it('downloads the template as a CSV file and tells when it fails', async () => {
    await mountModal()
    URL.createObjectURL = vi.fn(() => 'blob:x')
    URL.revokeObjectURL = vi.fn()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    service.importTemplate.mockResolvedValue(new Blob(['n']))
    button('Descargar plantilla').click()
    await flushPromises()
    expect(service.importTemplate).toHaveBeenCalledWith(7)
    expect(click).toHaveBeenCalled()
    service.importTemplate.mockRejectedValue(new Error('x'))
    button('Descargar plantilla').click()
    await flushPromises()
    expect(toasts()).toContain('No pudimos descargar la plantilla. Inténtalo de nuevo.')
  })

  it('starts over from the picker each time it opens', async () => {
    await mountModal()
    await toPreview()
    expect(body()).toContain('seleccionados')
    await wrapper.setProps({ open: false })
    await wrapper.setProps({ open: true })
    await flushPromises()
    expect(button('Elegir archivo')).toBeTruthy()
  })
})

describe('GuestImportModal: preview', () => {
  it('selects only clean, new rows and counts the chips and the hints', async () => {
    await mountModal()
    await toPreview()
    expect(body()).toContain('2 de 4 seleccionados')
    expect(button('Todos').textContent).toContain('4')
    expect(button('Listos').textContent).toContain('2')
    expect(button('Con problemas').textContent).toContain('1')
    expect(button('Repetidos').textContent).toContain('1')
    expect(body()).toContain('Con +1 agregado')
    expect(body()).toContain('Revísalos antes de importar')
    expect(body()).toContain('misma familia')
    expect(button('Importar 2 invitados')).toBeTruthy()
  })

  it('filters by chip and clears the filter when pressed again; "all" stays', async () => {
    await mountModal()
    await toPreview()
    button('Con problemas').click()
    await flushPromises()
    expect(document.body.querySelectorAll('tbody tr')).toHaveLength(1)
    expect(body()).toContain('Teléfono no válido')
    button('Con problemas').click()
    await flushPromises()
    expect(document.body.querySelectorAll('tbody tr')).toHaveLength(4)
    button('Todos').click()
    await flushPromises()
    expect(document.body.querySelectorAll('tbody tr')).toHaveLength(4)
  })

  it('shows a message when a filter has no rows', async () => {
    await mountModal()
    await toPreview(rows.slice(0, 2))
    // No problems, no duplicates: those chips are hidden, "ready" stays.
    expect(button('Repetidos')).toBeUndefined()
    button('Listos').click()
    await flushPromises()
    expect(document.body.querySelectorAll('tbody tr')).toHaveLength(2)
  })

  it('fixing a phone clears the problem and selects the row; breaking a name unselects it', async () => {
    await mountModal()
    await toPreview()
    const tableInput = label => [...document.body.querySelectorAll(`tbody [aria-label="${label}"]`)][0]
    const edit = async (label, value) => {
      const el = tableInput(label)
      el.value = value
      el.dispatchEvent(new Event('input'))
      await flushPromises()
    }
    await edit('Teléfono de la fila 4', '+13055550199')
    expect(body()).toContain('3 de 4 seleccionados')
    await edit('Nombre de la fila 2', '  ')
    expect(body()).toContain('2 de 4 seleccionados')
    expect(body()).toContain('Falta el nombre')
  })

  it('toggles a row, and a row with problems cannot be selected', async () => {
    await mountModal()
    await toPreview()
    const boxes = () => [...document.body.querySelectorAll('tbody [role="checkbox"]')]
    expect(boxes()[2].disabled || boxes()[2].hasAttribute('disabled') || boxes()[2].dataset.disabled !== undefined).toBe(true)
    boxes()[0].click()
    await flushPromises()
    expect(body()).toContain('1 de 4 seleccionados')
    boxes()[0].click()
    await flushPromises()
    expect(body()).toContain('2 de 4 seleccionados')
    boxes()[3].click() // duplicate, clean, not selected by default
    await flushPromises()
    expect(body()).toContain('3 de 4 seleccionados')
  })

  it('goes back to the picker with "elegir otro archivo"', async () => {
    await mountModal()
    await toPreview()
    button('Elegir otro archivo').click()
    await flushPromises()
    expect(button('Elegir archivo')).toBeTruthy()
  })

  it('cannot import with nothing selected', async () => {
    await mountModal()
    await toPreview([rows[2]])
    const confirmButton = button('Selecciona al menos un invitado')
    expect(confirmButton.disabled).toBe(true)
    confirmButton.click()
    await flushPromises()
    expect(service.importGuests).not.toHaveBeenCalled()
  })
})

describe('GuestImportModal: phone cards', () => {
  it('opens the native picker from the "choose" button', async () => {
    await mountModal()
    const click = vi.spyOn(input(), 'click').mockImplementation(() => {})
    button('Elegir archivo').click()
    expect(click).toHaveBeenCalled()
  })

  it('edits and selects rows from the cards used on phones', async () => {
    await mountModal()
    await toPreview()
    const cards = () => [...document.body.querySelectorAll('ul.md\\:hidden > li')]
    expect(cards()).toHaveLength(4)
    const type = async (card, label, value) => {
      const el = card.querySelector(`[aria-label="${label}"]`)
      el.value = value
      el.dispatchEvent(new Event('input'))
      await flushPromises()
    }
    await type(cards()[2], 'Teléfono de la fila 4', '+13055550177')
    expect(body()).toContain('3 de 4 seleccionados')
    await type(cards()[0], 'Nombre de la fila 2', 'Ana Maria')
    expect(document.body.querySelector('ul.md\\:hidden [aria-label="Nombre de la fila 2"]').value).toBe('Ana Maria')
    cards()[0].querySelector('[role="checkbox"]').click()
    await flushPromises()
    expect(body()).toContain('2 de 4 seleccionados')
    expect(cards()[0].textContent).toContain('ana@x.com')
    expect(cards()[0].textContent).toContain('Familia: Perez')
    expect(cards()[1].textContent).toContain('+1 asumido')
    expect(cards()[3].textContent).toContain('Ya existe')
  })
})

describe('GuestImportModal: importing', () => {
  it('sends the kept rows and reports created, families and skipped', async () => {
    await mountModal()
    await toPreview()
    service.importGuests.mockResolvedValue({ created: 2, families: 1, skipped: 1 })
    button('Importar 2 invitados').click()
    await flushPromises()
    expect(service.importGuests).toHaveBeenCalledWith(7, [
      { name: 'Ana Perez', phone: '+13055550111', email: 'ana@x.com', family: 'Perez' },
      { name: 'Luis Perez', phone: '+13055550112', family: 'Perez' }
    ])
    expect(toasts()).toEqual(['Importamos 2 invitados · 1 familia · 1 omitido'])
    expect(wrapper.emitted('imported')[0][0]).toEqual({ created: 2, families: 1, skipped: 1 })
    expect(wrapper.emitted('update:open')[0]).toEqual([false])
  })

  it('reports only what was created when there are no families or skips', async () => {
    await mountModal()
    await toPreview()
    service.importGuests.mockResolvedValue({ created: 1 })
    button('Importar 2 invitados').click()
    await flushPromises()
    expect(toasts()).toEqual(['Importamos 1 invitado'])
  })

  it('shows the plan limit inside the dialog when the plan is full', async () => {
    await mountModal()
    await toPreview()
    service.importGuests.mockRejectedValue({ response: { status: 402, data: { code: 'guest_limit_exceeded', limit: 50, total: 60, excess: 10 } } })
    button('Importar 2 invitados').click()
    await flushPromises()
    expect(document.body.querySelector('[role="status"]')).toBeTruthy()
    expect(body()).toContain('50')
    expect(toasts()).toEqual([])
    expect(wrapper.emitted('imported')).toBeUndefined()
  })

  it('toasts a generic failure and can try again', async () => {
    await mountModal()
    await toPreview()
    service.importGuests.mockRejectedValue(new Error('500'))
    button('Importar 2 invitados').click()
    await flushPromises()
    expect(toasts()).toEqual(['No pudimos importar a tus invitados. Inténtalo de nuevo.'])
    service.importGuests.mockResolvedValue({ created: 2 })
    button('Importar 2 invitados').click()
    await flushPromises()
    expect(service.importGuests).toHaveBeenCalledTimes(2)
  })

  it('does not send twice while a request is under way', async () => {
    await mountModal()
    await toPreview()
    let release
    service.importGuests.mockReturnValue(new Promise(resolve => (release = resolve)))
    button('Importar 2 invitados').click()
    await flushPromises()
    button('Importar 2 invitados')?.click()
    await flushPromises()
    expect(service.importGuests).toHaveBeenCalledTimes(1)
    release({ created: 2 })
    await flushPromises()
  })

  it('the cancel button of the picker closes the dialog', async () => {
    await mountModal()
    button('Cancelar').click()
    await flushPromises()
    expect(wrapper.emitted('update:open')[0]).toEqual([false])
  })
})
