import lightGallery from 'lightgallery'
import lgThumbnail from 'lightgallery/plugins/thumbnail'
import 'lightgallery/css/lightgallery.css'
import 'lightgallery/css/lg-thumbnail.css'

const escapeHtml = value =>
  String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch])

/** Opens the full-size photo in a lightGallery lightbox (a single dynamic slide). */
export function openPhotoViewer(memory) {
  if (!memory?.imagePath) return
  const container = document.createElement('div')
  const gallery = lightGallery(container, {
    dynamic: true,
    dynamicEl: [
      {
        src: memory.imagePath,
        thumb: memory.thumbnailPath || memory.imagePath,
        subHtml: `<h4>${escapeHtml(memory.title)}</h4><p>${escapeHtml(memory.description)}</p>`
      }
    ],
    plugins: [lgThumbnail],
    mobileSettings: { controls: true, showCloseIcon: true, download: true }
  })
  container.addEventListener('lgAfterClose', () => gallery.destroy())
  gallery.openGallery(0)
}
