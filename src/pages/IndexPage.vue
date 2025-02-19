<template>
  <q-page class="q-pa-md">
    <pre>{{ user }}</pre>
    <pre>{{ token }}</pre>
    <pre>{{ isAuthenticated }}</pre>

    <q-btn @click="signIn"> Sign In</q-btn>
    <q-btn @click="signOut"> Sign Out</q-btn>
    <q-btn @click="refreshAuth"> Refresh Auth</q-btn>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'

import { useAuthStore } from 'src/stores/auth-store.js'
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const token = computed(() => authStore.token)
const isAuthenticated = computed(() => authStore.isAuthenticated)

const signIn = () => {
  authStore.signIn({
    email: 'john.doe@example.com',
    password: 'password123',
  })
}

const signOut = () => {
  authStore.signOut()
}

const refreshAuth = () => {
  authStore.refreshAuth()
}
</script>
