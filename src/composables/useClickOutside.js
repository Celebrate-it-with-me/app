import { onBeforeUnmount, onMounted } from 'vue'

export function useClickOutside(elementRef, callback) {
  const handleClickOutside = event => {
    if (elementRef.value && !elementRef.value.contains(event.target)) {
      callback()
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
  })
}
