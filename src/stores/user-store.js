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
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}

/*
const records = await pb.collection('profiles').getFullList({
          expand: 'user',
        })
        this.users = records.map((record) => {
          return {
            ...record.expand.user,
            profile: record,
          }
        })
*/
