import { defineStore, acceptHMRUpdate } from 'pinia'

export const useGeneralStore = defineStore('general', {
  state: () => ({
    leftDrawerOpen: false,
  }),

  persist: true,
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(defineStore, import.meta.hot))
}
