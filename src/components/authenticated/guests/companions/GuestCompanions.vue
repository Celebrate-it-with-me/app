<script setup>
import { ref, watch } from 'vue'
import SetCompanionType from '@/components/authenticated/guests/companions/SetCompanionType.vue'
import NoNamedCompanion from '@/components/authenticated/guests/companions/NoNamedCompanion.vue'
import NamedCompanion from '@/components/authenticated/guests/companions/NamedCompanion.vue'
import GuestCompanionList from '@/components/authenticated/guests/companions/GuestCompanionList.vue'

const step = ref(1)
const companionType = ref(null)
const noNamedCompanionQty = ref(1)
const companions = ref([])
const showCompanyList = ref(false)
const resetQty = ref(false)

const addCompanion = () => {
  step.value += 1
}

const handleCompanionQty = () => {
  showCompanyList.value = true
}

const handleNamedCompanion = (companion) => {
  companions.value.push(companion)
  showCompanyList.value = true
}

const handleRemoveCompanion = (companion) => {
  if (companions.value.length) {
    companions.value = companions.value.filter((existingCompanion) => {
      if (companion.email && existingCompanion.email) {
        return existingCompanion.email !== companion.email
      } else {
        return (
          existingCompanion.firstName !== companion.firstName ||
          existingCompanion.lastName !== companion.lastName
        )
      }
    })

    if (!companions.value.length) {
      showCompanyList.value = false
    }
  }
}

const goBack = () => {
  showCompanyList.value = false
  step.value = 1
}

const handleRestartReset = () => {
  resetQty.value = false
}

const handleRemoveQty = () => {
  showCompanyList.value = false
  resetQty.value = true
}

watch(companionType, () => {
  showCompanyList.value = false
})
</script>

<template>
  <div class="flex flex-col gap-x-2 gap-6 pt-5 w-full">
    <h4 class="flex flex-row justify-between items center text-xl font-semibold mb-4">
      <span>Companions </span>

      <a
        v-if="step !== 1"
        class="text-sm underline cursor-pointer"
        @click="goBack"
      >Cancel</a>
    </h4>

    <div class="w-full flex flex-row gap-10">
      <div class="w-1/2">
        <div class="mb-4" v-if="!companions.length && step === 1">
          <p class="text-gray-400 text-sm">No companions added yet.</p>

          <button
            v-if="step === 1"
            type="button"
            class="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2 px-4 rounded-md mt-2"
            @click="addCompanion"
          >
            Add Companion
          </button>
        </div>

        <div v-else-if="step === 2">
          <SetCompanionType v-model="companionType" />

          <div v-if="companionType === 'no-named'" class="no-named-section">
            <NoNamedCompanion
              v-model="noNamedCompanionQty"
              :reset-qty="resetQty"
              @set-companions-qty="handleCompanionQty"
              @restart-reset="handleRestartReset"
            />
          </div>

          <div v-if="companionType === 'named'">
            <NamedCompanion
              @companion-send="handleNamedCompanion"
            />
          </div>
        </div>
      </div>
      <div class="w-1/2" v-if="showCompanyList">
        <GuestCompanionList
          :type="companionType"
          :qty="noNamedCompanionQty"
          :list="companions"
          @remove-companion="handleRemoveCompanion"
          @remove-qty="handleRemoveQty"
        />
      </div>
    </div>

  </div>
</template>

<style scoped></style>
