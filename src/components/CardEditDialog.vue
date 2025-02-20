<template>
  <q-card style="min-width: 850px">
    <q-card-section>
      <div class="text-h6">
        Edit Card
        <q-btn v-close-popup class="float-right" flat dense round icon="eva-close-outline" />
      </div>
    </q-card-section>

    <q-separator></q-separator>

    <div class="row">
      <div class="col-8">
        <q-scroll-area :style="`height: ${heightOfScrollArea}px`">
          <!-- <q-input v-model="courseTitle" label="Title" outlined dense class="q-mb-md" /> -->
          <!-- <q-input v-model="courseDescription" label="Description" outlined dense class="q-mb-md" /> -->

          <pre>{{ card }}</pre>

          <div class="empty-space q-px-xl q-my-xl"></div>
        </q-scroll-area>
      </div>
      <q-separator vertical></q-separator>
      <div class="col">
        <q-scroll-area :style="`height: ${heightOfScrollArea}px`">
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">Assignments</div>

            <q-card flat bordered>
              <!-- Creator Group -->
              <q-card-section>
                <q-select
                  v-model="creator"
                  :options="teamMembers"
                  option-label="name"
                  option-value="id"
                  label="Creator"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                  class="q-mb-sm"
                />
                <q-input v-model="creation_deadline" label="Creator Deadline" outlined dense>
                  <template #append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy
                        ref="creatorProxy"
                        cover
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-date v-model="creation_deadline" mask="YYYY-MM-DD">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Close" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </q-card-section>

              <q-separator />

              <!-- Reviewer 1 Group -->
              <q-card-section>
                <q-select
                  v-model="reviewer1"
                  :options="teamMembers"
                  option-label="name"
                  option-value="id"
                  label="Reviewer 1"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                  class="q-mb-sm"
                />
                <q-input v-model="r1_deadline" label="Reviewer 1 Deadline" outlined dense>
                  <template #append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy
                        ref="r1Proxy"
                        cover
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-date
                          v-model="r1_deadline"
                          mask="YYYY-MM-DD"
                          :min="creation_deadline"
                          :max="getMaxDate(creation_deadline)"
                        >
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Close" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </q-card-section>

              <q-separator />

              <!-- Reviewer 2 Group -->
              <q-card-section>
                <q-select
                  v-model="reviewer2"
                  :options="teamMembers"
                  option-label="name"
                  option-value="id"
                  label="Reviewer 2"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                  class="q-mb-sm"
                />
                <q-input v-model="r2_deadline" label="Reviewer 2 Deadline" outlined dense>
                  <template #append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy
                        ref="r2Proxy"
                        cover
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-date
                          v-model="r2_deadline"
                          mask="YYYY-MM-DD"
                          :min="r1_deadline"
                          :max="getMaxDate(r1_deadline)"
                        >
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Close" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </q-card-section>
            </q-card>
          </q-card-section>
        </q-scroll-area>
      </div>
    </div>

    <q-separator></q-separator>

    <q-card-section>
      <div class="row items-center q-col-gutter-md">
        <div class="col">
          <q-btn round dense flat icon="eva-trash-2-outline" color="negative" @click="deleteCard" />
        </div>
        <div class="col-auto">
          <q-btn label="Update" color="primary" @click="updateCard" />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useCourseStore } from 'src/stores/course-store.js'
import { useUserStore } from 'src/stores/user-store.js'
import { useRoute } from 'vue-router'
import { formatDateForUI } from 'src/boot/filters'
import { useQuasar } from 'quasar'

const courseStore = useCourseStore()
const userStore = useUserStore()
const route = useRoute()
const $q = useQuasar()
const card = courseStore.selectedCard
const teamMembers = ref([])

const creator = ref(card.creator || null)
const reviewer1 = ref(card.reviewer1 || null)
const reviewer2 = ref(card.reviewer2 || null)

// Initialize deadline refs with existing values or null
const creation_deadline = ref(formatDateForUI(card.creation_deadline) || null)
const r1_deadline = ref(formatDateForUI(card.r1_deadline) || null)
const r2_deadline = ref(formatDateForUI(card.r2_deadline) || null)

// Create refs for date pickers
const creatorProxy = ref(null)
const r1Proxy = ref(null)
const r2Proxy = ref(null)

// Function to calculate max date (30 days from min date)
const getMaxDate = (minDate) => {
  if (!minDate) return null
  const maxDate = new Date(minDate)
  maxDate.setDate(maxDate.getDate() + 30)
  return maxDate.toISOString().split('T')[0]
}
// Watch for changes to creator deadline
watch(creation_deadline, (newDate) => {
  if (newDate) {
    // Set R1 deadline to 1 day after creator deadline
    const r1Date = new Date(newDate)
    r1Date.setDate(r1Date.getDate() + 1)
    r1_deadline.value = r1Date.toISOString().split('T')[0]

    // Set R2 deadline to 1 day after R1 deadline
    const r2Date = new Date(r1Date)
    r2Date.setDate(r2Date.getDate() + 1)
    r2_deadline.value = r2Date.toISOString().split('T')[0]
  }
})

// Watch for changes to reviewer1 deadline
watch(r1_deadline, (newDate) => {
  if (newDate) {
    // Set R2 deadline to 1 day after R1 deadline
    const r2Date = new Date(newDate)
    r2Date.setDate(r2Date.getDate() + 1)
    r2_deadline.value = r2Date.toISOString().split('T')[0]
  }
})

const fetchTeamMembers = async () => {
  const courseId = route.params.courseId
  const team = await courseStore.fetchCourseTeam(courseId)
  const users = await userStore.fetchUsers()

  // Filter users to only include team members
  teamMembers.value = users.filter((user) => team.members.includes(user.id))
}

onMounted(() => {
  fetchTeamMembers()
})

const updateCard = async () => {
  const updatedCard = {
    creator: creator.value,
    reviewer1: reviewer1.value,
    reviewer2: reviewer2.value,
    creation_deadline: creation_deadline.value ? new Date(creation_deadline.value) : null,
    r1_deadline: r1_deadline.value ? new Date(r1_deadline.value) : null,
    r2_deadline: r2_deadline.value ? new Date(r2_deadline.value) : null,
  }
  await courseStore.updateCard(card.id, updatedCard)
}

const deleteCard = async () => {
  // await courseStore.deleteCard(card.id)

  $q.notify({
    type: 'negative',
    message: 'You are not allowed to delete a card',
  })
}

const heightOfScrollArea = window.innerHeight - (48 + 64 + 68.01 + 2 + 4) // 48 is space around dialog,  64 is header height, 68.01 is footer height, 2 is separators height, 4 is buffer
</script>

<style scoped></style>
