<script setup>
import { computed } from 'vue'
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'
import { useSweetMemoriesStore } from '@/stores/useSweetMemoriesStore'
import HNSweetMemoriesGallery from '@/views/non-authenticated/templates/habana-nights/SweetMemories/HNSweetMemoriesGallery.vue'

const props = defineProps({
  mode: { type: String, default: 'create' }
})

const templateStore = useTemplateStore()
const sweetMemoriesStore = useSweetMemoriesStore()

const formatImages = images => {
  return (images ?? []).map((memory, index) => {
    const img = props.mode === 'create' ? memory.url : memory.imagePath
    const title =
      props.mode === 'create'
        ? memory.name || `Sweet Memory ${index + 1}`
        : memory.imageOriginalName || `Sweet Memory ${index + 1}`

    return {
      image: img,
      thumb: img,
      title,
      subHtml: `<h4>${title}</h4>`,
      alt: title
    }
  })
}

const sweetMemoriesImages = computed(() => {
  if (props.mode === 'create') return formatImages(sweetMemoriesStore.memoriesImages)
  return formatImages(templateStore.event?.sweetMemoriesImages)
})
</script>

<template>
  <section id="sectionSweetMemories" class="hn-sm relative w-full min-h-screen overflow-hidden">
    <!-- Background image (cinematic Havana Nights) -->
    <div class="hn-sm__bg" />

    <!-- Global cinematic overlay to control contrast and add gold warmth -->
    <div class="hn-sm__overlay" />
    <div class="hn-sm__vignette" />

    <div class="relative z-10 w-full px-4 md:px-8 lg:px-16 py-16 md:py-24">
      <!-- Header / Title Card -->
      <div class="hn-sm__headerWrap">
        <div class="hn-sm__headerCard">
          <h2 class="hn-sm__title">SWEET MEMORIES</h2>
          <div class="hn-sm__divider" />
          <p class="hn-sm__subtitle">Momentos especiales que guardaremos para siempre</p>
        </div>
      </div>

      <!-- Gallery -->
      <div v-if="sweetMemoriesImages.length > 0" class="mt-10 md:mt-14">
        <HNSweetMemoriesGallery class="hn-sm__gallery" :memories="sweetMemoriesImages" />
      </div>

      <!-- Empty -->
      <div v-else class="mt-12 text-center">
        <div class="hn-sm__empty">
          <p class="hn-sm__emptyTitle">Aún no hay recuerdos para mostrar</p>
          <p class="hn-sm__emptySub">Pronto iremos llenando esta historia con momentos hermosos.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
/* ===== Section shell ===== */
.hn-sm {
  background: var(--hn-bg, #0b1220);
}

/* ===== Background layers ===== */
.hn-sm__bg {
  position: absolute;
  inset: 0;
  background-image: url('@/assets/images/Sweet/sweet_memories.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  transform: scale(1.02);
  filter: saturate(1.05) contrast(1.05);
}

.hn-sm__overlay {
  position: absolute;
  inset: 0;
  /* Midnight + Gold warmth (keeps cinematic but not too dark) */
  background:
    radial-gradient(900px 520px at 30% 25%, rgba(212, 175, 55, 0.16), transparent 60%),
    radial-gradient(900px 520px at 75% 45%, rgba(232, 93, 74, 0.1), transparent 65%),
    linear-gradient(180deg, rgba(11, 18, 32, 0.3), rgba(11, 18, 32, 0.78));
  pointer-events: none;
}

.hn-sm__vignette {
  position: absolute;
  inset: -10%;
  background: radial-gradient(closest-side, rgba(0, 0, 0, 0) 45%, rgba(0, 0, 0, 0.55) 100%);
  pointer-events: none;
}

/* ===== Header ===== */
.hn-sm__headerWrap {
  width: 100%;
  display: grid;
  place-items: center;
}

.hn-sm__headerCard {
  width: min(980px, 96vw);
  border-radius: 26px;
  padding: 26px 22px;
  text-align: center;

  /* More blur + better contrast (less competition with bright lamps in bg) */
  backdrop-filter: blur(18px);
  background: linear-gradient(180deg, rgba(17, 24, 39, 0.66), rgba(17, 24, 39, 0.46));
  border: 1px solid rgba(212, 175, 55, 0.28);

  box-shadow:
    0 26px 80px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(248, 241, 231, 0.09);
}

@media (min-width: 768px) {
  .hn-sm__headerCard {
    padding: 34px 38px;
  }
}

.hn-sm__title {
  margin: 0;
  font-family: var(--hn-font-heading, ui-serif);
  font-weight: 800;
  letter-spacing: 0.18em;
  font-size: clamp(1.6rem, 4.2vw, 2.5rem);
  line-height: 1.1;
  text-transform: uppercase;

  background-image: linear-gradient(90deg, var(--hn-gold, #d4af37), var(--hn-coral, #e85d4a));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;

  text-shadow: 0 18px 44px rgba(0, 0, 0, 0.35);
}

.hn-sm__divider {
  margin: 14px auto 0;
  width: min(420px, 70%);
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(212, 175, 55, 0),
    rgba(212, 175, 55, 0.55),
    rgba(212, 175, 55, 0)
  );
}

.hn-sm__subtitle {
  margin: 14px auto 0;
  max-width: 62ch;
  color: rgba(248, 241, 231, 0.78);
  font-family: var(--hn-font-body, ui-sans-serif);
  font-weight: 600;
  letter-spacing: 0.06em;
  font-size: 0.92rem;
  text-transform: uppercase;
}

/* ===== Gallery wrapper (lets the gallery feel "embedded" in the scene) ===== */
.hn-sm__gallery {
  width: min(1200px, 96vw);
  margin-left: auto;
  margin-right: auto;

  border-radius: 26px;
  overflow: hidden;

  backdrop-filter: blur(14px);
  background: linear-gradient(180deg, rgba(17, 24, 39, 0.4), rgba(17, 24, 39, 0.22));
  border: 1px solid rgba(212, 175, 55, 0.18);

  box-shadow:
    0 30px 90px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(248, 241, 231, 0.06);
}

/* ===== Empty state ===== */
.hn-sm__empty {
  width: min(720px, 92vw);
  margin: 0 auto;
  padding: 26px 22px;
  border-radius: 22px;
  backdrop-filter: blur(14px);
  background: rgba(17, 24, 39, 0.38);
  border: 1px solid rgba(212, 175, 55, 0.18);
}

.hn-sm__emptyTitle {
  font-family: var(--hn-font-body, ui-sans-serif);
  font-weight: 800;
  color: rgba(248, 241, 231, 0.92);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 0.95rem;
  margin: 0;
}

.hn-sm__emptySub {
  margin: 10px 0 0;
  font-family: var(--hn-font-body, ui-sans-serif);
  color: rgba(248, 241, 231, 0.7);
  line-height: 1.6;
  font-size: 0.95rem;
}
</style>
