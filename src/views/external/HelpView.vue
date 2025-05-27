<template>
  <section class="min-h-screen flex items-center justify-center bg-pink-50 dark:bg-gray-900 px-4 py-12">
    <CCard class="max-w-4xl w-full p-8 shadow-xl">
      <h1 class="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Help Center</h1>

      <div class="prose prose-pink max-w-none dark:prose-invert">
        <p class="mb-4">
          Welcome to the Celebrate With Me Help Center. Here you'll find answers to common questions and guidance on using our platform.
        </p>

        <h2 class="text-xl font-semibold mt-6 mb-3">Frequently Asked Questions</h2>

        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">How do I create an event?</h3>
            <p class="mt-2">
              After signing in, click on the "Create Event" button on your dashboard. Fill in the event details including name,
              date, time, and location. You can also add a description and customize your event page.
            </p>
          </div>

          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">How do I invite guests to my event?</h3>
            <p class="mt-2">
              From your event dashboard, go to the "Guests" tab and click "Invite Guests." You can enter email addresses
              individually or import contacts. Guests will receive an email invitation with a link to your event page.
            </p>
          </div>

          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Can I customize my event page?</h3>
            <p class="mt-2">
              Yes! You can customize your event page with themes, colors, and images. Go to the "Design" tab in your event
              dashboard to access customization options.
            </p>
          </div>

          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">How do I track RSVPs?</h3>
            <p class="mt-2">
              Your event dashboard shows real-time RSVP status. You can see who has accepted, declined, or not yet responded.
              You can also export this information as a spreadsheet.
            </p>
          </div>

          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Can guests bring plus-ones?</h3>
            <p class="mt-2">
              Yes, you can enable the plus-one option when setting up your event. Guests will be able to indicate if they're
              bringing someone when they RSVP.
            </p>
          </div>

          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">How do I contact support?</h3>
            <p class="mt-2">
              If you need additional help, please email us at support@celebratewithme.com or use the chat feature in the
              bottom right corner of your screen when logged in.
            </p>
          </div>
        </div>

        <h2 class="text-xl font-semibold mt-8 mb-3">Video Tutorials</h2>
        <p class="mb-4">
          Check out our video tutorials for step-by-step guidance on using Celebrate With Me:
        </p>
        <ul class="list-disc pl-6 mb-4">
          <li>Getting Started with Celebrate With Me</li>
          <li>Creating Your First Event</li>
          <li>Customizing Your Event Page</li>
          <li>Managing Guest Lists and RSVPs</li>
          <li>Advanced Features and Tips</li>
        </ul>
      </div>

      <div class="mt-8 flex justify-center">
        <CButton @click="goToHome">Back to Home</CButton>
      </div>
    </CCard>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router'
import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'

const router = useRouter()

const goToHome = () => {
  router.push('/')
}
</script>
