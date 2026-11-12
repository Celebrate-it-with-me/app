<script setup>
import { useInvitationContext } from '../composables/useInvitation'
import InvitationButton from './InvitationButton.vue'

defineProps({
  /** loading | notFound | error */
  status: { type: String, required: true }
})
defineEmits(['retry'])

const { tt } = useInvitationContext()
</script>

<template>
  <main class="flex min-h-svh flex-col items-center justify-center px-6 py-16 text-center">
    <div v-if="status === 'loading'" role="status" aria-busy="true" class="w-full max-w-xs">
      <div class="mx-auto h-28 w-24 animate-pulse rounded-t-full bg-inv-accent/20" />
      <div class="mx-auto mt-8 h-6 w-3/4 animate-pulse rounded-full bg-inv-ink/10" />
      <div class="mx-auto mt-3 h-4 w-1/2 animate-pulse rounded-full bg-inv-ink/10" />
      <p class="sr-only">{{ tt('loading') }}</p>
    </div>

    <template v-else>
      <h1 class="font-inv-heading text-3xl text-balance sm:text-4xl">
        {{ tt(status === 'notFound' ? 'notFoundTitle' : 'errorTitle') }}
      </h1>
      <p class="mt-3 max-w-md text-lg text-inv-ink-soft text-pretty">
        {{ tt(status === 'notFound' ? 'notFoundText' : 'errorText') }}
      </p>
      <InvitationButton v-if="status === 'error'" class="mt-8" @click="$emit('retry')">
        {{ tt('retry') }}
      </InvitationButton>
    </template>
  </main>
</template>
