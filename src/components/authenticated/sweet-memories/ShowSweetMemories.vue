<script setup>
import ImageUpload from '@/components/authenticated/sweet-memories/ImageUpload.vue'
import { useSweetMemoriesStore } from '@/stores/useSweetMemoriesStore'
import { useUserStore } from '@/stores/useUserStore'
import { onMounted, ref } from 'vue'

const sweetMemoriesStore = useSweetMemoriesStore()
const currentUserStore = useUserStore()

onMounted(() => {
  loadSweetMemoriesEventImages()
})

// Methods
const handleFilesSelected = (files) => {
  console.log('Selected files:', files)
}

const handleFileRemoved = async (file) => {
  if (file?.id && Number.isInteger(file.id)) {
    await removeImage(file.id)
  }
}

const removeImage = async (fileId) => {
  // Handle the remove image
  try {
    const response = await sweetMemoriesStore.removeSweetMemoriesImage(
      currentUserStore.currentEventId,
      fileId
    )

    if (response.status >= 200 && response.status < 300) {
      await loadSweetMemoriesEventImages()
    } else {
      console.error('Error removing image:', response)
    }
  } catch (error) {
    console.error('Error removing image:', error)
  }
}

const handleUploadImages = async (files) => {
  try {
    const response = await sweetMemoriesStore.uploadSweetMemoriesImages(
      files,
      currentUserStore.currentEventId
    )

    if (response.status >= 200 && response.status < 300) {
      await loadSweetMemoriesEventImages()
    } else {
      console.error('Error uploading images:', response)
    }
  } catch (error) {
    console.error('Error uploading images:', error)
  }
}

const loadSweetMemoriesEventImages = async () => {
  const result = await sweetMemoriesStore.loadSweetMemoriesImages(currentUserStore.currentEventId)
  if (!result.status) {
    console.error('Error loading sweet memories images:', result)
  }
}

const handleUpdateImages = async (files) => {
  // Handle the update images
  try {
    const response = await sweetMemoriesStore.updateSweetMemoriesImages(
      currentUserStore.currentEventId,
      files
    )

    if (response.status >= 200 && response.status < 300) {
      await loadSweetMemoriesEventImages()
    } else {
      console.error('Error updating images:', response)
    }
  } catch (error) {
    console.error('Error updating images:', error)
  }
}
</script>

<template>
  <div
    class="w-[70%] rounded-lg p-4 border-4 border-gray-900 dark:border-gray-800 flex flex-col items-center"
  >
    <ImageUpload
      :max-file-size="5 * 1024 * 1024"
      :max-files="sweetMemoriesStore?.config?.maxPictures ?? 2"
      :initial-files="sweetMemoriesStore?.memoriesImages ?? []"
      :mode="sweetMemoriesStore.mode"
      @files-selected="handleFilesSelected"
      @file-removed="handleFileRemoved"
      @upload-images="handleUploadImages"
      @update-images="handleUpdateImages"
    />
  </div>
</template>

<style scoped></style>
