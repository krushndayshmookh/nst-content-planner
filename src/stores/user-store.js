import { defineStore, acceptHMRUpdate } from 'pinia'
import { pb } from '../boot/pocketbase'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    profiles: [],
  }),

  actions: {
    async fetchUsers() {
      try {
        const records = await pb.collection('users').getFullList({
          sort: 'name',
        })

        const profiles = await pb.collection('profiles').getFullList()
        this.profiles = profiles

        records.forEach((user) => {
          const profile = profiles.find((profile) => profile.user === user.id)
          if (profile) {
            user.profile = profile
          }
        })

        this.users = records
        return records
      } catch (err) {
        console.error('Failed to fetch users:', err)
        return []
      }
    },

    async createUser({ name, email, password, role, campus }) {
      try {
        // First create the user
        const user = await pb.collection('users').create({
          email,
          password,
          passwordConfirm: password,
          name,
        })

        await pb.collection('users').update(user.id, {
          emailVisibility: true,
        })

        // Then create the associated profile
        const profile = await pb.collection('profiles').create({
          user: user.id,
          email,
          role,
          campus,
        })

        // Add the user to the local state
        user.profile = profile
        this.users.push(user)
        this.profiles.push(profile)

        return user
      } catch (err) {
        console.error('Failed to create user:', err)
        throw err
      }
    },

    async updateUser({ id, name, email, password, role, campus }) {
      try {
        const user = this.users.find((u) => u.id === id)
        if (!user || !user.profile) return null

        // Prepare user update data
        const userData = {
          name,
        }

        // Only include email and password if provided (admin only)
        if (email) {
          userData.email = email
          userData.emailVisibility = true
        }

        if (password) {
          userData.password = password
          userData.passwordConfirm = password
        }

        // Update the user
        const updatedUser = await pb.collection('users').update(id, userData)

        // Update the profile
        const updatedProfile = await pb.collection('profiles').update(user.profile.id, {
          email,
          role,
          campus,
        })

        // Update local state
        const userIndex = this.users.findIndex((u) => u.id === id)
        if (userIndex !== -1) {
          this.users[userIndex] = { ...updatedUser, profile: updatedProfile }
        }

        const profileIndex = this.profiles.findIndex((p) => p.id === updatedProfile.id)
        if (profileIndex !== -1) {
          this.profiles[profileIndex] = updatedProfile
        }

        return { ...updatedUser, profile: updatedProfile }
      } catch (err) {
        console.error('Failed to update user:', err)
        throw err
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
