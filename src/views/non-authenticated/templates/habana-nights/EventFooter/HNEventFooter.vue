<script setup>
import { computed } from 'vue'

const props = defineProps({
  config: { type: Object, default: () => ({}) }
})

const currentYear = computed(() => new Date().getFullYear())

const footer = computed(() => props.config?.sections?.footer || {})

const isEnabled = computed(() => footer.value?.isEnabled ?? true)

const title = computed(() => footer.value?.title ?? 'Celebrate It With Me')
const legalLines = computed(() => {
  return (
    footer.value?.legalLines ?? [
      'This website and its materials are provided for personal, non-commercial use only.',
      'All content, images, and trademarks are property of their respective owners.'
    ]
  )
})

const contactEmail = computed(() => footer.value?.contactEmail ?? 'info@celebrateitwithme.com')
const copyrightText = computed(() => footer.value?.copyrightText ?? 'Celebrate It with Me')
</script>

<template>
  <footer v-if="isEnabled" class="hn-footer relative w-full overflow-hidden py-14 px-4">
    <div class="hn-footer__smoke absolute inset-0" aria-hidden="true"></div>

    <div class="relative z-10 max-w-4xl mx-auto text-center">
      <h3 class="hn-footer__title">{{ title }}</h3>

      <div class="hn-footer__divider"></div>

      <div class="hn-footer__legal">
        <p v-for="(line, idx) in legalLines" :key="idx">
          {{ line }}
        </p>

        <p>
          Contact:
          <a :href="`mailto:${contactEmail}`" class="hn-footer__link">
            {{ contactEmail }}
          </a>
        </p>
      </div>

      <div class="hn-footer__copyright">© {{ currentYear }} {{ copyrightText }}</div>
    </div>
  </footer>
</template>

<style scoped>
.hn-footer {
  background: linear-gradient(180deg, #0f1728 0%, #0b1020 100%);
}

.hn-footer__smoke {
  background:
    radial-gradient(50% 60% at 60% 30%, rgba(179, 16, 210, 0.18) 0%, transparent 70%),
    radial-gradient(40% 50% at 40% 60%, rgba(212, 175, 55, 0.06) 0%, transparent 70%);
  filter: blur(60px);
  opacity: 0.7;
  pointer-events: none;
}

.hn-footer__title {
  font-family: var(--hn-font-heading, ui-serif);
  font-size: clamp(1.4rem, 4vw, 1.9rem);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-bottom: 1rem;

  background-image: linear-gradient(
    160deg,
    rgba(248, 241, 231, 0.9) 0%,
    rgba(212, 175, 55, 0.9) 45%,
    rgba(179, 16, 210, 0.75) 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hn-footer__divider {
  width: 140px;
  height: 1px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.6), transparent);
}

.hn-footer__legal {
  font-family: var(--hn-font-body, ui-sans-serif);
  font-size: 0.8rem;
  line-height: 1.6;
  color: rgba(248, 241, 231, 0.55);
  max-width: 620px;
  margin: 0 auto;
}

.hn-footer__legal p + p {
  margin-top: 0.4rem;
}

.hn-footer__link {
  color: rgba(212, 175, 55, 0.85);
  text-decoration: none;
  border-bottom: 1px solid rgba(212, 175, 55, 0.3);
  transition:
    opacity 180ms ease,
    border-color 180ms ease;
}

.hn-footer__link:hover {
  opacity: 0.9;
  border-bottom-color: rgba(212, 175, 55, 0.6);
}

.hn-footer__copyright {
  margin-top: 2rem;
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.6);
}
</style>
