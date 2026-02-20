<script setup>
import CInput from '@/components/UI/form2/CInput.vue'
import CTextarea from '@/components/UI/form2/CTextarea.vue'
import CToggle from '@/components/UI/form2/CToggle.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CCard from '@/components/UI/cards/CCard.vue'
import CAlert from '@/components/UI/alerts/CAlert.vue'
import CConfirmModal from '@/components/UI/modals/CConfirmModal.vue'
import { useMenuFormController } from '@/modules/menus/composables/useMenuFormController'

const { sending, mode, showDeleteMenuModal, menuState, onSubmit, handleDeleteMenu } =
  useMenuFormController()
</script>

<template>
  <CCard shadow="xl" class="overflow-hidden border-0 bg-white/50 backdrop-blur-sm">
    <form class="space-y-6" @submit.prevent="onSubmit">
      <div class="grid grid-cols-1 md:grid-cols-1 gap-6">
        <CInput
          id="menu_title"
          v-model="menuState.title"
          name="title"
          label="Menu Title"
          placeholder="e.g. Reception Dinner"
        />
      </div>

      <CTextarea
        id="menu_description"
        v-model="menuState.description"
        name="description"
        label="Menu Description"
        placeholder="Optional description for this menu..."
      />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-2xl">
        <CToggle
          v-model="menuState.allow_custom_request"
          name="allow_custom_request"
          label="Allow Custom Requests"
        />

        <CToggle
          v-model="menuState.allow_multiple_choices"
          name="allow_multiple_choices"
          label="Allow Multiple Choices"
        />
      </div>

      <div class="bg-rose/5 p-6 rounded-2xl border border-rose/10">
        <CToggle v-model="menuState.main_menu" name="main_menu" label="Is Main Menu" />
      </div>

      <div class="pt-4 flex justify-end">
        <CButton
          type="submit"
          variant="gradient"
          class="bg-gradient-to-r from-rose to-rose-dark text-white px-10 h-12 rounded-xl"
          :disabled="sending"
        >
          <span v-if="mode === 'create'"> Create Menu </span>
          <span v-if="mode === 'edit'"> Update Menu </span>
        </CButton>
      </div>
    </form>
  </CCard>

  <CCard v-if="mode === 'edit'" class="mt-8 border-rose/20 bg-rose/5">
    <CAlert variant="warning" class="bg-transparent border-0 p-0">
      <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-rose/10 flex items-center justify-center">
            <span class="text-rose text-lg">⚠️</span>
          </div>
          <div>
            <p class="font-bold text-rose-dark">Danger Zone</p>
            <p class="text-sm text-rose/80">Delete action is irreversible, please be careful.</p>
          </div>
        </div>
        <CButton variant="danger" class="w-full sm:w-auto px-6" @click="showDeleteMenuModal = true">
          Delete Menu
        </CButton>
      </div>
    </CAlert>
  </CCard>

  <CConfirmModal
    v-model="showDeleteMenuModal"
    :message="'Are you sure you want to delete this menu? All items and guest selections will be lost.'"
    show-close-icon
    show-footer
    @confirm="handleDeleteMenu"
  />
</template>
