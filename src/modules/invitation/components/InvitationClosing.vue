<script setup>
import { useInvitationContext } from '../composables/useInvitation'
import InvitationSection from './InvitationSection.vue'

defineProps({
  section: { type: Object, required: true }
})

const { invitation, tt } = useInvitationContext()
</script>

<template>
  <InvitationSection id="closing" :title="section.title" :text="section.text">
    <p
      v-if="invitation.branding.watermark"
      class="text-sm text-inv-ink-soft"
    >
      <a href="/" target="_blank" rel="noopener" class="underline underline-offset-4 hover:text-inv-primary">
        {{ tt('madeWith') }}
      </a>
    </p>
  </InvitationSection>
</template>
