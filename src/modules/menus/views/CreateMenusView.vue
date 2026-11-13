<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiPageHeader, UiCard, UiButton, UiField, UiInput, UiTextarea, UiSwitch, UiModal, UiSkeleton } from '@/ui'
import { useMenuFormController } from '@/modules/menus/composables/useMenuFormController'

const { t } = useI18n()
const { sending, loading, deleting, mode, showDeleteMenuModal, menuState, errors, onSubmit, handleDeleteMenu } = useMenuFormController()
const title = computed(() => (mode.value === 'edit' ? t('app.menus.editTitle') : t('app.menus.createTitle')))
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <UiPageHeader :title="title" :subtitle="t('app.menus.formSubtitle')" back="/dashboard/menus" />

    <div v-if="loading" class="mt-6 space-y-3">
      <UiSkeleton class="h-14" />
      <UiSkeleton class="h-28" />
      <UiSkeleton class="h-14" />
    </div>

    <template v-else>
      <UiCard class="mt-6">
        <form id="menu-form" class="space-y-5" novalidate @submit.prevent="onSubmit">
          <UiField :label="t('app.menus.fieldTitle')" :error="errors.title" required>
            <template #default="{ id, invalid }">
              <UiInput :id="id" v-model="menuState.title" :invalid="invalid" :placeholder="t('app.menus.fieldTitlePlaceholder')" autocomplete="off" />
            </template>
          </UiField>

          <UiField :label="t('app.menus.fieldDescription')" :error="errors.description">
            <template #default="{ id, invalid }">
              <UiTextarea :id="id" v-model="menuState.description" :invalid="invalid" :rows="3" :placeholder="t('app.menus.fieldDescriptionPlaceholder')" />
            </template>
          </UiField>

          <div class="space-y-4 border-t border-line pt-5">
            <UiSwitch v-model="menuState.allow_custom_request" :label="t('app.menus.allowCustom')" :description="t('app.menus.allowCustomHint')" />
            <UiSwitch v-model="menuState.allow_multiple_choices" :label="t('app.menus.allowMultiple')" :description="t('app.menus.allowMultipleHint')" />
            <UiSwitch v-model="menuState.main_menu" :label="t('app.menus.isMain')" :description="t('app.menus.isMainHint')" />
          </div>

          <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <UiButton variant="secondary" to="/dashboard/menus">{{ t('app.menus.cancel') }}</UiButton>
            <UiButton type="submit" :loading="sending">{{ mode === 'edit' ? t('app.menus.update') : t('app.menus.create') }}</UiButton>
          </div>
        </form>
      </UiCard>

      <UiCard v-if="mode === 'edit'" class="mt-6" :title="t('app.menus.dangerTitle')" :subtitle="t('app.menus.dangerText')" heading-level="h2">
        <UiButton variant="danger" class="mt-3" @click="showDeleteMenuModal = true">{{ t('app.menus.deleteMenu') }}</UiButton>
      </UiCard>
    </template>

    <UiModal v-model:open="showDeleteMenuModal" :title="t('app.menus.deleteTitle')" :description="t('app.menus.deleteText')" size="sm">
      <template #footer>
        <UiButton variant="secondary" @click="showDeleteMenuModal = false">{{ t('app.menus.cancel') }}</UiButton>
        <UiButton variant="danger" :loading="deleting" @click="handleDeleteMenu">{{ t('app.menus.delete') }}</UiButton>
      </template>
    </UiModal>
  </div>
</template>
