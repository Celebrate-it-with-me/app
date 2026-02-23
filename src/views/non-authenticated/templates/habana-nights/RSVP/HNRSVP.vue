<script setup>
import { computed, reactive } from 'vue'
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'
import HNRSVPTitles from '@/views/non-authenticated/templates/habana-nights/RSVP/HNRSVPTitles.vue'
import HNCWMRSVPComponent from '@/views/non-authenticated/templates/habana-nights/RSVP/HNCWMRSVPComponent.vue'
import HNCWMRSVPConfirmed from '@/views/non-authenticated/templates/habana-nights/RSVP/HNCWMRSVPConfirmed.vue'
import rsvpBg from '@/assets/images/RSVP/IMG_6044.png'

const rsvpConfig = reactive({
  isEnabled: true,
  backgroundColor: 'transparent',
  title: 'R S V P',
  subTitle: 'Confirme su asistencia antes del 15 de marzo',
  formTitle: 'Asistiras?',
  rsvpExtraBox: {
    isEnabled: true,
    title: 'Mis Quince',
    description: `My Quinceañera is on September 27, 2025, and I'd be delighted to celebrate with you!
                  Come ready to dance, smile, and enjoy the party. Please confirm by September 20, 2025.`
  }
})

const templateStore = useTemplateStore()

const rsvpCompleted = computed(() => {
  return templateStore.guest?.rsvpStatusDate !== null
})
</script>

<template>
  <section
    v-if="rsvpConfig?.isEnabled"
    id="sectionRSVP"
    class="hn-parallax-section hn-rsvp-section relative overflow-hidden w-full min-h-screen flex flex-col lg:flex-row"
  >
    <!-- ============================================================
         CAPA 1 — Atmósfera global (cubre TODO el ancho de la sección)
         El humo, el grain y la vignette son iguales en ambos lados.
         ============================================================ -->
    <div class="hn-parallax-bg absolute inset-0 z-0 hn-global-smoke" aria-hidden="true"></div>
    <div class="absolute inset-0 z-0 hn-global-vignette" aria-hidden="true"></div>
    <div class="absolute inset-0 z-0 hn-grain pointer-events-none" aria-hidden="true"></div>

    <!-- ============================================================
         CAPA 2 — Foto (desktop): encima del fondo global, izquierda
         ============================================================ -->
    <!-- MOBILE: foto de fondo -->
    <div
      class="lg:hidden absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
      :style="{ backgroundImage: `url(${rsvpBg})` }"
      aria-hidden="true"
    ></div>
    <div class="lg:hidden absolute inset-0 z-0 bg-[#0B1220]/80" aria-hidden="true"></div>

    <!-- DESKTOP: <img> real para respetar transparencia del PNG -->
    <img :src="rsvpBg" class="hn-photo-img hidden lg:block" alt="" aria-hidden="true" />

    <!-- Fade que disuelve la foto en el fondo global compartido -->
    <div class="hn-photo-fade hidden lg:block" aria-hidden="true"></div>

    <!-- ============================================================
         LAYOUT: espacio reservado izquierda + contenido derecha
         ============================================================ -->
    <div class="hidden lg:block lg:w-1/2" aria-hidden="true"></div>

    <!-- RIGHT SIDE: sin background propio, hereda el fondo global -->
    <div
      class="relative z-10 w-full lg:w-1/2 min-h-screen flex items-center justify-center p-4 lg:p-10"
    >
      <!-- Glass Panel -->
      <div class="relative z-10 hn-glass-panel w-full max-w-xl">
        <div class="hn-meta-bar mb-6">
          <span class="hn-meta-text">Confirmación</span>
          <span class="hn-meta-dot">•</span>
          <span class="hn-meta-text">Invitación Especial</span>
        </div>

        <HNRSVPTitles :title="rsvpConfig.title" :sub-title="rsvpConfig.subTitle" />

        <HNCWMRSVPComponent
          v-if="!rsvpCompleted"
          :form-title="rsvpConfig.formTitle"
          :rsvp-extra-box="rsvpConfig.rsvpExtraBox"
        />

        <HNCWMRSVPConfirmed v-else />
      </div>
    </div>
  </section>
</template>

<style scoped>
.hn-rsvp-section {
  background: linear-gradient(180deg, #0f1728 0%, #111a2e 100%);
}

.hn-global-smoke {
  background:
    radial-gradient(55% 65% at 72% 42%, rgba(232, 93, 74, 0.35) 0%, transparent 65%),
    radial-gradient(40% 55% at 78% 65%, rgba(232, 93, 74, 0.18) 0%, transparent 70%),
    radial-gradient(60% 70% at 65% 80%, rgba(212, 175, 55, 0.07) 0%, transparent 70%);
  filter: blur(30px);
  mix-blend-mode: screen;
  opacity: 0.9;
}

.hn-global-vignette {
  background: radial-gradient(ellipse at 65% 50%, transparent 35%, rgba(11, 18, 32, 0.7) 100%);
}

.hn-photo-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 52%;
  height: 100%;
  object-fit: cover;
  object-position: left center;
  z-index: 2;
  pointer-events: none;
  user-select: none;
}

.hn-photo-fade {
  position: absolute;
  top: 0;
  left: 0;
  width: 62%;
  height: 100%;
  z-index: 3;

  background:
    linear-gradient(
      to right,
      rgba(15, 23, 40, 0) 28%,
      rgba(15, 23, 40, 0.08) 44%,
      rgba(15, 23, 40, 0.38) 58%,
      rgba(15, 23, 40, 0.78) 72%,
      rgba(15, 23, 40, 1) 85%,
      rgba(15, 23, 40, 1) 100%
    ),
    linear-gradient(
      103deg,
      rgba(15, 23, 40, 0) 35%,
      rgba(15, 23, 40, 0.25) 58%,
      rgba(15, 23, 40, 0.85) 76%,
      rgba(15, 23, 40, 1) 88%
    ),
    linear-gradient(to bottom, rgba(0, 0, 0, 0) 62%, rgba(0, 0, 0, 0.22) 100%);

  pointer-events: none;
}

/* GLASS PANEL */
.hn-glass-panel {
  background: rgba(17, 24, 39, 0.5);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 12px;
  padding: 2.5rem;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.6),
    0 0 120px rgba(232, 93, 74, 0.08),
    0 0 80px rgba(212, 175, 55, 0.05);
}

/* META BAR */
.hn-meta-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.15);
}

.hn-meta-text {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #94a3b8;
}

.hn-meta-dot {
  margin: 0 0.75rem;
  color: rgba(212, 175, 55, 0.5);
}

/* GRAIN */
.hn-grain {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.03;
}
</style>
