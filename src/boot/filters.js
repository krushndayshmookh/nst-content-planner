import { defineBoot } from '#q-app/wrappers'
import { date as quasarDate } from 'quasar'

// Function to format date from PocketBase to UI (YYYY-MM-DD)
export const formatDateForUI = (dateStr) => {
  if (!dateStr) return null
  return dateStr.split(' ')[0]
}

export const humanDate = (dateStr) => {
  if (!dateStr) return null
  return quasarDate.formatDate(dateStr, 'D MMM YYYY')
}

export default defineBoot(({ app }) => {
  // Make filters available globally
  app.config.globalProperties.$formatDateForUI = formatDateForUI
  app.config.globalProperties.$humanDate = humanDate
})
