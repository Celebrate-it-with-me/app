<script setup>
import ImageUpload from '@/components/authenticated/sweet-memories/ImageUpload.vue'

const handleFilesSelected = (files) => {
  // Handle the selected files
  console.log('Selected files:', files)
}

const handleFileRemoved = (file) => {
  // Handle removed file
  console.log('Removed file:', file)
}


</script>

<template>
  <div
    class="w-[70%] rounded-lg p-4 border-4 border-gray-900 dark:border-gray-800 flex flex-col
          items-center"
  >
    <ImageUpload
      :max-file-size="5 * 1024 * 1024"
      :max-files="5"
      @files-selected="handleFilesSelected"
      @file-removed="handleFileRemoved"
    />
  </div>
</template>

<style scoped>

</style>
