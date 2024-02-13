<script setup >
import {onMounted, ref} from "vue";
import { useI18n } from 'vue-i18n'
import i18n from '../../locales/i18n'

const { locale } = useI18n()

const selectedLocale = ref({
  locale: 'en',
  label: 'EN'
})

const localeOptions = ref([
  {
    locale: 'en',
    label: 'ES'
  },
  {
    locale: 'es',
    label: 'EN'
  },
]);

onMounted(() => {
  const defaultLocale = i18n.global.locale.value

  localeOptions.value.forEach((loc) => {
    if (defaultLocale === loc.locale) {
      selectedLocale.value = loc
    }
  })
})

const changeLocale = (currentLocale) => {
  localeOptions.value.forEach((loc) => {
    if (loc.locale !== currentLocale) {
      selectedLocale.value = loc
    }
  });

  localStorage.setItem('selectedLocale', selectedLocale.value.locale)
  i18n.global.locale.value = selectedLocale.value.locale
}

</script>

<template>
  <div class="locale-container">
    <span class="underline" @click="changeLocale(selectedLocale.locale)">
      {{ selectedLocale.label }}
    </span>
  </div>
</template>

<style scoped>
.locale-container {
  position: absolute;
  right: 5px;
  top: 5px;
}
</style>
