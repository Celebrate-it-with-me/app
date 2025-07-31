<template>
  <section
    class="min-h-screen flex items-center justify-center bg-pink-50 dark:bg-gray-900 px-4 py-12"
  >
    <CCard class="max-w-4xl w-full p-8 shadow-xl">
      <h1 class="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Privacy Policy</h1>

      <div class="prose prose-pink max-w-none dark:prose-invert">
        <p class="mb-4">
          At Celebrate With Me, we take your privacy seriously. This Privacy Policy explains how we
          collect, use, disclose, and safeguard your information when you use our service.
        </p>

        <h2 class="text-xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
        <p class="mb-4">We may collect information about you in various ways, including:</p>
        <ul class="list-disc pl-6 mb-4">
          <li>
            Personal Data: Name, email address, phone number, and other identifiers you provide when
            creating an account
          </li>
          <li>Usage Data: Information on how you access and use our service</li>
          <li>
            Cookies and Tracking Data: Information collected through cookies and similar tracking
            technologies
          </li>
        </ul>

        <h2 class="text-xl font-semibold mt-6 mb-3">2. How We Use Your Information</h2>
        <p class="mb-4">
          We may use the information we collect about you for various purposes, including:
        </p>
        <ul class="list-disc pl-6 mb-4">
          <li>To provide and maintain our service</li>
          <li>To notify you about changes to our service</li>
          <li>To allow you to participate in interactive features when you choose to do so</li>
          <li>To provide customer support</li>
          <li>To gather analysis or valuable information to improve our service</li>
          <li>To monitor the usage of our service</li>
          <li>To detect, prevent, and address technical issues</li>
        </ul>

        <h2 class="text-xl font-semibold mt-6 mb-3">3. Disclosure of Your Information</h2>
        <p class="mb-4">
          We may share your information with third parties in certain situations, including:
        </p>
        <ul class="list-disc pl-6 mb-4">
          <li>With service providers to monitor and analyze the use of our service</li>
          <li>
            For business transfers if we are involved in a merger, acquisition, or sale of assets
          </li>
          <li>
            With affiliates, in which case we will require those affiliates to honor this Privacy
            Policy
          </li>
          <li>With your consent or to fulfill the purpose for which you provided it</li>
          <li>If required by law, such as to comply with a subpoena or similar legal process</li>
        </ul>

        <h2 class="text-xl font-semibold mt-6 mb-3">4. Security of Your Information</h2>
        <p class="mb-4">
          We use administrative, technical, and physical security measures to help protect your
          personal information. While we have taken reasonable steps to secure the personal
          information you provide to us, please be aware that no security measures are perfect or
          impenetrable, and no method of data transmission can be guaranteed against interception or
          other types of misuse.
        </p>

        <h2 class="text-xl font-semibold mt-6 mb-3">5. Changes to This Privacy Policy</h2>
        <p class="mb-4">
          We may update our Privacy Policy from time to time. We will notify you of any changes by
          posting the new Privacy Policy on this page and updating the "Last Updated" date at the
          top of this Privacy Policy.
        </p>
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
