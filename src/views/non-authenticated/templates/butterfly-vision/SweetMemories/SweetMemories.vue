<script setup>
import { computed } from 'vue'
import SweetMemoriesGallery from '@/views/non-authenticated/templates/butterfly-vision/SweetMemories/SweetMemoriesGallery.vue'
import { useTemplateStore } from '@/stores/useTemplateStore'
import { useSweetMemoriesStore } from '@/stores/useSweetMemoriesStore'

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
    console.log('Create mode - sweetMemoriesStore.memoriesImages:', sweetMemoriesStore.memoriesImages);
    return formatImages(sweetMemoriesStore.memoriesImages ?? [])
  }

  console.log('View mode - templateStore.event?.sweetMemoriesImages:', templateStore.event?.sweetMemoriesImages);
  return formatImages(templateStore.event?.sweetMemoriesImages ?? [])
})

const sweetMemoriesConfig = computed(() => {
  if (props.mode === 'create') {
    return sweetMemoriesStore?.config ?? {};
  }

  return templateStore.event?.sweetMemoriesConfig ?? {}
})

const generalStyles = computed(() => {
  let styles = {}
  styles.backgroundColor = sweetMemoriesConfig.value.backgroundColor ?? ''

  return styles
})

// Methods

const formatImages = (images) => {
  console.log('Formatting images:', images)
  return images.map((memory, index) => {
    // Create mode properties
    let image, thumb, title, subHtml, alt;

    if (props.mode === 'create') {
      image = memory.url;
      thumb = memory.url;
      title = memory.name || `Sweet Memory ${index + 1}`;
      subHtml = memory.name ? `<h4>${memory.name}</h4>` : `<h4>Sweet Memory ${index + 1}</h4>`;
      alt = memory.name || `Sweet Memory ${index + 1}`;
    } else {
      // View mode properties
      image = memory.imagePath;
      thumb = memory.imagePath;
      title = memory.imageOriginalName || `Sweet Memory ${index + 1}`;
      subHtml = memory.imageOriginalName ? `<h4>${memory.imageOriginalName}</h4>` : `<h4>Sweet Memory ${index + 1}</h4>`;
      alt = memory.imageOriginalName || `Sweet Memory ${index + 1}`;
    }

    console.log('Formatted image:', { image, thumb, title, subHtml, alt });

    return {
      image,
      thumb,
      title,
      subHtml,
      alt
    }
  })
}

</script>

<template>
  <section
    id="sectionSweetMemories"
    :style="generalStyles"
    class="min-h-screen w-full py-16 px-4 md:px-8 lg:px-20 flex flex-col items-center justify-center gap-12 bg-opacity-90"
  >
    <div class="w-full max-w-4xl mx-auto space-y-6">
      <h2
        v-if="sweetMemoriesConfig.title"
        class="font-gvibes text-5xl md:text-5xl lg:text-6xl text-purple-middle text-center font-bold transition-all duration-300 ease-in-out hover:scale-105"
      >
        {{ sweetMemoriesConfig.title }}
      </h2>

      <div class="relative">
        <h4
          v-if="sweetMemoriesConfig.subTitle"
          class="text-xl md:text-2xl text-dark-blue text-center font-quicksand font-semibold relative pb-8
                 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2
                 after:w-32 md:after:w-48 after:h-px after:bg-amber-200 before:content-[''] before:absolute
                 before:bottom-3 before:left-1/2 before:-translate-x-1/2 before:w-24 md:before:w-36
                 before:h-px before:bg-amber-200"
        >
          {{ sweetMemoriesConfig.subTitle }}
        </h4>
      </div>
    </div>

    <div class="w-full max-w-7xl mx-auto mt-8">
      <SweetMemoriesGallery
        :memories="sweetMemoriesImages"
        class="fade-in-up"
      />
    </div>
  </section>
</template>

<style scoped>
</style>
