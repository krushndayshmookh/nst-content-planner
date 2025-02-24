<template>
  <q-page class="q-pa-md bg-books">
    <div class="row justify-center">
      <div class="col-12 col-sm-6 col-md-4">
        <q-card v-if="card == 'sign-in'" class="q-ma-md">
          <q-card-section>
            <div class="text-h6">Sign In</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-banner v-if="errorMessage" class="bg-negative text-white q-mb-md">
              {{ errorMessage }}
            </q-banner>

            <q-input v-model="email" label="Email" outlined dense class="q-mb-md" />

            <q-input
              v-model="password"
              label="Password"
              type="password"
              outlined
              dense
              class="q-mb-md"
            />

            <q-btn label="Sign In" color="primary" class="q-mr-md" @click="signIn" />

            <q-btn outline label="Sign Up" color="secondary" to="/auth/sign-up" />
          </q-card-section>
        </q-card>

        <q-card v-if="card == 'sign-up'" class="q-ma-md">
          <q-card-section>
            <div class="text-h6">Sign Up</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-banner v-if="errorMessage" class="bg-negative text-white q-mb-md">
              {{ errorMessage }}
            </q-banner>

            <q-input v-model="name" label="Name" outlined dense class="q-mb-md" />

            <q-input v-model="email" label="Email" outlined dense class="q-mb-md" />

            <q-select
              v-model="campus"
              :options="campusOptions"
              label="Campus"
              outlined
              dense
              class="q-mb-md"
              map-options
              emit-value
            />

            <q-input
              v-model="password"
              label="Password"
              type="password"
              outlined
              dense
              class="q-mb-md"
            />

            <q-input
              v-model="passwordConfirm"
              label="Confirm Password"
              type="password"
              outlined
              dense
              class="q-mb-md"
            />

            <q-btn label="Sign Up" color="primary" class="q-mr-md" @click="signUp" />

            <q-btn outline label="Sign In" color="secondary" to="/auth/sign-in" />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

import { useAuthStore } from 'src/stores/auth-store.js'

const authStore = useAuthStore()
const $q = useQuasar()

const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const name = ref('')
const passwordConfirm = ref('')
const campus = ref('ADYPU')
const errorMessage = ref('')

const campusOptions = [
  { label: 'ADYPU', value: 'ADYPU' },
  { label: 'RU', value: 'RU' },
]

const card = computed(() => route.params.authCard ?? 'sign-in')

const signIn = async () => {
  errorMessage.value = ''

  $q.loading.show({
    message: 'Signing in...',
    spinnerColor: 'primary',
  })

  try {
    const isSignedIn = await authStore.signIn({
      email: email.value,
      password: password.value,
    })

    if (isSignedIn) {
      router.push('/')
    } else {
      errorMessage.value = 'Invalid email or password'
    }
  } finally {
    $q.loading.hide()
  }
}

const signUp = async () => {
  errorMessage.value = ''

  $q.loading.show({
    message: 'Creating your account...',
    spinnerColor: 'primary',
  })

  try {
    const isSignedIn = await authStore.signUp({
      name: name.value,
      email: email.value,
      password: password.value,
      passwordConfirm: passwordConfirm.value,
      campus: campus.value,
    })

    if (isSignedIn) {
      router.push('/')
    } else {
      errorMessage.value = 'Failed to create account. Please check your information and try again.'
    }
  } finally {
    $q.loading.hide()
  }
}
</script>

<style scoped>
.bg-books {
  background-image: url('/images/books.avif');
  background-size: cover;
  background-position: center;
}
</style>
