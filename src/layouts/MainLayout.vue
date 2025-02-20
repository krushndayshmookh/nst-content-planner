<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          v-if="isAuthenticated"
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> NST Content Planner </q-toolbar-title>

        <div v-if="isAuthenticated">
          <q-btn round flat dense icon="eva-power-outline" @click="signOut"></q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-if="isAuthenticated" v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Welcome {{ loggedInUser.name }} </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import { useRoute, useRouter } from 'vue-router'

const linksList = [
  {
    title: 'Courses',
    icon: 'eva-book-outline',
    to: '/courses',
  },
]

import { useGeneralStore } from 'src/stores/general-store'
const generalStore = useGeneralStore()

const leftDrawerOpen = computed({
  get: () => generalStore.leftDrawerOpen,
  set: (value) => (generalStore.leftDrawerOpen = value),
})

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

import { useAuthStore } from 'src/stores/auth-store.js'
const authStore = useAuthStore()

const route = useRoute()
const router = useRouter()

const isAuthenticated = computed(() => !!authStore.token)
const loggedInUser = computed(() => authStore.user)

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
