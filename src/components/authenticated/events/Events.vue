<script setup>
import CWMTabs from '@/components/UI/tabs/CWMTabs.vue'
import WelcomeBack from '@/components/welcome-back/WelcomeBack.vue'

const currentTabs = [
  { id: 1, label: 'Events', route: '/dashboard/events', selected: true },
  { id: 2, label: 'Guests', route: '/dashboard/guests', selected: true },
  { id: 3, label: 'Save the Date', route: '/dashboard/save-the-date', selected: false },
  { id: 4, label: 'RSVP', route: '/dashboard/events/rsvp', selected: false },
  { id: 5, label: 'Gallery', route: '/dashboard/events/gallery', selected: false },
  { id: 7, label: 'Analytics', route: '/dashboard/events/gallery', selected: false }
]

</script>

<template>
  <div class="container pb-10">
    <WelcomeBack />

    <CWMTabs
      :tabs=currentTabs
    />
  </div>
</template>
