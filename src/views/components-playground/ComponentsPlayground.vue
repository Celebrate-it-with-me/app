<template>
  <div :class="['min-h-screen transition-colors duration-300', isDark ? 'bg-gray-900 text-white' : 'bg-background text-text']" class="p-10">
    <div class="flex justify-between items-center mb-10">
      <h1 class="text-3xl font-display">🎨 UI Component Playground</h1>
      <button
        class="px-4 py-2 rounded-xl border border-primary text-primary hover:bg-primary hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-gray-900 transition"
        @click="toggleDark"
      >
        {{ isDark ? '🌞 Light Mode' : '🌙 Dark Mode' }}
      </button>
    </div>

    <section class="mb-10">
      <h2 class="text-xl font-bold mb-4">Buttons</h2>
      <div class="flex flex-wrap gap-4 items-start">
        <CButton variant="primary">Primary</CButton>
        <CButton variant="secondary">Secondary</CButton>
        <CButton variant="outline">Outline</CButton>
        <CButton variant="gradient">Gradient Button</CButton>
      </div>

      <div class="flex flex-wrap gap-4 items-start mt-6">
        <CButton size="sm">Small</CButton>
        <CButton size="md">Medium</CButton>
        <CButton size="lg">Large</CButton>
      </div>

      <div class="flex flex-wrap gap-4 items-start mt-6">
        <CButton full class="max-w-xs">Full Width</CButton>
      </div>
    </section>
    <section class="mb-10">
      <h2 class="text-xl font-bold mb-4">Headings</h2>

      <div class="space-y-6">
        <CHeading :level="1">Heading 1 – Default</CHeading>
        <CHeading :level="2" color="text-primary" weight="semibold">Heading 2 – Primary & Semibold</CHeading>
        <CHeading :level="3" color="text-secondary" weight="medium">Heading 3 – Secondary & Medium</CHeading>
        <CHeading :level="4" :gradient="true" weight="extrabold">Heading 4 – Gradient & Extra Bold</CHeading>
        <CHeading :level="5" color="text-accent" weight="light">Heading 5 – Accent & Light</CHeading>
        <CHeading :level="6" weight="normal">Heading 6 – Normal</CHeading>
      </div>
    </section>

    <section class="mb-10">
      <h2 class="text-xl fond-bold mb-4">Cards</h2>

      <div class="space-y-6">
        <div class="w-full flex flex-row gap-4 items-start justify-between">
          <div class="w-1/2">
            <CCard variant="testimonial">
              <template #title>
                <div class="flex items-center gap-3">
                  <img src="https://randomuser.me/api/portraits/women/68.jpg" class="w-10 h-10 rounded-full"  alt=""/>
                  <div>
                    <p class="font-semibold">Maria Rodríguez</p>
                    <p class="text-sm text-text-light">Quinceañera</p>
                  </div>
                </div>
              </template>
              <template #content>
                <p>"Planning my daughter's quinceañera was so much easier with Celebra. The tools and support were incredible!"</p>
              </template>
            </CCard>
          </div>

          <div class="w-1/2">
            <CCard variant="pricing">
              <template #title>
                <p class="text-xl font-semibold">Premium</p>
                <p class="text-4xl font-bold text-primary">$499</p>
              </template>
              <template #content>
                <ul class="space-y-1 text-left">
                  <li>✔️ Up to 250 guests</li>
                  <li>✔️ Advanced planning tools</li>
                  <li>✔️ Custom invitations</li>
                  <li>✔️ Vendor management</li>
                </ul>
              </template>
              <template #cta>
                <CButton variant="gradient" class="mt-4 w-full">Get Started</CButton>
              </template>
            </CCard>
          </div>
        </div>

        <!-- Gallery Card Example -->
        <CCard variant="gallery">
          <template #image>
            <img
              src="https://images.unsplash.com/photo-1509223197845-458d87318791?auto=format&fit=crop&w=800&q=80"
              class="w-full h-60 object-cover rounded-xl"
              alt=""
            />
          </template>
        </CCard>

        <!-- Feature Card Example -->
        <CCard variant="feature">
          <template #icon>
            <div class="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
              📅
            </div>
          </template>
          <template #title>
            <p class="text-lg font-semibold">Event Planning</p>
          </template>
          <template #content>
            <p class="text-sm text-text-light">Comprehensive planning tools, checklists, and timelines to keep you organized.</p>
          </template>
        </CCard>
      </div>
    </section>
    <section class="mb-10 space-y-6">
      <h2 class="text-xl font-bold mb-4">Alerts</h2>

      <CAlert variant="info">
        <template #icon>
          <Info class="mt-1 text-blue-600 dark:text-blue-300" :size="24" />
        </template>
        <template #title>
          <p class="font-semibold">Info</p>
        </template>
        <template #message>
          <p>This is an informational alert with useful context.</p>
        </template>
      </CAlert>

      <CAlert variant="success">
        <template #icon>
          <CheckCircle2 class="mt-1 text-green-600 dark:text-green-300" :size="24" />
        </template>
        <template #title>
          <p class="font-semibold">Success</p>
        </template>
        <template #message>
          <p>Your changes have been saved successfully!</p>
        </template>
      </CAlert>

      <CAlert variant="warning">
        <template #icon>
          <AlertTriangle class="mt-1 text-yellow-600 dark:text-yellow-300" :size="24"/>
        </template>
        <template #title>
          <p class="font-semibold">Warning</p>
        </template>
        <template #message>
          <p>Make sure to check all required fields before continuing.</p>
        </template>
      </CAlert>

      <CAlert variant="error">
        <template #icon>
          <XCircle class="mt-1 text-red-600 dark:text-red-300" :size="24" />
        </template>
        <template #title>
          <p class="font-semibold">Error</p>
        </template>
        <template #message>
          <p>Something went wrong. Please try again later.</p>
        </template>
      </CAlert>
    </section>
    <section class="mb-10">
      <h2 class="text-xl font-bold mb-4">Badges</h2>

      <div class="flex flex-wrap gap-4 items-center">
        <CBadge variant="gray">Default</CBadge>
        <CBadge variant="primary">Primary</CBadge>
        <CBadge variant="secondary">Secondary</CBadge>
        <CBadge variant="success">Success</CBadge>
        <CBadge variant="warning">Warning</CBadge>
        <CBadge variant="error">Error</CBadge>
        <CBadge variant="gradient">VIP</CBadge>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import CCard from '@/components/UI/cards/CCard.vue'
import CAlert from '@/components/UI/alerts/CAlert.vue'
import CBadge from '@/components/UI/badges/CBadge.vue'
import { Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-vue-next'

const isDark = ref(false)

const toggleDark = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Set initial state from existing class (optional)
watchEffect(() => {
  isDark.value = document.documentElement.classList.contains('dark')
})
</script>
