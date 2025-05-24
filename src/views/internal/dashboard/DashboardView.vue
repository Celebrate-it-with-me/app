<script setup>
import DashboardActiveEvent from '@/views/internal/dashboard/DashboardActiveEvent.vue'
import DashboardRsvpSummary from '@/views/internal/dashboard/DashboardRsvpSummary.vue'
import DashboardSmartAssistant from '@/views/internal/dashboard/DashboardSmartAssistant.vue'
import DashboardRecentActivity from '@/views/internal/dashboard/DashboardRecentActivity.vue'
import DashboardTodoList from '@/views/internal/dashboard/DashboardTodoList.vue'
</script>

<template>
  <div class="max-w-7xl mx-auto px-6 space-y-10">
    <!-- Top row -->
    <div class="grid md:grid-cols-2 gap-6">
      <DashboardActiveEvent />
      <DashboardRsvpSummary />
    </div>

    <!-- Middle row -->
    <div class="grid md:grid-cols-2 gap-6">
      <DashboardTodoList />
      <DashboardRecentActivity />
    </div>

    <!-- Bottom row -->
    <DashboardSmartAssistant />
  </div>
</template>
