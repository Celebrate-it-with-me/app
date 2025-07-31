<script setup>
import CWMTabs from '@/components/UI/tabs/CWMTabs.vue'
import WelcomeBack from '@/components/welcome-back/WelcomeBack.vue'

const currentTabs = [
  { id: 1, label: 'Events', route: '/dashboard/events', selected: true },
  { id: 2, label: 'Guests', route: '/dashboard/guests', selected: false },
  { id: 3, label: 'Save the Date', route: '/dashboard/save-the-date', selected: false },
  { id: 4, label: 'RSVP', route: '/dashboard/rsvp', selected: false },
  { id: 5, label: 'Sweet Memories', route: '/dashboard/sweet-memories', selected: false },
  { id: 6, label: 'Suggested Music', route: '/dashboard/suggest-music', selected: false },
  { id: 11, label: 'Background Music', route: '/dashboard/background-music', selected: false },
  { id: 12, label: 'Event Comments', route: '/dashboard/event-comments', selected: false },
  { id: 9, label: 'Seats Accommodation', route: '/dashboard/seats-accommodation', selected: false },
  { id: 7, label: 'Preview', route: '/dashboard/preview', selected: false },
  { id: 8, label: 'Budget', route: '/dashboard/budget', selected: false },
  { id: 10, label: 'Analytics', route: '/dashboard/analytics', selected: false }
]
</script>

<template>
  <div class="container pb-10">
    <WelcomeBack />

    <CWMTabs :tabs="currentTabs" />
  </div>
</template>
