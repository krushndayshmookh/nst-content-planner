<template>
  <q-page class="q-pa-md">
    <q-card v-if="card == 'sign-in'" class="q-ma-md">
      <q-card-section>
        <q-input v-model="email" label="Email" outlined dense />
      </q-card-section>
      <q-card-section>
        <q-input v-model="password" label="Password" type="password" outlined dense />
      </q-card-section>
      <q-card-section>
        <q-btn label="Sign In" color="primary" dense @click="signIn" />

        <q-btn label="Sign Up" color="secondary" dense to="/auth/sign-up" />
      </q-card-section>
    </q-card>

    <q-card v-if="card == 'sign-up'" class="q-ma-md">
      <q-card-section>
        <q-input v-model="name" label="Name" outlined dense />
      </q-card-section>
      <q-card-section>
        <q-input v-model="email" label="Email" outlined dense />
      </q-card-section>
      <q-card-section>
        <q-input v-model="password" label="Password" type="password" outlined dense />
      </q-card-section>
      <q-card-section>
        <q-input
          v-model="passwordConfirm"
          label="Confirm Password"
          type="password"
          outlined
          dense
        />
      </q-card-section>
      <q-card-section>
        <q-btn label="Sign Up" color="primary" dense @click="signUp" />

        <q-btn label="Sign In" color="secondary" dense to="/auth/sign-in" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from 'src/stores/auth-store.js'

const authStore = useAuthStore()

const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const name = ref('')
const passwordConfirm = ref('')

const card = computed(() => route.params.authCard ?? 'sign-in')

const signIn = () => {
  const isSignedIn = authStore.signIn({
    email: email.value,
    password: password.value,
  })

  if (isSignedIn) {
    router.push('/')
  }
}

const signUp = () => {
  const isSignedIn = authStore.signUp({
    name: name.value,
    email: email.value,
    password: password.value,
    passwordConfirm: passwordConfirm.value,
  })

  if (isSignedIn) {
    router.push('/')
  }
}
</script>
