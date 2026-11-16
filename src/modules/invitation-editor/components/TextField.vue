<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiInput, UiTabs, UiTextarea } from '@/ui'
import { LOCALES, maxFor } from '../utils/editorFields'

const props = defineProps({
  field: { type: Object, required: true },
  baseId: { type: String, required: true },
  describedBy: { type: String, default: undefined },
  invalidLang: { type: String, default: null },
  invalid: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['update'])
const { t, locale } = useI18n()

const tab = ref(LOCALES.includes(locale.value) ? locale.value : 'es')
const tabs = computed(() =>
  LOCALES.map(lang => ({ value: lang, label: t(`invitationEditor.field.lang.${lang}`) }))
)
const text = lang => props.field.value?.[lang] ?? ''
const count = lang => text(lang).length
const over = lang => count(lang) > maxFor(props.field, lang)
function onInput(lang, value) {
  emit('update', { ...(props.field.value ?? { es: '', en: '' }), [lang]: value })
}
</script>

<template>
  <UiTabs v-model="tab" :tabs="tabs" fill>
    <template v-for="lang in LOCALES" :key="lang" #[lang]>
      <div class="flex flex-col gap-1.5">
        <component
          :is="field.multiline ? UiTextarea : UiInput"
          :id="`${baseId}-${lang}`"
          :model-value="text(lang)"
          :rows="field.multiline ? 4 : undefined"
          :disabled="disabled"
          :invalid="invalid && (!invalidLang || invalidLang === lang)"
          :aria-label="`${t('invitationEditor.field.textIn', { lang: t(`invitationEditor.field.lang.${lang}`) })}`"
          :aria-describedby="describedBy"
          :data-testid="`text-${lang}`"
          @update:model-value="value => onInput(lang, value)"
        />
        <p class="self-end text-sm" :class="over(lang) ? 'font-semibold text-danger-700' : 'text-ink-500'" :aria-live="over(lang) ? 'polite' : 'off'">
          {{ t('invitationEditor.field.counter', { n: count(lang), max: maxFor(field, lang) }) }}
        </p>
      </div>
    </template>
  </UiTabs>
</template>
