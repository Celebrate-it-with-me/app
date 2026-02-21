<script setup>
// All comments in code are in English, as requested.

import CModal from '@/components/UI/modals/CModal.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CBadge from '@/components/UI/badges/CBadge.vue'
import { ArrowDown, ArrowUp, Users } from 'lucide-vue-next'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  selectedSong: { type: Object, default: null },
  getNetScore: { type: Function, required: true }
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <CModal
    :model-value="props.modelValue"
    title="Vote Details"
    size="lg"
    show-close-icon
    @update:model-value="val => emit('update:modelValue', val)"
  >
    <div v-if="props.selectedSong" class="space-y-6">
      <div class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <img
          :src="props.selectedSong.thumbnailUrl || 'https://via.placeholder.com/80'"
          alt="Album Art"
          class="w-20 h-20 rounded-lg object-cover shadow-sm"
        />
        <div class="flex-1 min-w-0">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white truncate">
            {{ props.selectedSong.title }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400 truncate">
            {{ props.selectedSong.artist }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-500 truncate">
            {{ props.selectedSong.album }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div
          class="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 text-center"
        >
          <p
            class="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1"
          >
            Up Votes
          </p>
          <p class="text-2xl font-bold text-green-700 dark:text-green-300">
            {{ props.selectedSong.votes?.up || 0 }}
          </p>
        </div>

        <div
          class="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-center"
        >
          <p
            class="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1"
          >
            Down Votes
          </p>
          <p class="text-2xl font-bold text-red-700 dark:text-red-300">
            {{ props.selectedSong.votes?.down || 0 }}
          </p>
        </div>

        <div
          class="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/30 text-center"
        >
          <p
            class="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1"
          >
            Net Score
          </p>
          <p class="text-2xl font-bold text-purple-700 dark:text-purple-300">
            {{ props.getNetScore(props.selectedSong) }}
          </p>
        </div>
      </div>

      <div>
        <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <Users class="w-4 h-4 mr-2 text-purple-500" />
          Vote Breakdown
        </h4>

        <div
          v-if="props.selectedSong.voteDetails && props.selectedSong.voteDetails.length > 0"
          class="overflow-hidden border border-gray-100 dark:border-gray-700 rounded-xl"
        >
          <div class="max-h-96 overflow-y-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Guest
                  </th>
                  <th
                    class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Vote
                  </th>
                  <th
                    class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody
                class="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800"
              >
                <tr
                  v-for="(vote, idx) in props.selectedSong.voteDetails"
                  :key="idx"
                  class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div
                        class="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold mr-3"
                      >
                        {{ vote.guestName?.charAt(0) || 'G' }}
                      </div>
                      <span class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ vote.guestName }}
                      </span>
                    </div>
                  </td>

                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <CBadge :variant="vote.type === 'UP' ? 'success' : 'error'" size="sm">
                      <component
                        :is="vote.type === 'UP' ? ArrowUp : ArrowDown"
                        class="w-3 h-3 mr-1"
                      />
                      {{ vote.type }}
                    </CBadge>
                  </td>

                  <td
                    class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400"
                  >
                    {{ vote.date }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div
          v-else
          class="text-center py-10 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700"
        >
          <Users class="w-10 h-10 mx-auto mb-2 text-gray-400 opacity-50" />
          <p class="text-gray-500 dark:text-gray-400">No votes recorded yet for this song.</p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end w-full">
        <CButton variant="outline" @click="emit('update:modelValue', false)">Close</CButton>
      </div>
    </template>
  </CModal>
</template>
