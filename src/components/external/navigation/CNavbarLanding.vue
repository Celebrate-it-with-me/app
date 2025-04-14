<template>
  <CNavbar
    :logo="'Celebrateitwithme'"
    :links="links"
    loginLink="sign-in"
    ctaText="Get Started"
    ctaHref="sign-up"
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
