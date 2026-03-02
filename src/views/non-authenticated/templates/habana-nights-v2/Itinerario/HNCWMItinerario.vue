<script setup>
import { Martini, Sparkles, Utensils, Music, Disc3 } from 'lucide-vue-next'
import itinerarioBg from '@/assets/images/Itinerario/IMG_6061.png'

const timeline = [
  { time: '7:00 PM', range: '7:00pm – 8:00pm', title: 'Cocktail', icon: Martini, accent: 'coral' },
  { time: '8:00 PM', range: '8:00pm – 9:30pm', title: 'Ceremonia', icon: Sparkles, accent: 'gold' },
  { time: '9:30 PM', range: '9:30pm – 10:30pm', title: 'Cena', icon: Utensils, accent: 'purple' },
  {
    time: '10:30 PM',
    range: '10:30pm – 11:00pm',
    title: 'Baile Sorpresa',
    icon: Music,
    accent: 'coral'
  },
  { time: '11:00 PM', range: 'Desde 11:00pm', title: 'Hora Loca', icon: Disc3, accent: 'gold' }
]

const getAccentClass = accent => `hn-accent--${accent}`
</script>

<template>
  <section
    id="sectionItinerario"
    class="hn-parallax-section hn-it relative w-full min-h-screen overflow-hidden flex flex-col lg:flex-row"
  >
    <!-- =====================================================
         LAYER 0 — Global atmosphere
         ===================================================== -->
    <div class="hn-parallax-bg hn-it__smoke absolute inset-0 z-0" aria-hidden="true"></div>
    <div class="hn-it__vignette absolute inset-0 z-0" aria-hidden="true"></div>
    <div class="hn-it__grain absolute inset-0 z-0 pointer-events-none" aria-hidden="true"></div>

    <!-- =====================================================
         LAYER 1 — Hero image
         NOTE: Do NOT add data-reveal to the mobile image because it uses transform for centering.
         ===================================================== -->

    <!-- Mobile -->
    <img
      :src="itinerarioBg"
      class="hn-it__photo-mobile hn-it__photo-fade lg:hidden"
      alt=""
      aria-hidden="true"
    />
    <div class="hn-it__mobileShade lg:hidden" aria-hidden="true"></div>

    <!-- Desktop -->
    <img
      :src="itinerarioBg"
      class="hn-it__photo hn-it__photo-fade hidden lg:block"
      alt=""
      aria-hidden="true"
    />

    <!-- =====================================================
         LAYOUT
         ===================================================== -->

    <!-- LEFT: Itinerario -->
    <div
      class="relative z-10 w-full lg:w-[55%] min-h-screen flex items-center justify-center p-4 lg:p-10"
    >
      <div class="hn-it__frame w-full">
        <!-- Meta bar -->
        <div class="hn-it__meta-bar" data-reveal="up" data-reveal-delay="0">
          <span class="hn-it__meta-text">La noche</span>
          <span class="hn-it__meta-dot">•</span>
          <span class="hn-it__meta-text">En momentos</span>
        </div>

        <!-- Header -->
        <div class="hn-it__header" data-reveal="up" data-reveal-delay="60">
          <h2 class="hn-it__title">Itinerario</h2>
          <p class="hn-it__subtitle">La noche en momentos inolvidables</p>
        </div>

        <!-- Timeline -->
        <div class="hn-it__timeline">
          <div class="hn-it__line" aria-hidden="true"></div>

          <!-- idx === 3 = Baile Sorpresa → gets the fix class -->
          <div
            v-for="(item, idx) in timeline"
            :key="item.title"
            class="hn-it__row"
            :class="{ 'hn-it__row--fix-dot': idx === 3 }"
            data-reveal="up"
            :data-reveal-delay="120 + idx * 60"
          >
            <!-- Left column: odd items -->
            <div class="hn-it__col hn-it__col--left">
              <div v-if="idx % 2 !== 0" class="hn-it__card" :class="getAccentClass(item.accent)">
                <div class="hn-it__iconBadge">
                  <component :is="item.icon" class="hn-it__icon" />
                </div>
                <div class="hn-it__card-info">
                  <div class="hn-it__cardTitle">{{ item.title }}</div>
                  <div class="hn-it__range">{{ item.range }}</div>
                </div>
              </div>
            </div>

            <!-- Center marker -->
            <div class="hn-it__center">
              <span class="hn-it__marker" :class="getAccentClass(item.accent)"></span>
            </div>

            <!-- Right column: even items desktop / all items mobile -->
            <div class="hn-it__col hn-it__col--right">
              <div
                v-if="idx % 2 === 0"
                class="hn-it__card hn-it__card--desktop-even"
                :class="getAccentClass(item.accent)"
              >
                <div class="hn-it__iconBadge">
                  <component :is="item.icon" class="hn-it__icon" />
                </div>
                <div class="hn-it__card-info">
                  <div class="hn-it__cardTitle">{{ item.title }}</div>
                  <div class="hn-it__range">{{ item.range }}</div>
                </div>
              </div>

              <div
                v-if="idx % 2 !== 0"
                class="hn-it__card hn-it__card--mobile-odd"
                :class="getAccentClass(item.accent)"
              >
                <div class="hn-it__iconBadge">
                  <component :is="item.icon" class="hn-it__icon" />
                </div>
                <div class="hn-it__card-info">
                  <div class="hn-it__cardTitle">{{ item.title }}</div>
                  <div class="hn-it__range">{{ item.range }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Microcopy -->
          <div class="hn-it__micro" data-reveal="up" data-reveal-delay="520">
            <span class="hn-it__microLine"></span>
            <span class="hn-it__microText">Sigue bajando para descubrirlo todo</span>
            <span class="hn-it__microLine"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT: reserved space for the image panel -->
    <div class="hidden lg:block lg:w-[45%]" aria-hidden="true"></div>
  </section>
</template>

<style scoped>
/* =====================================================
   BASE BACKGROUND
   ===================================================== */
.hn-it {
  background: linear-gradient(180deg, #0d1525 0%, #0f1728 100%);
}

/* =====================================================
   GLOBAL ATMOSPHERE
   ===================================================== */
.hn-it__smoke {
  background:
    radial-gradient(55% 70% at 72% 45%, rgba(179, 16, 210, 0.46) 0%, transparent 65%),
    radial-gradient(40% 50% at 68% 72%, rgba(130, 8, 160, 0.22) 0%, transparent 65%),
    radial-gradient(35% 40% at 70% 34%, rgba(212, 175, 55, 0.1) 0%, transparent 60%);
  filter: blur(36px);
  mix-blend-mode: screen;
  opacity: 0.95;
}

@media (max-width: 767px) {
  .hn-it__smoke {
    background:
      radial-gradient(55% 70% at 58% 42%, rgba(179, 16, 210, 0.42) 0%, transparent 65%),
      radial-gradient(40% 50% at 55% 72%, rgba(130, 8, 160, 0.2) 0%, transparent 65%),
      radial-gradient(35% 40% at 56% 34%, rgba(212, 175, 55, 0.09) 0%, transparent 60%);
  }
}

.hn-it__vignette {
  background: radial-gradient(ellipse at 65% 50%, transparent 32%, rgba(11, 18, 32, 0.72) 100%);
}

.hn-it__grain {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.03;
}

/* =====================================================
   HERO IMAGE — Desktop
   ===================================================== */
.hn-it__photo {
  position: absolute;
  right: 0;
  bottom: 0;
  height: 100%;
  width: auto;
  max-width: 45%;
  object-fit: contain;
  object-position: right bottom;
  z-index: 2;
  pointer-events: none;
  user-select: none;
  filter: drop-shadow(0 28px 90px rgba(0, 0, 0, 0.45));
}

/* =====================================================
   HERO IMAGE — Mobile (restored transform-based centering)
   ===================================================== */
.hn-it__photo-mobile {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120%;
  height: auto;
  transform: translate(-50%, -45%) scale(1.18);
  object-fit: contain;
  object-position: center;
  z-index: 1;
  opacity: 1;
  pointer-events: none;
  user-select: none;
  filter: drop-shadow(0 30px 90px rgba(0, 0, 0, 0.45));
}

.hn-it__mobileShade {
  display: none;
  position: absolute;
  inset: 0;
  z-index: 2;
  background:
    linear-gradient(
      90deg,
      rgba(13, 21, 37, 0.85) 0%,
      rgba(13, 21, 37, 0.65) 35%,
      rgba(13, 21, 37, 0.25) 65%,
      rgba(13, 21, 37, 0.05) 85%,
      rgba(13, 21, 37, 0) 100%
    ),
    linear-gradient(
      to bottom,
      rgba(13, 21, 37, 0.25) 0%,
      rgba(13, 21, 37, 0.45) 65%,
      rgba(13, 21, 37, 0.7) 100%
    );
  pointer-events: none;
}

/* =====================================================
   OPACITY-ONLY FADE (does not touch transform, iPhone-safe)
   ===================================================== */
.hn-it__photo-fade {
  opacity: 0;
  animation: hnItPhotoFadeIn 900ms ease-out 120ms forwards;
}

@keyframes hnItPhotoFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hn-it__photo-fade {
    animation: none;
    opacity: 1;
  }
}

/* =====================================================
   GLASS FRAME
   ===================================================== */
.hn-it__frame {
  max-width: 100%;
  border-radius: 20px;
  padding: 2rem 1.5rem;
  background: rgba(17, 24, 39, 0.52);
  border: 1px solid rgba(179, 16, 210, 0.22);
  opacity: 0.8;
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.5),
    0 0 80px rgba(179, 16, 210, 0.07),
    0 0 120px rgba(212, 175, 55, 0.04),
    inset 0 1px 0 rgba(212, 175, 55, 0.07);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

@media (min-width: 1024px) {
  .hn-it__frame {
    padding: 2.5rem 2.5rem;
    opacity: 1;
    max-width: 560px;
  }
}

/* META BAR */
.hn-it__meta-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 0.75rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid rgba(179, 16, 210, 0.18);
}

.hn-it__meta-text {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #94a3b8;
}

.hn-it__meta-dot {
  margin: 0 0.75rem;
  color: rgba(179, 16, 210, 0.7);
}

/* HEADER */
.hn-it__header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.hn-it__title {
  font-family: var(--hn-font-heading);
  font-size: clamp(2rem, 4vw, 3rem);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  background-image: linear-gradient(
    160deg,
    rgba(248, 241, 231, 0.96) 0%,
    rgba(212, 175, 55, 0.95) 45%,
    rgba(179, 16, 210, 0.85) 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hn-it__subtitle {
  margin-top: 6px;
  color: rgba(248, 241, 231, 0.6);
  font-weight: 200;
  font-style: italic;
  font-size: 0.82rem;
  letter-spacing: 0.04em;
}

/* =====================================================
   TIMELINE
   ===================================================== */
.hn-it__timeline {
  position: relative;
  padding-top: 8px;
  --axis-x: 50%;
}

.hn-it__line {
  position: absolute;
  top: 8px;
  bottom: 56px;
  left: var(--axis-x);
  transform: translateX(-50%);
  width: 2px;
  z-index: 1;
  background: linear-gradient(
    180deg,
    rgba(179, 16, 210, 0.06),
    rgba(179, 16, 210, 0.55) 40%,
    rgba(212, 175, 55, 0.45) 70%,
    rgba(179, 16, 210, 0.06)
  );
  box-shadow: 0 0 16px rgba(179, 16, 210, 0.18);
}

.hn-it__row {
  display: grid;
  grid-template-columns: 1fr 40px 1fr;
  align-items: start;
  gap: 10px;
  margin-bottom: 14px;
}

.hn-it__center {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 18px;
  z-index: 3;
}

.hn-it__marker {
  position: relative;
  z-index: 4;
  display: block;
  width: 13px;
  height: 13px;
  border-radius: 999px;
  border: 1px solid rgba(248, 241, 231, 0.2);
  flex-shrink: 0;
  background: rgba(212, 175, 55, 0.85);
  box-shadow:
    0 0 0 4px rgba(212, 175, 55, 0.1),
    0 0 18px rgba(212, 175, 55, 0.22);
}

/* DOT FIX — Baile Sorpresa (idx === 3) */
@media (min-width: 1024px) {
  .hn-it__row--fix-dot .hn-it__marker {
    transform: translateX(-10px);
  }
}

@media (max-width: 767px) {
  .hn-it__row--fix-dot .hn-it__marker {
    transform: none;
  }
}

/* CARDS */
.hn-it__card {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 14px;
  padding: 12px 14px;
  background: rgba(17, 24, 39, 0.6);
  border: 1px solid rgba(179, 16, 210, 0.2);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(212, 175, 55, 0.07);
  backdrop-filter: blur(8px);
}

.hn-it__card--mobile-odd {
  display: none;
}

@media (max-width: 767px) {
  .hn-it__timeline {
    --axis-x: 20px;
  }

  .hn-it__row {
    grid-template-columns: 40px 1fr;
    gap: 10px;
  }

  .hn-it__col--left {
    display: none;
  }

  .hn-it__col--right {
    grid-column: 2;
  }

  .hn-it__center {
    grid-column: 1;
    grid-row: 1;
    justify-content: center;
  }

  .hn-it__card--desktop-even,
  .hn-it__card--mobile-odd {
    display: flex;
  }
}

.hn-it__iconBadge {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(179, 16, 210, 0.1);
  border: 1px solid rgba(179, 16, 210, 0.28);
  flex-shrink: 0;
}

.hn-it__icon {
  width: 20px;
  height: 20px;
  color: rgba(212, 175, 55, 0.92);
}

.hn-it__card-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.hn-it__cardTitle {
  font-family: var(--hn-font-heading);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 0.88rem;
  color: rgba(248, 241, 231, 0.92);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hn-it__range {
  font-family: var(--hn-font-body);
  font-size: 0.72rem;
  color: rgba(248, 241, 231, 0.52);
  white-space: nowrap;
}

/* MICRO */
.hn-it__micro {
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.hn-it__microLine {
  width: 60px;
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(179, 16, 210, 0),
    rgba(179, 16, 210, 0.5),
    rgba(179, 16, 210, 0)
  );
}

.hn-it__microText {
  font-family: var(--hn-font-body);
  font-weight: 700;
  font-size: 0.66rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(248, 241, 231, 0.5);
}

/* ACCENTS */
.hn-accent--gold .hn-it__marker {
  background: rgba(212, 175, 55, 0.92);
  box-shadow:
    0 0 0 4px rgba(212, 175, 55, 0.12),
    0 0 22px rgba(212, 175, 55, 0.28);
}
.hn-accent--coral .hn-it__marker {
  background: rgba(232, 93, 74, 0.92);
  box-shadow:
    0 0 0 4px rgba(232, 93, 74, 0.12),
    0 0 22px rgba(232, 93, 74, 0.26);
}
.hn-accent--purple .hn-it__marker {
  background: rgba(179, 16, 210, 0.92);
  box-shadow:
    0 0 0 4px rgba(179, 16, 210, 0.12),
    0 0 22px rgba(179, 16, 210, 0.28);
}

.hn-accent--coral .hn-it__iconBadge {
  background: rgba(232, 93, 74, 0.08);
  border-color: rgba(232, 93, 74, 0.28);
}
.hn-accent--coral .hn-it__icon {
  color: rgba(232, 93, 74, 0.92);
}

.hn-accent--purple .hn-it__iconBadge {
  background: rgba(179, 16, 210, 0.1);
  border-color: rgba(179, 16, 210, 0.3);
}
.hn-accent--purple .hn-it__icon {
  color: rgba(179, 16, 210, 0.92);
}
</style>
