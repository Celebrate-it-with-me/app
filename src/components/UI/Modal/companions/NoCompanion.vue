<template>
  <div>
    {{ guestStore.currentGuest.firstName }} is attending without companions
  </div>
</template>

<script setup>
import { useGuestsStore } from '@/stores/useGuestStore'

const guestStore = useGuestsStore()
</script>
