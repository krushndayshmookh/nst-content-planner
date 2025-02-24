<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs class="text-primary q-mb-md">
      <template #separator>
        <q-icon size="1.5em" name="chevron_right" color="grey-7" />
      </template>

      <q-breadcrumbs-el class="text-grey-7" label="Home" icon="home" to="/" />

      <q-breadcrumbs-el class="text-grey-7" label="Courses" icon="eva-grid-outline" to="/courses" />

      <q-breadcrumbs-el v-if="course" :label="course.title" icon="eva-book-outline" />
    </q-breadcrumbs>

    <div v-if="course" class="q-mb-md row items-center">
      <div class="col">
        <div class="text-h6">{{ course.title }}</div>
      </div>
      <div class="col text-right">
        <q-btn
          outline
          color="primary"
          icon="eva-edit-outline"
          label="Edit"
          @click="openEditCourse"
        />
      </div>
    </div>

    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Boards</div>
        <div class="row items-center">
          <div class="col">
            <div class="row q-col-gutter-md">
              <div v-if="!hasLectureBoard" class="col-auto">
                <q-btn
                  color="primary"
                  icon="eva-book-outline"
                  label="Create Lecture Board"
                  @click="openCreateLectureBoard"
                />
              </div>
              <div v-if="!hasContestBoard" class="col-auto">
                <q-btn
                  color="primary"
                  icon="eva-award-outline"
                  label="Create Contest Board"
                  @click="openCreateContestBoard"
                />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

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

    <div class="row q-col-gutter-md q-mt-md">
      <div class="col-4">
        <q-card>
          <q-item>
            <q-item-section avatar>
              <q-icon name="eva-people-outline" color="primary" size="md" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">Team</q-item-label>
              <q-item-label caption>Manage course team members</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable :to="`/courses/${courseId}/team`">
            <q-item-section class="text-primary">Manage Team</q-item-section>
            <q-item-section side>
              <q-icon name="eva-chevron-right" />
            </q-item-section>
          </q-item>
        </q-card>
      </div>

      <div class="col-4">
        <q-card>
          <q-item>
            <q-item-section avatar>
              <q-icon name="eva-award-outline" color="primary" size="md" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">Contests</q-item-label>
              <q-item-label caption>Manage course contests</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable :to="`/courses/${courseId}/contests`">
            <q-item-section class="text-primary">Manage Contests</q-item-section>
            <q-item-section side>
              <q-icon name="eva-chevron-right" />
            </q-item-section>
          </q-item>
        </q-card>
      </div>

      <div class="col-4">
        <q-card>
          <q-item>
            <q-item-section avatar>
              <q-icon name="eva-book-outline" color="primary" size="md" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">Lectures</q-item-label>
              <q-item-label caption>Manage course lectures</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable :to="`/courses/${courseId}/lectures`">
            <q-item-section class="text-primary">Manage Lectures</q-item-section>
            <q-item-section side>
              <q-icon name="eva-chevron-right" />
            </q-item-section>
          </q-item>
        </q-card>
      </div>
    </div>

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

    <q-dialog v-model="showCreateLectureBoard" position="right" persistent full-height>
      <q-card style="width: 800px">
        <q-card-section>
          <div class="text-h6">
            Create Lecture Board
            <q-btn v-close-popup class="float-right" flat dense round icon="eva-close-outline" />
          </div>
        </q-card-section>
        <q-separator></q-separator>
        <q-card-section class="q-pa-none">
          <q-tabs
            v-model="lectureBoardTab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="basic" label="Basic Info" />
            <q-tab name="config" label="Configuration" />
            <q-tab name="json" label="JSON" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="lectureBoardTab" animated>
            <q-tab-panel name="basic">
              <q-input v-model="lectureBoardTitle" label="Title" outlined dense class="q-mb-md" />
            </q-tab-panel>

            <q-tab-panel name="config">
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-input
                    v-model.number="lectureBoardConfig.numberOfLectues"
                    type="number"
                    label="Number of Lectures"
                    outlined
                    dense
                  />
                </div>

                <div class="col-12">
                  <div class="text-subtitle2 q-mb-sm">Component Types</div>
                  <q-list bordered separator>
                    <q-item
                      v-for="(component, index) in lectureBoardConfig.componentTypes"
                      :key="index"
                    >
                      <q-item-section>
                        <q-input
                          v-model="component.name"
                          label="Name"
                          dense
                          outlined
                          class="q-mb-sm"
                        />
                        <q-select
                          v-model="component.contentType"
                          :options="['document', 'assignment']"
                          label="Content Type"
                          dense
                          outlined
                          class="q-mb-sm"
                          @update:model-value="
                            (val) => {
                              if (
                                val === 'assignment' &&
                                (!component.assignmentTypes || !component.assignmentTypes.length)
                              ) {
                                component.assignmentTypes = [{ name: '', count: 1 }]
                              }
                            }
                          "
                        />

                        <template v-if="component.contentType === 'assignment'">
                          <div class="text-caption q-mb-sm">Assignment Types</div>
                          <div
                            v-for="(type, typeIndex) in component.assignmentTypes"
                            :key="typeIndex"
                            class="row q-col-gutter-sm q-mb-sm"
                          >
                            <div class="col">
                              <q-input v-model="type.name" label="Type" dense outlined />
                            </div>
                            <div class="col-4">
                              <q-input
                                v-model.number="type.count"
                                type="number"
                                label="Count"
                                dense
                                outlined
                              />
                            </div>
                          </div>
                        </template>
                      </q-item-section>

                      <q-item-section side>
                        <q-btn
                          flat
                          round
                          dense
                          color="negative"
                          icon="eva-trash-2-outline"
                          @click="lectureBoardConfig.componentTypes.splice(index, 1)"
                        />
                      </q-item-section>
                    </q-item>
                  </q-list>

                  <q-btn
                    flat
                    color="primary"
                    label="Add Component"
                    class="q-mt-sm"
                    @click="addLectureBoardComponent"
                  />
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="json">
              <q-input
                v-model="lectureBoardConfigJson"
                type="textarea"
                filled
                autogrow
                class="monospace"
                :error="jsonError"
                :error-message="jsonError ? 'Invalid JSON format' : ''"
                @update:model-value="updateConfigFromJson"
              />
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
        <q-separator></q-separator>
        <q-card-section>
          <q-btn
            class="full-width"
            :label="isCreatingLectureBoard ? createProgress : 'Create'"
            color="primary"
            :loading="isCreatingLectureBoard"
            @click="createLectureBoard"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showCreateContestBoard" position="right" persistent full-height>
      <q-card style="width: 800px">
        <q-card-section>
          <div class="text-h6">
            Create Contest Board
            <q-btn v-close-popup class="float-right" flat dense round icon="eva-close-outline" />
          </div>
        </q-card-section>
        <q-separator></q-separator>
        <q-card-section class="q-pa-none">
          <q-tabs
            v-model="contestBoardTab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="basic" label="Basic Info" />
            <q-tab name="config" label="Configuration" />
            <q-tab name="json" label="JSON" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="contestBoardTab" animated>
            <q-tab-panel name="basic">
              <q-input v-model="contestBoardTitle" label="Title" outlined dense class="q-mb-md" />
            </q-tab-panel>

            <q-tab-panel name="config">
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <div class="text-subtitle2 q-mb-sm">Contest Types</div>
                  <q-list bordered separator>
                    <q-item
                      v-for="(contest, index) in contestBoardConfig.contestTypes"
                      :key="index"
                    >
                      <q-item-section>
                        <q-input
                          v-model="contest.name"
                          label="Name"
                          dense
                          outlined
                          class="q-mb-sm"
                        />

                        <div class="text-caption q-mb-sm">Assignment Types</div>
                        <div
                          v-for="(type, typeIndex) in contest.assignmentTypes"
                          :key="typeIndex"
                          class="row q-col-gutter-sm q-mb-sm"
                        >
                          <div class="col">
                            <q-input v-model="type.name" label="Type" dense outlined />
                          </div>
                          <div class="col-4">
                            <q-input
                              v-model.number="type.count"
                              type="number"
                              label="Count"
                              dense
                              outlined
                            />
                          </div>
                          <div class="col-auto">
                            <q-btn
                              flat
                              round
                              dense
                              color="negative"
                              icon="eva-trash-2-outline"
                              @click="contest.assignmentTypes.splice(typeIndex, 1)"
                            />
                          </div>
                        </div>

                        <q-btn
                          flat
                          color="primary"
                          label="Add Assignment Type"
                          class="q-mt-sm q-mb-md"
                          @click="contest.assignmentTypes.push({ name: '', count: 1 })"
                        />

                        <div class="text-caption q-mb-sm">Sets</div>
                        <div
                          v-for="(set, setIndex) in contest.sets"
                          :key="setIndex"
                          class="row q-col-gutter-sm q-mb-sm"
                        >
                          <div class="col">
                            <q-input
                              v-model="contest.sets[setIndex]"
                              label="Set Name"
                              dense
                              outlined
                            />
                          </div>
                          <div class="col-auto">
                            <q-btn
                              flat
                              round
                              dense
                              color="negative"
                              icon="eva-trash-2-outline"
                              @click="contest.sets.splice(setIndex, 1)"
                            />
                          </div>
                        </div>

                        <q-btn
                          flat
                          color="primary"
                          label="Add Set"
                          class="q-mt-sm"
                          @click="contest.sets.push('')"
                        />
                      </q-item-section>

                      <q-item-section side>
                        <q-btn
                          flat
                          round
                          dense
                          color="negative"
                          icon="eva-trash-2-outline"
                          @click="contestBoardConfig.contestTypes.splice(index, 1)"
                        />
                      </q-item-section>
                    </q-item>
                  </q-list>

                  <q-btn
                    flat
                    color="primary"
                    label="Add Contest Type"
                    class="q-mt-sm"
                    @click="
                      contestBoardConfig.contestTypes.push({
                        name: '',
                        assignmentTypes: [],
                        sets: [],
                      })
                    "
                  />
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="json">
              <q-input
                v-model="contestBoardConfigJson"
                type="textarea"
                filled
                autogrow
                class="monospace"
                :error="contestJsonError"
                :error-message="contestJsonError ? 'Invalid JSON format' : ''"
                @update:model-value="updateContestConfigFromJson"
              />
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
        <q-separator></q-separator>
        <q-card-section>
          <q-btn
            class="full-width"
            :label="isCreatingContestBoard ? createProgress : 'Create'"
            color="primary"
            :loading="isCreatingContestBoard"
            @click="createContestBoard"
          />
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
import {
  LECTURE_COLUMNS,
  CONTEST_COLUMNS,
  DEFAULT_LECTURE_BOARD_CONFIG,
  DEFAULT_CONTEST_BOARD_CONFIG,
  CONTENT_TYPES,
} from 'src/constants.js'

const courseStore = useCourseStore()

const route = useRoute()

const courseId = computed(() => route.params.courseId)

const course = computed(() => courseStore.selectedCourse)

const fetchCourse = async () => {
  await courseStore.fetchCourse(courseId.value)
}

fetchCourse()

const boards = computed(() => courseStore.selectedCourseBoards)

const hasLectureBoard = computed(() => boards.value.some((board) => board.type === 'lecture'))
const hasContestBoard = computed(() => boards.value.some((board) => board.type === 'contest'))

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

const openEditCourse = () => {
  courseTitle.value = course.value.title
  courseDescription.value = course.value.description

  showEditCourse.value = true
}

const $q = useQuasar()

const deleteCourse = async () => {
  $q.notify({
    type: 'negative',
    message: 'You are not allowed to delete a course',
  })
}

const showCreateLectureBoard = ref(false)
const showCreateContestBoard = ref(false)

const lectureBoardTitle = ref('')
const contestBoardTitle = ref('')

const lectureBoardTab = ref('basic')
const contestBoardTab = ref('basic')

const lectureBoardConfig = ref({ ...DEFAULT_LECTURE_BOARD_CONFIG })
const contestBoardConfig = ref({ ...DEFAULT_CONTEST_BOARD_CONFIG })

const lectureBoardConfigJson = ref('')
const jsonError = ref(false)

const contestBoardConfigJson = ref('')
const contestJsonError = ref(false)

// Add loading states
const isCreatingLectureBoard = ref(false)
const isCreatingContestBoard = ref(false)

// Add progress tracking
const createProgress = ref('')

// Update JSON when config changes
watch(
  () => lectureBoardConfig.value,
  (newConfig) => {
    lectureBoardConfigJson.value = JSON.stringify(newConfig, null, 2)
  },
  { deep: true },
)

// Watch for tab changes to update JSON view
watch(lectureBoardTab, (newTab) => {
  if (newTab === 'json') {
    lectureBoardConfigJson.value = JSON.stringify(lectureBoardConfig.value, null, 2)
  }
})

const updateConfigFromJson = (newValue) => {
  try {
    const parsed = JSON.parse(newValue)
    lectureBoardConfig.value = parsed
    jsonError.value = false
  } catch (error) {
    console.error('Failed to update config from JSON:', error)
    jsonError.value = true
  }
}

const addLectureBoardComponent = () => {
  lectureBoardConfig.value.componentTypes.push({
    name: '',
    contentType: 'document',
    assignmentTypes: [], // Initialize empty but will be populated if contentType is assignment
  })
}

const createLectureBoard = async () => {
  try {
    isCreatingLectureBoard.value = true
    createProgress.value = 'Creating board...'

    // Create the board first
    const board = await courseStore.createBoard({
      title: lectureBoardTitle.value,
      type: 'lecture',
      course: courseId.value,
      columns: LECTURE_COLUMNS,
    })

    // Generate lectures
    createProgress.value = 'Creating lectures...'
    const lectures = getLectures(lectureBoardConfig.value)
    const batchResults = await courseStore.createBulkLectures(
      lectures.map((lecture) => ({
        ...lecture,
        course: courseId.value,
        board: board.id,
      })),
    )
    // Extract created lectures from batch results
    const createdLectures = batchResults.map((result) => result.body)

    // Generate cards and questions
    createProgress.value = 'Creating cards and questions...'
    const [cardConfigs, questionConfigs] = getCardsForLectureBoard(
      board,
      createdLectures,
      lectureBoardConfig.value,
    )

    // Create cards
    await courseStore.createBulkCards(cardConfigs)

    // Create questions
    if (questionConfigs.length > 0) {
      await courseStore.createBulkQuestions(questionConfigs)
    }

    showCreateLectureBoard.value = false
    lectureBoardTitle.value = ''
    lectureBoardConfig.value = { ...DEFAULT_LECTURE_BOARD_CONFIG }

    $q.notify({
      type: 'positive',
      message: 'Lecture board created successfully',
    })
  } catch (error) {
    console.error('Failed to create lecture board:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to create lecture board',
    })
  } finally {
    isCreatingLectureBoard.value = false
    createProgress.value = ''
  }
}

const createContestBoard = async () => {
  try {
    isCreatingContestBoard.value = true
    createProgress.value = 'Creating board...'

    // Create the board first
    const board = await courseStore.createBoard({
      title: contestBoardTitle.value,
      type: 'contest',
      course: courseId.value,
      columns: CONTEST_COLUMNS,
    })

    // Generate contests
    createProgress.value = 'Creating contests...'
    const contests = getContests(contestBoardConfig.value)

    const batchResults = await courseStore.createBulkContests(
      contests.map((contest) => ({
        ...contest,
        course: courseId.value,
        board: board.id,
      })),
    )

    // Extract created contests from batch results
    const createdContests = batchResults.map((result) => result.body)

    // Generate cards and questions
    createProgress.value = 'Creating cards and questions...'

    const [cardConfigs, questionConfigs] = getCardsForContestBoard(
      board,
      createdContests,
      contestBoardConfig.value,
    )

    // Create cards
    await courseStore.createBulkCards(cardConfigs)

    // Create questions
    if (questionConfigs.length > 0) {
      await courseStore.createBulkQuestions(questionConfigs)
    }

    showCreateContestBoard.value = false
    contestBoardTitle.value = ''
    contestBoardConfig.value = { ...DEFAULT_CONTEST_BOARD_CONFIG }

    $q.notify({
      type: 'positive',
      message: 'Contest board created successfully',
    })
  } catch (error) {
    console.error('Failed to create contest board:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to create contest board',
    })
  } finally {
    isCreatingContestBoard.value = false
    createProgress.value = ''
  }
}

const openCreateLectureBoard = () => {
  lectureBoardTitle.value = `${course.value.title} - Lectures`
  lectureBoardConfig.value = { ...DEFAULT_LECTURE_BOARD_CONFIG }
  showCreateLectureBoard.value = true
}

const openCreateContestBoard = () => {
  contestBoardTitle.value = `${course.value.title} - Contests`
  contestBoardConfig.value = { ...DEFAULT_CONTEST_BOARD_CONFIG }
  showCreateContestBoard.value = true
}

const getLectures = (config) => {
  const lectures = []
  for (let i = 0; i < config.numberOfLectues; i++) {
    lectures.push({ title: `L${String(i + 1).padStart(2, '0')}` })
  }
  return lectures
}

const getCardsForLectureBoard = (board, lectures, config) => {
  const cards = []
  const questions = []
  for (const lecture of lectures) {
    for (const componentType of config.componentTypes) {
      if (componentType.contentType === CONTENT_TYPES.DOCUMENT) {
        // For documents, create single card
        cards.push({
          title: `${componentType.name}`,
          type: componentType.name,
          lecture: lecture.id,
          component: componentType.name,
          course: courseId.value,
          board: board.id,
          column: 'backlog',
          status: 'Not Started',
          description: `${componentType.name} for ${lecture.title}`,
          assignment_type: null,
          assignment_is_verified: false,
          file_link: null,
        })
      } else if (componentType.contentType === CONTENT_TYPES.ASSIGNMENT) {
        // For assignments, create card for each assignment type
        for (const assignmentType of componentType.assignmentTypes) {
          cards.push({
            title: `${componentType.name} - ${assignmentType.name}`,
            type: componentType.name,
            lecture: lecture.id,
            component: componentType.name,
            course: courseId.value,
            board: board.id,
            column: 'backlog',
            status: 'Not Started',
            description: `${componentType.name} ${assignmentType.name} for ${lecture.title}`,
            assignment_type: assignmentType.name,
            assignment_is_verified: false,
            question_count: assignmentType.count,
            questions: [],
            assignment_link: null,
            set_name: null,
          })

          // Create individual questions for this assignment type
          for (let i = 0; i < assignmentType.count; i++) {
            questions.push({
              title: `${assignmentType.name} Q${String(i + 1).padStart(2, '0')}`,
              type: assignmentType.name,
              lecture: lecture.id,
            })
          }
        }
      }
    }
  }
  return [cards, questions]
}

const getContests = (config) => {
  const contests = []
  for (const contestType of config.contestTypes) {
    contests.push({
      title: `${contestType.name}`,
      course: courseId.value,
      contest_type: contestType.name,
    })
  }
  return contests
}

const getCardsForContestBoard = (board, contests, config) => {
  const cards = []
  const questions = []
  for (const contest of contests) {
    const contestConfig = config.contestTypes.find((c) => c.name === contest.contest_type)

    if (!contestConfig) {
      console.warn('No contest config found for contest type:', contest.contest_type)
      continue
    }
    for (const assignmentType of contestConfig.assignmentTypes) {
      for (const set of contestConfig.sets) {
        cards.push({
          title: `${contest.title} - ${assignmentType.name} - ${set}`,
          type: assignmentType.name,
          contest: contest.id,
          component: 'Contest',
          course: courseId.value,
          board: board.id,
          column: 'backlog',
          status: 'Not Started',
          description: `Contest card for ${contest.title} - ${assignmentType.name}`,
          assignment_type: assignmentType.name,
          assignment_is_verified: false,
          // Additional required fields
          file_link: null,
          question_count: assignmentType.count,
          questions: [],
          assignment_link: null,
          set_name: set,
        })

        for (let i = 0; i < assignmentType.count; i++) {
          questions.push({
            title: `${assignmentType.name} Q${String(i + 1).padStart(2, '0')}`,
            type: assignmentType.name,
            contest: contest.id,
          })
        }
      }
    }
  }
  return [cards, questions]
}

// Update JSON when config changes
watch(
  () => contestBoardConfig.value,
  (newConfig) => {
    contestBoardConfigJson.value = JSON.stringify(newConfig, null, 2)
  },
  { deep: true },
)

// Watch for tab changes to update JSON view
watch(contestBoardTab, (newTab) => {
  if (newTab === 'json') {
    contestBoardConfigJson.value = JSON.stringify(contestBoardConfig.value, null, 2)
  }
})

const updateContestConfigFromJson = (newValue) => {
  try {
    const parsed = JSON.parse(newValue)
    contestBoardConfig.value = parsed
    contestJsonError.value = false
  } catch (error) {
    console.error('Failed to update contest config from JSON:', error)
    contestJsonError.value = true
  }
}

// Add CSS for monospace font
const style = document.createElement('style')
style.textContent = `
.monospace textarea {
  font-family: monospace !important;
  min-height: 400px !important;
}
`
document.head.appendChild(style)
</script>
