<script setup>
import { computed } from 'vue'
import { useTemplateStore } from '@/stores/useTemplateStore'
import OVSweetMemoriesGallery from '@/views/non-authenticated/templates/ocean-vibe/SweetMemories/OVSweetMemoriesGallery.vue'

defineProps({
  mode: {
    type: String,
    default: 'create'
  }
})

const templateStore = useTemplateStore()

const sweetMemoriesImages = computed(() => {
  return formatImages(templateStore.event?.sweetMemoriesImages ?? [])
})

// Methods

const formatImages = images => {
  return images.map((memory, index) => {
    return {
      image: memory.imagePath || '',
      thumb: memory.imagePath || '',
      title: memory.title || '',
      subHtml: `<h4>${memory.title || ''}</h4>`,
      alt: memory.title || `Sweet Memory ${index + 1}`,
      year: memory.year || ''
    }
  })
}
</script>

<template>
  <section
    id="sectionSweetMemories"
    class="min-h-screen w-full py-12 md:py-16 px-4 md:px-8 lg:px-20 flex flex-col items-center justify-center gap-12 bg-gradient-to-b from-[#F5FBFF] via-[#E6F4FA] to-[#DCEFF7]"
  >
    <div class="w-full max-w-4xl mx-auto space-y-4 text-center">
      <div class="overflow-visible">
        <h2
          class="font-gvibes text-5xl md:text-6xl lg:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-[#123B5A] via-[#2F6F8F] to-[#7FB9C9] font-bold transition-all duration-300 ease-in-out hover:scale-105 drop-shadow-[0_6px_18px_rgba(18,59,90,0.18)] py-2"
        >
          Sweet Memories
        </h2>
      </div>

      <div class="relative">
        <h4 class="text-lg md:text-xl text-[#4B6775] font-normal tracking-wide">
          Momentos especiales que han marcado su historia.
        </h4>
      </div>
    </div>

    <div v-if="sweetMemoriesImages.length > 0" class="w-full max-w-7xl mx-auto mt-8">
      <OVSweetMemoriesGallery :memories="sweetMemoriesImages" class="fade-in-up" />
    </div>
    <div
      v-else
      class="w-full max-w-2xl mx-auto py-10 px-8 rounded-3xl bg-white/70 backdrop-blur-md shadow-[0_18px_60px_rgba(18,59,90,0.14)] border border-[#CFE3EA] text-center"
    >
      <h3 class="text-xl md:text-2xl text-[#123B5A] font-medium mb-2">
        Aún no hay recuerdos publicados
      </h3>
      <p class="text-[#4B6775] leading-relaxed">
        Aquí iremos compartiendo fotos de momentos especiales de su vida.
      </p>
    </div>
  </section>
</template>

<style scoped></style>
