<template>
  <CHeading :level="2" weight="semibold">User Profile</CHeading>
  <Form
    :validation-schema="profileSchema"
    @submit="onSubmitProfile"
    @invalid-submit="onInvalidSubmitProfile"
  >
    <div class="mx-auto py-10 space-y-10">
      <div class="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-card mx-auto space-y-6">
        <div class="flex items-center gap-6 mb-8">
          <CAvatarUploader
            v-model="userAvatar"
            @file-selected="handleFileSelected"
          />
        </div>

        <form class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CInput v-model="user.name" label="Full Name" name="name"  id="name"/>
            <CInput v-model="user.email" label="Email" name="email" disabled id="email"/>
            <CPhoneInput
              name="phone"
              id="user-phone"
              label="Phone Number"
              v-model="user.phone"
              show-error
            />
          </div>
        </form>

        <div class="mt-10 flex justify-end">
          <CButton
            type="submit"
            :loading="saving"
            :disabled="!isModified || saving"
            :class="{
            'opacity-50 cursor-not-allowed': !isModified || saving
          }"
          >
            Save Changes
          </CButton>
        </div>
      </div>
    </div>
  </Form>
</template>

<script setup>
import CInput from '@/components/UI/form2/CInput.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { computed, onMounted, reactive, ref } from 'vue'
import CAvatarUploader from '@/components/UI/form2/CAvatarUploader.vue'
import { useUserStore } from '@/stores/useUserStore'
import CPhoneInput from '@/components/UI/form2/CPhoneInput.vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import { Form } from 'vee-validate'
import CHeading from '@/components/UI/headings/CHeading.vue'

const userStore = useUserStore()
const saving = ref(false)

const userAvatar = computed(() => {
  return userStore?.avatar ?? ''
})

const isModified = computed(() => {
  return (
    user.name !== originalUser.name ||
    user.phone !== originalUser.phone ||
    user.avatar !== originalUser.avatar
  )
})

const profileSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      name: zod.string().min(1, 'Name is required.'),
      avatar: zod.any().refine(
        (file) =>
          !file || file instanceof File || (typeof file === 'object' && 'name' in file),
        'Avatar must be a valid file.'
      ),
      phone: zod.string().optional(),
    })
  )
})

const user = reactive({
  name: '',
  email: '',
  phone: '',
  avatar: '',
})

const originalUser = reactive({
  name: '',
  email: '',
  phone: '',
  avatar: '',
})

onMounted(() => {
  user.name = originalUser.name = userStore.name ?? ''
  user.email = originalUser.email = userStore.email ?? ''
  user.phone = originalUser.phone = userStore.phone ?? ''
  user.avatar = originalUser.avatar = userStore.avatar ?? ''
})

const handleFileSelected = (file) => {
  user.avatar = file
}

const onSubmitProfile = async () => {
  try {
    saving.value = true

    const response = await userStore.updateProfile({
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
    })

    if (response.status === 200) {
      await userStore.refreshUser()

      originalUser.name = user.name
      originalUser.phone = user.phone
      originalUser.avatar = user.avatar
    } else {
      console.error('Failed to update profile:', response)
    }
  } catch (error) {
    console.log(error)
  } finally {
    saving.value = false
  }
}

const onInvalidSubmitProfile = (errors) => {
  console.log('Form submission failed with errors:', errors)
}
</script>
