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

    <q-dialog v-model="showLectureDialog" position="right" persistent full-height>
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{ isEditing ? 'Edit Lecture' : 'Create Lecture' }}
            <q-btn v-close-popup class="float-right" flat dense round icon="eva-close-outline" />
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-input v-model="lectureTitle" label="Title" outlined dense class="q-mb-md" />
          <q-select
            v-model="selectedCourse"
            :options="availableCourses"
            label="Course"
            option-label="title"
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
            @click="isEditing ? updateLecture() : createLecture()"
          />
        </q-card-section>
        <q-separator />
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCourseStore } from 'src/stores/course-store.js'

const courseStore = useCourseStore()

// State
const showLectureDialog = ref(false)
const isEditing = ref(false)
const selectedLecture = ref(null)
const lectureTitle = ref('')
const selectedCourse = ref(null)

// Computed
const course = computed(() => courseStore.selectedCourse)
const availableCourses = computed(() => courseStore.courses)
const lectures = computed(() => courseStore.lectures)

// Methods
const resetForm = () => {
  lectureTitle.value = ''
  selectedCourse.value = course.value.id
  selectedLecture.value = null
  isEditing.value = false
}

const openCreateLecture = () => {
  resetForm()
  showLectureDialog.value = true
}

const openEditLecture = (lecture) => {
  selectedLecture.value = lecture
  lectureTitle.value = lecture.title
  selectedCourse.value = lecture.course
  isEditing.value = true
  showLectureDialog.value = true
}

const createLecture = async () => {
  await courseStore.createLecture({
    title: lectureTitle.value,
    course: selectedCourse.value,
  })
  showLectureDialog.value = false
  resetForm()
}

const updateLecture = async () => {
  if (!selectedLecture.value) return

  await courseStore.updateLecture({
    id: selectedLecture.value.id,
    title: lectureTitle.value,
    course: selectedCourse.value,
  })
  showLectureDialog.value = false
  resetForm()
}

// Fetch initial data
const fetchData = async () => {
  await courseStore.fetchCourses()
  await courseStore.fetchLectures()
}

fetchData()
</script>
