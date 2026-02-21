<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <main class="max-w-7xl mx-auto p-6">
      <template v-if="loading">
        <div class="flex items-center justify-center py-20">
          <CWMLoading />
        </div>
      </template>

      <template v-else>
        <!-- Header Section -->
        <section class="mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-black text-gray-900 dark:text-white">My Events</h1>
              <p class="text-gray-500 dark:text-gray-400 text-sm">Manage and explore your events</p>
            </div>

            <div class="flex items-center gap-3">
              <button
                class="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold px-4 py-2 rounded-xl shadow hover:shadow-lg transition"
                @click="createNewEvent"
              >
                <PlusCircle class="w-5 h-5" />
                Create Event
              </button>
              <button
                class="inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
                @click="fetchEvents"
              >
                <RefreshCw class="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        <!-- Stats Section -->
        <section class="mb-8">
          <EventsStats :total-guests="totalGuestsCount" :avg-response="avgResponse" />
        </section>

        <!-- Search & Filters -->
        <section class="mb-6">
          <div class="flex items-center gap-3">
            <div class="relative flex-1">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search events..."
                class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-10 py-2 text-sm"
              />
              <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <div>
              <select
                v-model="statusFilter"
                class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                <option value="live">Live</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </section>

        <!-- Active Event -->
        <section v-if="activeEvent" class="mb-8 overflow-visible pt-3">
          <ActiveEventCard :active-event="activeEvent" />
        </section>

        <!-- Other Events -->
        <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <EventCard
            v-for="event in filteredEvents"
            :key="event.id"
            :event="event"
            @switch-to-active="switchToEvent"
          />
        </section>

        <!-- Empty State -->
        <section v-if="!events.length" class="text-center py-20 text-gray-500 dark:text-gray-400">
          <AlertCircle class="w-10 h-10 mx-auto mb-4" />
          <p>No events found. Create your first event to get started!</p>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup>
import { useEventsController } from '@/modules/events/composables/useEventsController'
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import EventsStats from '@/modules/events/components/EventsStats.vue'
import EventCard from '@/modules/events/components/EventCard.vue'
import ActiveEventCard from '@/modules/events/components/ActiveEventCard.vue'
import { PlusCircle, Search, AlertCircle, RefreshCw } from 'lucide-vue-next'

const {
  loading,
  error, // kept for parity, though not used in template
  searchQuery,
  statusFilter,
  events,
  activeEvent,
  avgResponse,
  totalGuestsCount,
  filteredEvents,
  fetchEvents,
  switchToEvent,
  createNewEvent
} = useEventsController()
</script>
