import { defineStore, acceptHMRUpdate } from 'pinia'
import { pb } from '../boot/pocketbase'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
  }),

  actions: {
    async fetchUsers() {
      try {
        const records = await pb.collection('users').getFullList({
          sort: 'name',
          expand: 'profile',
        })
        this.users = records
        return records
      } catch (err) {
        console.error('Failed to fetch users:', err)
        return []
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
