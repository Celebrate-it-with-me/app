<template>
  <div class="mx-auto space-y-10">
    <CHeading :level="2" weight="semibold" color="text-red-600">Danger Zone</CHeading>

    <ResetAccountDataCard />
    <TransferOwnershipCard />
    <RevokeApiTokensCard v-if="false" />
    <DeleteAccountCard />
  </div>
</template>

<script setup>
import CHeading from '@/components/UI/headings/CHeading.vue'

import DeleteAccountCard from '@/components/internal/settings/danger-zone/DeleteAccountCard.vue'
import RevokeApiTokensCard from '@/components/internal/settings/danger-zone/RevokeApiTokensCard.vue'
import ResetAccountDataCard from '@/components/internal/settings/danger-zone/ResetAccountDataCard.vue'
import TransferOwnershipCard from '@/components/internal/settings/danger-zone/TransferOwnershipCard.vue'
</script>
