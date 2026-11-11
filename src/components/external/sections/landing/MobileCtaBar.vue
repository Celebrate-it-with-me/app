<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton } from '@/ui'

/** Fixed bottom bar on phones, shown once the hero's own button has scrolled away. */
const props = defineProps({ watch: { type: String, default: '#como-funciona' } })
const { t } = useI18n()
const visible = ref(false)
let observer

onMounted(() => {
  const target = document.querySelector(props.watch)
  if (!target || !('IntersectionObserver' in window)) return
  observer = new IntersectionObserver(
    ([entry]) => {
      visible.value = entry.boundingClientRect.top < 0 || entry.isIntersecting
    },
    { rootMargin: '0px 0px -100% 0px' }
  )
  observer.observe(target)
})
onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div
    v-if="visible"
    class="ui-enter fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream-50/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden"
  >
    <UiButton block to="/sign-up">{{ t('hero.cta') }}</UiButton>
  </div>
</template>
