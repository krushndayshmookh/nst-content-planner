import { defineStore, acceptHMRUpdate } from 'pinia'

import { pb } from '../boot/pocketbase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
  }),

  persist: true,

  getters: {
    isAuthenticated() {
      return pb.authStore.isValid
    },
  },

  actions: {
    signOut() {
      this.user = null
      this.token = null
      pb.authStore.clear()
    },

    async signIn({ email, password }) {
      try {
        const authData = await pb.collection('users').authWithPassword(email, password)
        this.user = authData.record
        this.token = authData.token

        return true
      } catch (error) {
        console.error(error)
        return false
      }
    },

    async signUp({ name, email, password, passwordConfirm, campus }) {
      try {
        // Create the user
        const user = await pb.collection('users').create({ name, email, password, passwordConfirm })

        // Create the associated profile with default values
        await pb.collection('profiles').create({
          user: user.id,
          email,
          role: 'student', // Default role
          campus: campus || 'ADYPU', // Use provided campus or default to ADYPU
        })

        // Sign in the user
        const authData = await pb.collection('users').authWithPassword(email, password)
        this.user = authData.record
        this.token = authData.token

        // // Set email visibility to true
        await pb.collection('users').update(user.id, {
          emailVisibility: true,
        })

        return true
      } catch (error) {
        console.error(error)
        return false
      }
    },

    refreshAuth() {
      if (pb.authStore.isValid) {
        this.user = pb.authStore.record
        this.token = pb.authStore.token
      } else {
        this.user = null
        this.token = null
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
