<script setup>
import { computed } from 'vue'
import manImg from '@/assets/images/DressCode/man_formal_6043.png'
import womanImg from '@/assets/images/DressCode/woman_formal_6044.png'

const props = defineProps({
  isEnabled: { type: Boolean, default: true },
  title: { type: String, default: 'DRESS CODE' },
  subtitle: { type: String, default: 'GALA MODERNA' },
  tagline: { type: String, default: 'Una noche de elegancia, ritmo y distinción.' },
   
  reservedColors: { type: Array, default: ['Rojo', 'Dorado'] }
})

const manStyle = computed(() => ({
  backgroundImage: `url(${manImg})`
}))

const womanStyle = computed(() => ({
  backgroundImage: `url(${womanImg})`
}))

const getColorClass = color => {
  const c = color.toLowerCase()
  if (c.includes('rojo')) return 'hn-color-rojo'
  if (c.includes('dorado')) return 'hn-color-dorado'
  return ''
}
</script>

<template>
  <section
    v-if="props.isEnabled"
    id="sectionDressCode"
    class="hn-parallax-section hn-dress-section relative w-full overflow-hidden"
    aria-label="Dress Code"
  >
    <!-- Background -->
    <div class="hn-parallax-bg absolute inset-0 z-0 hn-dress-bg" aria-hidden="true"></div>
    <div class="absolute inset-0 z-0 hn-dress-smoke" aria-hidden="true"></div>
    <div class="absolute inset-0 z-0 hn-dress-vignette" aria-hidden="true"></div>

    <!-- Content -->
    <div
      class="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10 py-14 sm:py-16 lg:py-20"
    >
      <div class="hn-dress-card relative overflow-hidden">
        <!-- Silhouettes INSIDE the card -->
        <div class="hn-sil hn-sil-man" :style="manStyle" aria-hidden="true"></div>
        <div class="hn-sil hn-sil-woman" :style="womanStyle" aria-hidden="true"></div>

        <!-- Soft readability overlay inside the card -->
        <div class="hn-card-overlay" aria-hidden="true"></div>

        <div class="relative z-10">
          <!-- Header -->
          <header class="hn-dress-header text-center">
            <h2 class="hn-dress-title">{{ props.title }}</h2>
            <p class="hn-dress-subtitle">{{ props.subtitle }}</p>
            <p class="hn-dress-tagline">{{ props.tagline }}</p>
            <span class="hn-dress-divider" aria-hidden="true"></span>
          </header>

          <!-- Content grid -->
          <div class="hn-dress-grid mt-10">
            <div class="hn-panel">
              <h3 class="hn-panel-title">Caballeros</h3>
              <ul class="hn-list">
                <li>Traje Formal</li>
                <li>Camisa</li>
                <li>Zapatos de vestir</li>
              </ul>
            </div>

            <div class="hn-panel">
              <h3 class="hn-panel-title">Damas</h3>
              <ul class="hn-list">
                <li>Vestido largo</li>
                <li>Tacones</li>
                <li>Brillo sutil y/o accesorios finos</li>
              </ul>
            </div>
          </div>

          <!-- Reserved colors pill -->
          <div class="mt-10 flex justify-center">
            <div class="hn-pill">
              <span class="hn-pill-label">Colores reservados:</span>
              <span v-for="(color, index) in reservedColors" :key="index" class="hn-pill-value">
                <span v-if="index !== 0" class="hn-pill-dot">•</span>
                <span :class="getColorClass(color)">{{ color }}</span>
              </span>
            </div>
          </div>
          <p class="hn-dress-note">
            Estos colores están reservados exclusivamente para la quinceañera. Agradecemos no
            utilizarlos durante la celebración.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Section base */

.hn-color-rojo {
  color: #8b1e2d;
  text-shadow: 0 0 8px rgba(212, 175, 55, 0.15);
}

.hn-color-dorado {
  color: #d4af37;
}

.hn-dress-note {
  margin-top: 0.85rem;
  text-align: center;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: rgba(148, 163, 184, 0.85);
}

.hn-pill-dot {
  margin: 0 0.35rem;
  color: rgba(212, 175, 55, 0.6);
}

.hn-dress-section {
  min-height: 100vh;
  background: linear-gradient(180deg, #0f1728 0%, #111a2e 100%);
}

/* Background layers */
.hn-dress-bg {
  background:
    radial-gradient(60% 70% at 30% 20%, rgba(212, 175, 55, 0.08) 0%, transparent 60%),
    radial-gradient(55% 65% at 75% 42%, rgba(232, 93, 74, 0.22) 0%, transparent 65%),
    linear-gradient(180deg, #0f1728 0%, #111a2e 100%);
}

.hn-dress-smoke {
  background:
    radial-gradient(60% 70% at 70% 35%, rgba(232, 93, 74, 0.3) 0%, transparent 60%),
    radial-gradient(50% 65% at 78% 62%, rgba(232, 93, 74, 0.16) 0%, transparent 70%),
    radial-gradient(70% 80% at 55% 80%, rgba(212, 175, 55, 0.06) 0%, transparent 70%);
  filter: blur(28px);
  mix-blend-mode: screen;
  opacity: 0.65;
}

.hn-dress-vignette {
  background: radial-gradient(ellipse at 60% 50%, transparent 35%, rgba(11, 18, 32, 0.78) 100%);
}

/* Card */
.hn-dress-card {
  background: rgba(17, 24, 39, 0.52);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(212, 175, 55, 0.22);
  border-radius: 18px;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.6),
    0 0 120px rgba(232, 93, 74, 0.08),
    0 0 80px rgba(212, 175, 55, 0.05);
  padding: 2.5rem 1.25rem;
}

@media (min-width: 640px) {
  .hn-dress-card {
    padding: 3rem 2rem;
  }
}

@media (min-width: 1024px) {
  .hn-dress-card {
    padding: 3.25rem 2.5rem;
  }
}

/* Silhouettes inside card */
.hn-sil {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  pointer-events: none;

  /* Glow + subtle haze */
  opacity: 0.35;
  filter: brightness(0.95) contrast(1.05) saturate(1) blur(0.2px)
    drop-shadow(0 0 24px rgba(212, 175, 55, 0.18)) drop-shadow(0 0 60px rgba(232, 93, 74, 0.08));
  mix-blend-mode: screen;
}

.hn-sil-man {
  left: 2.5rem;
  background-position: left center;
}

.hn-sil-woman {
  right: 2.5rem;
  background-position: right center;
}

/* Card overlay for readability (keeps luxury vibe) */
.hn-card-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(55% 55% at 50% 20%, rgba(15, 23, 40, 0.15) 0%, rgba(15, 23, 40, 0.55) 70%),
    linear-gradient(180deg, rgba(15, 23, 40, 0.4) 0%, rgba(15, 23, 40, 0.58) 100%);
  pointer-events: none;
}

/* Header typography */
.hn-dress-header {
  padding: 0 0.25rem;
}

.hn-dress-title {
  font-family: 'Cinzel', serif;
  font-weight: 600;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(248, 241, 231, 0.95);
  font-size: clamp(2rem, 6.2vw, 3.25rem);
  line-height: 1.05;
}

.hn-dress-subtitle {
  margin-top: 0.75rem;
  font-family: 'Montserrat', sans-serif;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(212, 175, 55, 0.9);
  font-size: 0.85rem;
}

.hn-dress-tagline {
  margin-top: 0.75rem;
  font-family: 'Montserrat', sans-serif;
  color: rgba(148, 163, 184, 0.95);
  font-size: 1rem;
  line-height: 1.6;
}

.hn-dress-divider {
  display: block;
  width: 72px;
  height: 2px;
  margin: 1.1rem auto 0;
  background: linear-gradient(
    90deg,
    rgba(212, 175, 55, 0),
    rgba(212, 175, 55, 0.9),
    rgba(212, 175, 55, 0)
  );
  opacity: 0.9;
}

/* Grid panels */
.hn-dress-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .hn-dress-grid {
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
  }
}

.hn-panel {
  border: 1px solid rgba(212, 175, 55, 0.14);
  border-radius: 16px;
  background: rgba(17, 24, 39, 0.4);
  padding: 1.25rem 1.25rem;
}

.hn-panel-title {
  font-family: 'Cinzel', serif;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(248, 241, 231, 0.92);
  font-size: 1rem;
  margin-bottom: 0.85rem;
}

.hn-list {
  margin: 0;
  padding-left: 1.05rem;
  color: rgba(226, 232, 240, 0.86);
  font-family: 'Montserrat', sans-serif;
  line-height: 1.7;
}

.hn-list li {
  margin: 0.55rem 0;
}

.hn-list li::marker {
  color: rgba(212, 175, 55, 0.85);
}

/* Pill */
.hn-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(212, 175, 55, 0.16);
  background: rgba(17, 24, 39, 0.46);
  font-family: 'Montserrat', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.hn-pill-label {
  color: rgba(148, 163, 184, 0.92);
  font-size: 0.72rem;
}

.hn-pill-value {
  color: rgba(248, 241, 231, 0.92);
  font-size: 0.72rem;
}

/* ---------------------------
   Mobile polishing (the magic)
---------------------------- */
@media (max-width: 640px) {
  .hn-dress-card {
    padding: 2.1rem 1.05rem;
    border-radius: 16px;
  }

  /* Make silhouettes bigger + more visible on mobile */
  .hn-sil {
    width: 78%;
    opacity: 0.55;
    filter: brightness(1) contrast(1.05) saturate(1.05) blur(0.35px)
      drop-shadow(0 0 28px rgba(212, 175, 55, 0.22)) drop-shadow(0 0 70px rgba(232, 93, 74, 0.1));
  }

  /* Reposition so they frame the content instead of hiding behind it */
  .hn-sil-man {
    left: -18%;
    top: 12%;
    bottom: auto;
    height: 70%;
    background-position: left top;
    transform: translateY(0) scale(1.04);
  }

  .hn-sil-woman {
    right: -22%;
    top: 45%;
    bottom: auto;
    height: 78%;
    background-position: right top;
    transform: translateY(0) scale(1.06);
  }

  /* Slightly stronger overlay for readability on small screens */
  .hn-card-overlay {
    background:
      radial-gradient(60% 60% at 50% 10%, rgba(15, 23, 40, 0.18) 0%, rgba(15, 23, 40, 0.62) 72%),
      linear-gradient(180deg, rgba(15, 23, 40, 0.46) 0%, rgba(15, 23, 40, 0.66) 100%);
  }

  .hn-dress-tagline {
    font-size: 0.95rem;
    padding: 0 0.25rem;
  }

  .hn-panel {
    padding: 1.15rem 1.05rem;
  }
}
</style>
