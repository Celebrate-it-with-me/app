<script setup>
import ImageUpload from '@/components/authenticated/sweet-memories/ImageUpload.vue'
import { useSweetMemoriesStore } from '@/stores/useSweetMemoriesStore'
import { useUserStore } from '@/stores/useUserStore'

const sweetMemoriesStore = useSweetMemoriesStore()
const currentUserStore = useUserStore()

// Mr
const handleFilesSelected = (files) => {
  // Handle the selected files
  console.log('Selected files:', files)
}

const handleFileRemoved = (file) => {
  // Handle removed file
  console.log('Removed file:', file)
}

const handleUploadImages = async (files) => {
  // Handle the upload images
  console.log('Upload images:', files)
  try {

    const response = await sweetMemoriesStore.uploadSweetMemoriesImages(
      files,
      currentUserStore.currentEventId
    )

    if (response.status >= 200 && response.status < 300) {
      console.log('Images uploaded successfully:', response.data)
    } else {
      console.error('Error uploading images:', response)
    }

  } catch (error) {
    console.error('Error uploading images:', error)
  }
}


</script>

<template>
  <div
    class="w-[70%] rounded-lg p-4 border-4 border-gray-900 dark:border-gray-800 flex flex-col
          items-center"
  >
    <ImageUpload
      :max-file-size="5 * 1024 * 1024"
      :max-files="sweetMemoriesStore?.config?.maxPictures ?? 2"
      @files-selected="handleFilesSelected"
      @file-removed="handleFileRemoved"
      @upload-images="handleUploadImages"
    />
  </div>
</template>

<style scoped>

</style>
