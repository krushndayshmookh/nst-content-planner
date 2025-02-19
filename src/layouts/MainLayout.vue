<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Quasar App </q-toolbar-title>

        <div v-if="isAuthenticated">
          <q-btn round flat dense icon="eva-power-outline" @click="signOut"></q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Essential Links </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import { useRoute, useRouter } from 'vue-router'

const linksList = [
  {
    title: 'Docs',
    caption: 'quasar.dev',
    icon: 'school',
    link: 'https://quasar.dev',
  },
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

import { useAuthStore } from 'src/stores/auth-store.js'
const authStore = useAuthStore()

const route = useRoute()
const router = useRouter()

const isAuthenticated = computed(() => !!authStore.token)

const checkAuth = () => {
  if (isAuthenticated.value) {
    authStore.refreshAuth()
  } else {
    const currentPath = route.fullPath
    authStore.signOut()

    if (!currentPath.includes('/auth/')) {
      router.push('/auth/sign-in', {
        query: {
          redirect: currentPath,
        },
      })
    }
  }
}

checkAuth()

const signOut = () => {
  authStore.signOut()
  router.push('/auth/sign-in')
}
</script>
