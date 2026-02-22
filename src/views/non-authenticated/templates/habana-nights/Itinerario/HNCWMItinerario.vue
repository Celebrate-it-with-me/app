<script setup>
import { Martini, Sparkles, Utensils, Music, Disc3 } from 'lucide-vue-next'

/**
 * NOTE:
 * - Keep your background image handling in CSS (you said you'll swap later).
 * - No step numbers. Order is defined by the timeline data and time labels.
 * - Icons are Lucide and styled as "gold badge" with subtle neon accents.
 */

const timeline = [
  { time: '7:00 PM', range: '7:00pm – 8:00pm', title: 'Cocktail', icon: Martini, accent: 'coral' },
  { time: '8:00 PM', range: '8:00pm – 9:30pm', title: 'Ceremonia', icon: Sparkles, accent: 'gold' },
  { time: '9:30 PM', range: '9:30pm – 10:30pm', title: 'Cena', icon: Utensils, accent: 'teal' },
  {
    time: '10:30 PM',
    range: '10:30pm – 11:00pm',
    title: 'Baile Sorpresa',
    icon: Music,
    accent: 'coral'
  },
  { time: '11:00 PM', range: 'Desde 11:00pm', title: 'Hora Loca', icon: Disc3, accent: 'gold' }
]

const getAccentClass = accent => {
  if (accent === 'teal') return 'hn-accent--teal'
  if (accent === 'coral') return 'hn-accent--coral'
  return 'hn-accent--gold'
}
</script>

<template>
  <section id="sectionItinerario" class="hn-it relative w-full min-h-screen overflow-hidden">
    <!-- Background layer (swap later) -->
    <div class="hn-it__bg" />
    <!-- Vignette + warm gold bloom (cinematic) -->
    <div class="hn-it__vignette" />
    <div class="hn-it__bloom" />

    <!-- Content wrapper -->
    <div class="hn-it__content px-4 py-16 md:py-24">
      <!-- Editorial container -->
      <div class="hn-it__frame">
        <!-- Header -->
        <div class="hn-it__header">
          <h2 class="hn-it__title">Itinerario</h2>
          <p class="hn-it__subtitle">La noche en momentos inolvidables</p>
        </div>

        <!-- Timeline -->
        <div class="hn-it__timeline">
          <!-- Center line -->
          <div class="hn-it__line" />

          <div
            v-for="(item, idx) in timeline"
            :key="item.title"
            class="hn-it__row"
            :class="{ 'is-right': idx % 2 === 0, 'is-left': idx % 2 !== 0 }"
          >
            <!-- Left column -->
            <div class="hn-it__col hn-it__col--left">
              <div v-if="idx % 2 !== 0" class="hn-it__card" :class="getAccentClass(item.accent)">
                <div class="hn-it__cardTop">
                  <div class="hn-it__time">{{ item.time }}</div>
                  <div class="hn-it__range">{{ item.range }}</div>
                </div>

                <div class="hn-it__cardBody">
                  <div class="hn-it__iconBadge">
                    <component :is="item.icon" class="hn-it__icon" />
                  </div>

                  <div class="hn-it__text">
                    <div class="hn-it__cardTitle">{{ item.title }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Center marker -->
            <div class="hn-it__center">
              <span class="hn-it__marker" :class="getAccentClass(item.accent)" />
            </div>

            <!-- Right column -->
            <div class="hn-it__col hn-it__col--right">
              <div v-if="idx % 2 === 0" class="hn-it__card" :class="getAccentClass(item.accent)">
                <div class="hn-it__cardTop">
                  <div class="hn-it__time">{{ item.time }}</div>
                  <div class="hn-it__range">{{ item.range }}</div>
                </div>

                <div class="hn-it__cardBody">
                  <div class="hn-it__iconBadge">
                    <component :is="item.icon" class="hn-it__icon" />
                  </div>

                  <div class="hn-it__text">
                    <div class="hn-it__cardTitle">{{ item.title }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom microcopy -->
          <div class="hn-it__micro">
            <span class="hn-it__microLine" />
            <span class="hn-it__microText">Sigue bajando para descubrirlo todo</span>
            <span class="hn-it__microLine" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
/* SECTION + BACKDROP */
.hn-it {
  background: var(--hn-bg);
}

.hn-it__bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(180deg, rgba(11, 18, 32, 0.55), rgba(11, 18, 32, 0.78)),
    url('@/assets/images/Itinerario/IMG_6044.webp');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

@media (min-width: 1024px) {
  .hn-it__bg {
    background-image:
      linear-gradient(180deg, rgba(11, 18, 32, 0.52), rgba(11, 18, 32, 0.76)),
      url('@/assets/images/Itinerario/IMG_6044.webp');
  }
}

/* Cinematic vignette */
.hn-it__vignette {
  position: absolute;
  inset: -12%;
  background: radial-gradient(closest-side, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.55) 100%);
  pointer-events: none;
}

/* Warm gold bloom (adds "gold" without losing midnight vibe) */
.hn-it__bloom {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(1200px 520px at 50% 18%, rgba(212, 175, 55, 0.14), rgba(0, 0, 0, 0) 60%),
    radial-gradient(900px 460px at 30% 65%, rgba(232, 93, 74, 0.08), rgba(0, 0, 0, 0) 60%),
    radial-gradient(900px 460px at 70% 70%, rgba(34, 211, 238, 0.06), rgba(0, 0, 0, 0) 60%);
}

/* CONTENT */
.hn-it__content {
  position: relative;
  z-index: 2;
  width: 100%;
  min-height: 100vh;
  display: grid;
  place-items: center;
}

/* The big container card (semi-dark, transparent, lets background show) */
.hn-it__frame {
  width: min(1020px, 94vw);
  border-radius: 28px;
  padding: 26px 18px 22px;
  background: linear-gradient(180deg, rgba(17, 24, 39, 0.55), rgba(17, 24, 39, 0.38));
  border: 1px solid rgba(212, 175, 55, 0.22);
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(248, 241, 231, 0.08);
  backdrop-filter: blur(14px);
}

@media (min-width: 768px) {
  .hn-it__frame {
    padding: 44px 44px 36px;
  }
}

/* HEADER */
.hn-it__header {
  text-align: center;
  margin-bottom: 26px;
}

.hn-it__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: rgba(248, 241, 231, 0.72);
}

.hn-it__eyebrowText {
  font-family: var(--hn-font-body);
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.22em;
}

.hn-it__dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(232, 93, 74, 0.9);
  box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.14);
}

.hn-it__title {
  margin-top: 6px;
  font-family: var(--hn-font-heading);
  font-size: clamp(2.2rem, 4.6vw, 3.2rem);
  letter-spacing: 0.16em;
  text-transform: uppercase;

  /* Rich gold gradient */
  background-image: linear-gradient(
    180deg,
    rgba(248, 241, 231, 0.96),
    rgba(212, 175, 55, 0.95),
    rgba(232, 93, 74, 0.65)
  );

  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;

  /* Subtle cinematic glow */
  text-shadow:
    0 4px 18px rgba(212, 175, 55, 0.18),
    0 10px 40px rgba(212, 175, 55, 0.12);
}

.hn-it__subtitle {
  margin-top: 8px;
  color: rgba(248, 241, 231, 0.72);
  font-weight: 200;
  font-style: italic;
  font-size: 0.82rem;
  letter-spacing: 0.04em;
}

/* TIMELINE */
.hn-it__timeline {
  position: relative;
  padding-top: 10px;
}

.hn-it__line {
  position: absolute;
  top: 10px;
  bottom: 62px;
  left: 50%;
  width: 2px;
  transform: translateX(-50%);
  background: linear-gradient(
    180deg,
    rgba(212, 175, 55, 0.08),
    rgba(212, 175, 55, 0.55),
    rgba(212, 175, 55, 0.12)
  );
  box-shadow: 0 0 18px rgba(212, 175, 55, 0.16);
}

.hn-it__row {
  display: grid;
  grid-template-columns: 1fr 64px 1fr;
  align-items: center;
  margin: 16px 0;
}

@media (max-width: 880px) {
  .hn-it__line {
    left: 22px;
    transform: none;
  }
  .hn-it__row {
    grid-template-columns: 64px 1fr;
    gap: 14px;
  }
  .hn-it__col--left {
    display: none;
  }
  .hn-it__col--right {
    grid-column: 2;
  }
}

.hn-it__col {
  min-height: 1px;
}

.hn-it__center {
  display: grid;
  place-items: center;
}

.hn-it__marker {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: rgba(212, 175, 55, 0.9);
  box-shadow:
    0 0 0 5px rgba(212, 175, 55, 0.1),
    0 0 22px rgba(212, 175, 55, 0.22);
  border: 1px solid rgba(248, 241, 231, 0.18);
}

/* CARD */
.hn-it__card {
  border-radius: 18px;
  padding: 16px 16px;
  background: linear-gradient(180deg, rgba(248, 241, 231, 0.1), rgba(248, 241, 231, 0.06));
  border: 1px solid rgba(212, 175, 55, 0.18);
  box-shadow:
    0 14px 34px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(248, 241, 231, 0.08);
}

@media (min-width: 768px) {
  .hn-it__card {
    padding: 18px 18px;
  }
}

.hn-it__cardTop {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.hn-it__time {
  font-family: var(--hn-font-body);
  font-weight: 800;
  letter-spacing: 0.18em;
  font-size: 0.72rem;
  text-transform: uppercase;
  color: rgba(248, 241, 231, 0.86);
}

.hn-it__range {
  font-family: var(--hn-font-body);
  font-weight: 600;
  font-size: 0.74rem;
  color: rgba(248, 241, 231, 0.62);
}

.hn-it__cardBody {
  display: flex;
  gap: 12px;
  align-items: center;
}

.hn-it__iconBadge {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.28);
  box-shadow: inset 0 1px 0 rgba(248, 241, 231, 0.1);
}

.hn-it__icon {
  width: 22px;
  height: 22px;
  color: rgba(212, 175, 55, 0.92);
}

.hn-it__cardTitle {
  font-family: var(--hn-font-heading);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 0.95rem;
  color: rgba(248, 241, 231, 0.92);
}

.hn-it__cardHint {
  margin-top: 4px;
  font-family: var(--hn-font-body);
  font-weight: 600;
  font-size: 0.82rem;
  color: rgba(248, 241, 231, 0.7);
}

/* MICRO */
.hn-it__micro {
  margin-top: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.hn-it__microLine {
  width: 70px;
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(212, 175, 55, 0),
    rgba(212, 175, 55, 0.55),
    rgba(212, 175, 55, 0)
  );
}

.hn-it__microText {
  font-family: var(--hn-font-body);
  font-weight: 700;
  font-size: 0.68rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(248, 241, 231, 0.62);
}

/* ACCENTS (subtle neon is optional; this is tasteful) */
.hn-accent--gold .hn-it__marker {
  background: rgba(212, 175, 55, 0.92);
  box-shadow:
    0 0 0 5px rgba(212, 175, 55, 0.1),
    0 0 26px rgba(212, 175, 55, 0.24);
}

.hn-accent--coral .hn-it__marker {
  background: rgba(232, 93, 74, 0.92);
  box-shadow:
    0 0 0 5px rgba(232, 93, 74, 0.1),
    0 0 26px rgba(232, 93, 74, 0.22);
}

.hn-accent--teal .hn-it__marker {
  background: rgba(34, 211, 238, 0.88);
  box-shadow:
    0 0 0 5px rgba(34, 211, 238, 0.1),
    0 0 26px rgba(34, 211, 238, 0.18);
}

.hn-accent--coral .hn-it__iconBadge {
  background: rgba(232, 93, 74, 0.08);
  border-color: rgba(232, 93, 74, 0.26);
}
.hn-accent--coral .hn-it__icon {
  color: rgba(232, 93, 74, 0.92);
}

.hn-accent--teal .hn-it__iconBadge {
  background: rgba(34, 211, 238, 0.06);
  border-color: rgba(34, 211, 238, 0.18);
}
.hn-accent--teal .hn-it__icon {
  color: rgba(34, 211, 238, 0.85);
}

/* Script hook */
.hn-script {
  font-family: var(--hn-font-script, var(--hn-font-heading));
}
</style>
