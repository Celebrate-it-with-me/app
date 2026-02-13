<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import CModal from '@/components/UI/modals/CModal.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { Sparkles, CheckCircle2, Zap } from 'lucide-vue-next'

const router = useRouter()
const isVisible = ref(false)
const STORAGE_KEY = 'cwm_exit_intent_modal_last_shown'
const DAYS_TO_WAIT = 7

const checkEligibility = () => {
  const lastShown = localStorage.getItem(STORAGE_KEY)
  if (!lastShown) return true

  const lastShownDate = new Date(parseInt(lastShown))
  const now = new Date()
  const diffTime = Math.abs(now - lastShownDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays >= DAYS_TO_WAIT
}

const showModal = () => {
  if (isVisible.value) return
  if (!checkEligibility()) return

  isVisible.value = true
  localStorage.setItem(STORAGE_KEY, Date.now().toString())
  removeListeners()
}

const handleMouseOut = e => {
  if (e.clientY <= 10) {
    showModal()
  }
}

const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
  const scrollProgress = (scrollTop / docHeight) * 100

  if (scrollProgress >= 60) {
    showModal()
  }
}

let timer = null

const removeListeners = () => {
  document.removeEventListener('mouseleave', handleMouseOut)
  window.removeEventListener('scroll', handleScroll)
  if (timer) clearTimeout(timer)
}

onMounted(() => {
  if (!checkEligibility()) return

  document.addEventListener('mouseleave', handleMouseOut)
  window.addEventListener('scroll', handleScroll)

  timer = setTimeout(() => {
    showModal()
  }, 25000)
})

onUnmounted(() => {
  removeListeners()
})

const goToSignUp = () => {
  isVisible.value = false
  router.push({ name: 'sign-up' })
}

const closeModal = () => {
  isVisible.value = false
}
</script>

<template>
  <CModal v-model="isVisible" :show-footer="false" :show-close-icon="true">
    <template #title>
      <div class="flex flex-col items-center gap-2">
        <div
          class="inline-flex items-center px-2 py-0.5 rounded-full bg-pink-50 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/50 backdrop-blur-sm mb-1"
        >
          <Zap class="w-2.5 h-2.5 text-pink-500 mr-1" />
          <span
            class="text-[9px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400"
            >Free to start</span
          >
        </div>
        <div class="flex items-center gap-2">
          <Sparkles class="w-5 h-5 text-primary" />
          <span class="font-display">Before you go...</span>
        </div>
      </div>
    </template>

    <div class="space-y-8 py-2">
      <div class="text-center space-y-4">
        <h2
          class="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white leading-tight"
        >
          Create your event page in 60 seconds
        </h2>
        <p class="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
          Start collecting RSVPs, share photos, and keep guests updated — free to start.
        </p>
        <div class="pt-4">
          <p
            class="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5"
          >
            <span class="text-yellow-400">⭐</span>
            Trusted by 5,000+ families
          </p>
        </div>
      </div>

      <div class="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 mt-6">
        <div class="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <div class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <CheckCircle2 class="w-4 h-4 text-green-500" />
            No credit card required
          </div>
          <div class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <CheckCircle2 class="w-4 h-4 text-green-500" />
            Takes 60 seconds
          </div>
          <div class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <CheckCircle2 class="w-4 h-4 text-green-500" />
            Share instantly
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-4 mt-2">
        <CButton
          variant="gradient"
          full
          size="lg"
          class="text-lg font-bold shadow-lg shadow-pink-500/20 py-4 transform hover:scale-[1.02] transition-all duration-200"
          @click="goToSignUp"
        >
          Start My Free Event
        </CButton>

        <CButton
          variant="ghost"
          full
          class="text-xs text-gray-400 font-medium hover:text-primary hover:underline transition-all duration-200"
          @click="closeModal"
        >
          Not now
        </CButton>
      </div>
    </div>
  </CModal>
</template>
