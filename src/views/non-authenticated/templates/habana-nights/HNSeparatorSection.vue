<script setup>
const props = defineProps({
  kicker: { type: String, default: '' },
  compact: { type: Boolean, default: false }
})
</script>

<template>
  <section class="hn-separator" :class="{ 'hn-separator--compact': props.compact }">
    <div class="hn-separator-inner">
      <p v-if="props.kicker" class="hn-separator-kicker">
        {{ props.kicker }}
      </p>

      <div class="hn-separator-line" aria-hidden="true"></div>

      <p class="hn-separator-text">
        <slot />
      </p>

      <div class="hn-separator-line" aria-hidden="true"></div>
    </div>
  </section>
</template>

<style scoped>
.hn-separator {
  position: relative;
  padding: 60px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  overflow: hidden;
}

/* Optional compact mode */
.hn-separator--compact {
  padding: 44px 18px;
}

/* Cinematic depth */
.hn-separator::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(11, 18, 32, 0.86), rgba(11, 18, 32, 0.66)),
    radial-gradient(
      ellipse 160% 85% at 50% 44%,
      rgba(248, 241, 231, 0.085) 0%,
      rgba(248, 241, 231, 0.045) 18%,
      rgba(11, 18, 32, 0.12) 42%,
      rgba(11, 18, 32, 0.72) 100%
    ),
    radial-gradient(
      ellipse 120% 120% at 50% 50%,
      rgba(11, 18, 32, 0) 35%,
      rgba(11, 18, 32, 0.55) 100%
    );
  z-index: 0;
}

/* Mobile refinement: wider + softer center */
@media (max-width: 640px) {
  .hn-separator {
    padding: 68px 18px;
  }

  .hn-separator--compact {
    padding: 52px 18px;
  }

  .hn-separator::before {
    background:
      linear-gradient(180deg, rgba(11, 18, 32, 0.9), rgba(11, 18, 32, 0.72)),
      radial-gradient(
        ellipse 220% 75% at 50% 42%,
        rgba(248, 241, 231, 0.065) 0%,
        rgba(248, 241, 231, 0.032) 22%,
        rgba(11, 18, 32, 0.18) 48%,
        rgba(11, 18, 32, 0.78) 100%
      ),
      radial-gradient(
        ellipse 140% 140% at 50% 50%,
        rgba(11, 18, 32, 0) 30%,
        rgba(11, 18, 32, 0.6) 100%
      );
  }
}

.hn-separator-inner {
  position: relative;
  z-index: 1;
  max-width: 660px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.hn-separator-kicker {
  margin: 0;
  font-family: var(--hn-font-body, ui-sans-serif), sans-serif;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(248, 241, 231, 0.62);
}

.hn-separator-text {
  margin: 0;
  font-family: var(--hn-font-body, ui-sans-serif), sans-serif;
  font-size: 15px;
  line-height: 2.02;
  letter-spacing: 0.04em;
  color: rgba(248, 241, 231, 0.88);
}

.hn-separator-line {
  width: 120px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--hn-gold, #d4af37), transparent);
  opacity: 0.85;
}

@media (max-width: 640px) {
  .hn-separator-inner {
    max-width: 560px;
    gap: 16px;
  }

  .hn-separator-text {
    font-size: 13px;
    line-height: 1.95;
    letter-spacing: 0.03em;
  }

  .hn-separator-line {
    width: 92px;
  }
}
</style>
