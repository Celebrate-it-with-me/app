<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import LightGallery from 'lightgallery/vue'
import lgThumbnail from 'lightgallery/plugins/thumbnail'
import lgZoom from 'lightgallery/plugins/zoom'

import { Splide, SplideSlide } from '@splidejs/vue-splide'
import '@splidejs/vue-splide/css'

import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

import 'lightgallery/css/lightgallery.css'
import 'lightgallery/css/lg-thumbnail.css'
import 'lightgallery/css/lg-zoom.css'

const props = defineProps({
  memories: { type: Array, required: true }
})

const plugins = [lgThumbnail, lgZoom]

const gallerySettings = {
  speed: 500,
  plugins,
  thumbnail: true,
  showThumbByDefault: true,
  allowMediaOverlap: false,
  toggleThumb: true,
  download: false,
  counter: true,
  subHtmlSelectorRelative: true,
  appendSubHtmlTo: '.lg-item',
  mousewheel: true,
  selector: '.hn-sm__link'
}

const activeIndex = ref(0)
const mainRef = ref<any>(null)

const slides = computed(() => props.memories ?? [])

const goPrev = () => {
  if (!mainRef.value) return
  mainRef.value?.splide?.go('<')
}

const goNext = () => {
  if (!mainRef.value) return
  mainRef.value?.splide?.go('>')
}

const onMainMoved = (_splide: any, newIndex: number) => {
  activeIndex.value = newIndex
}

const setActive = (index: number) => {
  activeIndex.value = index
  mainRef.value?.splide?.go(index)
}

onMounted(() => {
  if (activeIndex.value >= slides.value.length) activeIndex.value = 0
})

watch(
  () => slides.value.length,
  len => {
    if (activeIndex.value >= len) activeIndex.value = 0
  }
)
</script>

<template>
  <div class="hn-sm__gallery">
    <LightGallery :settings="gallerySettings" class="hn-sm__lg">
      <!-- Main cinematic slide -->
      <div class="hn-sm__main">
        <Splide
          ref="mainRef"
          :options="{
            type: 'slide',
            perPage: 1,
            rewind: true,
            pagination: false,
            arrows: false,
            speed: 650,
            easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
            drag: true
          }"
          @splide:moved="onMainMoved"
        >
          <SplideSlide v-for="(item, idx) in slides" :key="idx">
            <a class="hn-sm__link hn-sm__heroCard" :href="item.image" :data-sub-html="item.subHtml">
              <img :src="item.thumb" :alt="item.alt" class="hn-sm__heroImg" loading="lazy" />

              <!-- Cinematic overlays -->
              <div class="hn-sm__heroOverlay" />
              <div class="hn-sm__heroGrain" />

              <div class="hn-sm__heroMeta">
                <div class="hn-sm__metaEyebrow">MEMORY</div>
                <div class="hn-sm__metaTitle">{{ item.title }}</div>
              </div>
            </a>
          </SplideSlide>
        </Splide>

        <!-- Arrows -->
        <button type="button" class="hn-sm__arrow hn-sm__arrow--left" @click="goPrev">
          <ChevronLeft :size="18" />
        </button>
        <button type="button" class="hn-sm__arrow hn-sm__arrow--right" @click="goNext">
          <ChevronRight :size="18" />
        </button>
      </div>

      <!-- Filmstrip thumbnails -->
      <div class="hn-sm__strip" role="list">
        <button
          v-for="(item, idx) in slides"
          :key="idx"
          type="button"
          class="hn-sm__thumb"
          :class="{ 'is-active': idx === activeIndex }"
          @click="setActive(idx)"
        >
          <img :src="item.thumb" :alt="item.alt" class="hn-sm__thumbImg" loading="lazy" />
          <span class="hn-sm__thumbGlow" />
        </button>
      </div>
    </LightGallery>
  </div>
</template>

<style>
/* =========================================================
   Gallery Shell
========================================================= */
.hn-sm__gallery {
  width: 100%;
}

/* =========================================================
   HERO (Main)
========================================================= */
.hn-sm__main {
  position: relative;
}

.hn-sm__heroCard {
  display: block;
  position: relative;
  border-radius: 26px;
  overflow: hidden;
  border: 1px solid rgba(212, 175, 55, 0.22);
  background: linear-gradient(180deg, rgba(17, 24, 39, 0.62), rgba(17, 24, 39, 0.42));
  box-shadow:
    0 26px 86px rgba(0, 0, 0, 0.52),
    inset 0 1px 0 rgba(248, 241, 231, 0.08);
}

.hn-sm__heroImg {
  width: 100%;
  height: clamp(320px, 52vh, 540px);
  object-fit: cover;
  transform: scale(1.015);
  filter: saturate(1.02) contrast(1.04);
}

/* Cinematic editorial overlay (midnight + gold warmth) */
.hn-sm__heroOverlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(900px 420px at 35% 18%, rgba(212, 175, 55, 0.13), rgba(0, 0, 0, 0) 62%),
    radial-gradient(820px 420px at 72% 55%, rgba(232, 93, 74, 0.08), rgba(0, 0, 0, 0) 65%),
    linear-gradient(180deg, rgba(11, 18, 32, 0.10), rgba(11, 18, 32, 0.76));
  pointer-events: none;
}

/* Film grain (no asset needed) */
.hn-sm__heroGrain {
  position: absolute;
  inset: 0;
  opacity: 0.12;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E");
  pointer-events: none;
}

/* Meta bar */
.hn-sm__heroMeta {
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 18px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(11, 18, 32, 0.46);
  border: 1px solid rgba(212, 175, 55, 0.22);
  backdrop-filter: blur(14px);
  box-shadow: inset 0 1px 0 rgba(248, 241, 231, 0.07);
}

.hn-sm__metaEyebrow {
  font-family: var(--hn-font-body, ui-sans-serif);
  font-weight: 800;
  font-size: 0.66rem;
  letter-spacing: 0.28em;
  color: rgba(248, 241, 231, 0.70);
}

.hn-sm__metaTitle {
  margin-top: 6px;
  font-family: var(--hn-font-heading, ui-serif);
  font-weight: 800;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: rgba(248, 241, 231, 0.92);
  font-size: 0.98rem;
  line-height: 1.25;
  text-shadow: 0 14px 40px rgba(0, 0, 0, 0.35);
}

/* Arrows */
.hn-sm__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(11, 18, 32, 0.55);
  border: 1px solid rgba(212, 175, 55, 0.30);
  color: rgba(248, 241, 231, 0.92);
  backdrop-filter: blur(10px);
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease;
}

.hn-sm__arrow:hover {
  border-color: rgba(212, 175, 55, 0.62);
  box-shadow:
    0 18px 42px rgba(0, 0, 0, 0.38),
    0 0 0 1px rgba(212, 175, 55, 0.20);
  transform: translateY(-50%) scale(1.05);
  filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.22));
}

.hn-sm__arrow--left {
  left: 14px;
}

.hn-sm__arrow--right {
  right: 14px;
}

@media (max-width: 640px) {
  .hn-sm__arrow {
    display: none;
  }
}

/* =========================================================
   FILMSTRIP THUMBNAILS
========================================================= */
.hn-sm__strip {
  margin-top: 14px;
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 10px 4px 4px;
  scroll-snap-type: x mandatory;
}

.hn-sm__strip::-webkit-scrollbar {
  height: 8px;
}
.hn-sm__strip::-webkit-scrollbar-thumb {
  background: rgba(212, 175, 55, 0.18);
  border-radius: 999px;
}

.hn-sm__thumb {
  position: relative;
  flex: 0 0 auto;
  width: 108px;
  height: 68px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(212, 175, 55, 0.18);
  background: rgba(17, 24, 39, 0.35);
  scroll-snap-align: start;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.hn-sm__thumb:hover {
  transform: translateY(-2px);
  border-color: rgba(212, 175, 55, 0.45);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.28);
}

.hn-sm__thumbImg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.02);
  filter: saturate(1.02);
}

/* subtle glow layer */
.hn-sm__thumbGlow {
  position: absolute;
  inset: 0;
  opacity: 0;
  background:
    radial-gradient(120px 60px at 50% 15%, rgba(212, 175, 55, 0.24), transparent 65%),
    linear-gradient(180deg, rgba(11, 18, 32, 0.10), rgba(11, 18, 32, 0.52));
  pointer-events: none;
  transition: opacity 180ms ease;
}

.hn-sm__thumb.is-active {
  border-color: rgba(212, 175, 55, 0.70);
  box-shadow:
    0 22px 52px rgba(0, 0, 0, 0.34),
    0 0 0 1px rgba(212, 175, 55, 0.25),
    0 0 18px rgba(212, 175, 55, 0.14);
  transform: translateY(-1px);
}

.hn-sm__thumb.is-active .hn-sm__thumbGlow {
  opacity: 1;
}

/* =========================================================
   LightGallery modal overrides (so it doesn't look default)
   - Keep it subtle, cinematic, consistent with Havana Nights
========================================================= */
.hn-sm__lg :global(.lg-backdrop) {
  background: rgba(6, 10, 18, 0.92) !important;
}

.hn-sm__lg :global(.lg-toolbar),
.hn-sm__lg :global(.lg-sub-html),
.hn-sm__lg :global(.lg-counter) {
  font-family: var(--hn-font-body, ui-sans-serif);
}

.hn-sm__lg :global(.lg-sub-html) {
  background: rgba(11, 18, 32, 0.45) !important;
  border-top: 1px solid rgba(212, 175, 55, 0.18);
  backdrop-filter: blur(14px);
}

.hn-sm__lg :global(.lg-toolbar) {
  background: rgba(11, 18, 32, 0.35) !important;
  border-bottom: 1px solid rgba(212, 175, 55, 0.14);
  backdrop-filter: blur(14px);
}

.hn-sm__lg :global(.lg-icon) {
  color: rgba(248, 241, 231, 0.9) !important;
}

.hn-sm__lg :global(.lg-icon:hover) {
  color: rgba(212, 175, 55, 0.95) !important;
}
</style>
