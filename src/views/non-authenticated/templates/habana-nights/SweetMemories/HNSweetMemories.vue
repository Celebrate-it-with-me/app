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
  <section
    id="sectionSweetMemories"
    class="hn-parallax-section hn-sm relative w-full min-h-screen overflow-hidden"
  >
    <div class="hn-parallax-bg hn-sm__bg" />
    <div class="hn-sm__overlay" />
    <div class="hn-sm__vignette" />

    <div class="hn-sm__content relative z-10 w-full px-4 md:px-8 lg:px-16 py-16 md:py-24">
      <!-- Header -->
      <div class="hn-sm__headerWrap">
        <div class="hn-sm__headerCard">
          <h2 class="hn-sm__title">SWEET MEMORIES</h2>
          <div class="hn-sm__divider" />
          <p class="hn-sm__subtitle">Momentos especiales que guardaremos para siempre</p>
        </div>
      </div>

      <!-- Gallery -->
      <div v-if="sweetMemoriesImages.length > 0" class="mt-10 md:mt-14">
        <div class="hn-sm__galleryWrap">
          <HNSweetMemoriesGallery class="hn-sm__gallery" :memories="sweetMemoriesImages" />
        </div>

        <!-- ✅ Subtle swipe hint (mobile/touch) -->
        <div class="hn-sm__swipeHint" aria-hidden="true">
          <span class="hn-sm__swipeLine"></span>
          <span class="hn-sm__swipeText">Desliza para ver más</span>
          <span class="hn-sm__swipeChev">‹ ›</span>
          <span class="hn-sm__swipeLine"></span>
        </div>
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
.hn-sm {
  background: var(--hn-bg, #0b1220);
  overflow-x: hidden;
}

.hn-sm *,
.hn-sm *::before,
.hn-sm *::after {
  box-sizing: border-box;
}

/* Background layers */
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

/* Content */
.hn-sm__content {
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
}

/* Header */
.hn-sm__headerWrap {
  width: 100%;
  display: flex;
  justify-content: center;
}

.hn-sm__headerCard {
  width: min(980px, 100%);
  margin-left: auto;
  margin-right: auto;
  border-radius: 26px;
  padding: 26px 22px;
  text-align: center;

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

@media (max-width: 767px) {
  .hn-sm__headerCard {
    width: calc(100% - 24px);
    max-width: 560px;
  }
}

.hn-sm__title {
  margin: 0;
  font-family: var(--hn-font-heading, ui-serif);
  font-weight: 800;
  letter-spacing: 0.18em;
  font-size: clamp(1.45rem, 4.6vw, 2.5rem);
  line-height: 1.1;
  text-transform: uppercase;

  background-image: linear-gradient(90deg, var(--hn-gold, #d4af37), var(--hn-coral, #e85d4a));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;

  text-shadow: 0 18px 44px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

@media (max-width: 380px) {
  .hn-sm__title {
    letter-spacing: 0.14em;
  }
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

/* Gallery */
.hn-sm__galleryWrap {
  width: 100%;
  display: flex;
  justify-content: center;
}

.hn-sm__gallery {
  width: min(1200px, 100%);
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

@media (max-width: 767px) {
  .hn-sm__gallery {
    width: calc(100% - 24px);
    max-width: 560px;
  }
}

/* ✅ Swipe hint (only on mobile / touch-ish) */
.hn-sm__swipeHint {
  margin-top: 16px;
  width: 100%;
  display: none;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0.75;
  user-select: none;
  pointer-events: none;
}

@media (max-width: 767px) {
  .hn-sm__swipeHint {
    display: flex;
  }
}

.hn-sm__swipeLine {
  width: 52px;
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(212, 175, 55, 0),
    rgba(212, 175, 55, 0.55),
    rgba(212, 175, 55, 0)
  );
}

.hn-sm__swipeText {
  font-family: var(--hn-font-body, ui-sans-serif);
  font-weight: 700;
  font-size: 0.68rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(248, 241, 231, 0.68);
  white-space: nowrap;
}

.hn-sm__swipeChev {
  font-family: var(--hn-font-body, ui-sans-serif);
  font-weight: 800;
  font-size: 0.9rem;
  letter-spacing: 0.18em;
  color: rgba(212, 175, 55, 0.75);
}

/* Empty state */
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
