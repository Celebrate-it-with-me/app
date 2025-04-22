<template>
  <CHeading :level="2" weight="semibold">Security Settings</CHeading>
  <div class="mx-auto py-10 space-y-10">
    <!-- Change Password -->
    <ChangePasswordCard />

    <!-- Update Email -->
    <UpdateEmailCard v-if="false" />

    <!-- 2FA -->
    <TwoFactorAuthCard />

    <!-- Active Sessions -->
    <ActiveSessionsCard v-if="false" />
  </div>
</template>

<script setup>
import CHeading from '@/components/UI/headings/CHeading.vue'
import ChangePasswordCard from '@/components/internal/settings/security/ChangePasswordCard.vue'
import UpdateEmailCard from '@/components/internal/settings/security/UpdateEmailCard.vue'
import TwoFactorAuthCard from '@/components/internal/settings/security/TwoFactorAuthCard.vue'
import ActiveSessionsCard from '@/components/internal/settings/security/ActiveSessionsCard.vue'
</script>
