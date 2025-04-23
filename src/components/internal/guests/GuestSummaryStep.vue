<template>
  <section class="bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6 space-y-6">
    <!-- Guest Info -->
    <div>
      <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-2">Guest Info</h3>
      <ul class="text-sm text-gray-700 dark:text-gray-300 space-y-1">
        <li><strong>Name:</strong> {{ guestData.name }}</li>
        <li><strong>Email:</strong> {{ guestData.email || 'N/A' }}</li>
        <li><strong>Phone:</strong> {{ guestData.phone || 'N/A' }}</li>
      </ul>
    </div>

    <!-- Companions -->
    <div>
      <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-2">Companions</h3>
      <ul class="text-sm text-gray-700 dark:text-gray-300 space-y-1">
        <li><strong>Named Companions:</strong>
          <span v-if="namedCompanions.length">
            <ul class="space-y-4">
              <li
                v-for="(companion, index) in namedCompanions"
                :key="index"
              >
                <p v-if="companion.name">
                  Name: {{ companion.name }} - Email: {{ companion.email }} - Phone: {{ companion.phone }}
                </p>
              </li>
            </ul>
          </span>
          <span v-else>N/A</span>
        </li>
        <li><strong>Unnamed Companions:</strong> {{ unnamedCompanions || 0 }}</li>
      </ul>
    </div>

    <!-- Preferences -->
    <div>
      <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-2">Preferences</h3>
      <ul class="text-sm text-gray-700 dark:text-gray-300 space-y-1">
        <li><strong>Meal Preference:</strong> {{ preferences.meal_preference || 'N/A' }}</li>
        <li><strong>Allergies:</strong> {{ preferences.allergies || 'N/A' }}</li>
        <li><strong>Notes:</strong> {{ preferences.notes || 'N/A' }}</li>
      </ul>
    </div>
  </section>
</template>

<script setup>
defineProps({
  guestData: { type: Object, required: true },
  namedCompanions: { type: Array, required: true },
  unnamedCompanions: { type: Number, required: true },
  preferences: { type: Object, required: true },
})
</script>
