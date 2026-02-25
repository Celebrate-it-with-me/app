<script setup>
import bgImage from '@/assets/images/img/hero_2644.jpg'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'

const templateStore = useTemplateStore()

const guest = computed(() => templateStore.guest)
const companions = computed(() => guest.value?.companions ?? [])

const companionsCount = computed(() => companions.value.length)
const haveCompanions = computed(() => companionsCount.value > 0)

// Layout modes
const isCrowded = computed(() => companionsCount.value >= 4) // enable 2 columns
const isScrollMode = computed(() => companionsCount.value >= 7) // force early scroll + hint

// Background reframe when content is heavy
const heroBgStyle = computed(() => ({
  backgroundImage: `url(${bgImage})`,
  backgroundPosition: isCrowded.value ? '50% 75%' : '50% 50%'
}))

// Optional: real overflow detection (kept as safety net)
const companionsListEl = ref(null)
const isActuallyOverflowing = ref(false)

const computeOverflow = async () => {
  await nextTick()
  const el = companionsListEl.value
  if (!el) return
  isActuallyOverflowing.value = el.scrollHeight > el.clientHeight + 1
}

let ro = null

onMounted(() => {
  computeOverflow()

  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(() => computeOverflow())
    if (companionsListEl.value) ro.observe(companionsListEl.value)
  }

  window.addEventListener('resize', computeOverflow, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('resize', computeOverflow)
  if (ro) ro.disconnect()
})

watch(companionsCount, () => computeOverflow())

// Show hint earlier by business rule (>= 7) OR real overflow
const shouldShowScrollHint = computed(() => isScrollMode.value || isActuallyOverflowing.value)
</script>

<template>
  <section
    id="sectionHome"
    class="hero-section relative w-full z-10 mt-0 md:mt-12"
    :class="{
      'is-crowded': isCrowded,
      'is-scroll-mode': isScrollMode
    }"
  >
    <div class="hero relative w-full overflow-hidden">
      <!-- Background -->
      <div class="hero-bg absolute inset-0 bg-cover" :style="heroBgStyle" aria-hidden="true">
        <div class="absolute inset-0 hero-overlay pointer-events-none"></div>
        <div class="absolute inset-0 hero-vignette pointer-events-none"></div>
        <div class="absolute inset-0 hero-grain pointer-events-none"></div>
      </div>

      <!-- Foreground -->
      <div class="hero-content relative z-10 w-full h-full flex flex-col">
        <!-- Top: Name + Date -->
        <div
          data-reveal="up"
          data-reveal-delay="0"
          class="relative w-full flex justify-center px-6 hero-top-pad"
        >
          <div class="hero-top-wrap w-full max-w-[620px]">
            <div class="hn-ambient-glow hn-ambient-glow--gold" aria-hidden="true"></div>

            <div class="hero-top-card text-center px-6 py-6 hn-glass-card hn-pressable hn-shimmer">
              <p class="hn-script hero-name">Isabella Canedo</p>

              <div class="mt-3 flex items-center justify-center gap-4">
                <div class="hero-line"></div>
                <p class="hero-date">04 · 18 · 2026</p>
                <div class="hero-line"></div>
              </div>

              <p class="mt-3 hero-subtitle">MIS QUINCE</p>
            </div>
          </div>
        </div>

        <!-- Bottom: Invitation (true bottom) -->
        <div
          data-reveal="up"
          data-reveal-delay="110"
          class="relative w-full flex justify-center px-6 mt-auto hero-bottom-pad"
        >
          <div class="hero-invite-wrap w-full max-w-[720px]">
            <div class="hn-ambient-glow hn-ambient-glow--coral" aria-hidden="true"></div>

            <div
              class="hero-invite-card w-full hn-glass-card hn-pressable"
              :class="isScrollMode ? 'px-5 py-4' : isCrowded ? 'px-5 py-4' : 'px-6 py-5'"
            >
              <div class="text-center">
                <p class="hero-invite-title">
                  <span v-if="haveCompanions">ES NUESTRO PLACER INVITARLOS</span>
                  <span v-else>ES NUESTRO PLACER INVITARTE</span>
                </p>

                <div
                  class="flex items-center justify-center gap-3"
                  :class="isScrollMode ? 'mt-2' : isCrowded ? 'mt-2' : 'mt-3'"
                >
                  <span class="hero-dot"></span>
                  <span class="hero-mini">A CELEBRAR UNA NOCHE INOLVIDABLE</span>
                  <span class="hero-dot"></span>
                </div>
              </div>

              <div
                :class="
                  isScrollMode
                    ? 'mt-4 hero-guest-wrap'
                    : isCrowded
                      ? 'mt-4 hero-guest-wrap'
                      : 'mt-5 hero-guest-wrap'
                "
              >
                <div class="hero-guest-pill">
                  <p class="hero-guest-label">INVITADO</p>
                  <p class="hero-guest-name">
                    {{ guest?.name || '—' }}
                  </p>
                </div>

                <div v-if="haveCompanions" class="hero-companions">
                  <p class="hero-companions-title">ACOMPAÑANTES</p>

                  <ul
                    ref="companionsListEl"
                    class="hero-companions-list"
                    :class="[
                      isCrowded ? 'hero-companions-list--two-cols' : '',
                      isScrollMode ? 'hero-companions-list--scroll-early' : ''
                    ]"
                  >
                    <li v-for="companion in companions" :key="companion.id">
                      {{ companion.name }}
                    </li>
                  </ul>

                  <p v-if="shouldShowScrollHint" class="hero-scroll-hint">
                    SCROLL PARA VER A TODOS
                  </p>
                </div>
              </div>

              <div
                data-reveal="up"
                data-reveal-delay="210"
                class="hero-footer"
                :class="isScrollMode ? 'mt-4' : isCrowded ? 'mt-4' : 'mt-5'"
              >
                <div class="hero-divider"></div>
                <p class="hero-footer-text">DESLIZA PARA VER LOS DETALLES DEL EVENTO</p>
                <div class="hero-divider"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="hero-bottom-space" aria-hidden="true"></div>
      </div>
    </div>
  </section>
</template>

<style>
/* iPhone-safe viewport */
.hero {
  height: 100svh;
  min-height: 100svh;
}

.hero-content {
  height: 100%;
}

/* Safe-area paddings without breaking bottom lock */
.hero-top-pad {
  padding-top: calc(96px + env(safe-area-inset-top));
}

.hero-bottom-pad {
  padding-bottom: calc(40px + env(safe-area-inset-bottom));
}

@media (max-width: 640px) {
  .hero-bottom-pad {
    padding-bottom: calc(10px + env(safe-area-inset-bottom));
  }
}

/* Background layers */
.hero-bg {
  transform: translate3d(0, 0px, 0);
}

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

.hero-grain {
  opacity: 0.07;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E");
}

/* Glow wrappers */
.hero-top-wrap,
.hero-invite-wrap {
  position: relative;
}

.hn-ambient-glow {
  position: absolute;
  inset: -26px;
  border-radius: 28px;
  filter: blur(26px);
  opacity: 0.55;
  transform: translate3d(0, 0px, 0);
  animation: hnGlowBreath 7.5s ease-in-out infinite;
  pointer-events: none;
}

.hn-ambient-glow--gold {
  background: radial-gradient(circle at 30% 30%, rgba(212, 175, 55, 0.35), rgba(212, 175, 55, 0));
}

.hn-ambient-glow--coral {
  background: radial-gradient(circle at 70% 30%, rgba(236, 72, 153, 0.24), rgba(236, 72, 153, 0));
}

@keyframes hnGlowBreath {
  0% {
    opacity: 0.42;
    transform: translate3d(0, 0px, 0) scale(0.98);
  }
  50% {
    opacity: 0.62;
    transform: translate3d(0, -2px, 0) scale(1.02);
  }
  100% {
    opacity: 0.42;
    transform: translate3d(0, 0px, 0) scale(0.98);
  }
}

/* Shared glass + interactions */
.hn-glass-card {
  border-radius: 22px;
  border: 1px solid rgba(212, 175, 55, 0.18);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(10px);
}

.hn-pressable {
  transition:
    transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 240ms cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform;
}

@media (hover: hover) and (pointer: fine) {
  .hn-pressable:hover {
    transform: translate3d(0, -1px, 0) scale(1.01);
    box-shadow: 0 22px 72px rgba(0, 0, 0, 0.38);
  }
}

.hn-pressable:active {
  transform: translate3d(0, 0px, 0) scale(0.99);
}

/* Shimmer (top card only) */
.hn-shimmer {
  position: relative;
  overflow: hidden;
}

.hn-shimmer::after {
  content: '';
  position: absolute;
  top: -40%;
  left: -60%;
  width: 55%;
  height: 180%;
  transform: rotate(18deg) translate3d(0, 0, 0);
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 35%,
    rgba(255, 255, 255, 0) 70%
  );
  opacity: 0.7;
  animation: hnShimmer 9s ease-in-out infinite;
  pointer-events: none;
}

@keyframes hnShimmer {
  0% {
    transform: rotate(18deg) translate3d(-120%, 0, 0);
    opacity: 0;
  }
  15% {
    opacity: 0.65;
  }
  35% {
    transform: rotate(18deg) translate3d(220%, 0, 0);
    opacity: 0;
  }
  100% {
    transform: rotate(18deg) translate3d(220%, 0, 0);
    opacity: 0;
  }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .hn-ambient-glow {
    animation: none;
  }
  .hn-shimmer::after {
    animation: none;
    display: none;
  }
  .hn-pressable {
    transition: none;
  }
}

/* Existing card styles */
.hero-top-card {
  background: rgba(17, 24, 39, 0.24);
  backdrop-filter: blur(6px);
}

.hero-name {
  font-size: 46px;
  line-height: 1;
  letter-spacing: 0.015em;
  opacity: 0.96;
  color: transparent;
  background-clip: text;
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
  background: rgba(248, 241, 231, 0.78);
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

/* Footer */
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

.hero-bottom-space {
  height: 8px;
}

@media (min-width: 768px) {
  .hero-guest-wrap {
    grid-template-columns: 1fr 1fr;
  }
}

/* Mobile: caps + scroll */
@media (max-width: 640px) {
  .hero-name {
    font-size: 38px;
  }

  .hero-invite-title {
    font-size: 16px;
    letter-spacing: 0.11em;
  }

  .hero-grain {
    opacity: 0.045;
  }

  .hero-overlay {
    background: linear-gradient(
      180deg,
      rgba(11, 18, 32, 0.48) 0%,
      rgba(11, 18, 32, 0.18) 38%,
      rgba(11, 18, 32, 0.72) 100%
    );
  }

  .hero-vignette {
    background: radial-gradient(
      circle at 50% 35%,
      rgba(248, 241, 231, 0.07) 0%,
      rgba(11, 18, 32, 0) 46%,
      rgba(11, 18, 32, 0.56) 100%
    );
  }

  .hn-ambient-glow {
    opacity: 0.42;
    filter: blur(24px);
  }

  /* Default cap (<= 6 companions usually fine) */
  .hero-companions {
    max-height: min(190px, 26svh);
    display: flex;
    flex-direction: column;
  }

  .hero-companions-list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding-right: 6px;
  }

  .hero-companions-list::-webkit-scrollbar {
    width: 6px;
  }

  .hero-companions-list::-webkit-scrollbar-thumb {
    background: rgba(212, 175, 55, 0.35);
    border-radius: 999px;
  }

  .hero-companions-list::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.06);
    border-radius: 999px;
  }
}

/* Two columns on mobile only when crowded */
@media (max-width: 640px) {
  .hero-companions-list--two-cols {
    grid-template-columns: 1fr 1fr;
    column-gap: 14px;
    row-gap: 6px;
  }
}

/* Scroll hint */
.hero-scroll-hint {
  margin-top: 8px;
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(15, 23, 42, 0.55);
  text-align: center;
}

/* Crowded mode: reclaim vertical space */
.hero-section.is-crowded .hero-top-pad {
  padding-top: calc(76px + env(safe-area-inset-top));
}

.hero-section.is-crowded .hero-invite-title {
  font-size: 15px;
  letter-spacing: 0.105em;
}

.hero-section.is-crowded .hero-guest-name {
  font-size: 16px;
}

/* Scroll mode (>= 7): force tighter cap earlier so hero image stays visible */
@media (max-width: 640px) {
  .hero-section.is-scroll-mode .hero-companions {
    max-height: min(140px, 18svh);
  }

  .hero-section.is-scroll-mode .hero-companions-list {
    font-size: 12px;
    row-gap: 5px;
  }

  .hero-section.is-scroll-mode .hero-footer-text {
    font-size: 10px;
    letter-spacing: 0.12em;
  }

  .hero-section.is-scroll-mode .hero-divider {
    width: 44px;
  }
}
</style>
