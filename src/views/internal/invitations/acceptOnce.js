const accepting = new Map()

/**
 * Accepting an invitation is not idempotent (the second POST is a 404): run `accept` once per invitation and
 * give every caller the same result, even if the view mounts twice.
 */
export function acceptOnce(inviteId, accept) {
  if (!accepting.has(inviteId)) accepting.set(inviteId, accept())
  return accepting.get(inviteId)
}

export function resetAcceptOnce() {
  accepting.clear()
}

/** Lets one invitation be tried again (after verifying the email) without clearing the others. */
export function forgetAcceptOnce(inviteId) {
  accepting.delete(inviteId)
}
