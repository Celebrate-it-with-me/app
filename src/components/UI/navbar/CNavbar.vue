<template>
  <header
    class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm font-[Poppins] sticky top-0 z-50"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
      <div class="flex items-center gap-2">
        <slot name="logo">
          <span class="text-pink-500 font-bold text-xl hover:text-pink-600 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 rounded-md px-1" tabindex="0"> {{ logo }}</span>
        </slot>
      </div>

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex items-center gap-2 text-sm font-medium" role="navigation" aria-label="Main navigation">
        <template v-for="(link, index) in selfLinks" :key="index">
          <a
            :href="link.href"
            :class="[
              'relative px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
              link.isActive
                ? 'text-primary bg-gradient-to-r from-primary/10 to-secondary/10 shadow-sm font-semibold'
                : 'text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:shadow-sm'
            ]"
            :aria-current="link.isActive ? 'page' : undefined"
            :aria-label="`Navigate to ${link.label} section`"
            @click.prevent="scrollToSection(link)"
            @keydown.enter.prevent="scrollToSection(link)"
            @keydown.space.prevent="scrollToSection(link)"
          >
            <span class="relative z-10">{{ link.label }}</span>
            <!-- Active indicator -->
            <span
              v-if="link.isActive"
              class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
              aria-hidden="true"
            ></span>
          </a>
        </template>
      </nav>

      <!-- Desktop CTA -->
      <div class="hidden md:flex items-center gap-4">
        <slot name="extra">
          <RouterLink v-if="loginLink" :to="`/${loginLink}`">
            <a class="group relative inline-flex items-center gap-2 px-4 py-2 border-2 border-primary/30 text-primary hover:text-white hover:border-primary bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm font-semibold text-sm rounded-xl shadow-glow hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 overflow-hidden">
              <span class="relative z-10 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4m-5-4l4-4m0 0l-4-4m4 4H3" />
                </svg>
                Login
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </a>
          </RouterLink>

          <RouterLink v-if="ctaText && ctaHref" :to="`/${ctaHref}`">
            <a
              class="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary to-secondary text-white shadow-glow hover:shadow-lg transition-all duration-300"
              >{{ ctaText }}</a
            >
          </RouterLink>
        </slot>
      </div>

      <!-- Mobile Menu Button -->
      <button
        class="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
        aria-label="Toggle menu"
        @click="isMenuOpen = !isMenuOpen"
      >
        <svg
          v-if="!isMenuOpen"
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Mobile Menu with enhanced animations -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="isMenuOpen" class="md:hidden bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700" role="navigation" aria-label="Mobile navigation menu">
        <div class="px-4 py-3 space-y-1">
          <template v-for="(link, index) in selfLinks" :key="index">
            <a
              :href="link.href"
              :class="[
                'block py-2 px-3 rounded-md transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
                link.isActive
                  ? 'text-primary bg-gradient-to-r from-primary/10 to-secondary/10 border-l-2 border-primary shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary hover:translate-x-1'
              ]"
              :aria-current="link.isActive ? 'page' : undefined"
              :aria-label="`Navigate to ${link.label} section`"
              @click="scrollToSection(link)"
              @keydown.enter.prevent="scrollToSection(link)"
              @keydown.space.prevent="scrollToSection(link)"
            >
              <span class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-current opacity-0 transition-opacity duration-200" :class="{ 'opacity-100': link.isActive }" aria-hidden="true"></span>
                {{ link.label }}
              </span>
            </a>
          </template>

          <div class="pt-4 pb-2 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-2">
            <RouterLink v-if="loginLink" :to="`/${loginLink}`">
              <a class="group relative flex items-center justify-center gap-2 px-4 py-2 border-2 border-primary/30 text-primary hover:text-white hover:border-primary bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm font-semibold text-sm rounded-xl shadow-glow hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 overflow-hidden">
                <span class="relative z-10 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4m-5-4l4-4m0 0l-4-4m4 4H3" />
                  </svg>
                  Login
                </span>
                <div class="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
            </RouterLink>

            <RouterLink v-if="ctaText && ctaHref" :to="`/${ctaHref}`">
              <a
                class="block py-2 px-3 text-center rounded-xl bg-gradient-to-r from-primary to-secondary text-white shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]"
                >{{ ctaText }}</a
              >
            </RouterLink>
          </div>
        </div>
      </div>
    </Transition>
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
const isMenuOpen = ref(false)
const selfLinks = toRef(props.links)

const scrollToSection = link => {
  const targetId = link.href.replace('#', '')
  const element = document.getElementById(targetId)

  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })

    window.history.pushState({}, '', link.href)
    activeHash.value = targetId
    isMenuOpen.value = false
  }

  updateActiveStatus(link)
}

const updateActiveStatus = link => {
  emit('updateActiveStatus', link)
}

const handleScroll = () => {
  const sections = props.links
    .map(link => {
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
    })
    .filter(Boolean)

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

watch(
  () => props.links,
  newValue => {
    selfLinks.value = newValue
  },
  { immediate: true, deep: true }
)
</script>
