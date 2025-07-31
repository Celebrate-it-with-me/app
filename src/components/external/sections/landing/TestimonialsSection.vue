<template>
  <section
    class="py-24 px-4 bg-gradient-to-br from-pink-50/30 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-purple-900/20 relative overflow-hidden"
  >
    <!-- Enhanced Background Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div
        class="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-l from-accent/10 to-primary/10 rounded-full blur-3xl opacity-60 animate-pulse"
      ></div>
      <div
        class="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-3xl opacity-50 animate-pulse"
        style="animation-delay: 3s"
      ></div>
      <div
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-pink-200/10 to-purple-200/10 rounded-full blur-2xl opacity-40"
      ></div>

      <!-- Floating testimonial elements -->
      <div
        class="absolute top-20 left-20 w-6 h-6 bg-accent/20 rounded-full animate-bounce"
        style="animation-delay: 1s"
      >
        <div class="w-full h-full flex items-center justify-center">
          <MessageCircle class="w-3 h-3 text-accent/60" />
        </div>
      </div>
      <div
        class="absolute bottom-32 right-32 w-8 h-8 bg-primary/20 rounded-lg rotate-12 animate-pulse"
        style="animation-delay: 2s"
      >
        <div class="w-full h-full flex items-center justify-center">
          <Star class="w-3 h-3 text-primary/60" />
        </div>
      </div>
      <div
        class="absolute top-1/3 right-1/4 w-4 h-4 bg-secondary/30 rounded-full animate-bounce"
        style="animation-delay: 4s"
      ></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto">
      <!-- Header Section -->
      <div class="text-center mb-20 animate-fadeIn">
        <div
          class="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-accent/10 to-secondary/10 border border-accent/20 backdrop-blur-sm mb-6"
        >
          <MessageCircle class="w-4 h-4 text-accent mr-2" />
          <span class="text-sm font-semibold text-accent">Testimonials</span>
          <span class="text-sm text-gray-600 dark:text-gray-300">Real stories</span>
        </div>

        <CHeading
          :level="2"
          weight="bold"
          class="mb-6 text-4xl sm:text-5xl lg:text-6xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent"
        >
          What Our Customers
          <span class="block text-primary font-bold">Say About Us</span>
        </CHeading>
        <p class="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
          Join thousands of happy celebration planners who have created
          <span class="font-semibold text-primary">unforgettable memories</span> with our platform.
        </p>
      </div>

      <!-- Enhanced Testimonial Carousel -->
      <div class="relative">
        <div class="overflow-hidden rounded-3xl">
          <div
            class="flex transition-transform duration-700 ease-out"
            :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
          >
            <div
              v-for="(testimonial, index) in testimonials"
              :key="index"
              class="w-full flex-shrink-0 px-6"
            >
              <!-- Enhanced Testimonial Card -->
              <div
                class="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl p-8 md:p-12 transform transition-all duration-500 hover:-translate-y-2 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
              >
                <!-- Card Background Gradient -->
                <div
                  class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                ></div>

                <!-- Quote Icon -->
                <div
                  class="absolute top-6 right-6 w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity duration-500"
                >
                  <svg class="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"
                    />
                  </svg>
                </div>

                <div
                  class="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start"
                >
                  <!-- Enhanced Avatar Section -->
                  <div class="flex-shrink-0">
                    <div class="relative">
                      <div
                        class="w-24 h-24 md:w-28 md:h-28 rounded-3xl overflow-hidden shadow-xl ring-4 ring-white/50 dark:ring-gray-700/50 transform group-hover:scale-105 transition-transform duration-500"
                      >
                        <img
                          :src="testimonial.image"
                          :alt="`Photo of ${testimonial.name}`"
                          class="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <!-- Verified Badge -->
                      <div
                        class="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-gray-800"
                      >
                        <svg
                          class="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <!-- Content Section -->
                  <div class="flex-1 text-center md:text-left">
                    <!-- Star Rating -->
                    <div class="flex justify-center md:justify-start mb-4">
                      <div class="flex gap-1">
                        <svg
                          v-for="star in 5"
                          :key="star"
                          class="w-6 h-6 text-yellow-400 drop-shadow-sm"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                          />
                        </svg>
                      </div>
                    </div>

                    <!-- Testimonial Quote -->
                    <blockquote
                      class="text-gray-700 dark:text-gray-300 text-xl md:text-2xl leading-relaxed mb-6 font-medium"
                    >
                      "{{ testimonial.quote }}"
                    </blockquote>

                    <!-- Customer Info -->
                    <div class="space-y-2">
                      <h4 class="text-xl font-bold text-gray-900 dark:text-white">
                        {{ testimonial.name }}
                      </h4>
                      <div class="flex items-center justify-center md:justify-start gap-2">
                        <div class="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        <p class="text-primary font-semibold">{{ testimonial.event }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Enhanced Navigation Buttons -->
        <div class="absolute top-1/2 -left-6 transform -translate-y-1/2 z-20">
          <button
            class="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl hover:shadow-2xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Previous testimonial"
            @click="prevTestimonial"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        <div class="absolute top-1/2 -right-6 transform -translate-y-1/2 z-20">
          <button
            class="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl hover:shadow-2xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Next testimonial"
            @click="nextTestimonial"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        <!-- Enhanced Dots Indicator -->
        <div class="flex justify-center mt-12 gap-3">
          <button
            v-for="(_, index) in testimonials"
            :key="index"
            :class="[
              'transition-all duration-300 focus:outline-none rounded-full',
              currentIndex === index
                ? 'w-8 h-3 bg-gradient-to-r from-primary to-secondary'
                : 'w-3 h-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 hover:scale-125'
            ]"
            :aria-label="`Go to testimonial ${index + 1}`"
            @click="goToTestimonial(index)"
          ></button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import { MessageCircle, Star } from 'lucide-vue-next'

const testimonials = [
  {
    name: 'Maria Rodriguez',
    event: 'Quinceañera',
    image: 'https://randomuser.me/api/portraits/women/45.jpg',
    quote:
      "Planning my daughter's quinceañera was so much easier with Celebra. The tools and support were incredible! Everything from the venue selection to the guest management worked flawlessly."
  },
  {
    name: 'John Smith',
    event: 'Anniversary Party',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    quote:
      'The budget tracking feature helped us stay on track while planning our 25th anniversary celebration. We were able to create a beautiful event without going over budget.'
  },
  {
    name: 'Sarah Johnson',
    event: 'Sweet 16',
    image: 'https://randomuser.me/api/portraits/women/22.jpg',
    quote:
      "The digital invitations were beautiful and made managing RSVPs a breeze. My daughter's Sweet 16 was perfect thanks to the planning tools and ideas provided by the platform."
  },
  {
    name: 'Michael Chen',
    event: 'Graduation Party',
    image: 'https://randomuser.me/api/portraits/men/62.jpg',
    quote:
      "I was able to plan my son's graduation party in just a few weeks. The vendor recommendations and timeline tools were especially helpful for someone like me who isn't naturally organized."
  }
]

const currentIndex = ref(0)
let autoplayInterval = null

const nextTestimonial = () => {
  currentIndex.value = (currentIndex.value + 1) % testimonials.length
}

const prevTestimonial = () => {
  currentIndex.value = (currentIndex.value - 1 + testimonials.length) % testimonials.length
}

const goToTestimonial = index => {
  currentIndex.value = index
}

const startAutoplay = () => {
  autoplayInterval = setInterval(() => {
    nextTestimonial()
  }, 6000)
}

const stopAutoplay = () => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
  }
}

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})
</script>
