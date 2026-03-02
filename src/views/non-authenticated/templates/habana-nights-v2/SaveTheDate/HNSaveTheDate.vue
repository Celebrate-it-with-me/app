<script setup>
import HNSaveTheDateCountDown from '@/views/non-authenticated/templates/habana-nights/SaveTheDate/HNSaveTheDateCountDown.vue'
import HNSaveTheDateAddToCalendar from '@/views/non-authenticated/templates/habana-nights/SaveTheDate/HNSaveTheDateAddToCalendar.vue'
</script>

<template>
  <section id="sectionSTD" class="hn-std relative w-full min-h-screen overflow-hidden">
    <!-- Background -->
    <div class="hn-std__bg" />

    <!-- Gold glow layer -->
    <div class="hn-std__goldGlow" />

    <!-- Soft vignette -->
    <div class="hn-std__vignette" />

    <!-- Content -->
    <div class="hn-std__content px-5 py-16 md:py-24">
      <div class="hn-std__cardWrap">
        <!-- Ambient glow behind card -->
        <div class="hn-std__ambient" aria-hidden="true"></div>

        <div data-reveal="up" data-reveal-delay="0" class="hn-std__card hn-pressable hn-shimmer">
          <!-- Eyebrow -->
          <div data-reveal="up" data-reveal-delay="40" class="hn-std__eyebrow">
            <span class="hn-std__dot" />
            <span class="hn-std__eyebrowText">SAVE THE DATE</span>
            <span class="hn-std__dot" />
          </div>

          <!-- Title -->
          <h2 data-reveal="up" data-reveal-delay="80" class="hn-std__title hn-script">
            Reserve esta fecha
          </h2>

          <!-- Subtitle -->
          <p data-reveal="up" data-reveal-delay="120" class="hn-std__subtitle">
            Una noche mágica está por llegar y tú no puedes faltar.
          </p>

          <!-- Divider -->
          <div data-reveal="up" data-reveal-delay="150" class="hn-std__divider" />

          <!-- Countdown -->
          <div data-reveal="up" data-reveal-delay="180" class="hn-std__countdown mt-8 md:mt-10">
            <HNSaveTheDateCountDown
              :numbers="{
                font: 'var(--hn-font-heading)',
                color: 'var(--hn-cream)',
                size: 'var(--hn-std-num-size)',
                style: 'normal',
                weight: '600',
                letterSpacing: 'var(--hn-std-num-tracking)'
              }"
              :text="{
                font: 'var(--hn-font-body)',
                color: 'rgba(248,241,231,0.78)',
                size: 'var(--hn-std-label-size)',
                style: 'normal',
                weight: '600',
                letterSpacing: 'var(--hn-std-label-tracking)'
              }"
            />
          </div>

          <!-- CTA -->
          <div data-reveal="up" data-reveal-delay="220" class="mt-10 md:mt-12">
            <div class="hn-std__ctaWrap">
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
          </div>

          <!-- Footer microcopy -->
          <p data-reveal="up" data-reveal-delay="260" class="hn-std__micro mt-10">
            Desliza para ver los detalles del evento
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
/* Section shell */
.hn-std {
  background: var(--hn-bg);
  overflow-x: hidden;
  --hn-std-num-size: 2.35rem;
  --hn-std-label-size: 0.78rem;
  --hn-std-num-tracking: 0.06em;
  --hn-std-label-tracking: 0.16em;
}

/* Mobile tightening so the 4 blocks stay on one line */
@media (max-width: 767px) {
  .hn-std {
    --hn-std-num-size: 2.05rem;
    --hn-std-label-size: 0.72rem;
    --hn-std-num-tracking: 0.04em;
    --hn-std-label-tracking: 0.14em;
  }
}

/* Background image layer */
.hn-std__bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(180deg, rgba(11, 18, 32, 0.8), rgba(11, 18, 32, 0.94)),
    url('@/assets/images/SaveTheDate/bg_palm3.jpg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;

  filter: saturate(1.05) contrast(1.03);
  transform: scale(1.02);
}

/* Gold glow */
.hn-std__goldGlow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(900px 520px at 50% 44%, rgba(212, 175, 55, 0.3), rgba(0, 0, 0, 0) 62%),
    radial-gradient(900px 520px at 15% 78%, rgba(232, 93, 74, 0.06), rgba(0, 0, 0, 0) 62%),
    radial-gradient(900px 520px at 85% 78%, rgba(212, 175, 55, 0.08), rgba(0, 0, 0, 0) 62%);
  mix-blend-mode: screen;
  opacity: 0.9;
}

/* Vignette */
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
  justify-items: center;
  overflow-x: hidden;
}

/* Card wrap so ambient glow can sit behind */
.hn-std__cardWrap {
  position: relative;
  width: 100%;
  display: grid;
  place-items: center;
}

/* Ambient glow (breathing) */
.hn-std__ambient {
  position: absolute;
  inset: -26px;
  width: min(900px, 96vw);
  height: 520px;
  border-radius: 28px;
  filter: blur(28px);
  opacity: 0.52;
  pointer-events: none;
  background:
    radial-gradient(circle at 50% 35%, rgba(212, 175, 55, 0.28), rgba(212, 175, 55, 0) 58%),
    radial-gradient(circle at 20% 70%, rgba(232, 93, 74, 0.1), rgba(232, 93, 74, 0) 62%);
  animation: hnStdGlowBreath 8.5s ease-in-out infinite;
  transform: translate3d(0, 0, 0);
}

@keyframes hnStdGlowBreath {
  0% {
    opacity: 0.42;
    transform: translate3d(0, 0, 0) scale(0.98);
  }
  50% {
    opacity: 0.62;
    transform: translate3d(0, -2px, 0) scale(1.02);
  }
  100% {
    opacity: 0.42;
    transform: translate3d(0, 0, 0) scale(0.98);
  }
}

/* Editorial glass card */
.hn-std__card {
  width: min(860px, 94vw);
  border-radius: 24px;
  padding: 20px 22px;
  text-align: center;

  margin-left: auto;
  margin-right: auto;
  justify-self: center;

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

/* Mobile width becomes symmetric and reduces side waste */
@media (max-width: 767px) {
  .hn-std__card {
    width: calc(100% - 16px);
    max-width: 560px;
    padding-left: 16px;
    padding-right: 16px;
  }
}

/* Press / hover */
.hn-pressable {
  transition:
    transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 240ms cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform;
}

@media (hover: hover) and (pointer: fine) {
  .hn-pressable:hover {
    transform: translate3d(0, -1px, 0) scale(1.01);
    box-shadow:
      0 30px 86px rgba(0, 0, 0, 0.52),
      0 0 0 1px rgba(248, 241, 231, 0.05) inset,
      0 0 52px rgba(212, 175, 55, 0.08);
  }
}

.hn-pressable:active {
  transform: translate3d(0, 0, 0) scale(0.99);
}

/* Shimmer highlight (subtle) */
.hn-shimmer {
  position: relative;
  overflow: hidden;
}

.hn-shimmer::after {
  content: '';
  position: absolute;
  top: -40%;
  left: -65%;
  width: 55%;
  height: 190%;
  transform: rotate(18deg) translate3d(0, 0, 0);
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.08) 38%,
    rgba(255, 255, 255, 0) 72%
  );
  opacity: 0;
  animation: hnStdShimmer 10.5s ease-in-out infinite;
  pointer-events: none;
}

@keyframes hnStdShimmer {
  0% {
    transform: rotate(18deg) translate3d(-140%, 0, 0);
    opacity: 0;
  }
  10% {
    opacity: 0.55;
  }
  26% {
    transform: rotate(18deg) translate3d(240%, 0, 0);
    opacity: 0;
  }
  100% {
    transform: rotate(18deg) translate3d(240%, 0, 0);
    opacity: 0;
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

/* Countdown layout guardrails (forces single row on mobile) */
.hn-std__countdown {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
}

.hn-std__countdown > * {
  max-width: 100%;
  display: flex !important;
  flex-wrap: nowrap !important;
  justify-content: center;
  align-items: stretch;
  gap: 10px;
}

.hn-std__countdown > * > * {
  min-width: 0;
  flex: 1 1 0;
}

@media (max-width: 767px) {
  .hn-std__countdown > * {
    gap: 8px;
  }
}

/* CTA wrapper (optional visual “anchor”) */
.hn-std__ctaWrap {
  display: grid;
  place-items: center;
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

/* iPhone perf + readability */
@media (max-width: 640px) {
  .hn-std__goldGlow {
    opacity: 0.82;
    mix-blend-mode: normal;
  }
  .hn-std__ambient {
    opacity: 0.42;
    filter: blur(24px);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .hn-std__ambient {
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
</style>
