import { defineStore, acceptHMRUpdate } from 'pinia'

import { pb } from '../boot/pocketbase'

export const useCourseStore = defineStore('course', {
  state: () => ({
    // page: 1,
    perPage: 50,
    // totalItems: 100,
    // totalPages: 5,
    items: [],
  }),

  getters: {
    courses() {
      return this.items
    },
  },

  actions: {
    async fetchCourses() {
      const items = await pb.collection('courses').getFullList({ sort: 'title' })
      this.items = items
    },

    async createCourse(data) {
      await pb.collection('courses').create({
        ...data,
        created_at: new Date().toISOString(),
        created_by: pb.authStore.record.id,
        scrum_masters: JSON.stringify([pb.authStore.record.id]),
      })
      this.fetchCourses()
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCourseStore, import.meta.hot))
}
