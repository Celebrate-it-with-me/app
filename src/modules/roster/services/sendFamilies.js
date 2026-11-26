import SendWizardService from './SendWizardService'
import { WIZARD_HANDLES_AUTOMATIC, categoryCounts, membersOf, mergeFamilies } from '../utils/sendWizard'

/**
 * The send wizard's own read of the families (audience + recipients + roster, and the reminders when the API is holding
 * some back). The wizard and the Inicio's "Recordar" both go through here, so the number on the Inicio's button is the
 * one the wizard's card shows. Returns `{ info, families }`.
 */
export async function loadSendFamilies(eventId, mode) {
  const [info, recipients, roster, reminderInfo] = await Promise.all([
    SendWizardService.audience(eventId, 'invitation'),
    SendWizardService.allRecipients(eventId, 'invitation'),
    SendWizardService.allRoster(eventId),
    // Who is held back depends on the template: the 3-reminders cap only shows up when asking for reminders.
    SendWizardService.audience(eventId, 'reminder_pending').catch(() => null)
  ])
  const holds = reminderInfo?.blocked?.reminder_limit > 0 || reminderInfo?.blocked?.recently_sent > 0
  const reminders = mode === 'automatic' && info?.mode?.automatic !== false && holds ? await SendWizardService.allRecipients(eventId, 'reminder_pending').catch(() => []) : []
  return { info, families: mergeFamilies(recipients, roster, reminders) }
}

/** The mode the wizard opens in for a WhatsApp module state (`whatsappModuleState`): automatic unless off or locked. */
export const wizardModeOf = moduleState => (moduleState !== 'locked' && moduleState !== 'off' && WIZARD_HANDLES_AUTOMATIC ? 'automatic' : 'manual')

/** The automatic mode falls back to manual when the API says it cannot send (no number, template not approved...). */
export const effectiveModeOf = (mode, info) => (mode === 'automatic' && info?.mode?.automatic === false ? 'manual' : mode)

/**
 * The counters of the wizard's cards (`unsent`, `pending`, `all`) exactly as the wizard computes them when it opens in
 * `mode`, plus `pendingUnsent` (families that have not answered because the invitation never reached them: they are on
 * the first-send card), whether the RSVP window is open and whether the event is archived.
 */
export async function sendCounts(eventId, mode) {
  const { info, families } = await loadSendFamilies(eventId, mode)
  const effective = effectiveModeOf(mode, info)
  return {
    ...categoryCounts(families, { template: 'invitation', mode: effective }),
    pendingUnsent: membersOf(families, 'unsent', { template: 'invitation', mode: effective }).filter(f => f.status === 'pending').length,
    rsvpOpen: info?.rsvp?.isOpen !== false,
    archived: !!info?.event?.archived
  }
}
