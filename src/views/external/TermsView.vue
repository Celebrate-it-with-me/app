<script setup>
import { useI18n } from 'vue-i18n'
import LegalPage from '@/components/external/legal/LegalPage.vue'

const { t } = useI18n()
</script>

<template>
  <LegalPage :title="t('titles.terms')" updated="2026-11-11">
        <p>
          Welcome to Quinvite ("we", "us", or "our"). These Terms of Service ("Terms")
          govern your use of our website and event planning services. By accessing or using our
          services, you agree to be bound by these Terms and our Privacy Policy.
        </p>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By creating an account, accessing our website, or using our services, you acknowledge that
          you have read, understood, and agree to be bound by these Terms and all applicable laws
          and regulations. If you do not agree with any part of these Terms, you must not use our
          services.
        </p>
        <p>
          These Terms apply to all users of our services, including event hosts, guests, and
          visitors to our website.
        </p>
        <h2>2. Description of Service</h2>
        <p>
          Quinvite is an event planning platform that helps users create, manage, and
          celebrate special occasions including quinceañeras, birthdays, weddings, and other
          celebrations. Our services include:
        </p>
        <ul>
          <li>Event creation and management tools</li>
          <li>Guest invitation and RSVP management</li>
          <li>Vendor recommendations and booking assistance</li>
          <li>Budget tracking and planning tools</li>
          <li>Photo and memory sharing features</li>
          <li>Communication tools for event coordination</li>
        </ul>
        <h2>3. User Accounts and Registration</h2>
        <h3>Account Creation</h3>
        <p>
          To use certain features of our service, you must create an account by providing accurate
          and complete information. You are responsible for:
        </p>
        <ul>
          <li>Maintaining the confidentiality of your account credentials</li>
          <li>All activities that occur under your account</li>
          <li>Notifying us immediately of any unauthorized use</li>
          <li>Ensuring your account information remains current and accurate</li>
        </ul>
        <h3>Age Requirements</h3>
        <p>
          You must be at least 13 years old to create an account. Users between 13 and 18 years old
          must have parental consent to use our services.
        </p>
        <h2>4. Acceptable Use Policy</h2>
        <p>
          You agree to use our services only for lawful purposes and in accordance with these Terms.
          You agree not to:
        </p>
        <h3>Prohibited Activities</h3>
        <ul>
          <li>Violate any applicable laws or regulations</li>
          <li>Infringe on the rights of others, including intellectual property rights</li>
          <li>Upload or share inappropriate, offensive, or harmful content</li>
          <li>Harass, abuse, or harm other users</li>
          <li>Spam or send unsolicited communications</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Use our services for commercial purposes without permission</li>
          <li>Create fake accounts or impersonate others</li>
        </ul>
        <h2>5. Content and Intellectual Property</h2>
        <h3>Your Content</h3>
        <p>
          You retain ownership of content you upload to our platform. By uploading content, you
          grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute
          your content in connection with our services.
        </p>
        <h3>Our Content</h3>
        <p>
          All content, features, and functionality of our service, including but not limited to
          text, graphics, logos, and software, are owned by us or our licensors and are protected by
          copyright, trademark, and other intellectual property laws.
        </p>
        <h2>6. Payment Terms</h2>
        <h3>Fees and Billing</h3>
        <p>
          Certain features of our service may require payment. By purchasing premium features, you
          agree to pay all applicable fees as described at the time of purchase.
        </p>
        <ul>
          <li>All fees are non-refundable unless otherwise stated</li>
          <li>Prices may change with 30 days' notice</li>
          <li>You are responsible for all taxes and fees</li>
          <li>Payment information must be current and accurate</li>
        </ul>
        <h3>Subscription Services</h3>
        <p>
          Subscription services automatically renew unless cancelled. You may cancel your
          subscription at any time through your account settings.
        </p>
        <h2>7. Privacy and Data Protection</h2>
        <p>
          Your privacy is important to us. Our collection and use of personal information is
          governed by our Privacy Policy, which is incorporated into these Terms by reference.
        </p>
        <h2>8. Disclaimers and Limitations of Liability</h2>
        <h3>Service Availability</h3>
        <p>
          Our services are provided "as is" and "as available." We do not guarantee that our
          services will be uninterrupted, error-free, or completely secure.
        </p>
        <h3>Limitation of Liability</h3>
        <p>
          To the maximum extent permitted by law, we shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages, including but not limited to loss
          of profits, data, or other intangible losses.
        </p>
        <h2>9. Indemnification</h2>
        <p>
          You agree to indemnify and hold us harmless from any claims, damages, or expenses arising
          from your use of our services, violation of these Terms, or infringement of any rights of
          another party.
        </p>
        <h2>10. Termination</h2>
        <p>
          We may terminate or suspend your account and access to our services at any time, with or
          without notice, for conduct that we believe violates these Terms or is harmful to other
          users or our business.
        </p>
        <p>
          You may terminate your account at any time by contacting us or using the account deletion
          feature in your settings.
        </p>
        <h2>11. Governing Law and Dispute Resolution</h2>
        <p>
          These Terms are governed by the laws of the State of New York, without regard to conflict
          of law principles. Any disputes arising from these Terms or your use of our services will
          be resolved through binding arbitration.
        </p>
        <h2>12. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. We will notify users of material
          changes by email or through our service. Your continued use of our services after changes
          become effective constitutes acceptance of the new Terms.
        </p>
        <h2>13. Contact Information</h2>
        <p>
          If you have any questions about these Terms of Service, please contact us at:
        </p>
        <ul>
          <li><strong>Email:</strong> hola@quinvite.com</li>
          <li><strong>Phone:</strong> +1 (234) 567-8901</li>
          <li><strong>Address:</strong> 123 Celebration Ave, Suite 101, New York, NY 10001</li>
        </ul>
        <p>
          <strong>Last Updated:</strong> January 31, 2025
        </p>
      
  </LegalPage>
</template>
