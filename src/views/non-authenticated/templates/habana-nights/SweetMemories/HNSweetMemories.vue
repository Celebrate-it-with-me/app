<script setup>
import { computed } from 'vue'
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'
import { useSweetMemoriesStore } from '@/stores/useSweetMemoriesStore'
import HNSweetMemoriesGallery
  from '@/views/non-authenticated/templates/habana-nights/SweetMemories/HNSweetMemoriesGallery.vue'

const props = defineProps({
  mode: {
    type: String,
    default: 'create'
  }
})

const templateStore = useTemplateStore()
const sweetMemoriesStore = useSweetMemoriesStore()

const sweetMemoriesImages = computed(() => {
  if (props.mode === 'create') {
    return formatImages(sweetMemoriesStore.memoriesImages ?? [])
  }

  return formatImages(templateStore.event?.sweetMemoriesImages ?? [])
})

// Methods

const formatImages = images => {
  console.log(images)
  return images.map((memory, index) => {
    return {
      image: props.mode === 'create' ? memory.url : memory.imagePath,
      thumb: props.mode === 'create' ? memory.url : memory.imagePath,
      title:
        props.mode === 'create'
          ? memory.name || `Sweet Memory ${index + 1}`
          : memory.imageOriginalName || `Sweet Memory ${index + 1}`,
      subHtml:
        props.mode === 'create'
          ? `<h4>${memory.name}</h4>` || `<h4>Sweet Memory ${index + 1}</h4>`
          : `<h4>${memory.imageOriginalName}</h4>` || `<h4>Sweet Memory ${index + 1}</h4>`,
      alt:
        props.mode === 'create'
          ? memory.name || `Sweet Memory ${index + 1}`
          : memory.imageOriginalName || `Sweet Memory ${index + 1}`
    }
  })
}
</script>

<template>
  <section
    id="sectionSweetMemories"
    class="min-h-screen w-full py-16 px-4 md:px-8 lg:px-20 flex flex-col items-center justify-center gap-12 bg-gradient-to-br from-red-800/15 via-white to-blue-800/15"
  >
    <div class="w-full max-w-4xl mx-auto space-y-6 text-center">
      <div class="overflow-visible">
        <h2
          class="font-gvibes text-4xl md:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-l from-blue-800 to-red-800 font-bold transition-all duration-300 ease-in-out hover:scale-105 leading-[1.2] py-2 relative top-[2px]"
        >
          Sweet Memories
        </h2>
        <div
          class="h-[2px] w-24 mx-auto bg-gradient-to-l from-blue-800 to-red-800 opacity-60 mt-4"
        ></div>
      </div>

      <div class="relative">
        <h4 class="text-xl md:text-2xl text-gray-700 font-normal">
          Momentos especiales que guardaremos para siempre
        </h4>
      </div>
    </div>

    <div v-if="sweetMemoriesImages.length > 0" class="w-full max-w-7xl mx-auto mt-8">
      <HNSweetMemoriesGallery :memories="sweetMemoriesImages" class="fade-in-up" />
    </div>
    <div v-else class="text-center py-12">
      <p class="text-gray-500 text-lg">Aún no hay recuerdos para mostrar. ❤️</p>
    </div>
  </section>
</template>

<style scoped></style>
