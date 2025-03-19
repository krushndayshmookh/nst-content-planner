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
        :to="`/courses/${course.id}`"
      />
      <q-breadcrumbs-el label="Lectures" icon="eva-book-outline" />
    </q-breadcrumbs>

    <div class="q-mb-md row items-center">
      <div class="col">
        <div class="text-h6">Lectures</div>
      </div>
      <div class="col text-right">
        <q-btn color="primary" icon="eva-plus-outline" label="Lecture" @click="openCreateLecture" />
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-list bordered separator>
          <q-item v-for="lecture in lectures" :key="lecture.id">
            <q-item-section>
              <q-item-label>{{ lecture.title }}</q-item-label>
              <q-item-label caption>
                Course: {{ lecture.expand?.course?.title || 'Unknown Course' }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                flat
                round
                color="primary"
                icon="eva-edit-outline"
                @click="openEditLecture(lecture)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>

    <!-- Replace the old dialog with the new component -->
    <LectureConfigDialog
      v-model="showCreateLecture"
      mode="single"
      title="Create Lecture"
      :course-id="courseId"
      :initial-config="lectureConfig"
      :loading="isCreatingLecture"
      :loading-text="createProgress"
      action-button-text="Create"
      @create="handleCreateLecture"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCourseStore } from 'src/stores/course-store.js'
import { useQuasar } from 'quasar'
import LectureConfigDialog from 'src/components/LectureConfigDialog.vue'
import { DEFAULT_LECTURE_BOARD_CONFIG } from 'src/constants.js'

const route = useRoute()
const courseStore = useCourseStore()
const $q = useQuasar()

// State
const showCreateLecture = ref(false)
const isEditing = ref(false)
const selectedLecture = ref(null)
const isCreatingLecture = ref(false)
const createProgress = ref('')

// Computed
const courseId = computed(() => route.params.courseId)
const course = computed(() => courseStore.selectedCourse)
const lectures = computed(() =>
  courseStore.lectures.filter((lecture) => lecture.course === courseId.value),
)

// Methods
const resetForm = () => {
  selectedLecture.value = null
  isEditing.value = false
}

const openCreateLecture = () => {
  resetForm()
  showCreateLecture.value = true
}

const openEditLecture = (lecture) => {
  selectedLecture.value = lecture
  isEditing.value = true
  showCreateLecture.value = true
}

const handleCreateLecture = (config) => {
  isCreatingLecture.value = true
  createProgress.value = 'Creating lecture...'

  // Create the lecture with the provided config
  courseStore
    .createLecture({
      title: config.title,
      course: courseId.value,
      createCards: true,
      componentConfig: {
        componentTypes: config.componentTypes,
      },
    })
    .then(() => {
      showCreateLecture.value = false
      isCreatingLecture.value = false
      createProgress.value = ''
      $q.notify({
        type: 'positive',
        message: 'Lecture created successfully',
      })
      loadLectures()
    })
    .catch((error) => {
      isCreatingLecture.value = false
      createProgress.value = ''
      $q.notify({
        type: 'negative',
        message: `Failed to create lecture: ${error.message}`,
      })
    })
}

// Add the loadLectures function
const loadLectures = () => {
  courseStore.fetchLectures(courseId.value)
}

// Add lectureConfig for the dialog
const lectureConfig = ref({
  title: '',
  numberOfLectues: 1,
  componentTypes: DEFAULT_LECTURE_BOARD_CONFIG.componentTypes,
})

// Fetch initial data
const fetchData = async () => {
  await courseStore.fetchCourse(courseId.value)
  await courseStore.fetchLectures(courseId.value)
}

onMounted(() => {
  fetchData()
})
</script>
