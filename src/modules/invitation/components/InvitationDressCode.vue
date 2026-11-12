<script setup>
import { computed } from 'vue'
import { Shirt } from 'lucide-vue-next'
import { useInvitationContext } from '../composables/useInvitation'
import { swatchFor } from '../composables/colorNames'
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
const colors = computed(() =>
  data.value.colors.map(name => ({ name, swatch: swatchFor(name), isCode: isHex(String(name).trim()) }))
)
</script>

<template>
  <InvitationSection id="dress-code" :title="section.title" :text="section.text">
    <div class="flex flex-col items-center">
      <span
        class="flex h-14 w-14 items-center justify-center rounded-full bg-inv-primary/10 text-inv-primary ring-1 ring-inv-accent/50"
      >
        <Shirt class="h-6 w-6" aria-hidden="true" />
      </span>
      <p class="mt-4 font-inv-script text-5xl text-inv-primary-ink sm:text-6xl">{{ typeLabel }}</p>
      <p v-if="data.description" class="mx-auto mt-4 max-w-prose text-lg text-inv-ink-soft text-pretty">
        {{ data.description }}
      </p>
    </div>

    <div v-if="colors.length" class="mt-10">
      <p class="text-sm font-medium text-inv-ink-soft">{{ reservedLabel }}</p>
      <ul class="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-5">
        <li v-for="color in colors" :key="color.name" class="flex w-20 flex-col items-center gap-2">
          <span
            v-if="color.swatch"
            class="h-14 w-14 rounded-full shadow-soft ring-1 ring-inv-ink/15 ring-offset-2 ring-offset-inv-surface"
            :style="{ backgroundColor: color.swatch }"
            aria-hidden="true"
          />
          <span :class="color.isCode ? 'sr-only' : 'text-sm text-inv-ink-soft'">{{ color.name }}</span>
        </li>
      </ul>
    </div>
  </InvitationSection>
</template>
