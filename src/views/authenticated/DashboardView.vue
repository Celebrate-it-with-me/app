<template>
  <div class="max-w-7xl mx-auto px-6 py-10 space-y-10">
    <div class="grid md:grid-cols-2 gap-6">
      <section class="bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Active Event</h2>
          <CButton variant="primary" size="sm">See Evento</CButton>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-gray-600 dark:text-gray-300">Name:</p>
            <p class="font-bold">Melissa Quince's</p>
          </div>
          <div>
            <p class="text-gray-600 dark:text-gray-300">Date:</p>
            <p class="font-bold">20 Julio 2025</p>
          </div>
          <div>
            <p class="text-gray-600 dark:text-gray-300">Status:</p>
            <p class="font-bold text-green-600">Public</p>
          </div>
          <div>
            <p class="text-gray-600 dark:text-gray-300">Progress:</p>
            <progress class="w-full" value="70" max="100"></progress>
          </div>
        </div>
      </section>

      <!-- Confirmaciones de Invitados -->
      <section class="bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6">
        <h2 class="text-xl font-semibold mb-4">Confirmaciones de Invitados</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-600">Total Invitados:</p>
            <p class="text-lg font-bold">120</p>
          </div>
          <div>
            <p class="text-sm text-green-600">Confirmados:</p>
            <p class="font-bold">78</p>
          </div>
          <div>
            <p class="text-sm text-yellow-600">Pendientes:</p>
            <p class="font-bold">30</p>
          </div>
          <div>
            <p class="text-sm text-red-600">Rechazados:</p>
            <p class="font-bold">12</p>
          </div>
        </div>
      </section>
    </div>

    <section class="bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Asistente Inteligente</h2>
        <CButton variant="secondary" size="sm">Ver sugerencias</CButton>
      </div>
      <p class="text-gray-600 dark:text-gray-300 mb-4">Tu asistente virtual analiza tu progreso y te sugiere los próximos pasos para que tu evento quede perfecto.</p>
      <ul class="list-disc ml-5 space-y-2">
        <li>Añade una playlist personalizada basada en el tipo de evento.</li>
        <li>Completa los datos del lugar para que tus invitados puedan ubicarlo fácilmente.</li>
        <li>Invita a más personas: tienes 80 confirmados de 120.</li>
        <li>Sube fotos de inspiración para el diseño del evento.</li>
      </ul>
    </section>

    <section class="bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6">
      <h2 class="text-xl font-semibold mb-4">Tareas Pendientes</h2>
      <ul class="list-disc ml-5 space-y-2">
        <li>Subir galería de fotos</li>
        <li>Agregar música sugerida</li>
        <li>Finalizar lista de invitados</li>
        <li>Confirmar locación</li>
      </ul>
    </section>

    <section class="bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6">
      <h2 class="text-xl font-semibold mb-4">Actividad Reciente</h2>
      <ul class="space-y-3">
        <li><span class="text-gray-500 text-sm">📆 18 Abr</span> - Invitado Juan Pérez confirmó asistencia</li>
        <li><span class="text-gray-500 text-sm">📸 17 Abr</span> - Se subió 1 nueva foto al evento</li>
        <li><span class="text-gray-500 text-sm">🎵 16 Abr</span> - Se agregó una canción a la playlist</li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import CButton from '@/components/UI/buttons/CButton.vue'
</script>
