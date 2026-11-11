<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton } from '@/ui'

/** Fixed bottom bar on phones, shown once the hero's own button has scrolled away. */
const props = defineProps({ watch: { type: String, default: '#como-funciona' } })
const { t } = useI18n()
const pastHero = ref(false)
const footerInView = ref(false)
const visible = computed(() => pastHero.value && !footerInView.value)
let heroObserver
let footerObserver

onMounted(() => {
  if (!('IntersectionObserver' in window)) return
  const target = document.querySelector(props.watch)
  if (target) {
    heroObserver = new IntersectionObserver(
      ([entry]) => {
        pastHero.value = entry.boundingClientRect.top < 0 || entry.isIntersecting
      },
      { rootMargin: '0px 0px -100% 0px' }
    )
    heroObserver.observe(target)
  }
  const footer = document.querySelector('footer')
  if (footer) {
    footerObserver = new IntersectionObserver(([entry]) => {
      footerInView.value = entry.isIntersecting
    })
    footerObserver.observe(footer)
  }
})
onUnmounted(() => {
  heroObserver?.disconnect()
  footerObserver?.disconnect()
})
</script>

<template>
  <div
    v-if="visible"
    class="ui-enter fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream-50/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden"
  >
    <UiButton block to="/sign-up">{{ t('hero.cta') }}</UiButton>
  </div>
</template>
