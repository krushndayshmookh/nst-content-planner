<template>
  <q-page class="q-pa-md">
    <div class="q-mb-md row items-center">
      <div class="col">
        <div class="text-h6">Courses</div>
      </div>
      <div class="col text-right">
        <q-btn color="primary" icon="eva-plus-outline" label="Course" @click="openCreateCourse" />
      </div>
    </div>

    <q-card>
      <q-list>
        <q-item v-for="course in courses" :key="course.id" clickable :to="`/courses/${course.id}`">
          <q-item-section>
            <q-item-label>{{ course.title }}</q-item-label>
            <q-item-label caption>{{ course.description }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="eva-chevron-right" />
            <!-- <q-item-label caption>{{ course.created_at }}</q-item-label> -->
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

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
