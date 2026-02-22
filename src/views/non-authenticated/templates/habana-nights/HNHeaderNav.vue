<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import HNCWMHamburger from '@/views/non-authenticated/templates/habana-nights/SVGs/HNCWMHamburger.vue'

const route = useRoute()
const menuOpen = ref(false)

const currentHash = computed(() => route.hash)

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const handleClick = hash => {
  menuOpen.value = false
  if (hash) window.location.hash = hash
}
</script>

<template>
  <!-- Mobile -->
  <header class="lg:hidden fixed top-0 right-0 z-50 w-full" :class="{ 'h-screen': menuOpen }">
    <div class="flex justify-end px-4 pt-6">
      <button
        type="button"
        class="p-2 rounded-xl border border-[color:rgba(212,175,55,0.35)] bg-[color:rgba(17,24,39,0.45)] backdrop-blur focus:outline-none shadow-sm"
        @click="toggleMenu"
      >
        <HNCWMHamburger color="var(--hn-gold)" width="24" height="24" />
      </button>
    </div>

    <Transition
      enter-active-class="transition ease-out duration-250"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <nav v-if="menuOpen" class="mt-3 w-full flex justify-center h-[calc(100vh-12%)]">
        <div
          class="w-[96%] h-full rounded-2xl border border-[color:rgba(212,175,55,0.25)] bg-[linear-gradient(180deg,var(--hn-bg),var(--hn-surface))] shadow-xl flex flex-col overflow-hidden"
        >
          <div
            class="px-6 py-6 text-white text-center flex items-center justify-center border-b border-[color:rgba(212,175,55,0.14)]"
          >
            <ul class="w-full space-y-2">
              <li>
                <a class="hn-mobile-link" @click="handleClick('#sectionHome')">
                  <span>Home</span>
                </a>
              </li>
              <li>
                <a class="hn-mobile-link" @click="handleClick('#sectionSTD')">
                  <span>Save the Date</span>
                </a>
              </li>
              <li>
                <a class="hn-mobile-link" @click="handleClick('#sectionItinerario')">
                  <span>Itinerario</span>
                </a>
              </li>
              <li>
                <a class="hn-mobile-link" @click="handleClick('#sectionSweetMemories')">
                  <span>Sweet Memories</span>
                </a>
              </li>
              <li>
                <a class="hn-mobile-link" @click="handleClick('#sectionRSVP')">
                  <span>RSVP</span>
                </a>
              </li>
              <li>
                <a class="hn-mobile-link" @click="handleClick('#sectionSong')">
                  <span>Canciones</span>
                </a>
              </li>
              <li>
                <a class="hn-mobile-link" @click="handleClick('#sectionComments')">
                  <span>Comentarios</span>
                </a>
              </li>
              <li>
                <a class="hn-mobile-link" @click="handleClick('#sectionContact')">
                  <span>Contacto</span>
                </a>
              </li>
            </ul>
          </div>

          <div class="flex flex-col items-center justify-center mt-auto pt-6 pb-10">
            <p class="text-5xl leading-none hn-script text-[var(--hn-gold)] select-none">
              Mis Quinces
            </p>
            <div
              class="mt-3 h-px w-28 bg-[linear-gradient(90deg,transparent,var(--hn-gold),transparent)] opacity-80"
            ></div>
          </div>
        </div>
      </nav>
    </Transition>
  </header>

  <!-- Desktop -->
  <header
    id="page-header"
    class="hidden lg:flex items-center justify-center fixed top-0 left-0 w-full z-50 border-b border-[color:rgba(212,175,55,0.20)] bg-[color:rgba(248,241,231,0.92)] backdrop-blur shadow-sm"
  >
    <div class="h-16 flex items-center gap-x-8 px-6 font-[var(--hn-font-body)]">
      <!-- Left nav -->
      <nav>
        <ul class="flex items-center gap-x-6">
          <li class="hn-nav-item" :class="{ active: currentHash === '#sectionHome' }">
            <a class="hn-nav-link" href="#sectionHome">HOME</a>
          </li>
          <li class="hn-nav-item" :class="{ active: currentHash === '#sectionSTD' }">
            <a class="hn-nav-link" href="#sectionSTD">SAVE THE DATE</a>
          </li>
          <li class="hn-nav-item" :class="{ active: currentHash === '#sectionItinerario' }">
            <a class="hn-nav-link" href="#sectionItinerario">ITINERARIO</a>
          </li>
          <li class="hn-nav-item" :class="{ active: currentHash === '#sectionSweetMemories' }">
            <a class="hn-nav-link" href="#sectionSweetMemories">SWEET MEMORIES</a>
          </li>
        </ul>
      </nav>

      <!-- Logo -->
      <div class="px-2">
        <p
          class="text-[44px] leading-none hn-script select-none text-transparent bg-clip-text"
          style="background-image: linear-gradient(90deg, var(--hn-gold), var(--hn-coral))"
        >
          Mis Quinces
        </p>
      </div>

      <!-- Right nav -->
      <nav>
        <ul class="flex items-center gap-x-6">
          <li class="hn-nav-item" :class="{ active: currentHash === '#sectionRSVP' }">
            <a class="hn-nav-link" href="#sectionRSVP">RSVP</a>
          </li>
          <li class="hn-nav-item" :class="{ active: currentHash === '#sectionSong' }">
            <a class="hn-nav-link" href="#sectionSong">CANCIONES</a>
          </li>
          <li class="hn-nav-item" :class="{ active: currentHash === '#sectionComments' }">
            <a class="hn-nav-link" href="#sectionComments">COMENTARIOS</a>
          </li>
          <li class="hn-nav-item" :class="{ active: currentHash === '#sectionContact' }">
            <a class="hn-nav-link" href="#sectionContact">CONTACTO</a>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style>
/* Desktop nav */
.hn-nav-item {
  position: relative;
}

.hn-nav-link {
  display: inline-block;
  padding: 10px 2px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(15, 23, 42, 0.82);
  transition: color 200ms ease;
}

.hn-nav-item::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 6px;
  height: 2px;
  transform: scaleX(0);
  transform-origin: left;
  background: linear-gradient(90deg, var(--hn-gold), var(--hn-coral));
  opacity: 0.95;
  transition: transform 220ms ease;
  border-radius: 999px;
}

.hn-nav-item:hover .hn-nav-link {
  color: rgba(15, 23, 42, 0.95);
}

.hn-nav-item:hover::after {
  transform: scaleX(1);
}

.hn-nav-item.active .hn-nav-link {
  color: rgba(15, 23, 42, 0.98);
}

.hn-nav-item.active::after {
  transform: scaleX(1);
}

/* Mobile links */
.hn-mobile-link {
  display: block;
  padding: 12px 14px;
  border-radius: 14px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(212, 175, 55, 0.14);
  background: rgba(255, 255, 255, 0.03);
  transition:
    transform 160ms ease,
    background 160ms ease,
    border-color 160ms ease;
}

.hn-mobile-link:hover {
  transform: translateY(-1px);
  background: rgba(212, 175, 55, 0.08);
  border-color: rgba(212, 175, 55, 0.22);
}

@media screen and (max-width: 1093px) {
  .hn-nav-link {
    font-size: 11px;
  }
}
</style>
