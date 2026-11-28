/** Photo rules for the profile picture. The API takes an image of 2 MB at most (`avatar`: image|max:2048). */
export const AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp'
export const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']
/** What the person may pick: phone photos are big, and the crop below shrinks them to a few dozen KB. */
export const AVATAR_PICK_MAX_BYTES = 12 * 1024 * 1024
/** What the API accepts. */
export const AVATAR_UPLOAD_MAX_BYTES = 2 * 1024 * 1024
export const AVATAR_OUTPUT_PX = 512

/** 'type' | 'size' | null: why the chosen file cannot be used (checked before reading it). */
export function avatarFileProblem(file) {
  if (!file || !AVATAR_TYPES.includes(file.type)) return 'type'
  if (file.size > AVATAR_PICK_MAX_BYTES) return 'size'
  return null
}

/** The centred square of an image of `width` x `height`: where it starts and its side. */
export function centerSquare(width, height) {
  const side = Math.min(width, height)
  return { sx: Math.round((width - side) / 2), sy: Math.round((height - side) / 2), side }
}

/** Crops the centred square of a loaded image into a `size` x `size` JPEG file. Rejects when the browser cannot encode it. */
export function cropSquareToFile(image, { size = AVATAR_OUTPUT_PX, name = 'avatar.jpg' } = {}) {
  const width = image.naturalWidth || image.width
  const height = image.naturalHeight || image.height
  const { sx, sy, side } = centerSquare(width, height)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) return Promise.reject(new Error('canvas-unavailable'))
  context.fillStyle = '#ffffff' // a transparent PNG would turn black as a JPEG
  context.fillRect(0, 0, size, size)
  context.drawImage(image, sx, sy, side, side, 0, 0, size, size)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(new File([blob], name, { type: 'image/jpeg' })) : reject(new Error('encode-failed'))),
      'image/jpeg',
      0.9
    )
  })
}
