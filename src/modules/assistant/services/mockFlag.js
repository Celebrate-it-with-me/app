/** `VITE_ASSISTANT_MOCK` turns the assistant mock on only when it is exactly `1` or `true` (so `false`, `0`, empty or anything else keep it off). */
export const isAssistantMockEnabled = value => value === '1' || value === 'true' || value === true || value === 1
