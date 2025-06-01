<template>
  <CNavbar
    :links="links"
    login-link="sign-in"
    cta-text="Get Started"
    cta-href="sign-up"
    @update-active-status="handleUpdateActiveStatus"
  >
    <template #logo>
      <router-link to="/">
        <img :src="LogoImage" alt="Celebrate it with me logo" class="w-48 auto" />
      </router-link>
    </template>
  </CNavbar>
</template>

<script setup>
import CNavbar from '@/components/UI/navbar/CNavbar.vue'
import { ref } from 'vue'
import LogoImage from '@/assets/images/commons/logo_primary.png'

const links = ref([
  { label: 'Features', href: '#features', isActive: false },
  { label: 'Pricing', href: '#pricing', isActive: false },
  { label: 'Gallery', href: '#gallery', isActive: false },
  { label: 'Testimonials', href: '#testimonials', isActive: false }
])

const handleUpdateActiveStatus = activeLink => {
  links.value.forEach(link => {
    link.isActive = link.href === activeLink.href
  })
}
</script>
