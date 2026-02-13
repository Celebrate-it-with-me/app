<template>
  <!-- Empty State Onboarding -->
  <div
    v-if="showEmptyState"
    class="min-h-[80vh] flex flex-col items-center justify-center p-4 rounded-3xl bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500 relative overflow-hidden"
  >
    <!-- Decorative Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute top-10 left-10 w-32 h-32 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse"
      ></div>
      <div
        class="absolute bottom-10 right-10 w-40 h-40 bg-pink-200/20 dark:bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"
      ></div>
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-200/10 dark:bg-orange-500/5 rounded-full blur-3xl"
      ></div>
    </div>

    <!-- Icon Section -->
    <div class="mb-10 relative z-10">
      <div
        class="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-3xl flex items-center justify-center shadow-xl animate-float"
      >
        <PartyPopper class="w-12 h-12 text-pink-500 dark:text-pink-400" />
      </div>
      <div class="absolute -top-3 -right-3 animate-bounce-slow">
        <Sparkles class="w-7 h-7 text-purple-400 dark:text-purple-300 drop-shadow-lg" />
      </div>
      <div class="absolute -bottom-2 -left-2 animate-spin-slow">
        <Heart class="w-6 h-6 text-pink-400 dark:text-pink-300 opacity-60" />
      </div>
    </div>

    <!-- Text Section -->
    <div class="text-center max-w-2xl mb-14 z-10 space-y-4">
      <h1
        class="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 dark:from-purple-400 dark:via-pink-400 dark:to-orange-400 mb-4 tracking-tight animate-fade-in leading-tight"
      >
        Let's Create Magic Together! ✨
      </h1>
      <p class="text-xl text-gray-700 dark:text-gray-300 leading-relaxed animate-fade-in-delay">
        Every celebration deserves to be unforgettable. Choose your event type and let's start this
        exciting journey!
      </p>
    </div>

    <!-- Event Type Grid -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-5 w-full max-w-6xl z-10 px-4">
      <button
        v-for="type in onboardingTypes"
        :key="type.id"
        class="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-7 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-3 hover:scale-105 transition-all duration-300 border-2 border-gray-100 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-600 flex flex-col items-center gap-5"
        @click="selectEventType(type.id)"
      >
        <!-- Glow Effect on Hover -->
        <div
          class="absolute inset-0 rounded-3xl bg-gradient-to-br from-pink-400/0 to-purple-400/0 group-hover:from-pink-400/10 group-hover:to-purple-400/10 transition-all duration-300"
        ></div>

        <div
          :class="[
            type.bg,
            'dark:bg-opacity-20 p-5 rounded-2xl group-hover:scale-125 group-hover:rotate-6 transition-all duration-300 shadow-md relative z-10'
          ]"
        >
          <component
            :is="type.icon"
            :class="['w-10 h-10', type.color, 'group-hover:animate-wiggle']"
          />
        </div>
        <span
          class="font-bold text-base text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors relative z-10"
        >
          {{ type.label }}
        </span>
      </button>
    </div>

    <!-- Skip/Secondary CTA -->
    <button
      class="mt-16 text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 font-semibold transition-all duration-300 flex items-center gap-3 group z-10 hover:scale-105"
      @click="showEmptyState = false"
    >
      <span>Or start with a blank canvas</span>
      <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
    </button>
  </div>

  <!-- Wizard Form -->
  <div
    v-else
    class="bg-white dark:bg-gray-900 rounded-3xl p-10 shadow-2xl border border-gray-100 dark:border-gray-800"
  >
    <!-- Header with Progress Indicator -->
    <div class="mb-10">
      <!-- Breadcrumb Style Header -->
      <div class="flex items-center gap-3 mb-6">
        <div
          class="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg"
        >
          <PartyPopper class="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {{ mode === 'edit' ? 'Edit Your Event' : 'Create Your Dream Event' }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400 text-base mt-1">
            {{ getCurrentStepSubtitle() }}
          </p>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="relative">
        <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 transition-all duration-500 ease-out rounded-full"
            :style="{ width: `${((currentStep + 1) / steps.length) * 100}%` }"
          ></div>
        </div>
        <div class="flex justify-between mt-3">
          <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">
            Step {{ currentStep + 1 }} of {{ steps.length }}
          </span>
          <span class="text-xs font-semibold text-pink-600 dark:text-pink-400">
            {{ Math.round(((currentStep + 1) / steps.length) * 100) }}% Complete
          </span>
        </div>
      </div>
    </div>

    <Form
      :validation-schema="eventValidationSchema"
      @submit="onSubmit"
      @invalid-submit="onInvalidSubmit"
    >
      <CWizard
        :steps="steps"
        :next-valid="isValidNext"
        :initial-step="currentStep"
        @active-step="handleStepChange"
        @submit="handleSubmit"
      >
        <template #current-Step="{ step }">
          <!-- Step 1: Event Details (Todo lo esencial) -->
          <div v-if="step === 0" class="space-y-8 animate-slide-in">
            <div class="flex items-center gap-4 mb-6">
              <div
                class="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center"
              >
                <Sparkles class="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Event Details</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  The essentials to get started
                </p>
              </div>
            </div>

            <!-- Layout de 2 columnas en desktop -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- Columna Izquierda: Identidad del Evento -->
              <div class="space-y-6">
                <div class="space-y-2">
                  <label
                    class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                  >
                    <Heart class="w-4 h-4 text-pink-500" />
                    Event Name *
                  </label>
                  <CInput
                    id="event-name"
                    v-model="eventState.eventName"
                    name="eventName"
                    placeholder="e.g., Maria's Sweet 16 Party"
                    show-error
                  />
                </div>

                <div class="space-y-2">
                  <label
                    class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                  >
                    <PartyPopper class="w-4 h-4 text-orange-500" />
                    Event Type *
                  </label>
                  <CSelect
                    id="event-type"
                    v-model="eventState.eventType"
                    name="eventType"
                    :options="eventTypes"
                    show-error
                    description=""
                    label=""
                  />
                </div>

                <!-- Fechas en grid inline -->
                <div class="space-y-2">
                  <label
                    class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                  >
                    <Calendar class="w-4 h-4 text-blue-500" />
                    Event Dates *
                  </label>
                  <div class="grid grid-cols-2 gap-3">
                    <CDate
                      id="start-date"
                      v-model="eventState.startDate"
                      name="startDate"
                      placeholder="Start"
                      also-time
                      show-error
                    />
                    <CDate
                      id="end-date"
                      v-model="eventState.endDate"
                      name="endDate"
                      placeholder="End"
                      also-time
                      show-error
                    />
                  </div>
                </div>
              </div>

              <!-- Columna Derecha: Contexto y Settings -->
              <div class="space-y-6">
                <div class="space-y-2">
                  <label
                    class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                  >
                    <MessageSquareText class="w-4 h-4 text-purple-500" />
                    Description
                  </label>
                  <CTextarea
                    id="event-description"
                    v-model="eventState.eventDescription"
                    :rows="6"
                    name="eventDescription"
                    placeholder="Share the story behind this celebration..."
                    show-error
                    description=""
                    disabled=""
                    label=""
                  />
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Tell guests what makes this event special
                  </p>
                </div>

                <!-- Quick Settings Panel -->
                <div
                  class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700"
                >
                  <h4
                    class="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
                  >
                    <Settings class="w-4 h-4" />
                    Quick Settings
                  </h4>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">
                          Publish immediately
                        </p>
                        <p class="text-xs text-gray-600 dark:text-gray-400">
                          Make event visible to guests
                        </p>
                      </div>
                      <CToggle v-model="eventState.isPublished" name="isPublished" />
                    </div>
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">
                          Public event
                        </p>
                        <p class="text-xs text-gray-600 dark:text-gray-400">
                          Anyone with link can view
                        </p>
                      </div>
                      <CToggle v-model="eventState.isPublic" name="isPublic" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Enhanced Tips Panel -->
            <div
              class="relative overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 dark:from-pink-900/10 dark:via-purple-900/10 dark:to-orange-900/10 p-6 rounded-2xl border-2 border-pink-100 dark:border-pink-900/30"
            >
              <div
                class="absolute top-0 right-0 w-32 h-32 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-2xl"
              ></div>
              <div class="relative z-10">
                <div class="flex items-center gap-3 mb-4">
                  <div
                    class="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center"
                  >
                    <Lightbulb class="w-5 h-5 text-white" />
                  </div>
                  <h4 class="text-lg font-bold text-gray-900 dark:text-white">Pro Tips</h4>
                </div>
                <ul class="space-y-3">
                  <li class="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <div
                      class="w-5 h-5 rounded-full bg-pink-200 dark:bg-pink-800 flex items-center justify-center flex-shrink-0 mt-0.5"
                    >
                      <span class="text-xs font-bold text-pink-700 dark:text-pink-300">1</span>
                    </div>
                    <span
                      >Choose a <strong>clear and memorable name</strong> that reflects the
                      celebration's spirit</span
                    >
                  </li>
                  <li class="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <div
                      class="w-5 h-5 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center flex-shrink-0 mt-0.5"
                    >
                      <span class="text-xs font-bold text-purple-700 dark:text-purple-300">2</span>
                    </div>
                    <span
                      >Set <strong>accurate dates and times</strong> to help guests plan ahead</span
                    >
                  </li>
                  <li class="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <div
                      class="w-5 h-5 rounded-full bg-orange-200 dark:bg-orange-800 flex items-center justify-center flex-shrink-0 mt-0.5"
                    >
                      <span class="text-xs font-bold text-orange-700 dark:text-orange-300">3</span>
                    </div>
                    <span>Save as draft if you're still planning — you can publish when ready</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Step 2: Customize Features (Smart + Optional) -->
          <div v-else-if="step === 1" class="space-y-8 animate-slide-in">
            <div class="flex items-center gap-4 mb-6">
              <div
                class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 flex items-center justify-center"
              >
                <Zap class="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Customize Features</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Choose what guests can do (optional)
                </p>
              </div>
            </div>

            <!-- Essential Features (Smart Defaults) -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h4 class="text-lg font-bold text-gray-900 dark:text-white">
                    Essential Features
                  </h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Recommended for {{ getEventTypeName() }} events
                  </p>
                </div>
                <button
                  class="text-sm text-primary hover:text-pink-700 dark:hover:text-pink-300 font-semibold flex items-center gap-1"
                  @click="enableAllCoreFeatures"
                >
                  <CheckCircle class="w-4 h-4" />
                  Enable All
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="feature in coreFeatures"
                  :key="feature.name"
                  class="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 p-5 rounded-2xl border-2 transition-all duration-300"
                  :class="[
                    eventState[feature.model]
                      ? 'border-pink-300 dark:border-pink-600 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 hover:border-pink-200 dark:hover:border-pink-700'
                  ]"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex items-start gap-4 flex-1">
                      <div
                        class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                        :class="[
                          eventState[feature.model]
                            ? 'bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 scale-110'
                            : 'bg-gray-100 dark:bg-gray-700'
                        ]"
                      >
                        <component
                          :is="feature.icon"
                          class="w-6 h-6 transition-colors"
                          :class="
                            eventState[feature.model]
                              ? 'text-pink-600 dark:text-pink-400'
                              : 'text-gray-400'
                          "
                        />
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <p class="text-base font-bold text-gray-900 dark:text-white">
                            {{ feature.label }}
                          </p>
                          <span
                            class="px-2 py-0.5 text-xs font-bold rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                          >
                            Essential
                          </span>
                        </div>
                        <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {{ feature.description }}
                        </p>
                      </div>
                    </div>
                    <div class="flex-shrink-0">
                      <CToggle v-model="eventState[feature.model]" :name="feature.name" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Optional Features (Collapsed by default) -->
            <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
              <button
                class="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                @click="showOptionalFeatures = !showOptionalFeatures"
              >
                <div class="flex items-center gap-3">
                  <Plus v-if="!showOptionalFeatures" class="w-5 h-5 text-gray-400" />
                  <Minus v-else class="w-5 h-5 text-gray-400" />
                  <div class="text-left">
                    <h4 class="text-base font-bold text-gray-900 dark:text-white">
                      Additional Features
                    </h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      {{ optionalFeatures.length }} more features available
                    </p>
                  </div>
                </div>
                <ChevronDown
                  class="w-5 h-5 text-gray-400 transition-transform duration-300"
                  :class="{ 'rotate-180': showOptionalFeatures }"
                />
              </button>

              <div
                v-if="showOptionalFeatures"
                class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-slide-in"
              >
                <div
                  v-for="feature in optionalFeatures"
                  :key="feature.name"
                  class="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 p-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-pink-200 dark:hover:border-pink-700 transition-all duration-300"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex items-start gap-4 flex-1">
                      <div
                        class="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0"
                      >
                        <component :is="feature.icon" class="w-6 h-6 text-gray-400" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-base font-bold text-gray-900 dark:text-white mb-1">
                          {{ feature.label }}
                        </p>
                        <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {{ feature.description }}
                        </p>
                      </div>
                    </div>
                    <div class="flex-shrink-0">
                      <CToggle v-model="eventState[feature.model]" :name="feature.name" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Skip Option -->
            <div class="text-center pt-4">
              <button
                class="text-sm text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 font-medium transition-colors flex items-center gap-2 mx-auto"
                @click="useSmartDefaults"
              >
                <Wand2 class="w-4 h-4" />
                Just use smart defaults for my {{ getEventTypeName() }}
              </button>
            </div>

            <!-- Enhanced Tips Panel -->
            <div
              class="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 dark:from-indigo-900/10 dark:via-violet-900/10 dark:to-purple-900/10 p-6 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900/30"
            >
              <div
                class="absolute bottom-0 right-0 w-32 h-32 bg-violet-200/20 dark:bg-violet-500/10 rounded-full blur-2xl"
              ></div>
              <div class="relative z-10">
                <div class="flex items-center gap-3 mb-4">
                  <div
                    class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center"
                  >
                    <Lightbulb class="w-5 h-5 text-white" />
                  </div>
                  <h4 class="text-lg font-bold text-gray-900 dark:text-white">About Features</h4>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  Don't worry! You can enable or disable any feature at any time from your event
                  dashboard.
                </p>
                <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  💡 <strong>Pro tip:</strong> Start with essentials and add more as you need them.
                </p>
              </div>
            </div>
          </div>

          <!-- Step 3: Review & Launch -->
          <div v-else-if="step === 2" class="space-y-8 animate-slide-in">
            <div class="flex items-center gap-4 mb-6">
              <div
                class="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center"
              >
                <CheckCircle class="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Review & Launch</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Everything looks great!</p>
              </div>
            </div>

            <!-- Compact Review Card -->
            <div
              class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-8 rounded-3xl border-2 border-purple-100 dark:border-purple-900/30"
            >
              <div class="flex items-start gap-6">
                <div
                  class="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0"
                >
                  <component :is="getEventTypeIcon()" class="w-10 h-10 text-white" />
                </div>
                <div class="flex-1">
                  <h4 class="text-2xl font-black text-gray-900 dark:text-white mb-2">
                    {{ eventState.eventName || 'Your Event' }}
                  </h4>
                  <div class="flex flex-wrap gap-2 mb-4">
                    <span
                      class="px-3 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                    >
                      {{ getEventTypeName() }}
                    </span>
                    <span
                      class="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                    >
                      {{ eventState.isPublished ? '✓ Published' : 'Draft' }}
                    </span>
                    <span
                      class="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                    >
                      {{ eventState.isPublic ? 'Public' : 'Private' }}
                    </span>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Calendar class="w-4 h-4 text-blue-500" />
                      <span> <strong>Start:</strong> {{ formatDate(eventState.startDate) }} </span>
                    </div>
                    <div class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Calendar class="w-4 h-4 text-red-500" />
                      <span> <strong>End:</strong> {{ formatDate(eventState.endDate) }} </span>
                    </div>
                  </div>
                  <div
                    v-if="eventState.eventDescription"
                    class="mt-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl"
                  >
                    <p class="text-sm text-gray-700 dark:text-gray-300 italic">
                      "{{ eventState.eventDescription }}"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Enabled Features -->
            <div
              class="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 p-6 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900/30"
            >
              <div class="flex items-center gap-3 mb-4">
                <Zap class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h4 class="font-bold text-lg text-gray-900 dark:text-white">
                  Active Features ({{ enabledFeaturesCount }})
                </h4>
              </div>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="feature in enabledFeatures"
                  :key="feature.name"
                  class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-indigo-200 dark:border-indigo-800"
                >
                  <component
                    :is="feature.icon"
                    class="w-4 h-4 text-green-600 dark:text-green-400"
                  />
                  <span class="text-sm font-semibold text-gray-900 dark:text-white">{{
                    feature.label
                  }}</span>
                </span>
              </div>
              <p
                v-if="enabledFeaturesCount === 0"
                class="text-sm text-gray-600 dark:text-gray-400 italic"
              >
                No features enabled yet. You can add them later from your dashboard.
              </p>
            </div>

            <!-- Error Display -->
            <div
              v-if="eventErrors"
              class="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 p-5 rounded-2xl text-sm flex items-start gap-3"
            >
              <AlertCircle class="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p class="font-bold mb-1">Oops! Something went wrong</p>
                <p>{{ eventErrors }}</p>
              </div>
            </div>

            <!-- Success Message -->
            <div
              class="bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 dark:from-pink-900/10 dark:via-purple-900/10 dark:to-orange-900/10 p-6 rounded-2xl border-2 border-pink-200 dark:border-pink-900/30"
            >
              <div class="flex items-start gap-4">
                <div
                  class="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0"
                >
                  <Rocket class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 class="font-bold text-lg text-gray-900 dark:text-white mb-2">
                    Ready to Launch! 🎉
                  </h4>
                  <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    Click <strong>"Create Event"</strong> to
                    {{ eventState.isPublished ? 'publish' : 'save as draft' }}. You can always edit
                    everything later from your dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </template>
      </CWizard>

      <div class="mt-8 flex justify-end">
        <CButton variant="outline" class="mr-4" @click="cancelCreateEvent">Cancel</CButton>
      </div>
    </Form>
  </div>
</template>

<script setup>
import { Form } from 'vee-validate'
import { computed, reactive, ref, onMounted, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'

import CInput from '@/components/UI/form2/CInput.vue'
import CTextarea from '@/components/UI/form2/CTextarea.vue'
import CDate from '@/components/UI/form2/CDate.vue'
import CSelect from '@/components/UI/form2/CSelect.vue'
import CToggle from '@/components/UI/form2/CToggle.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CWizard from '@/components/UI/wizard/CWizard.vue'

import { useEventsStore } from '@/stores/useEventsStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { DEFAULT_ERROR_MESSAGE } from '@/constants/constants'
import {
  Calendar,
  Cake,
  Baby,
  Heart,
  Music,
  Waves,
  ImageIcon,
  MessageSquareText,
  MapIcon,
  Wallet,
  PartyPopper,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Zap,
  AlertCircle,
  Settings,
  Lightbulb,
  Plus,
  Minus,
  ChevronDown,
  Wand2,
  Rocket
} from 'lucide-vue-next'
import { useUserStore } from '@/stores/useUserStore'
import { useRoute, useRouter } from 'vue-router'

defineEmits(['cancelCreate'])
const eventState = reactive({
  eventName: '',
  eventDescription: '',
  eventType: '',
  startDate: '',
  endDate: '',
  isPublished: false,
  isPublic: true,
  processing: false,
  // Features
  rsvp: false,
  menu: false,
  sweetMemories: false,
  music: false,
  location: false,
  backgroundMusic: false,
  eventComments: false,
  budget: false
})

// Smart defaults por tipo de evento
const smartDefaults = {
  wedding: ['rsvp', 'menu', 'sweetMemories', 'location'],
  birthday: ['rsvp', 'sweetMemories', 'location'],
  quinceanera: ['rsvp', 'menu', 'sweetMemories', 'music', 'location'],
  'baby-shower': ['rsvp', 'menu', 'sweetMemories', 'location'],
  other: ['rsvp', 'location']
}

const featuresList = [
  {
    name: 'RSVP',
    model: 'rsvp',
    icon: Calendar,
    label: 'RSVP',
    description: 'Let guests confirm attendance',
    category: 'core'
  },
  {
    name: 'Location',
    model: 'location',
    icon: MapIcon,
    label: 'Location',
    description: 'Share event venue details',
    category: 'core'
  },
  {
    name: 'sweetMemories',
    model: 'sweetMemories',
    icon: ImageIcon,
    label: 'Sweet Memories',
    description: 'Photo gallery for guests',
    category: 'core'
  },
  {
    name: 'Menu',
    model: 'menu',
    icon: Cake,
    label: 'Menu',
    description: 'Meal selection for guests',
    category: 'core'
  },
  {
    name: 'music',
    model: 'music',
    icon: Waves,
    label: 'Music Playlist',
    description: 'Share music playlist',
    category: 'optional'
  },
  {
    name: 'backgroundMusic',
    model: 'backgroundMusic',
    icon: Music,
    label: 'Background Music',
    description: 'Background music on page',
    category: 'optional'
  },
  {
    name: 'eventComments',
    model: 'eventComments',
    icon: MessageSquareText,
    label: 'Guest Comments',
    description: 'Let guests leave messages',
    category: 'optional'
  },
  {
    name: 'Budget',
    model: 'budget',
    icon: Wallet,
    label: 'Budget Tracker',
    description: 'Manage event expenses',
    category: 'optional'
  }
]

const coreFeatures = computed(() => {
  const eventTypeKey = getEventTypeKey()
  const defaultFeatures = smartDefaults[eventTypeKey] || smartDefaults.other

  return featuresList.filter(f => f.category === 'core' && defaultFeatures.includes(f.model))
})

const optionalFeatures = computed(() => {
  return featuresList.filter(f => f.category === 'optional')
})

const enabledFeatures = computed(() => {
  return featuresList.filter(f => eventState[f.model])
})

const enabledFeaturesCount = computed(() => enabledFeatures.value.length)

const showOptionalFeatures = ref(false)

// Wizard configuration - AHORA 3 PASOS
const currentStep = ref(0)
const isValidNext = ref(true)

const steps = [
  { title: 'Event Details', subtitle: 'The essentials to get started' },
  { title: 'Features', subtitle: 'Customize your experience' },
  { title: 'Review', subtitle: 'Ready to launch!' }
]

const getCurrentStepSubtitle = () => {
  return steps[currentStep.value]?.subtitle || ''
}

const getEventTypeKey = () => {
  if (!eventState.eventType) return 'other'
  const type = eventStore.eventTypes.find(t => t.id === eventState.eventType)
  const name = type?.name.toLowerCase() || 'other'

  if (name.includes('wedding')) return 'wedding'
  if (name.includes('birthday')) return 'birthday'
  if (name.includes('quinceañera') || name.includes('quinceanera')) return 'quinceañera'
  if (name.includes('baby') || name.includes('shower')) return 'baby-shower'
  return 'other'
}

const getEventTypeName = () => {
  if (!eventState.eventType) return 'your event'
  const type = eventStore.eventTypes.find(t => t.id === eventState.eventType)
  return type?.name || 'event'
}

const getEventTypeIcon = () => {
  const key = getEventTypeKey()
  const icons = {
    wedding: Heart,
    birthday: Cake,
    quinceanera: Sparkles,
    'baby-shower': Baby,
    other: PartyPopper
  }
  return icons[key] || PartyPopper
}

const enableAllCoreFeatures = () => {
  coreFeatures.value.forEach(feature => {
    eventState[feature.model] = true
  })
}

const useSmartDefaults = () => {
  featuresList.forEach(f => {
    eventState[f.model] = false
  })

  enableAllCoreFeatures()

  showOptionalFeatures.value = false
}

const formatDate = date => {
  if (!date) return 'Not set'
  try {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return date
  }
}

const handleStepChange = step => {
  currentStep.value = step
  validateCurrentStep()
}

const validateCurrentStep = () => {
  switch (currentStep.value) {
    case 0: // Event Details
      isValidNext.value =
        !!eventState.eventName &&
        !!eventState.eventType &&
        !!eventState.startDate &&
        !!eventState.endDate
      break
    case 1: // Features (opcional)
      isValidNext.value = true
      break
    case 2: // Review
      isValidNext.value = true
      break
    default:
      isValidNext.value = true
  }
}

// Watch for changes in form fields to update validation
watch(
  () => [eventState.eventName, eventState.eventType, eventState.startDate, eventState.endDate],
  () => validateCurrentStep(),
  { deep: true }
)

// Auto-enable core features when event type changes
watch(
  () => eventState.eventType,
  newType => {
    if (newType && currentStep.value === 0) {
      // Solo auto-habilitar en el primer paso
      enableAllCoreFeatures()
    }
  }
)

const handleSubmit = () => {
  onSubmit()
}

const eventStore = useEventsStore()
const userStore = useUserStore()
const notificationStore = useNotificationStore()
const eventErrors = ref('')
const router = useRouter()
const route = useRoute()
const mode = ref('create')
const showEmptyState = ref(false)

const onboardingTypes = [
  {
    id: 'quinceañera',
    label: 'Quinceañera',
    icon: Sparkles,
    color: 'text-purple-500',
    bg: 'bg-purple-50'
  },
  { id: 'wedding', label: 'Wedding', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50' },
  { id: 'birthday', label: 'Birthday', icon: Cake, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'baby-shower', label: 'Baby Shower', icon: Baby, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'other', label: 'Other', icon: PartyPopper, color: 'text-indigo-500', bg: 'bg-indigo-50' }
]

const selectEventType = typeId => {
  const type = eventStore.eventTypes.find(
    t =>
      t.name.toLowerCase().includes(typeId.replace('-', '')) ||
      (typeId === 'other' &&
        !['quinceañera', 'wedding', 'birthday', 'baby-shower'].some(k =>
          t.name.toLowerCase().includes(k.replace('-', ''))
        ))
  )

  if (type) {
    eventState.eventType = type.id
  }

  showEmptyState.value = false
}

const eventValidationSchema = computed(() => {
  return toTypedSchema(
    zod
      .object({
        eventName: zod.string().min(1, 'Event name is required.'),
        eventType: zod.number({
          required_error: 'Event type is required.',
          invalid_type_error: 'Invalid event type.'
        }),
        startDate: zod.string().min(1, 'Start date is required.'),
        endDate: zod.string().min(1, 'End date is required.')
      })
      .refine(
        data => {
          const [start, end] = [new Date(data.startDate), new Date(data.endDate)]
          return end > start
        },
        { message: 'End Date must be after Start Date' }
      )
  )
})

const eventTypes = computed(() => {
  return eventStore.eventTypes.map(type => ({
    label: type.name,
    value: type.id
  }))
})

onMounted(async () => {
  // Ensure event types are loaded
  if (eventStore.eventTypes.length === 0) {
    await eventStore.loadEventsPlansAndType()
  }

  // Check if we should show empty state
  if (mode.value === 'create' && !eventStore.hasEvents) {
    showEmptyState.value = true
  }

  // Pre-select type from query param if present
  if (route.query.type) {
    selectEventType(route.query.type)
  }

  if (route.name === 'edit-event') {
    mode.value = 'edit'
    const routeId = route.params.id?.toString()
    const activeId = eventStore.activeEvent?.id?.toString()

    if (!routeId || routeId !== activeId) {
      notificationStore.addNotification({
        type: 'error',
        message: 'You can only edit the currently active event.'
      })
      await router.push('/dashboard')
    } else {
      const current = eventStore.activeEvent
      let features = {}

      eventStore.activeEvent.eventFeatures.forEach(feature => {
        features[feature.name] = feature.isActive
      })

      Object.assign(eventState, {
        ...current,
        ...features,
        // Mapear status/visibility a los nuevos campos
        isPublished: current.status === 'published',
        isPublic: current.visibility === 'public'
      })

      // Initialize validation for wizard
      validateCurrentStep()
    }
  }
})

const cancelCreateEvent = () => {
  // Reset form data
  Object.keys(eventState).forEach(key => {
    if (typeof eventState[key] === 'boolean') {
      eventState[key] = false
    } else if (typeof eventState[key] === 'string') {
      eventState[key] = ''
    } else if (typeof eventState[key] === 'number') {
      eventState[key] = 0
    }
  })

  // Reset wizard to first step
  currentStep.value = 0

  // Navigate back to events view
  router.push('/dashboard/events')
}

const createOrEditEvent = () => {
  // Convertir los nuevos campos a formato legacy
  const payload = {
    ...eventState,
    status: eventState.isPublished ? 'published' : 'draft',
    visibility: eventState.isPublic ? 'public' : 'private'
  }

  return mode.value === 'edit' ? eventStore.editEvent(payload) : eventStore.createEvent(payload)
}

const onSubmit = async () => {
  try {
    eventState.processing = true
    const result = await createOrEditEvent()
    if (result.status >= 200 && result.status < 300) {
      notificationStore.addNotification({
        type: 'success',
        message:
          mode.value === 'edit' ? 'Event updated successfully!' : 'Event created successfully!'
      })

      const userUpdated = await userStore.initUserEvents()

      if (userUpdated.status >= 200 && userUpdated.status < 300) {
        const result = userUpdated.data?.data ?? {}
        await eventStore.initUserEventsData(result)

        await router.push('/dashboard/events')
      } else {
        console.log('Error loading events')
        if (userUpdated.status === 401) {
          notificationStore.addNotification({
            type: 'error',
            message: 'Session expired. Please log in again.'
          })
        }
      }
    } else {
      eventErrors.value = result.response?.data?.message ?? DEFAULT_ERROR_MESSAGE
    }
  } catch (error) {
    console.log('checking errors', error)
    eventErrors.value = DEFAULT_ERROR_MESSAGE
  } finally {
    eventState.processing = false
  }
}

const onInvalidSubmit = e => {
  console.log('invalid form', e)
  eventErrors.value = Object.values(e.errors)[0] || DEFAULT_ERROR_MESSAGE
}
</script>

<style scoped>
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes wiggle {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-5deg);
  }
  75% {
    transform: rotate(5deg);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-wiggle {
  animation: wiggle 0.5s ease-in-out;
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}

.animate-fade-in-delay {
  animation: fade-in 0.6s ease-out 0.2s both;
}

.animate-slide-in {
  animation: slide-in 0.4s ease-out;
}

.animate-bounce-slow {
  animation: bounce 2s infinite;
}

.animate-spin-slow {
  animation: spin 8s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}
</style>
