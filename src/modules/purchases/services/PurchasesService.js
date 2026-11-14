import { CWM_API } from '@/services/axios'

class PurchasesService {
  /** The logged in user's paid and refunded purchases, each with its invoices and credit notes. */
  async list() {
    return (await CWM_API.get('account/purchases')).data.data
  }

  /** Her billing data ({ exists, name, billingEmail, ..., accountEmail }). */
  async billingProfile() {
    return (await CWM_API.get('account/billing-profile')).data.data
  }

  async saveBillingProfile(payload) {
    return (await CWM_API.put('account/billing-profile', payload)).data.data
  }

  /** Mails an invoice or credit note again to one of her own addresses ('billing' | 'account'). Returns the address used. */
  async resend(kind, id, to) {
    const path = kind === 'invoice' ? `account/invoices/${id}/resend` : `account/credit-notes/${id}/resend`
    return (await CWM_API.post(path, { to })).data.data.sentTo
  }

  /** Downloads a PDF (the auth header is needed, so it goes through axios as a blob). */
  async download(kind, id, filename) {
    const path = kind === 'invoice' ? `account/invoices/${id}/pdf` : `account/credit-notes/${id}/pdf`
    const res = await CWM_API.get(path, { responseType: 'blob', headers: { Accept: 'application/pdf' } })
    saveBlob(res.data, filename)
  }
}

export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export default new PurchasesService()
