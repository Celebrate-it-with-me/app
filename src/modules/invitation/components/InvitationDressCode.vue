<script setup>
import { computed } from 'vue'
import { useInvitationContext } from '../composables/useInvitation'
import { isHex } from '../composables/useInvitationTheme'
import InvitationSection from './InvitationSection.vue'

const props = defineProps({
  section: { type: Object, required: true }
})

const { invitation, tt } = useInvitationContext()

const data = computed(() => props.section.data)
/** Same words as the organizer's setup, in the invitation language. */
const typeLabel = computed(() => tt(`dressCode.types.${data.value.type}`))
const reservedLabel = computed(() =>
  tt(invitation.value.event.typeSlug === 'wedding' ? 'dressCode.reservedWedding' : 'dressCode.reservedQuince')
)
</script>

<template>
  <InvitationSection id="dress-code" :title="section.title" :text="section.text">
    <p class="font-inv-heading text-3xl text-inv-primary">{{ typeLabel }}</p>
    <p v-if="data.description" class="mx-auto mt-3 max-w-prose text-lg text-inv-ink-soft text-pretty">
      {{ data.description }}
    </p>

    <div v-if="data.colors.length" class="mt-8">
      <p class="text-sm font-medium text-inv-ink-soft">{{ reservedLabel }}</p>
      <ul class="mt-3 flex flex-wrap justify-center gap-2">
        <li
          v-for="color in data.colors"
          :key="color"
          class="inline-flex items-center gap-2 rounded-full bg-inv-surface-alt px-3 py-1.5 text-sm ring-1 ring-inv-ink/10"
        >
          <span
            v-if="isHex(color)"
            class="h-4 w-4 rounded-full ring-1 ring-inv-ink/20"
            :style="{ backgroundColor: color }"
            aria-hidden="true"
          />
          {{ color }}
        </li>
      </ul>
    </div>
  </InvitationSection>
</template>
