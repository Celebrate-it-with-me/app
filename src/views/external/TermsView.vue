<template>
  <section class="min-h-screen flex items-center justify-center bg-pink-50 dark:bg-gray-900 px-4 py-12">
    <CCard class="max-w-4xl w-full p-8 shadow-xl">
      <h1 class="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Terms of Service</h1>

      <div class="prose prose-pink max-w-none dark:prose-invert">
        <p class="mb-4">
          Welcome to Celebrate With Me. By using our service, you agree to these terms.
        </p>

        <h2 class="text-xl font-semibold mt-6 mb-3">1. Acceptance of Terms</h2>
        <p class="mb-4">
          By accessing or using our service, you agree to be bound by these Terms of Service and all applicable laws and regulations.
          If you do not agree with any of these terms, you are prohibited from using or accessing this site.
        </p>

        <h2 class="text-xl font-semibold mt-6 mb-3">2. Use License</h2>
        <p class="mb-4">
          Permission is granted to temporarily use the materials on Celebrate With Me's website for personal, non-commercial purposes only.
          This is the grant of a license, not a transfer of title, and under this license you may not:
        </p>
        <ul class="list-disc pl-6 mb-4">
          <li>Modify or copy the materials</li>
          <li>Use the materials for any commercial purpose</li>
          <li>Attempt to decompile or reverse engineer any software contained on the website</li>
          <li>Remove any copyright or other proprietary notations from the materials</li>
          <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
        </ul>

        <h2 class="text-xl font-semibold mt-6 mb-3">3. Disclaimer</h2>
        <p class="mb-4">
          The materials on Celebrate With Me's website are provided on an 'as is' basis. Celebrate With Me makes no warranties,
          expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties
          or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other
          violation of rights.
        </p>

        <h2 class="text-xl font-semibold mt-6 mb-3">4. Limitations</h2>
        <p class="mb-4">
          In no event shall Celebrate With Me or its suppliers be liable for any damages (including, without limitation, damages for
          loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the website,
          even if Celebrate With Me or a Celebrate With Me authorized representative has been notified orally or in writing of the
          possibility of such damage.
        </p>

        <h2 class="text-xl font-semibold mt-6 mb-3">5. Revisions and Errata</h2>
        <p class="mb-4">
          The materials appearing on Celebrate With Me's website could include technical, typographical, or photographic errors.
          Celebrate With Me does not warrant that any of the materials on its website are accurate, complete or current.
          Celebrate With Me may make changes to the materials contained on its website at any time without notice.
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
