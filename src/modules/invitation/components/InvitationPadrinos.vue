<script setup>
import { Heart } from 'lucide-vue-next'
import { useInvitationContext } from '../composables/useInvitation'
import InvitationSection from './InvitationSection.vue'

defineProps({
  section: { type: Object, required: true }
})

const { tt, locale } = useInvitationContext()

/** "the cake, the DJ and the dress": the list in the invitation's language. */
const sponsorsLine = items => tt('padrinos.sponsors', { items: new Intl.ListFormat(locale.value, { style: 'long', type: 'conjunction' }).format(items) })
</script>

<template>
  <InvitationSection id="padrinos" :title="section.title" :text="section.text" variant="alt">
    <ul class="mx-auto flex max-w-xl flex-col gap-8">
      <li v-for="(padrino, index) in section.data.items" :key="index" class="flex flex-col items-center text-center">
        <span class="flex h-11 w-11 items-center justify-center rounded-full bg-inv-primary/10 text-inv-primary ring-1 ring-inv-accent/50">
          <Heart class="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 class="mt-3 font-inv-heading text-2xl text-inv-primary-ink text-balance">{{ padrino.name }}</h3>
        <p v-if="padrino.relationship" class="text-sm text-inv-ink-soft">{{ padrino.relationship }}</p>
        <p v-if="padrino.sponsors.length" class="mt-1 text-inv-ink-soft">{{ sponsorsLine(padrino.sponsors) }}</p>
        <p v-if="padrino.thanks" class="mt-3 font-inv-script text-3xl text-inv-primary text-pretty">{{ padrino.thanks }}</p>
      </li>
    </ul>
  </InvitationSection>
</template>
