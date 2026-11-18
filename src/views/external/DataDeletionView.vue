<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import LegalPage from '@/components/external/legal/LegalPage.vue'
import { UiButton } from '@/ui'
import { SUPPORT_EMAIL } from '@/config/brand'
import { useUserStore } from '@/stores/useUserStore'

const { t, tm, rt } = useI18n()
const userStore = useUserStore()

const steps = computed(() => tm('dataDeletion.howSteps').map((s) => rt(s)))
const items = computed(() => tm('dataDeletion.whatItems').map((s) => rt(s)))
</script>

<template>
  <LegalPage :title="t('titles.dataDeletion')" translated>
    <p>{{ t('dataDeletion.intro') }}</p>

    <h2>{{ t('dataDeletion.dataTitle') }}</h2>
    <i18n-t keypath="dataDeletion.dataText" tag="p">
      <template #privacy>
        <router-link to="/privacy">{{ t('dataDeletion.privacyLink') }}</router-link>
      </template>
    </i18n-t>

    <h2>{{ t('dataDeletion.howTitle') }}</h2>
    <ol class="mb-4 list-decimal pl-6 [&_li]:mb-1">
      <li v-for="step in steps" :key="step">{{ step }}</li>
    </ol>
    <p>
      <UiButton v-if="userStore.isAuthenticated" to="/settings/security" data-testid="deletion-cta">
        {{ t('dataDeletion.goToSettings') }}
      </UiButton>
      <UiButton v-else to="/sign-in" variant="secondary" data-testid="deletion-cta">
        {{ t('dataDeletion.goToSignIn') }}
      </UiButton>
    </p>

    <h2>{{ t('dataDeletion.cannotTitle') }}</h2>
    <i18n-t keypath="dataDeletion.cannotText" tag="p">
      <template #email>
        <a :href="`mailto:${SUPPORT_EMAIL}`">{{ SUPPORT_EMAIL }}</a>
      </template>
    </i18n-t>

    <h2>{{ t('dataDeletion.whatTitle') }}</h2>
    <ul>
      <li v-for="item in items" :key="item">{{ item }}</li>
    </ul>

    <h2>{{ t('dataDeletion.socialTitle') }}</h2>
    <p>{{ t('dataDeletion.socialText') }}</p>

    <h2>{{ t('dataDeletion.contactTitle') }}</h2>
    <i18n-t keypath="dataDeletion.contactText" tag="p">
      <template #email>
        <a :href="`mailto:${SUPPORT_EMAIL}`">{{ SUPPORT_EMAIL }}</a>
      </template>
    </i18n-t>
  </LegalPage>
</template>
