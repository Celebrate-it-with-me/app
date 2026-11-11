<script setup>
import { useI18n } from 'vue-i18n'
import QuinviteLogo from '@/components/brand/QuinviteLogo.vue'
import LocaleSwitch from '@/components/external/navigation/LocaleSwitch.vue'

const { t } = useI18n()
const year = new Date().getFullYear()

const product = [
  { label: 'nav.howItWorks', to: { path: '/', hash: '#como-funciona' } },
  { label: 'nav.pricing', to: { path: '/', hash: '#precios' } },
  { label: 'nav.help', to: '/help' }
]
const legal = [
  { label: 'nav.terms', to: '/terms' },
  { label: 'nav.privacy', to: '/privacy' },
  { label: 'nav.cookies', to: '/cookies' }
]
</script>

<template>
  <footer class="border-t border-line bg-cream-50">
    <div class="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div class="lg:col-span-2">
          <QuinviteLogo class="h-8 text-ink-900" />
          <p class="mt-3 max-w-sm text-sm text-ink-500">{{ t('footer.tagline') }}</p>
          <div class="mt-4"><LocaleSwitch /></div>
        </div>
        <div>
          <h3 class="font-body text-sm font-semibold text-ink-900">{{ t('footer.product') }}</h3>
          <ul class="mt-3 flex flex-col gap-2">
            <li v-for="link in product" :key="link.label">
              <router-link :to="link.to" class="text-sm text-ink-500 hover:text-ink-900">
                {{ t(link.label) }}
              </router-link>
            </li>
          </ul>
        </div>
        <div>
          <h3 class="font-body text-sm font-semibold text-ink-900">{{ t('footer.legal') }}</h3>
          <ul class="mt-3 flex flex-col gap-2">
            <li v-for="link in legal" :key="link.label">
              <router-link :to="link.to" class="text-sm text-ink-500 hover:text-ink-900">
                {{ t(link.label) }}
              </router-link>
            </li>
          </ul>
        </div>
      </div>
      <p class="mt-10 border-t border-line pt-6 text-xs text-ink-400">
        © {{ year }} {{ t('common.company') }} · {{ t('common.brand') }}. {{ t('footer.rights') }}
      </p>
    </div>
  </footer>
</template>
