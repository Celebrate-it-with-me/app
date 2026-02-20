<template>
  <div>{{ guestStore.currentGuest.firstName }} is attending without companions</div>
</template>

<script setup>
import { useGuestsStore } from '@/modules/guests/stores/useGuestStore'

const guestStore = useGuestsStore()
</script>
