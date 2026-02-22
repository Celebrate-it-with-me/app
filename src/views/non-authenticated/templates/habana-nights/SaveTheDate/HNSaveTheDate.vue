<script setup>
import HNSaveTheDateCountDown from '@/views/non-authenticated/templates/habana-nights/SaveTheDate/HNSaveTheDateCountDown.vue'
import HNSaveTheDateAddToCalendar from '@/views/non-authenticated/templates/habana-nights/SaveTheDate/HNSaveTheDateAddToCalendar.vue'
</script>

<template>
  <section id="sectionSTD" class="hn-std relative w-full min-h-screen overflow-hidden">
    <!-- Background -->
    <div class="hn-std__bg" />

    <!-- Gold glow layer (adds warmth without losing midnight) -->
    <div class="hn-std__goldGlow" />

    <!-- Soft vignette -->
    <div class="hn-std__vignette" />

    <!-- Content -->
    <div class="hn-std__content px-5 py-16 md:py-24">
      <div class="hn-std__card">
        <!-- Eyebrow -->
        <div class="hn-std__eyebrow">
          <span class="hn-std__dot" />
          <span class="hn-std__eyebrowText">SAVE THE DATE</span>
          <span class="hn-std__dot" />
        </div>

        <!-- Title -->
        <h2 class="hn-std__title hn-script">Cuenta los Días Conmigo</h2>

        <!-- Subtitle -->
        <p class="hn-std__subtitle">
          Este es un momento especial para nosotros y queremos celebrarlo contigo.
        </p>

        <!-- Divider -->
        <div class="hn-std__divider" />

        <!-- Countdown -->
        <div class="mt-8 md:mt-10">
          <HNSaveTheDateCountDown
            :numbers="{
              font: 'var(--hn-font-heading)',
              color: 'var(--hn-cream)',
              size: '2.35rem',
              style: 'normal',
              weight: '600',
              letterSpacing: '0.06em'
            }"
            :text="{
              font: 'var(--hn-font-body)',
              color: 'rgba(248,241,231,0.78)',
              size: '0.78rem',
              style: 'normal',
              weight: '600',
              letterSpacing: '0.16em'
            }"
          />
        </div>

        <!-- CTA -->
        <div class="mt-10 md:mt-12">
          <HNSaveTheDateAddToCalendar
            :button-style="{
              bgColor: 'transparent',
              fontColor: 'rgba(248,241,231,0.92)',
              hoverColor: 'var(--hn-gold)',
              fontFamily: 'var(--hn-font-body)',
              borderRadius: '14px',
              borderColor: 'rgba(212,175,55,0.55)'
            }"
          />
        </div>

        <!-- Footer microcopy -->
        <p class="hn-std__micro mt-10">Desliza para ver los detalles del evento</p>
      </div>
    </div>
  </section>
</template>

<style>
/* Section shell */
.hn-std {
  background: var(--hn-bg);
}

/* Background image layer (keep your asset; swap whenever) */
.hn-std__bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(180deg, rgba(11, 18, 32, 0.8), rgba(11, 18, 32, 0.94)),
    url('@/assets/images/SaveTheDate/bg_palm3.jpg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;

  /* Slight cinematic polish */
  filter: saturate(1.05) contrast(1.03);
  transform: scale(1.02);
}

/* GOLD GLOW (this is the key change) */
.hn-std__goldGlow {
  position: absolute;
  inset: 0;
  pointer-events: none;

  /* Warmth concentrated behind the card */
  background:
    radial-gradient(900px 520px at 50% 44%, rgba(212, 175, 55, 0.3), rgba(0, 0, 0, 0) 62%),
    radial-gradient(900px 520px at 15% 78%, rgba(232, 93, 74, 0.06), rgba(0, 0, 0, 0) 62%),
    radial-gradient(900px 520px at 85% 78%, rgba(212, 175, 55, 0.08), rgba(0, 0, 0, 0) 62%);

  /* Helps it feel like light, not paint */
  mix-blend-mode: screen;
  opacity: 0.9;
}

/* Vignette for cinematic mood (tuned to not kill the gold) */
.hn-std__vignette {
  position: absolute;
  inset: -10%;
  pointer-events: none;
  background: radial-gradient(closest-side, rgba(0, 0, 0, 0) 46%, rgba(0, 0, 0, 0.48) 100%);
}

/* Content wrapper */
.hn-std__content {
  position: relative;
  z-index: 2;
  width: 100%;
  min-height: 100vh;
  display: grid;
  place-items: center;
}

/* Editorial glass card */
.hn-std__card {
  width: min(860px, 94vw);
  border-radius: 24px;
  padding: 28px 22px;
  text-align: center;

  background:
    radial-gradient(900px 360px at 50% 0%, rgba(212, 175, 55, 0.1), rgba(0, 0, 0, 0) 55%),
    linear-gradient(180deg, rgba(17, 24, 39, 0.6), rgba(17, 24, 39, 0.44));

  border: 1px solid rgba(212, 175, 55, 0.3);

  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.48),
    0 0 0 1px rgba(248, 241, 231, 0.04) inset,
    0 0 40px rgba(212, 175, 55, 0.06);

  backdrop-filter: blur(14px);
}

@media (min-width: 768px) {
  .hn-std__card {
    padding: 44px 48px;
  }
}

/* Eyebrow */
.hn-std__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: rgba(248, 241, 231, 0.72);
  margin-bottom: 10px;
}
.hn-std__eyebrowText {
  font-family: var(--hn-font-body);
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.22em;
}
.hn-std__dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(232, 93, 74, 0.9);
  box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.15);
}

/* Title */
.hn-std__title {
  margin-top: 6px;
  font-size: clamp(2.4rem, 5vw, 3.4rem);
  line-height: 1.05;
  font-weight: 700;
  letter-spacing: 0.02em;
  background-image: linear-gradient(90deg, var(--hn-gold), var(--hn-coral));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* Subtitle */
.hn-std__subtitle {
  margin-top: 14px;
  max-width: 58ch;
  margin-left: auto;
  margin-right: auto;
  color: rgba(248, 241, 231, 0.78);
  font-family: var(--hn-font-body);
  font-weight: 500;
  font-size: 0.98rem;
  line-height: 1.55;
}

/* Divider */
.hn-std__divider {
  margin: 18px auto 0;
  width: min(340px, 70%);
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(212, 175, 55, 0),
    rgba(212, 175, 55, 0.58),
    rgba(212, 175, 55, 0)
  );
}

/* Microcopy */
.hn-std__micro {
  color: rgba(248, 241, 231, 0.62);
  font-family: var(--hn-font-body);
  font-weight: 600;
  font-size: 0.7rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

/* Script class hook */
.hn-script {
  font-family: var(--hn-font-script, var(--hn-font-heading));
}
</style>
