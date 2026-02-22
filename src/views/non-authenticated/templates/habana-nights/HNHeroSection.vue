<script setup>
import bgImage from '@/assets/images/img/hero_2644.jpg'
import { computed } from 'vue'
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'

const templateStore = useTemplateStore()

const guest = computed(() => templateStore.guest)
const haveCompanions = computed(() => guest.value?.companions?.length > 0)
</script>

<template>
  <section
    id="sectionHome"
    class="hero-section relative flex flex-col items-center justify-center w-full min-h-screen z-10 mt-0 md:mt-12"
  >
    <div class="hero relative w-full h-screen overflow-hidden">
      <!-- Background (leave as-is for now) -->
      <div
        class="parallax-bg absolute inset-0 bg-cover bg-center flex flex-col items-center justify-between pt-24 pb-10"
        :style="`background-image: url(${bgImage});`"
      >
        <!-- Cinematic overlays -->
        <div class="absolute inset-0 hero-overlay"></div>
        <div class="absolute inset-0 hero-vignette"></div>

        <!-- Top: Name + Date -->
        <div class="relative z-10 w-full flex justify-center px-6">
          <div class="hero-top-card w-full max-w-[620px] text-center px-6 py-6">
            <p class="hn-script hero-name">Isabella Canedo</p>

            <div class="mt-3 flex items-center justify-center gap-4">
              <div class="hero-line"></div>
              <p class="hero-date">04 · 18 · 2026</p>
              <div class="hero-line"></div>
            </div>

            <p class="mt-3 hero-subtitle">MIS QUINCE</p>
          </div>
        </div>

        <!-- Bottom: Invitation -->
        <div class="relative z-10 w-full flex justify-center px-6">
          <div class="hero-invite-card w-full px-6 py-5">
            <div class="text-center">
              <p class="hero-invite-title">
                <span v-if="haveCompanions">ES NUESTRO PLACER INVITARLOS</span>
                <span v-else>ES NUESTRO PLACER INVITARTE</span>
              </p>

              <div class="mt-3 flex items-center justify-center gap-3">
                <span class="hero-dot"></span>
                <span class="hero-mini">A CELEBRAR UNA NOCHE INOLVIDABLE</span>
                <span class="hero-dot"></span>
              </div>
            </div>

            <div class="mt-5 hero-guest-wrap">
              <div class="hero-guest-pill">
                <p class="hero-guest-label">INVITADO</p>
                <p class="hero-guest-name">
                  {{ guest?.name || '—' }}
                </p>
              </div>

              <div v-if="haveCompanions" class="hero-companions">
                <p class="hero-companions-title">ACOMPAÑANTES</p>
                <ul class="hero-companions-list">
                  <li v-for="companion in guest.companions" :key="companion.id">
                    {{ companion.name }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="mt-5 hero-footer">
              <div class="hero-divider"></div>
              <p class="hero-footer-text">DESLIZA PARA VER LOS DETALLES DEL EVENTO</p>
              <div class="hero-divider"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
.hero-overlay {
  background: linear-gradient(
    180deg,
    rgba(11, 18, 32, 0.58) 0%,
    rgba(11, 18, 32, 0.22) 38%,
    rgba(11, 18, 32, 0.78) 100%
  );
}

.hero-vignette {
  background: radial-gradient(
    circle at 50% 35%,
    rgba(248, 241, 231, 0.09) 0%,
    rgba(11, 18, 32, 0) 46%,
    rgba(11, 18, 32, 0.62) 100%
  );
}

.hero-top-card {
  border-radius: 22px;
  border: 1px solid rgba(212, 175, 55, 0.18);
  background: rgba(17, 24, 39, 0.24);
  backdrop-filter: blur(6px);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.32);
}

.hero-name {
  font-size: 46px;
  line-height: 1;
  letter-spacing: 0.015em;
  opacity: 0.96;
  color: transparent;
  background-clip: text;
  /* More gold-dominant cinematic gradient */
  background-image: linear-gradient(
    90deg,
    #f6d365 0%,
    var(--hn-gold) 35%,
    var(--hn-gold) 65%,
    #c9972e 100%
  );
  text-shadow:
    0 4px 18px rgba(212, 175, 55, 0.25),
    0 2px 6px rgba(0, 0, 0, 0.35);
}

.hero-date {
  font-size: 12px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(248, 241, 231, 0.9);
}

.hero-line {
  height: 1px;
  width: 62px;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.85), transparent);
}

.hero-subtitle {
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(248, 241, 231, 0.68);
}

.hero-invite-card {
  max-width: 720px;
  border-radius: 22px;
  border: 1px solid rgba(212, 175, 55, 0.18);
  background: rgba(248, 241, 231, 0.78);
  backdrop-filter: blur(10px);
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.24);
}

.hero-invite-title {
  font-size: 18px;
  line-height: 1.15;
  font-weight: 400;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(15, 23, 42, 0.88);
}

.hero-mini {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(15, 23, 42, 0.68);
}

.hero-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--hn-gold), rgba(212, 175, 55, 0.65));
  opacity: 0.9;
}

.hero-guest-wrap {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.hero-guest-pill,
.hero-companions {
  border-radius: 18px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  background: rgba(255, 255, 255, 0.58);
  padding: 10px 14px;
}

.hero-guest-label,
.hero-companions-title {
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(15, 23, 42, 0.55);
}

.hero-guest-name {
  margin-top: 4px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: rgba(15, 23, 42, 0.92);
}

.hero-companions-list {
  margin-top: 8px;
  display: grid;
  gap: 6px;
  font-size: 13px;
  color: rgba(15, 23, 42, 0.86);
}

.hero-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}

.hero-divider {
  height: 1px;
  width: 58px;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.75), transparent);
}

.hero-footer-text {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(15, 23, 42, 0.62);
}

@media (min-width: 768px) {
  .hero-guest-wrap {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .hero-name {
    font-size: 38px;
  }
  .hero-invite-title {
    font-size: 16px;
    letter-spacing: 0.11em;
  }
}
</style>
