<template>
  <section class="relative w-full px-4 py-10">
    <!-- Cinematic background layers -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <!-- Deep base -->
      <div class="absolute inset-0 bg-[#070D18]" />

      <!-- Gold glow (top/center) -->
      <div
        class="absolute -top-24 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full blur-3xl opacity-40"
        style="
          background: radial-gradient(
            circle at center,
            rgba(230, 196, 138, 0.35),
            rgba(230, 196, 138, 0) 62%
          );
        "
      />

      <!-- Warm red glow (lower/right) -->
      <div
        class="absolute -bottom-40 right-[-160px] h-[520px] w-[520px] rounded-full blur-3xl opacity-30"
        style="
          background: radial-gradient(
            circle at center,
            rgba(220, 38, 38, 0.22),
            rgba(220, 38, 38, 0) 62%
          );
        "
      />

      <!-- Subtle vignette -->
      <div
        class="absolute inset-0"
        style="
          background: radial-gradient(
            circle at center,
            rgba(0, 0, 0, 0) 35%,
            rgba(0, 0, 0, 0.7) 100%
          );
        "
      />
    </div>

    <div class="relative w-full max-w-5xl mx-auto space-y-6">
      <!-- Editorial header -->
      <header class="text-center space-y-2">
        <div class="inline-flex items-center justify-center gap-2">
          <span
            class="h-[1px] w-10 md:w-16 opacity-50"
            style="
              background: linear-gradient(
                90deg,
                rgba(230, 196, 138, 0),
                rgba(230, 196, 138, 0.7),
                rgba(230, 196, 138, 0)
              );
            "
          />
          <p
            class="text-[11px] md:text-xs tracking-[0.35em] uppercase text-white/60 font-montserrat"
          >
            The Arrival
          </p>
          <span
            class="h-[1px] w-10 md:w-16 opacity-50"
            style="
              background: linear-gradient(
                90deg,
                rgba(230, 196, 138, 0),
                rgba(230, 196, 138, 0.7),
                rgba(230, 196, 138, 0)
              );
            "
          />
        </div>

        <h2
          class="text-4xl md:text-6xl font-cinzel font-semibold tracking-wide text-[#E6C48A]"
          style="text-shadow: 0 0 26px rgba(230, 196, 138, 0.18)"
        >
          Event Location
        </h2>

        <p class="mt-2 text-sm md:text-base text-white/65 font-montserrat">
          {{ locationName }}
        </p>
      </header>

      <!-- Glass card -->
      <div
        class="relative rounded-3xl overflow-hidden border border-white/10 backdrop-blur-xl"
        style="
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.55),
            0 0 40px rgba(230, 196, 138, 0.08);
        "
      >
        <!-- Top media: Carousel or elegant placeholder -->
        <div class="relative">
          <div v-if="images.length" class="relative">
            <!-- Premium frame -->
            <div class="absolute inset-0 pointer-events-none">
              <div
                class="absolute inset-0"
                style="
                  background: linear-gradient(180deg, rgba(7, 13, 24, 0.15), rgba(7, 13, 24, 0.85));
                "
              />
              <div
                class="absolute inset-x-0 top-0 h-10"
                style="
                  background: linear-gradient(
                    180deg,
                    rgba(230, 196, 138, 0.18),
                    rgba(230, 196, 138, 0)
                  );
                "
              />
            </div>

            <CCarousel
              :images="imagesUrl"
              width="w-full"
              height="h-[260px] md:h-[340px]"
              :autoplay="true"
              :show-dots="false"
              :show-arrows="true"
              transition-effect="slide"
            />
          </div>

          <div
            v-else
            class="h-[220px] md:h-[300px] flex items-center justify-center text-center px-6"
          >
            <div class="max-w-md space-y-2">
              <p class="text-[#E6C48A] font-cinzel text-xl md:text-2xl">A night to remember</p>
              <p class="text-white/60 text-sm md:text-base font-montserrat">
                Location visuals will appear here once available.
              </p>
            </div>
          </div>

          <!-- Subtle divider line -->
          <div
            class="absolute bottom-0 left-6 right-6 h-[1px] opacity-60"
            style="
              background: linear-gradient(
                90deg,
                rgba(230, 196, 138, 0),
                rgba(230, 196, 138, 0.65),
                rgba(230, 196, 138, 0)
              );
            "
          />
        </div>

        <!-- Content -->
        <div class="p-6 md:p-8 space-y-6">
          <!-- Address block -->
          <div class="space-y-2 text-center md:text-left">
            <p class="text-white/85 text-base md:text-lg font-montserrat leading-relaxed">
              {{ fullAddress }}
            </p>

            <p class="text-white/55 text-xs md:text-sm font-montserrat tracking-wide uppercase">
              Doors open soon
            </p>
          </div>

          <!-- CTA -->
          <div class="flex justify-center md:justify-start">
            <a
              :href="googleMapsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="group inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-montserrat text-sm md:text-base border border-[#C9A14A]/70 text-[#E6C48A] bg-white/0 hover:bg-[#C9A14A]/10 transition shadow-[0_0_0_rgba(230,196,138,0)] hover:shadow-[0_0_26px_rgba(230,196,138,0.22)]"
            >
              <span class="tracking-wide">Open in Google Maps</span>
              <span
                class="h-1.5 w-1.5 rounded-full bg-[#E6C48A]/80 opacity-70 group-hover:opacity-100 transition"
              />
            </a>
          </div>

          <!-- Map preview (cinematic frame) -->
          <div class="relative rounded-2xl overflow-hidden border border-white/10">
            <div v-if="hasCoordinates" class="relative">
              <CMapPreview :lat="lat" :lng="lng" class="w-full h-[260px] md:h-[320px]" />

              <!-- Map overlays to match cinematic style -->
              <div class="pointer-events-none absolute inset-0">
                <div
                  class="absolute inset-0"
                  style="
                    background: linear-gradient(
                      180deg,
                      rgba(7, 13, 24, 0.25),
                      rgba(7, 13, 24, 0.65)
                    );
                  "
                />
                <div
                  class="absolute -top-24 left-1/2 h-48 w-[520px] -translate-x-1/2 rounded-full blur-3xl opacity-25"
                  style="
                    background: radial-gradient(
                      circle at center,
                      rgba(230, 196, 138, 0.28),
                      rgba(230, 196, 138, 0) 65%
                    );
                  "
                />
              </div>
            </div>

            <div
              v-else
              class="h-[220px] md:h-[280px] flex items-center justify-center text-center px-6"
            >
              <div class="max-w-md space-y-2">
                <p class="text-white/80 font-cinzel text-lg md:text-xl">Map preview unavailable</p>
                <p class="text-white/55 text-sm font-montserrat">
                  Coordinates are missing for this location.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Outer subtle glow edge -->
        <div class="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import CCarousel from '@/components/UI/carousel/CCarousel.vue'
import CMapPreview from '@/components/UI/google/CMapPreview.vue'
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'

const templateStore = useTemplateStore()

const location = computed(() => {
  return templateStore.event?.eventLocations ?? {}
})

const images = computed(() => {
  return templateStore.event?.eventLocations?.images ?? []
})

const imagesUrl = computed(() => {
  return images.value.map(image => image.path)
})

const locationName = computed(() => {
  return location.value?.name || 'A curated destination'
})

const fullAddress = computed(() => {
  const parts = [
    location.value?.address,
    location.value?.city,
    location.value?.state,
    location.value?.zipCode,
    location.value?.country
  ].filter(Boolean)

  return parts.length ? parts.join(', ') : 'Address details coming soon.'
})

const lat = computed(() => Number(location.value?.latitude))
const lng = computed(() => Number(location.value?.longitude))

const hasCoordinates = computed(() => Number.isFinite(lat.value) && Number.isFinite(lng.value))

const googleMapsUrl = computed(() => {
  const name = location.value?.name || ''
  const address = location.value?.address || ''
  const city = location.value?.city || ''
  const state = location.value?.state || ''
  const zip = location.value?.zipCode || ''
  const country = location.value?.country || ''

  const query = [name, address, city, state, zip, country].filter(Boolean).join(' ')
  const q = encodeURIComponent(query || name)

  return `https://www.google.com/maps/search/?api=1&query=${q}`
})
</script>
