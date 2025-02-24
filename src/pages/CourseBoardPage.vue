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
        class="text-grey-7"
        :label="course.title"
        icon="eva-book-outline"
        :to="`/courses/${courseId}`"
      />
      <q-breadcrumbs-el v-if="board" :label="board.title" icon="eva-checkmark-square-outline" />
    </q-breadcrumbs>

    <q-card flat bordered>
      <q-card-section>
        <div class="row items-center">
          <div class="col-auto">
            <div class="text-body1 text-weight-medium">{{ board.title }}</div>
          </div>

          <div class="col">
            <!-- show or hide columns -->
            <div class="row items-center justify-end q-col-gutter-md">
              <div class="col-auto">
                <q-select
                  v-model="selectedColumnIds"
                  :options="boardColumns"
                  map-options
                  emit-value=""
                  option-label="title"
                  option-value="id"
                  placeholder="Columns"
                  outlined
                  dense
                  multiple
                  hide-bottom-space
                  style="width: 200px"
                  input-class="ellipsis"
                  :display-value="`${selectedColumnIds.length}/${boardColumns.length} columns`"
                />
              </div>

              <div class="col-auto">
                <!-- filters -->
                <q-btn outline color="primary" icon="eva-funnel-outline" label="Filters">
                  <q-menu>
                    <q-list>
                      <q-item v-ripple clickable>
                        <q-item-section>Filter 1</q-item-section>
                      </q-item>
                      <q-item v-ripple clickable>
                        <q-item-section>Filter 2</q-item-section>
                      </q-item>
                      <q-item v-ripple clickable>
                        <q-item-section>Filter 3</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>

              <div class="col-auto">
                <q-btn
                  outline
                  color="primary"
                  icon="eva-edit-outline"
                  label="Edit"
                  @click="openEditBoard"
                />
              </div>

              <div class="col-auto">
                <q-btn
                  outline
                  color="primary"
                  icon="eva-list-outline"
                  label="List View"
                  :to="`/courses/${courseId}/boards/${boardId}/list`"
                />
              </div>

              <div class="col-auto">
                <q-btn
                  color="primary"
                  icon="eva-plus-outline"
                  label="Add Card"
                  @click="openCreateCard"
                />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section v-if="boardColumns.length" class="overflow-auto">
        <div class="row no-wrap q-col-gutter-md">
          <div
            v-for="column in columnsToDisplay"
            :key="column.id"
            class="col-4 col-sm-3 col-md-2"
            :data-column-id="column.id"
          >
            <q-item class="q-pl-none">
              <q-item-section>
                <q-item-label header>
                  {{ column.title }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge color="grey">{{ cardsByColumns[column.id].length }}</q-badge>
              </q-item-section>
            </q-item>

            <div>
              <draggable
                v-model="cardsByColumns[column.id]"
                group="cards"
                class="draggable-list"
                item-key="id"
                ghost-class="ghost"
                @end="onDragEnd"
              >
                <template #item="{ element }">
                  <div>
                    <TaskCard :card="element" @edit="openEditCard" />
                  </div>
                </template>
              </draggable>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showEditCard" full-height>
      <CardEditDialog v-if="showEditCard" />
    </q-dialog>

    <q-dialog v-model="showCreateCard" position="right" persistent full-height>
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-h6">
            Create Card
            <q-btn v-close-popup class="float-right" flat dense round icon="eva-close-outline" />
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-input v-model="cardTitle" label="Title" outlined dense class="q-mb-md" />
          <q-input
            v-model="cardDescription"
            label="Description"
            type="textarea"
            outlined
            dense
            class="q-mb-md"
          />

          <q-select
            v-model="selectedBoard"
            :options="courseBoards"
            label="Board"
            option-label="title"
            option-value="id"
            emit-value
            map-options
            outlined
            dense
            class="q-mb-md"
          />

          <q-select
            v-model="cardType"
            :options="componentTypes"
            label="Component Type"
            outlined
            dense
            class="q-mb-md"
            @update:model-value="onCardTypeChange"
          />

          <template v-if="cardType === 'Contest'">
            <q-select
              v-model="selectedContest"
              :options="contests"
              label="Contest"
              option-label="title"
              option-value="id"
              emit-value
              map-options
              outlined
              dense
              class="q-mb-md"
            />
            <q-input
              v-model.number="questionCount"
              type="number"
              label="Number of Questions"
              outlined
              dense
              class="q-mb-md"
            />
            <q-select
              v-model="assignmentType"
              :options="assignmentTypes"
              label="Assignment Type"
              outlined
              dense
              multiple
              class="q-mb-md"
            />
            <q-input v-model="setName" label="Set Name" outlined dense class="q-mb-md" />
          </template>

          <template v-else>
            <q-select
              v-model="selectedLecture"
              :options="lectures"
              label="Lecture"
              option-label="title"
              option-value="id"
              emit-value
              map-options
              outlined
              dense
              class="q-mb-md"
            />
          </template>

          <template v-if="isAssignmentType">
            <q-input
              v-model.number="questionCount"
              type="number"
              label="Number of Questions"
              outlined
              dense
              class="q-mb-md"
            />
            <q-select
              v-model="assignmentType"
              :options="assignmentTypes"
              label="Assignment Type"
              outlined
              dense
              multiple
              class="q-mb-md"
            />
          </template>

          <div class="text-subtitle2 q-mb-sm">Assignments</div>
          <q-select
            v-model="creator"
            :options="teamMembers"
            label="Creator"
            option-label="name"
            option-value="id"
            emit-value
            map-options
            outlined
            dense
            class="q-mb-md"
          />

          <q-input
            v-model="creationDeadline"
            label="Creation Deadline"
            outlined
            dense
            class="q-mb-md"
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="creationDeadline" mask="YYYY-MM-DD HH:mm" />
                </q-popup-proxy>
              </q-icon>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-time v-model="creationDeadline" mask="YYYY-MM-DD HH:mm" format24h />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-select
            v-model="reviewer1"
            :options="teamMembers"
            label="Reviewer 1"
            option-label="name"
            option-value="id"
            emit-value
            map-options
            outlined
            dense
            class="q-mb-md"
          />

          <q-input v-model="r1Deadline" label="Reviewer 1 Deadline" outlined dense class="q-mb-md">
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="r1Deadline" mask="YYYY-MM-DD HH:mm" />
                </q-popup-proxy>
              </q-icon>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-time v-model="r1Deadline" mask="YYYY-MM-DD HH:mm" format24h />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-select
            v-model="reviewer2"
            :options="teamMembers"
            label="Reviewer 2"
            option-label="name"
            option-value="id"
            emit-value
            map-options
            outlined
            dense
            class="q-mb-md"
          />

          <q-input v-model="r2Deadline" label="Reviewer 2 Deadline" outlined dense class="q-mb-md">
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="r2Deadline" mask="YYYY-MM-DD HH:mm" />
                </q-popup-proxy>
              </q-icon>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-time v-model="r2Deadline" mask="YYYY-MM-DD HH:mm" format24h />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-btn class="full-width" label="Create" color="primary" @click="createCard" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCourseStore } from 'src/stores/course-store.js'
import { pb } from 'src/boot/pocketbase'
import draggable from 'components/vue.draggable.next/src/vuedraggable.js'
import TaskCard from 'src/components/TaskCard.vue'
import CardEditDialog from 'src/components/CardEditDialog.vue'
import { storeToRefs } from 'pinia'

const route = useRoute()
const $q = useQuasar()
const courseStore = useCourseStore()

const courseId = computed(() => route.params.courseId)
const boardId = computed(() => route.params.boardId)

// Use storeToRefs to maintain reactivity
const {
  selectedCourse: course,
  selectedBoard: board,
  selectedColumnIds,
  cardsByColumns,
} = storeToRefs(courseStore)

const boardColumns = computed(() => courseStore.selectedBoard?.columns || [])
const columnsToDisplay = computed(() => courseStore.columnsToDisplay)

const fetchCourse = async () => {
  await courseStore.fetchCourse(courseId.value)
}

fetchCourse()

const fetchBoard = async () => {
  await courseStore.fetchBoard(boardId.value)
}

fetchBoard()

const onDragEnd = async (event) => {
  const { item, from, to } = event
  const cardId = item._underlying_vm_.id
  const newColumnId = to.closest('[data-column-id]').dataset.columnId
  const oldColumnId = from.closest('[data-column-id]').dataset.columnId

  if (newColumnId !== oldColumnId) {
    await courseStore.updateCardColumn(cardId, newColumnId, oldColumnId)
  }
}

const openEditBoard = () => {}

const showEditCard = ref(false)

const openEditCard = (card) => {
  courseStore.selectedCard = { ...card }
  showEditCard.value = true
}

// New card creation state
const showCreateCard = ref(false)
const cardTitle = ref('')
const cardDescription = ref('')
const cardType = ref(null)
const selectedLecture = ref(null)
const selectedContest = ref(null)
const questionCount = ref(1)
const assignmentType = ref(['MCQs'])
const creationDeadline = ref('')
const r1Deadline = ref('')
const r2Deadline = ref('')
const reviewer1 = ref(null)
const reviewer2 = ref(null)
const setName = ref('')
const creator = ref(null)

// Computed properties for form options
const componentTypes = computed(() => [
  'Lecture Outline',
  'Lab Outline',
  'Presentation',
  'In-class',
  'Post-class',
  'Lab',
  'Contest',
])

const assignmentTypes = computed(() => ['MCQs', 'Coding', 'AI Mock Interview'])

const isAssignmentType = computed(() => ['In-class', 'Post-class', 'Lab'].includes(cardType.value))

const lectures = computed(() => courseStore.lectures)
const contests = computed(() => courseStore.courseContests)
const teamMembers = computed(() => courseStore.selectedCourseMembers)

// Add new computed property for course boards
const courseBoards = computed(() => courseStore.selectedCourseBoards)

// Add new ref for selected board
const selectedBoard = ref(boardId.value)

// Methods for card creation
const resetCardForm = () => {
  cardTitle.value = ''
  cardDescription.value = ''
  selectedBoard.value = boardId.value
  cardType.value = null
  creator.value = null
  selectedLecture.value = null
  selectedContest.value = null
  questionCount.value = 1
  assignmentType.value = ['MCQs']
  creationDeadline.value = ''
  r1Deadline.value = ''
  r2Deadline.value = ''
  reviewer1.value = null
  reviewer2.value = null
  setName.value = ''
}

const onCardTypeChange = () => {
  // Reset assignment-related fields when type changes
  if (!isAssignmentType.value) {
    questionCount.value = 4
    assignmentType.value = ['MCQs']
  }

  // Reset lecture/contest selection when type changes
  if (cardType.value === 'Contest') {
    selectedLecture.value = null
  } else {
    selectedContest.value = null
  }
}

const openCreateCard = async () => {
  // Fetch both lectures and contests
  await Promise.all([courseStore.fetchLectures(), courseStore.fetchCourseContests(courseId.value)])
  resetCardForm()
  showCreateCard.value = true
}

const createCard = async () => {
  try {
    const cardData = {
      title: cardTitle.value,
      description: cardDescription.value,
      component: cardType.value,
      course: courseId.value,
      board: selectedBoard.value,
      column: 'backlog',
      status: 'Not Started',
      creator: creator.value || pb.authStore.model.id,
      initial_creator: creator.value || pb.authStore.model.id,
      creation_deadline: creationDeadline.value || null,
      initial_creation_deadline: creationDeadline.value || null,
      reviewer1: reviewer1.value,
      initial_reviewer1: reviewer1.value,
      r1_deadline: r1Deadline.value || null,
      initial_r1_deadline: r1Deadline.value || null,
      reviewer2: reviewer2.value,
      initial_reviewer2: reviewer2.value,
      r2_deadline: r2Deadline.value || null,
      initial_r2_deadline: r2Deadline.value || null,
      file_link: null,
      order: 0, // Will be set by the backend
    }

    // Add lecture or contest specific data
    if (cardType.value === 'Contest') {
      cardData.contest = selectedContest.value
      cardData.lecture = null
      // Add assignment fields for contest
      cardData.assignment_type = assignmentType.value
      cardData.assignment_is_verified = false
      cardData.question_count = questionCount.value
      cardData.questions = []
      cardData.assignment_link = null
      cardData.set_name = setName.value || null
    } else {
      cardData.lecture = selectedLecture.value
      cardData.contest = null
      // Add assignment fields only if it's an assignment type
      if (isAssignmentType.value) {
        cardData.assignment_type = assignmentType.value
        cardData.assignment_is_verified = false
        cardData.question_count = questionCount.value
        cardData.questions = []
        cardData.assignment_link = null
        cardData.set_name = setName.value || null
      }
    }

    // Create the card
    await courseStore.createCard(cardData)

    // Create questions if it's an assignment type or contest
    if ((isAssignmentType.value || cardType.value === 'Contest') && questionCount.value > 0) {
      const questions = []
      for (let i = 0; i < questionCount.value; i++) {
        questions.push({
          title: `Q${String(i + 1).padStart(2, '0')}`,
          type: assignmentType.value,
          [cardType.value === 'Contest' ? 'contest' : 'lecture']:
            cardType.value === 'Contest' ? selectedContest.value : selectedLecture.value,
        })
      }
      await courseStore.createBulkQuestions(questions)
    }

    // Refresh the board
    await courseStore.fetchBoard(boardId.value)
    showCreateCard.value = false
    resetCardForm()
  } catch (error) {
    console.error('Failed to create card:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to create card',
    })
  }
}

// const instance = getCurrentInstance()

watch(showEditCard, (value) => {
  if (!value) {
    courseStore.groupCardsByColumns()
  }
})
</script>

<style scoped>
.draggable-list {
  min-height: 600px;
}

.ghost {
  & > div {
    & > * {
      opacity: 0.25;
    }
    border: 1px dashed #ccc;
    background-color: transparent !important;
    box-shadow: none !important;
  }
}
</style>
