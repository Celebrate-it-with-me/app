<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page Header -->
    <div class="relative mb-12">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <CHeading
            :level="1"
            weight="black"
            class="text-4xl md:text-5xl text-gray-900 dark:text-white tracking-tight mb-3"
          >
            Event Dress <span class="text-rose">Code</span>
          </CHeading>
          <p class="text-gray-500 dark:text-gray-400 max-w-xl text-lg leading-relaxed">
            Define the dress code requirements for your event
          </p>
        </div>
      </div>
    </div>

    <CPageLoaderV2 v-if="loading"></CPageLoaderV2>

    <template v-else>
      <NoDressCodeView v-if="activeView === 'noDressCode'" @show-dress-code-form="handleShowForm" />

      <DressCodeFormView
        v-if="activeView === 'dressCodeForm'"
        @form-submitted="handleFormSubmitted"
        @form-cancelled="handleFormCancelled"
      />

      <ShowDressCodeView
        v-if="activeView === 'showDressCode'"
        @edit-dress-code="handleShowForm"
        @delete-dress-code="handleDeleteDressCode"
      />
    </template>
  </div>
</template>

<script setup>
import NoDressCodeView from '@/modules/dress-code/components/NoDressCodeView.vue'
import DressCodeFormView from '@/modules/dress-code/components/DressCodeFormView.vue'
import CPageLoaderV2 from '@/components/UI/loading/CPageLoaderV2.vue'
import ShowDressCodeView from '@/modules/dress-code/components/ShowDressCodeView.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import { useDressCodeView } from '@/modules/dress-code/composables/useDressCodeView'

const {
  activeView,
  loading,
  handleShowForm,
  handleFormSubmitted,
  handleFormCancelled,
  handleDeleteDressCode
} = useDressCodeView()
</script>
