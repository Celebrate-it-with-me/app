<script setup>
import { useI18n } from 'vue-i18n'
import LegalPage from '@/components/external/legal/LegalPage.vue'

const { t } = useI18n()
</script>

<template>
  <LegalPage :title="t('titles.cookies')" updated="2026-11-11">
        <p>
          This Cookie Policy explains how Quinvite ("we", "us", or "our") uses cookies and
          similar technologies when you visit our website or use our services. This policy explains
          what these technologies are, why we use them, and your rights to control our use of them.
        </p>
        <h2>1. What Are Cookies?</h2>
        <p>
          Cookies are small data files that are placed on your computer or mobile device when you
          visit a website. Cookies are widely used by website owners to make their websites work
          more efficiently and to provide reporting information. Cookies set by the website owner
          are called "first-party cookies." Cookies set by parties other than the website owner are
          called "third-party cookies."
        </p>
        <h2>2. Why Do We Use Cookies?</h2>
        <p>We use cookies for several reasons:</p>
        <ul>
          <li>
            <strong>Essential Cookies:</strong> These are necessary for the website to function
            properly and cannot be switched off in our systems
          </li>
          <li>
            <strong>Performance Cookies:</strong> These help us understand how visitors interact
            with our website by collecting and reporting information anonymously
          </li>
          <li>
            <strong>Functionality Cookies:</strong> These enable the website to provide enhanced
            functionality and personalization
          </li>
          <li>
            <strong>Targeting Cookies:</strong> These may be set through our site by our advertising
            partners to build a profile of your interests
          </li>
        </ul>
        <h2>3. Types of Cookies We Use</h2>
        <h3>Strictly Necessary Cookies</h3>
        <p>
          These cookies are essential for you to browse the website and use its features, such as
          accessing secure areas of the site. Without these cookies, services you have asked for
          cannot be provided.
        </p>
        <h3>Analytics and Performance Cookies</h3>
        <p>
          These cookies collect information about how you use our website, such as which pages you
          visited and which links you clicked on. All of this information is aggregated and
          therefore anonymized. Their sole purpose is to improve website functions.
        </p>
        <h3>Functionality Cookies</h3>
        <p>
          These cookies allow our website to remember choices you make (such as your user name,
          language, or the region you are in) and provide enhanced, more personal features.
        </p>
        <h3>Advertising and Targeting Cookies</h3>
        <p>
          These cookies are used to deliver advertisements more relevant to you and your interests.
          They are also used to limit the number of times you see an advertisement and help measure
          the effectiveness of advertising campaigns.
        </p>
        <h2>4. Third-Party Cookies</h2>
        <p>
          In addition to our own cookies, we may also use various third-party cookies to report
          usage statistics of the service, deliver advertisements on and through the service, and so
          on. These third-party cookies may include:
        </p>
        <ul>
          <li>Google Analytics for website analytics</li>
          <li>Social media platforms for social sharing features</li>
          <li>Advertising networks for targeted advertising</li>
          <li>Customer support tools for chat functionality</li>
        </ul>
        <h2>5. How to Control Cookies</h2>
        <p>
          You have the right to decide whether to accept or reject cookies. You can exercise your
          cookie preferences by clicking on the appropriate opt-out links provided in our cookie
          banner when you first visit our website.
        </p>
        <p>
          You can also set or amend your web browser controls to accept or refuse cookies. If you
          choose to reject cookies, you may still use our website though your access to some
          functionality and areas of our website may be restricted.
        </p>
        <h2>6. Browser Settings</h2>
        <p>
          Most web browsers allow you to control cookies through their settings preferences.
          However, if you limit the ability of websites to set cookies, you may worsen your overall
          user experience since it will no longer be personalized to you. Here are links to cookie
          settings for popular browsers:
        </p>
        <ul>
          <li>Chrome: Settings > Privacy and security > Cookies and other site data</li>
          <li>Firefox: Settings > Privacy & Security > Cookies and Site Data</li>
          <li>Safari: Preferences > Privacy > Cookies and website data</li>
          <li>Edge: Settings > Cookies and site permissions > Cookies and site data</li>
        </ul>
        <h2>7. Updates to This Cookie Policy</h2>
        <p>
          We may update this Cookie Policy from time to time to reflect changes in our practices or
          for other operational, legal, or regulatory reasons. Please revisit this Cookie Policy
          regularly to stay informed about our use of cookies and related technologies.
        </p>
        <h2>8. Contact Us</h2>
        <p>
          If you have any questions about our use of cookies or other technologies, please contact
          us at:
        </p>
        <ul>
          <li><strong>Email:</strong> hola@quinvite.com</li>
          <li><strong>Address:</strong> 123 Celebration Ave, Suite 101, New York, NY 10001</li>
        </ul>
        <p>
          <strong>Last Updated:</strong> January 31, 2025
        </p>
      
  </LegalPage>
</template>
