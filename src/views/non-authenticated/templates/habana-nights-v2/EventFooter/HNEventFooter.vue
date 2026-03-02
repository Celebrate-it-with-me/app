<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<template>
  <footer class="hn-footer relative w-full overflow-hidden py-14 px-4">
    <!-- Atmosphere (very subtle) -->
    <div class="hn-footer__smoke absolute inset-0" aria-hidden="true"></div>

    <div class="relative z-10 max-w-4xl mx-auto text-center">
      <!-- Event Title -->
      <h3 class="hn-footer__title">Isabella Canedo Quinces</h3>

      <!-- Divider -->
      <div class="hn-footer__divider"></div>

      <!-- Legal -->
      <div class="hn-footer__legal">
        <p>This website and its materials are provided for personal, non-commercial use only.</p>
        <p>All content, images, and trademarks are property of their respective owners.</p>
        <p>
          Contact:
          <a href="mailto:info@celebrateitwithme.com" class="hn-footer__link">
            info@celebrateitwithme.com
          </a>
        </p>
      </div>

      <!-- Copyright -->
      <div class="hn-footer__copyright">© {{ currentYear }} Celebrate It with Me</div>
    </div>
  </footer>
</template>

<style scoped>
/* =========================================
   Cinematic Editorial Minimal Footer
   ========================================= */

.hn-footer {
  background: linear-gradient(180deg, #0f1728 0%, #0b1020 100%);
}

/* Subtle purple atmosphere */
.hn-footer__smoke {
  background:
    radial-gradient(50% 60% at 60% 30%, rgba(179, 16, 210, 0.18) 0%, transparent 70%),
    radial-gradient(40% 50% at 40% 60%, rgba(212, 175, 55, 0.06) 0%, transparent 70%);
  filter: blur(60px);
  opacity: 0.7;
  pointer-events: none;
}

/* Title */
.hn-footer__title {
  font-family: var(--hn-font-heading);
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

/* Thin cinematic divider */
.hn-footer__divider {
  width: 140px;
  height: 1px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.6), transparent);
}

/* Legal text */
.hn-footer__legal {
  font-family: var(--hn-font-body);
  font-size: 0.8rem;
  line-height: 1.6;
  color: rgba(248, 241, 231, 0.55);
  max-width: 620px;
  margin: 0 auto;
}

.hn-footer__legal p + p {
  margin-top: 0.4rem;
}

/* Link */
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

/* Copyright */
.hn-footer__copyright {
  margin-top: 2rem;
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.6);
}
</style>
