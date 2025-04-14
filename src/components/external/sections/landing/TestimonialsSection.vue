<template>
  <section class="py-half px-4 bg-gradient-to-b from-pink-50 to-white dark:from-gray-900 dark:to-gray-800">
    <div class="max-w-7xl mx-auto text-center mb-12">
      <CHeading :level="2" weight="bold" class="mb-2">
        What Our Customers Say
      </CHeading>
      <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        Join thousands of happy celebration planners
      </p>
    </div>

    <div class="grid gap-6 md:grid-cols-3 max-w-7xl mx-auto">
      <!-- Testimonial 1 -->
      <CCard variant="testimonial">
        <template #title>
          <div class="flex items-center gap-3">
            <img src="https://randomuser.me/api/portraits/women/45.jpg" class="w-10 h-10 rounded-full" alt="Maria" />
            <div>
              <p class="font-semibold">Maria Rodriguez</p>
              <p class="text-sm text-text-light">Quinceañera</p>
            </div>
          </div>
        </template>
        <template #content>
          <p>"Planning my daughter's quinceañera was so much easier with Celebra. The tools and support were incredible!"</p>
        </template>
      </CCard>

      <!-- Testimonial 2 -->
      <CCard variant="testimonial">
        <template #title>
          <div class="flex items-center gap-3">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" class="w-10 h-10 rounded-full" alt="John" />
            <div>
              <p class="font-semibold">John Smith</p>
              <p class="text-sm text-text-light">Anniversary Party</p>
            </div>
          </div>
        </template>
        <template #content>
          <p>"The budget tracking feature helped us stay on track while planning our 25th anniversary celebration."</p>
        </template>
      </CCard>

      <!-- Testimonial 3 -->
      <CCard variant="testimonial">
        <template #title>
          <div class="flex items-center gap-3">
            <img src="https://randomuser.me/api/portraits/women/22.jpg" class="w-10 h-10 rounded-full" alt="Sarah" />
            <div>
              <p class="font-semibold">Sarah Johnson</p>
              <p class="text-sm text-text-light">Sweet 16</p>
            </div>
          </div>
        </template>
        <template #content>
          <p>"The digital invitations were beautiful and made managing RSVPs a breeze. Highly recommend!"</p>
        </template>
      </CCard>
    </div>
  </section>
</template>

<script setup>
import CHeading from '@/components/UI/headings/CHeading.vue'
import CCard from '@/components/UI/cards/CCard.vue'
</script>
