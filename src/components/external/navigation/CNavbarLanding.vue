<template>
  <CNavbar
    :logo="'Celebrateitwithme'"
    :links="links"
    loginLink="#login"
    ctaText="Get Started"
    ctaHref="#get-started"
  />
</template>

<script setup>
import CNavbar from '@/components/UI/navbar/CNavbar.vue'
import { ref } from 'vue'

const links = ref([
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Testimonials', href: '#testimonials' },
])

</script>
