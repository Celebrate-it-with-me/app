<template>
  <section
    class="min-h-screen flex items-center justify-center bg-pink-50 dark:bg-gray-900 px-4 py-12"
  >
    <CCard class="max-w-4xl w-full p-8 shadow-xl">
      <h1 class="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Cookie Policy</h1>

      <div class="prose prose-pink max-w-none dark:prose-invert">
        <p class="mb-4">
          This Cookie Policy explains how Celebrate With Me ("we", "us", or "our") uses cookies and similar technologies when you visit our website or use our services. This policy explains what these technologies are, why we use them, and your rights to control our use of them.
        </p>

        <h2 class="text-xl font-semibold mt-6 mb-3">1. What Are Cookies?</h2>
        <p class="mb-4">
          Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work more efficiently and to provide reporting information. Cookies set by the website owner are called "first-party cookies." Cookies set by parties other than the website owner are called "third-party cookies."
        </p>

        <h2 class="text-xl font-semibold mt-6 mb-3">2. Why Do We Use Cookies?</h2>
        <p class="mb-4">We use cookies for several reasons:</p>
        <ul class="list-disc pl-6 mb-4">
          <li><strong>Essential Cookies:</strong> These are necessary for the website to function properly and cannot be switched off in our systems</li>
          <li><strong>Performance Cookies:</strong> These help us understand how visitors interact with our website by collecting and reporting information anonymously</li>
          <li><strong>Functionality Cookies:</strong> These enable the website to provide enhanced functionality and personalization</li>
          <li><strong>Targeting Cookies:</strong> These may be set through our site by our advertising partners to build a profile of your interests</li>
        </ul>

        <h2 class="text-xl font-semibold mt-6 mb-3">3. Types of Cookies We Use</h2>

        <h3 class="text-lg font-medium mt-4 mb-2">Strictly Necessary Cookies</h3>
        <p class="mb-4">
          These cookies are essential for you to browse the website and use its features, such as accessing secure areas of the site. Without these cookies, services you have asked for cannot be provided.
        </p>

        <h3 class="text-lg font-medium mt-4 mb-2">Analytics and Performance Cookies</h3>
        <p class="mb-4">
          These cookies collect information about how you use our website, such as which pages you visited and which links you clicked on. All of this information is aggregated and therefore anonymized. Their sole purpose is to improve website functions.
        </p>

        <h3 class="text-lg font-medium mt-4 mb-2">Functionality Cookies</h3>
        <p class="mb-4">
          These cookies allow our website to remember choices you make (such as your user name, language, or the region you are in) and provide enhanced, more personal features.
        </p>

        <h3 class="text-lg font-medium mt-4 mb-2">Advertising and Targeting Cookies</h3>
        <p class="mb-4">
          These cookies are used to deliver advertisements more relevant to you and your interests. They are also used to limit the number of times you see an advertisement and help measure the effectiveness of advertising campaigns.
        </p>

        <h2 class="text-xl font-semibold mt-6 mb-3">4. Third-Party Cookies</h2>
        <p class="mb-4">
          In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the service, deliver advertisements on and through the service, and so on. These third-party cookies may include:
        </p>
        <ul class="list-disc pl-6 mb-4">
          <li>Google Analytics for website analytics</li>
          <li>Social media platforms for social sharing features</li>
          <li>Advertising networks for targeted advertising</li>
          <li>Customer support tools for chat functionality</li>
        </ul>

        <h2 class="text-xl font-semibold mt-6 mb-3">5. How to Control Cookies</h2>
        <p class="mb-4">
          You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences by clicking on the appropriate opt-out links provided in our cookie banner when you first visit our website.
        </p>
        <p class="mb-4">
          You can also set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.
        </p>

        <h2 class="text-xl font-semibold mt-6 mb-3">6. Browser Settings</h2>
        <p class="mb-4">
          Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience since it will no longer be personalized to you. Here are links to cookie settings for popular browsers:
        </p>
        <ul class="list-disc pl-6 mb-4">
          <li>Chrome: Settings > Privacy and security > Cookies and other site data</li>
          <li>Firefox: Settings > Privacy & Security > Cookies and Site Data</li>
          <li>Safari: Preferences > Privacy > Cookies and website data</li>
          <li>Edge: Settings > Cookies and site permissions > Cookies and site data</li>
        </ul>

        <h2 class="text-xl font-semibold mt-6 mb-3">7. Updates to This Cookie Policy</h2>
        <p class="mb-4">
          We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. Please revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
        </p>

        <h2 class="text-xl font-semibold mt-6 mb-3">8. Contact Us</h2>
        <p class="mb-4">
          If you have any questions about our use of cookies or other technologies, please contact us at:
        </p>
        <ul class="list-none mb-4">
          <li><strong>Email:</strong> privacy@celebrateitwithme.com</li>
          <li><strong>Address:</strong> 123 Celebration Ave, Suite 101, New York, NY 10001</li>
        </ul>

        <p class="text-sm text-gray-600 dark:text-gray-400 mt-6">
          <strong>Last Updated:</strong> January 31, 2025
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
