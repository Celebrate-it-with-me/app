<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm font-[Poppins]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
      <div class="flex items-center gap-2">
        <slot name="logo">
          <span class="text-pink-500 font-bold text-xl"> {{ logo }}</span>
        </slot>
      </div>
      <nav class="hidden md:flex items-center gap-6 text-sm font-medium">
        <template v-for="(link, index) in selfLinks" :key="index">
          <a
            :href="link.href"
            :class="[
              'transition-colors duration-200',
              link.isActive
                ? 'text-primary'
                : 'text-gray-700 dark:text-gray-300 hover:text-primary'
            ]"
            @click.prevent="scrollToSection(link)"
          >
            {{ link.label }}
          </a>
        </template>
      </nav>
      <div class="flex items-center gap-4">
        <slot name="extra">
          <RouterLink
            v-if="loginLink"
            :to="`/${loginLink}`"
          >
            <a
              class="text-sm text-gray-600 dark:text-gray-300 hover:text-primary"
            >Login</a>
          </RouterLink>

          <RouterLink
            v-if="ctaText && ctaHref"
            :to="`/${ctaHref}`"
          >
            <a
              class="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary to-secondary text-white shadow-glow"
            >{{ ctaText }}</a>
          </RouterLink>
        </slot>
      </div>
    </div>
  </header>
</template>

<script setup>
import { onMounted, onUnmounted, ref, toRef, watch } from 'vue'

const emit = defineEmits(['updateActiveStatus'])
const props = defineProps({
  logo: {
    type: [String, Object],
    default: 'Celebrateitwithme'
  },
  links: {
    type: Array,
    default: () => []
  },
  loginLink: String,
  ctaText: String,
  ctaHref: String
})

const activeHash = ref('')
const selfLinks = toRef(props.links)


const isActive = (href) => {
  console.log('checking active', href, activeHash.value)
  return href === `#${activeHash.value}`
}

const scrollToSection = (link) => {
  const targetId = link.href.replace('#', '')
  const element = document.getElementById(targetId)

  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
    // Update URL without page reload
    window.history.pushState({}, '', link.href)
    activeHash.value = targetId
  }

  updateActiveStatus(link)
}

const updateActiveStatus = (link) => {
  emit('updateActiveStatus', link)
}

const handleScroll = () => {
  const sections = props.links.map(link => {
    const id = link.href.replace('#', '')
    const element = document.getElementById(id)
    if (element) {
      return {
        id,
        element,
        position: element.getBoundingClientRect().top
      }
    }
    return null
  }).filter(Boolean)

  // Find the section closest to the top of the viewport
  const closest = sections.reduce((prev, curr) => {
    if (!prev) return curr
    return Math.abs(curr.position) < Math.abs(prev.position) ? curr : prev
  })

  if (closest) {
    activeHash.value = closest.id
  }
}

onMounted(() => {
  // Initial check for hash in URL
  if (window.location.hash) {
    activeHash.value = window.location.hash.replace('#', '')
  }

  // Add scroll event listener
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

watch(() => props.links, (newValue) => {
  selfLinks.value = newValue
}, { immediate: true, deep: true })

</script>
