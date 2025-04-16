<template>
  <CNavbar
    :links="links"
    loginLink="sign-in"
    ctaText="Get Started"
    ctaHref="sign-up"
  >
    <template #logo>
      <img :src="LogoImage" alt="Celebrate it with me logo" class="w-48 auto">
    </template>
  </CNavbar>
</template>

<script setup>
import CNavbar from '@/components/UI/navbar/CNavbar.vue'
import { ref } from 'vue'
import LogoImage from '@/assets/images/commons/logo_primary.png'

const links = ref([
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Testimonials', href: '#testimonials' },
])

</script>
