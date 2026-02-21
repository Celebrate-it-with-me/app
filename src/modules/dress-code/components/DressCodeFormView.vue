<script setup>
import { FileText, Image, Palette, Shirt, Sparkles } from 'lucide-vue-next'
import CSimpleColor from '@/components/UI/form2/CSimpleColor.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CSelect from '@/components/UI/form2/CSelect.vue'
import CTextarea from '@/components/UI/form2/CTextarea.vue'
import CImageUpload from '@/components/UI/form2/CImageUpload.vue'
import { Form } from 'vee-validate'
import { useDressCodeForm } from '@/modules/dress-code/composables/useDressCodeForm'

const emit = defineEmits(['formSubmitted', 'formCancelled'])

const {
  form,
  sending,
  validationSchema,
  descriptionLength,
  descriptionMaxLength,
  dressCodeOptions,
  isEditMode,
  handleSubmit,
  onInvalidSubmit
} = useDressCodeForm(emit)
</script>

<template>
  <div class="space-y-6">
    <!-- Form Header -->
    <div
      class="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800"
    >
      <div
        class="relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 px-8 py-10 lg:px-12"
      >
        <div class="flex items-start gap-4">
          <div
            class="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25"
          >
            <Sparkles class="w-7 h-7 text-white" stroke-width="2.5" />
          </div>
          <div class="flex-1">
            <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {{ isEditMode ? 'Edit Dress Code' : 'Create Dress Code' }}
            </h2>
            <p class="text-lg text-gray-600 dark:text-gray-400">
              Define the attire guidelines for your special event
            </p>
          </div>
        </div>
      </div>

      <!-- Form Content -->
      <div class="p-8 lg:p-12">
        <Form
          :validation-schema="validationSchema"
          @submit="handleSubmit"
          @invalid-submit="onInvalidSubmit"
        >
          <div class="space-y-8">
            <!-- Dress Code Type & Reserved Colors Row -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Dress Code Type -->
              <div class="space-y-3">
                <label
                  class="flex items-center gap-3 text-base font-semibold text-gray-900 dark:text-white"
                >
                  <div
                    class="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center"
                  >
                    <Shirt class="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span>Dress Code Type</span>
                  <span class="text-red-500">*</span>
                </label>
                <CSelect
                  id="dressCodeType"
                  v-model="form.dressCodeType"
                  :options="dressCodeOptions"
                  placeholder="Select dress code type"
                  class="w-full"
                  name="dressCodeType"
                  description=""
                  label=""
                />
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Choose the formality level for your event
                </p>
              </div>

              <!-- Reserved Colors -->
              <div class="space-y-3">
                <label
                  class="flex items-center gap-3 text-base font-semibold text-gray-900 dark:text-white"
                >
                  <div
                    class="w-8 h-8 bg-pink-100 dark:bg-pink-900/20 rounded-lg flex items-center justify-center"
                  >
                    <Palette class="w-4 h-4 text-pink-600 dark:text-pink-400" />
                  </div>
                  <span>Reserved Colors</span>
                  <span class="text-red-500">*</span>
                </label>
                <CSimpleColor
                  id="reservedColors"
                  v-model="form.reservedColors"
                  name="reservedColors"
                  class="w-full"
                />
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Colors reserved for the quinceañera and her court
                </p>
              </div>
            </div>

            <!-- Description -->
            <div class="space-y-3">
              <label
                class="flex items-center gap-3 text-base font-semibold text-gray-900 dark:text-white"
              >
                <div
                  class="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center"
                >
                  <FileText class="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span>Description</span>
              </label>
              <div class="relative">
                <CTextarea
                  id="description"
                  v-model="form.description"
                  :rows="5"
                  placeholder="Provide detailed information about the dress code requirements. For example: 'Formal attire is requested. Ladies may wear elegant cocktail dresses or gowns. Gentlemen should wear suits or tuxedos.'"
                  class="w-full"
                  name="description"
                  description=""
                  label=""
                />
                <div
                  class="absolute bottom-3 right-3 text-xs font-medium"
                  :class="
                    descriptionLength > descriptionMaxLength ? 'text-red-500' : 'text-gray-400'
                  "
                >
                  {{ descriptionLength }} / {{ descriptionMaxLength }}
                </div>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Help your guests understand what to wear
              </p>
            </div>

            <!-- Reference Images -->
            <div class="space-y-3">
              <label
                class="flex items-center gap-3 text-base font-semibold text-gray-900 dark:text-white"
              >
                <div
                  class="w-8 h-8 bg-pink-100 dark:bg-pink-900/20 rounded-lg flex items-center justify-center"
                >
                  <Image class="w-4 h-4 text-pink-600 dark:text-pink-400" />
                </div>
                <span>Reference Images</span>
                <span class="text-xs font-normal text-gray-500 dark:text-gray-400">(Optional)</span>
              </label>
              <div
                class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6"
              >
                <CImageUpload
                  id="dressCodeImages"
                  v-model="form.dressCodeImages"
                  name="dressCodeImages"
                />
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Add example images to inspire your guests' attire choices
              </p>
            </div>
          </div>

          <!-- Actions Footer -->
          <div class="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div class="flex flex-col sm:flex-row justify-end gap-3">
              <CButton
                variant="outline"
                type="button"
                class="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 px-8 py-3 rounded-xl transition-all hover:-translate-y-0.5 shadow-sm order-2 sm:order-1"
                @click="emit('formCancelled')"
              >
                Cancel
              </CButton>
              <CButton
                variant="primary"
                type="submit"
                :disabled="sending"
                class="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
              >
                <svg
                  v-if="sending"
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {{ sending ? 'Saving...' : isEditMode ? 'Update Dress Code' : 'Save Dress Code' }}
              </CButton>
            </div>
          </div>
        </Form>
      </div>
    </div>

    <!-- Helper Tips Card (Optional Enhancement) -->
    <div
      class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-2xl p-6 border border-purple-100 dark:border-purple-900/20"
    >
      <div class="flex items-start gap-4">
        <div
          class="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="text-purple-600 dark:text-purple-400"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </div>
        <div class="flex-1">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Dress Code Tips</h4>
          <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Be specific about the level of formality</li>
            <li>• Include color restrictions if any</li>
            <li>• Consider the venue and time of day</li>
            <li>• Add reference images for visual clarity</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional custom styles if needed */
</style>
