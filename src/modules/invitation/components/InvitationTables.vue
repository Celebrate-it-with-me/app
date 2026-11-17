<script setup>
import { computed } from 'vue'
import { Armchair } from 'lucide-vue-next'
import { useInvitationContext } from '../composables/useInvitation'
import InvitationSection from './InvitationSection.vue'
import InvitationPanel from './InvitationPanel.vue'

const props = defineProps({
  section: { type: Object, required: true },
  /** card (default, stationery panel) | inline (no panel) */
  variant: { type: String, default: 'card' }
})

const { tt } = useInvitationContext()

const rows = computed(() => (Array.isArray(props.section.data?.tables) ? props.section.data.tables : []))
/** One line when everyone shares the table, one per person otherwise. */
const same = computed(() => props.section.data?.sameTable !== false && rows.value.length > 0)
const tableLabel = row => tt('tables.table', { name: row.table })
const seatLabel = row => (row.seat ? tt('tables.seat', { seat: row.seat }) : '')
</script>

<template>
  <!-- Nothing assigned: nothing is drawn (the API omits the section too). -->
  <InvitationSection v-if="rows.length" id="tables" :title="section.title || tt('tables.title')" :text="section.text">
    <component :is="variant === 'inline' ? 'div' : InvitationPanel" class="inv-tables" :data-variant="variant">
      <div v-if="same" class="flex flex-col items-center gap-3 text-center">
        <span class="inv-badge flex h-14 w-14 items-center justify-center rounded-full bg-inv-primary/10 text-inv-primary ring-1 ring-inv-accent/50">
          <Armchair class="h-6 w-6" aria-hidden="true" />
        </span>
        <p class="font-inv-heading text-3xl text-inv-primary-ink text-balance break-words sm:text-4xl">{{ tableLabel(rows[0]) }}</p>
        <p v-if="seatLabel(rows[0])" class="text-lg text-inv-ink-soft">{{ seatLabel(rows[0]) }}</p>
      </div>
      <ul v-else class="divide-y divide-inv-ink/10">
        <li v-for="row in rows" :key="row.personId" class="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
          <span class="min-w-0 truncate font-inv-heading text-lg">{{ row.name }}</span>
          <span class="shrink-0 text-right text-inv-ink-soft">
            {{ tableLabel(row) }}<template v-if="seatLabel(row)"> · {{ seatLabel(row) }}</template>
          </span>
        </li>
      </ul>
    </component>
  </InvitationSection>
</template>
