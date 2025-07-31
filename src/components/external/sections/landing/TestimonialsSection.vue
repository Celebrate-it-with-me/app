<template>
  <section
    class="py-half px-4 bg-gradient-to-b from-pink-50 to-white dark:from-gray-900 dark:to-gray-800"
  >
    <div class="max-w-7xl mx-auto text-center mb-12 animate-fadeIn">
      <CHeading :level="2" weight="bold" class="mb-2"> What Our Customers Say </CHeading>
      <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        Join thousands of happy celebration planners
      </p>
    </div>

    <div class="max-w-5xl mx-auto relative">
      <!-- Testimonial Carousel -->
      <div class="overflow-hidden">
        <div
          class="flex transition-transform duration-700 ease-in-out"
          :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
        >
          <div
            v-for="(testimonial, index) in testimonials"
            :key="index"
            class="w-full flex-shrink-0 px-4"
          >
            <div
              class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 transform transition-all duration-300 hover:shadow-xl"
            >
              <div class="flex flex-col md:flex-row gap-6 items-center md:items-start">
                <div class="flex-shrink-0">
                  <div class="relative">
                    <img
                      :src="testimonial.image"
                      :alt="`Photo of ${testimonial.name}`"
                      class="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-pink-100 dark:border-gray-700"
                      loading="lazy"
                    />
                    <div class="absolute -bottom-2 -right-2 bg-primary text-white rounded-full p-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M7 11l2-2m0 0l4-4m-4 4l-4-4m8 8l2-2m0 0l4-4m-4 4l-4-4"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div class="flex-1 text-center md:text-left">
                  <div class="flex justify-center md:justify-start mb-2">
                    <div class="flex">
                      <svg
                        v-for="star in 5"
                        :key="star"
                        class="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p class="text-gray-700 dark:text-gray-300 text-lg italic mb-4">
                    "{{ testimonial.quote }}"
                  </p>
                  <div>
                    <p class="font-semibold text-gray-900 dark:text-white">
                      {{ testimonial.name }}
                    </p>
                    <p class="text-sm text-primary">{{ testimonial.event }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div
        class="flex justify-between absolute top-1/2 left-0 right-0 transform -translate-y-1/2 pointer-events-none"
      >
        <button
          class="bg-white dark:bg-gray-800 rounded-full p-3 shadow-md hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 pointer-events-auto"
          aria-label="Previous testimonial"
          @click="prevTestimonial"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-gray-700 dark:text-gray-300"
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
        <button
          class="bg-white dark:bg-gray-800 rounded-full p-3 shadow-md hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 pointer-events-auto"
          aria-label="Next testimonial"
          @click="nextTestimonial"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-gray-700 dark:text-gray-300"
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

      <!-- Dots Indicator -->
      <div class="flex justify-center mt-8 gap-2">
        <button
          v-for="(_, index) in testimonials"
          :key="index"
          :class="[
            'w-3 h-3 rounded-full transition-all duration-300 focus:outline-none',
            currentIndex === index
              ? 'bg-primary scale-125'
              : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
          ]"
          :aria-label="`Go to testimonial ${index + 1}`"
          @click="goToTestimonial(index)"
        ></button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import CHeading from '@/components/UI/headings/CHeading.vue'

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
