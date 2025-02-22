<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs class="text-primary q-mb-md">
      <template #separator>
        <q-icon size="1.5em" name="chevron_right" color="grey-7" />
      </template>

      <q-breadcrumbs-el class="text-grey-7" label="Home" icon="home" to="/" />

      <q-breadcrumbs-el label="Courses" icon="eva-grid-outline" />
    </q-breadcrumbs>

    <div class="q-mb-md row items-center">
      <div class="col">
        <div class="text-h6">Courses</div>
      </div>
      <div class="col text-right">
        <q-btn color="primary" icon="eva-plus-outline" label="Course" @click="openCreateCourse" />
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div v-for="course in courses" :key="course.id" class="col-3" style="height: 200px">
        <q-card
          class="cursor-pointer hoverable"
          style="height: 100%; display: flex; flex-direction: column"
          @click="$router.push(`/courses/${course.id}`)"
        >
          <q-card-section style="flex-grow: 1">
            <div class="text-h6">
              {{ course.title }}
              <q-icon name="eva-chevron-right" class="float-right" />
            </div>
            <div class="text-subtitle2">{{ course.description }}</div>
          </q-card-section>
          <!-- <q-separator />
          <q-card-section>
            <div class="text-subtitle2">
              {{ $humanDate(course.created_at) }}
            </div>
          </q-card-section> -->
        </q-card>
      </div>
    </div>

    <q-dialog v-model="showCreateCourse" position="right" persistent full-height>
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-h6">
            Create Course
            <q-btn v-close-popup class="float-right" flat dense round icon="eva-close-outline" />
          </div>
        </q-card-section>
        <q-separator></q-separator>
        <q-card-section>
          <q-input v-model="courseTitle" label="Title" outlined dense class="q-mb-md" />
          <q-input v-model="courseDescription" label="Description" outlined dense class="q-mb-md" />

          <q-btn class="full-width" label="Create" color="primary" @click="createCourse" />
        </q-card-section>
        <q-separator></q-separator>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
// import { useRoute, useRouter } from 'vue-router'

import { useCourseStore } from 'src/stores/course-store.js'

const courseStore = useCourseStore()

// const route = useRoute()
// const router = useRouter()

const courses = computed(() => courseStore.courses)

const fetchCourses = () => {
  courseStore.fetchCourses()
}

fetchCourses()

const courseTitle = ref('')
const courseDescription = ref('')

const createCourse = async () => {
  await courseStore.createCourse({
    title: courseTitle.value,
    description: courseDescription.value,
  })
  showCreateCourse.value = false
  courseTitle.value = ''
  courseDescription.value = ''
}

const showCreateCourse = ref(false)

const openCreateCourse = () => {
  showCreateCourse.value = true
}
</script>
