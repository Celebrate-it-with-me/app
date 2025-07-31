<script setup>
import RsvpTemplateCard from '@/components/authenticated/rsvp/RsvpTemplates/RsvpTemplateCard.vue'
import { reactive } from 'vue'
import CreateRsvp from '@/components/authenticated/rsvp/CreateRsvp.vue'

const RSVP_TEMPLATES = reactive([
  {
    id: 1,
    name: 'Butterfly RSVP',
    cardDescription: `This design is clean, simple, yet very useful, and includes all the main
                    options to efficiently manage an RSVP.`,
    selected: false,
    customFields: [
      {
        firstName: '',
        lastName: '',
        backgroundImage: '',
        confirmationLabel: '',
        descriptionPosition: '',
        companionsSection: '',
        mealSection: true
      }
    ]
  },
  {
    id: 2,
    name: 'Second RSVP',
    cardDescription: `Another Option using full size`,
    selected: false,
    customFields: [
      {
        firstName: '',
        lastName: '',
        backgroundImage: '',
        confirmationLabel: '',
        descriptionPosition: '',
        companionsSection: '',
        mealSection: true
      }
    ]
  }
])

const handleCurrentTemplate = templateId => {
  RSVP_TEMPLATES.forEach(template => {
    if (template.id === templateId) {
      template.selected = true
    } else {
      template.selected = false
    }
  })
}
</script>

<template>
  <div class="relative overflow-x-auto shadow-md sm:rounded-lg mt-2">
    <div
      class="w-full flex flex-col text-lg font-semibold p-5 text-gray-900 bg-white dark:text-white dark:bg-gray-800"
    >
      <CreateRsvp />
    </div>
  </div>
</template>

<style scoped></style>
