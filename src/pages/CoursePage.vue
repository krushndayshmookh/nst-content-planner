<template>
  <q-page class="q-pa-md">
    <div v-if="course" class="q-mb-md row items-center">
      <div class="col">
        <div class="text-h6">{{ course.title }}</div>
      </div>
      <div class="col text-right">
        <q-btn
          outline
          color="primary"
          icon="eva-people-outline"
          label="Team"
          class="q-mr-sm"
          :to="`/courses/${courseId}/team`"
        />
        <q-btn
          outline
          color="primary"
          icon="eva-edit-outline"
          label="Edit"
          @click="openEditCourse"
        />
      </div>
    </div>

    <q-card flat bordered>
      <q-card-section>
        <div class="row items-center">
          <div class="col">
            <div class="text-h6">Boards</div>
          </div>
          <div class="col text-right">
            <q-btn
              color="primary"
              icon="eva-plus-outline"
              label="Create"
              @click="openCreateBoard"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!--  <q-list>
        <q-item
          v-for="board in boards"
          :key="board.id"
          clickable
          :to="`/courses/${courseId.value}/boards/${board.id}`"
        >
          <q-item-section>
            <q-item-label>{{ board.title }}</q-item-label>
            <q-item-label caption>{{ board.description }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="eva-chevron-right" />
          </q-item-section>
        </q-item>
      </q-list> -->

      <q-card-section>
        <div class="row q-col-gutter-md">
          <div v-for="board in boards" :key="board.id" class="col-6 col-sm-4 col-md-3">
            <q-card>
              <q-item>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ board.title }}</q-item-label>
                  <q-item-label caption>{{ board.description }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable :to="`/courses/${courseId}/boards/${board.id}`">
                <q-item-section class="text-primary"> Open Board </q-item-section>

                <q-item-section side>
                  <q-icon name="eva-chevron-right" />
                </q-item-section>
              </q-item>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showEditCourse" position="right" persistent full-height>
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-h6">
            Edit Course
            <q-btn v-close-popup class="float-right" flat dense round icon="eva-close-outline" />
          </div>
        </q-card-section>
        <q-separator></q-separator>
        <q-card-section>
          <q-input v-model="courseTitle" label="Title" outlined dense class="q-mb-md" />
          <q-input v-model="courseDescription" label="Description" outlined dense class="q-mb-md" />

          <div class="row items-center q-col-gutter-md">
            <div class="col-auto">
              <q-btn
                round
                dense
                flat
                icon="eva-trash-2-outline"
                color="negative"
                @click="deleteCourse"
              />
            </div>
            <div class="col">
              <q-btn class="full-width" label="Update" color="primary" @click="updateCourse" />
            </div>
          </div>
        </q-card-section>
        <q-separator></q-separator>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'

import { useCourseStore } from 'src/stores/course-store.js'

const courseStore = useCourseStore()

const route = useRoute()

const courseId = computed(() => route.params.courseId)

const course = computed(() => courseStore.selectedCourse)

const fetchCourse = async () => {
  await courseStore.fetchCourse(courseId.value)
}

fetchCourse()

const boards = computed(() => courseStore.selectedCourseBoards)

const fetchCourses = () => {
  courseStore.fetchCourses()
}

fetchCourses()

const courseTitle = ref('')
const courseDescription = ref('')

const updateCourse = async () => {
  courseStore.selectedCourse = await courseStore.updateCourse(courseId.value, {
    title: courseTitle.value,
    description: courseDescription.value,
  })
  showEditCourse.value = false
}

const showEditCourse = ref(false)

// const openCreateCourse = () => {
//   showCreateCourse.value = true
// }

const openEditCourse = () => {
  courseTitle.value = course.value.title
  courseDescription.value = course.value.description

  showEditCourse.value = true
}

const $q = useQuasar()

const deleteCourse = async () => {
  // await courseStore.deleteCourse(courseId.value)
  // showEditCourse.value = false

  $q.notify({
    type: 'negative',
    message: 'You are not allowed to delete a course',
  })
}

const showCreateBoard = ref(false)

const openCreateBoard = () => {
  showCreateBoard.value = true
}
</script>
