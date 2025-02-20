import { defineBoot } from '#q-app/wrappers'

// Function to format date from PocketBase to UI (YYYY-MM-DD)
export const formatDateForUI = (dateStr) => {
  if (!dateStr) return null
  return dateStr.split(' ')[0]
}

export default defineBoot(({ app }) => {
  // Make formatDateForUI available globally
  app.config.globalProperties.$formatDateForUI = formatDateForUI
})
