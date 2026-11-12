<script setup>
import { useInvitationContext } from '../composables/useInvitation'
import InvitationSection from './InvitationSection.vue'
import InvitationSprig from '../art/InvitationSprig.vue'

defineProps({
  section: { type: Object, required: true }
})

const { invitation, tt } = useInvitationContext()
</script>

<template>
  <InvitationSection id="closing" :title="section.title" :text="section.text" variant="deep">
    <template #decor>
      <InvitationSprig
        class="pointer-events-none absolute -left-10 -top-10 h-44 w-44 text-inv-accent/60 sm:h-60 sm:w-60"
      />
      <InvitationSprig
        flip
        class="pointer-events-none absolute -bottom-10 -right-10 h-44 w-44 rotate-180 text-inv-accent/60 sm:h-60 sm:w-60"
      />
    </template>
    <p v-if="invitation.branding.watermark" class="text-sm text-inv-surface/70">
      <a href="/" target="_blank" rel="noopener" class="underline underline-offset-4 hover:text-inv-surface">
        {{ tt('madeWith') }}
      </a>
    </p>
  </InvitationSection>
</template>
