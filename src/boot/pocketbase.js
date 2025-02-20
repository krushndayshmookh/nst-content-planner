import { defineBoot } from '#q-app/wrappers'
import PocketBase from 'pocketbase'

const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090')

export default defineBoot(({ app }) => {
  app.config.globalProperties.$pb = pb
})

export { pb }
