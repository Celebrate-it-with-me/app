<template>
  <div class="max-w-7xl mx-auto px-6 space-y-10">
    <div class="grid md:grid-cols-2 gap-6">
      <DashboardActiveEvent />

      <DashboardRsvpSummary />
    </div>

    <DashboardSmartAssistant />

    <section class="bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6">
      <h2 class="text-xl font-semibold mb-4">Actividad Reciente</h2>
      <ul class="space-y-3">
        <li>
          <span class="text-gray-500 text-sm">📆 18 Abr</span> - Invitado Juan Pérez confirmó
          asistencia
        </li>
        <li>
          <span class="text-gray-500 text-sm">📸 17 Abr</span> - Se subió 1 nueva foto al evento
        </li>
        <li>
          <span class="text-gray-500 text-sm">🎵 16 Abr</span> - Se agregó una canción a la playlist
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import DashboardActiveEvent from '@/views/internal/dashboard/DashboardActiveEvent.vue'
import DashboardRsvpSummary from '@/views/internal/dashboard/DashboardRsvpSummary.vue'
import DashboardSmartAssistant from '@/views/internal/dashboard/DashboardSmartAssistant.vue'

</script>
