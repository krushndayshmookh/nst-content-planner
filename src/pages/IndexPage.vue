<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs class="text-primary q-mb-md">
      <template #separator>
        <q-icon size="1.5em" name="chevron_right" color="grey-7" />
      </template>

      <q-breadcrumbs-el label="Home" icon="home" />
    </q-breadcrumbs>

    <div class="row">
      <div class="col-3">
        <q-card class="cursor-pointer hoverable" @click="$router.push('/courses')">
          <q-card-section>
            <div class="text-h6">
              Courses
              <q-icon name="eva-chevron-right" class="float-right" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
// import { computed } from 'vue'
// import { useRouter } from 'vue-router'

// import { useAuthStore } from 'src/stores/auth-store.js'
// const authStore = useAuthStore()

// const user = computed(() => authStore.user)
// // const token = computed(() => authStore.token)
// // const isAuthenticated = computed(() => authStore.isAuthenticated)

// const signIn = () => {
//   authStore.signIn({
//     email: 'john.doe@example.com',
//     password: 'password123',
//   })
// }

// const router = useRouter()

// const signOut = () => {
//   authStore.signOut()
//   router.push('/auth/sign-in')
// }

// const refreshAuth = () => {
//   authStore.refreshAuth()
// }
</script>
