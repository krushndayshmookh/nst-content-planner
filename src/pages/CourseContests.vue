<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs class="text-primary q-mb-md">
      <template #separator>
        <q-icon size="1.5em" name="chevron_right" color="grey-7" />
      </template>

      <q-breadcrumbs-el class="text-grey-7" label="Home" icon="home" to="/" />
      <q-breadcrumbs-el class="text-grey-7" label="Courses" icon="eva-grid-outline" to="/courses" />
      <q-breadcrumbs-el
        v-if="course"
        :label="course.title"
        icon="eva-book-outline"
        :to="`/courses/${courseId}`"
      />
      <q-breadcrumbs-el label="Contests" icon="eva-award-outline" />
    </q-breadcrumbs>

    <div class="q-mb-md row items-center">
      <div class="col">
        <div class="text-h6">Contests</div>
      </div>
      <div class="col text-right">
        <q-btn color="primary" icon="eva-plus-outline" label="Contest" @click="openCreateContest" />
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-list bordered separator>
          <q-expansion-item
            v-if="upcomingReadyContests.length"
            icon="eva-checkmark-circle-2"
            label="Upcoming Ready Contests"
            caption="Contests that are ready to be executed"
            header-class="text-positive"
            default-opened
          >
            <q-list separator>
              <q-item v-for="contest in upcomingReadyContests" :key="contest.id">
                <q-item-section>
                  <q-item-label>{{ contest.title }}</q-item-label>
                  <q-item-label caption>
                    Type: {{ contest.contest_type }} | Date:
                    {{ formatDateForUI(contest.contest_date) }}
                  </q-item-label>
                  <q-item-label v-if="contest.contest_owner" caption>
                    Owner: {{ contest.expand?.contest_owner?.name }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="eva-edit-outline"
                    @click.stop="openEditContest(contest)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>

          <q-expansion-item
            v-if="upcomingNotReadyContests.length"
            icon="eva-alert-triangle-outline"
            label="Upcoming Contests (Not Ready)"
            caption="Contests that need preparation"
            header-class="text-negative"
            default-opened
          >
            <q-list separator>
              <q-item v-for="contest in upcomingNotReadyContests" :key="contest.id">
                <q-item-section>
                  <q-item-label>{{ contest.title }}</q-item-label>
                  <q-item-label caption>
                    Type: {{ contest.contest_type }} | Date:
                    {{ formatDateForUI(contest.contest_date) }}
                  </q-item-label>
                  <q-item-label v-if="contest.contest_owner" caption>
                    Owner: {{ contest.expand?.contest_owner?.name }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="eva-edit-outline"
                    @click.stop="openEditContest(contest)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>

          <q-expansion-item
            v-if="executedContests.length"
            icon="eva-done-all"
            label="Executed Contests"
            caption="Past contests"
            header-class="text-primary"
          >
            <q-list separator>
              <q-item v-for="contest in executedContests" :key="contest.id">
                <q-item-section>
                  <q-item-label>{{ contest.title }}</q-item-label>
                  <q-item-label caption>
                    Type: {{ contest.contest_type }} | Date:
                    {{ formatDateForUI(contest.contest_date) }}
                  </q-item-label>
                  <q-item-label v-if="contest.contest_owner" caption>
                    Owner: {{ contest.expand?.contest_owner?.name }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="eva-edit-outline"
                    @click.stop="openEditContest(contest)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>
        </q-list>
      </div>
    </div>

    <q-dialog v-model="showContestDialog" position="right" persistent full-height>
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{ isEditing ? 'Edit Contest' : 'Create Contest' }}
            <q-btn v-close-popup class="float-right" flat dense round icon="eva-close-outline" />
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-input v-model="contestTitle" label="Title" outlined dense class="q-mb-md" />
          <q-select
            v-model="contestType"
            :options="contestTypes"
            label="Contest Type"
            outlined
            dense
            class="q-mb-md"
          />
          <q-input v-model="contestDate" label="Contest Date" outlined dense class="q-mb-md">
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  ref="dateProxy"
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    v-model="contestDate"
                    mask="YYYY-MM-DD"
                    today-btn
                    @update:model-value="() => dateProxy.hide()"
                  />
                </q-popup-proxy>
              </q-icon>
              <q-icon name="close" class="cursor-pointer" @click.stop="contestDate = ''" />
            </template>
          </q-input>
          <q-input v-model="contestReadyAt" label="Ready Date" outlined dense class="q-mb-md">
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  ref="readyDateProxy"
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    v-model="contestReadyAt"
                    mask="YYYY-MM-DD"
                    today-btn
                    @update:model-value="() => readyDateProxy.hide()"
                  />
                </q-popup-proxy>
              </q-icon>
              <q-icon name="close" class="cursor-pointer" @click.stop="contestReadyAt = ''" />
            </template>
          </q-input>
          <q-select
            v-model="contestOwner"
            :options="courseTeamMembers"
            label="Contest Owner"
            option-label="name"
            option-value="id"
            emit-value
            map-options
            outlined
            dense
            class="q-mb-md"
          />

          <q-btn
            class="full-width"
            :label="isEditing ? 'Update' : 'Create'"
            color="primary"
            @click="isEditing ? updateContest() : createContest()"
          />
        </q-card-section>
        <q-separator />
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCourseStore } from 'src/stores/course-store.js'
import { formatDateForUI } from 'src/boot/filters'

const courseStore = useCourseStore()
const route = useRoute()

const courseId = computed(() => route.params.courseId)
const course = computed(() => courseStore.selectedCourse)
const courseTeamMembers = computed(() => courseStore.selectedCourseMembers)

// Contest types from schema
const contestTypes = [
  'Contest 1',
  'Contest 2',
  'Contest 3',
  'Contest 4',
  'Mid Semester',
  'End Semester',
  'Mock Interview',
  'End Semester Retest',
]

const showContestDialog = ref(false)
const isEditing = ref(false)
const selectedContest = ref(null)

const contestTitle = ref('')
const contestType = ref(null)
const contestDate = ref('')
const contestReadyAt = ref('')
const contestOwner = ref(null)

const dateProxy = ref(null)
const readyDateProxy = ref(null)

// Computed properties for contest grouping
const upcomingReadyContests = computed(() => {
  const now = new Date()
  return courseStore.courseContests
    .filter((contest) => {
      if (!contest.contest_date) return false
      const contestDate = new Date(contest.contest_date)
      return contestDate > now && contest.contest_ready_at
    })
    .sort((a, b) => new Date(a.contest_date) - new Date(b.contest_date))
})

const upcomingNotReadyContests = computed(() => {
  const now = new Date()
  return courseStore.courseContests
    .filter((contest) => {
      // If no date set, consider it as not ready
      if (!contest.contest_date) return true
      const contestDate = new Date(contest.contest_date)
      return contestDate > now && !contest.contest_ready_at
    })
    .sort((a, b) => {
      // If either contest doesn't have a date, put it at the end
      if (!a.contest_date) return 1
      if (!b.contest_date) return -1
      return new Date(a.contest_date) - new Date(b.contest_date)
    })
})

const executedContests = computed(() => {
  const now = new Date()
  return courseStore.courseContests
    .filter((contest) => {
      if (!contest.contest_date) return false
      const contestDate = new Date(contest.contest_date)
      return contestDate <= now
    })
    .sort((a, b) => new Date(b.contest_date) - new Date(a.contest_date)) // Most recent first
})

const resetForm = () => {
  contestTitle.value = ''
  contestType.value = null
  contestDate.value = ''
  contestReadyAt.value = ''
  contestOwner.value = null
  selectedContest.value = null
  isEditing.value = false
}

const openCreateContest = () => {
  resetForm()
  showContestDialog.value = true
}

const openEditContest = (contest) => {
  selectedContest.value = contest
  contestTitle.value = contest.title
  contestType.value = contest.contest_type
  contestDate.value = contest.contest_date ? formatDateForUI(contest.contest_date) : ''
  contestReadyAt.value = contest.contest_ready_at ? formatDateForUI(contest.contest_ready_at) : ''
  contestOwner.value = contest.contest_owner
  isEditing.value = true
  showContestDialog.value = true
}

const createContest = async () => {
  await courseStore.createContest({
    title: contestTitle.value,
    contest_type: contestType.value,
    contest_date: contestDate.value ? new Date(contestDate.value) : null,
    contest_ready_at: contestReadyAt.value ? new Date(contestReadyAt.value) : null,
    contest_owner: contestOwner.value,
    course: courseId.value,
  })
  showContestDialog.value = false
  resetForm()
}

const updateContest = async () => {
  if (!selectedContest.value) return

  await courseStore.updateContest({
    id: selectedContest.value.id,
    title: contestTitle.value,
    contest_type: contestType.value,
    contest_date: contestDate.value ? new Date(contestDate.value) : null,
    contest_ready_at: contestReadyAt.value ? new Date(contestReadyAt.value) : null,
    contest_owner: contestOwner.value,
  })
  showContestDialog.value = false
  resetForm()
}

// Fetch initial data
const fetchData = async () => {
  await courseStore.fetchCourse(courseId.value)
  await courseStore.fetchCourseContests(courseId.value)
  await courseStore.fetchCourseTeam(courseId.value)
}

fetchData()
</script>
