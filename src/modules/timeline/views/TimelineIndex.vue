<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Event Timeline</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Define the timeline for your event by adding activities with start and end times
        </p>
      </div>
      <div v-if="timelines.length > 0">
        <CButton variant="gradient" @click="openCreateModal">
          <PlusCircle class="w-4 h-4 mr-2" />
          Add Timeline Item
        </CButton>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading && timelines.length === 0" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- Empty state -->
    <TimelineEmptyState v-else-if="timelines.length === 0" @add="openCreateModal" />

    <!-- Timeline items list -->
    <div v-else class="relative">
      <!-- Timeline vertical line -->
      <div
        class="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 -ml-0.5 hidden md:block"
      ></div>

      <!-- Timeline items -->
      <div class="space-y-8">
        <div v-for="(item, index) in timelines" :key="item.id" class="relative">
          <!-- Timeline dot for desktop -->
          <div
            class="absolute left-1/2 top-6 w-4 h-4 rounded-full bg-primary -ml-2 hidden md:block"
          ></div>

          <!-- Timeline item card -->
          <div
            class="md:w-5/12 transition-all duration-300"
            :class="[index % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto']"
          >
            <TimelineCard :item="item" @edit="openEditModal" @delete="confirmDelete" />
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <CModal v-model="isModalOpen" :show-footer="false">
      <template #title>
        {{ isEditing ? 'Edit Timeline Item' : 'Add Timeline Item' }}
      </template>
      <TimelineForm
        v-model="currentTimeline"
        :is-editing="isEditing"
        :loading="loading"
        @submit="saveTimeline"
        @cancel="isModalOpen = false"
      />
    </CModal>

    <!-- Delete Confirmation Modal -->
    <CConfirmModal
      v-model="isDeleteConfirmOpen"
      title="Delete Timeline Item"
      message="Are you sure you want to delete this activity? This action cannot be undone."
      confirm-text="Delete"
      confirm-variant="danger"
      :loading="loading"
      @confirm="deleteTimeline"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { PlusCircle } from 'lucide-vue-next'
import { useTimeline } from '../composables/useTimeline'
import TimelineCard from '../components/TimelineCard.vue'
import TimelineForm from '../components/TimelineForm.vue'
import TimelineEmptyState from '../components/TimelineEmptyState.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CModal from '@/components/UI/modals/CModal.vue'
import CConfirmModal from '@/components/UI/modals/CConfirmModal.vue'

const {
  timelines,
  loading,
  isModalOpen,
  isEditing,
  currentTimeline,
  isDeleteConfirmOpen,
  fetchTimelines,
  openCreateModal,
  openEditModal,
  saveTimeline,
  confirmDelete,
  deleteTimeline
} = useTimeline()

onMounted(async () => {
  await fetchTimelines()
})
</script>
