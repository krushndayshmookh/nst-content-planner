<!-- eslint-disable vue/no-v-html -->
<template>
  <q-card style="min-width: 850px">
    <!-- Not needed at the moment as we can simply close by clicking outside the dialog -->

    <!-- <q-card-section>
      <div class="text-h6">
        Edit Card
        <q-btn v-close-popup class="float-right" flat dense round icon="eva-close-outline" />
      </div>
    </q-card-section> -->

    <q-separator></q-separator>

    <div class="row">
      <div class="col-8">
        <q-scroll-area :style="`height: ${heightOfScrollArea}px`">
          <!-- <pre>{{ card }}</pre> -->
          <!-- Add title and description editors -->
          <div class="q-pa-md">
            <div
              ref="titleRef"
              :class="{ 'unsaved-changes': isDirty.title }"
              class="title-editor q-mb-sm"
              contenteditable="true"
              @blur="handleTitleBlur"
              @input="handleTitleInput"
              v-text="localTitle"
            ></div>

            <div class="description-wrapper q-pa-xs">
              <div class="description-controls">
                <q-btn-toggle
                  v-model="editorMode"
                  size="sm"
                  flat
                  :options="[
                    { icon: 'eva-edit-outline', value: 'write', label: 'Write' },
                    { icon: 'eva-eye-outline', value: 'preview', label: 'Preview' },
                    { icon: 'eva-eye-off-outline', value: 'hide', label: 'Hide' },
                  ]"
                />
              </div>

              <div
                v-if="editorMode === 'preview'"
                class="markdown-preview q-mt-xs"
                v-html="markdownPreview"
              ></div>
              <textarea
                v-if="editorMode === 'write'"
                ref="descriptionRef"
                v-model="localDescription"
                :class="{ 'unsaved-changes': isDirty.description }"
                class="description-editor full-width q-mt-xs"
                rows="18"
                @input="handleDescriptionInput"
                @blur="handleDescriptionBlur"
                @focus="handleDescriptionFocus"
              ></textarea>
              <div v-if="editorMode === 'write'" class="col-auto text-caption text-grey-7">
                This editor supports
                <a href="https://www.markdownguide.org/" target="_blank">Markdown</a>. Click outside
                the editor to save.
              </div>
            </div>
          </div>

          <div v-if="cardQuestions.length" class="q-px-md">
            <q-list bordered separator>
              <q-item
                v-for="question in cardQuestions"
                :key="question.id"
                :class="{
                  'bg-green-1': question.is_reviewed,
                  'bg-red-1': !question.question_id,
                  'bg-yellow-1': question.question_id && !question.is_reviewed,
                }"
              >
                <q-item-section class="col-4">
                  <q-input
                    v-model="question.question_id"
                    placeholder="Django ID"
                    outlined
                    dense
                    @update:model-value="(val) => handleQuestionInput(val, question)"
                  />
                </q-item-section>
                <q-item-section v-if="question.is_reviewed">
                  <q-item-label>
                    <q-icon name="eva-checkmark-circle-outline" color="positive" /> Reviewed
                  </q-item-label>
                </q-item-section>
                <q-item-section v-else>
                  <q-item-label>
                    <q-icon name="eva-checkmark-circle-outline" color="grey" /> Not Reviewed
                  </q-item-label>
                </q-item-section>

                <q-item-section v-if="!question.is_reviewed" side>
                  <q-btn
                    round
                    flat
                    dense
                    icon="eva-refresh-outline"
                    color="grey"
                    disable
                    @click="updateQuestion(question)"
                  >
                    <q-tooltip>Check for Updates</q-tooltip>
                  </q-btn>
                </q-item-section>

                <q-item-section side>
                  <q-btn
                    round
                    flat
                    dense
                    icon="eva-eye-outline"
                    :color="question.question_id ? 'primary' : 'grey'"
                    :disable="!question.question_id"
                    @click="openQuestion(question)"
                  >
                    <q-tooltip>Open Question</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- <q-separator /> -->

          <div class="q-pa-md">
            <div class="text-h6 q-mb-sm">Comments</div>

            <div class="comment-editor q-mb-md q-pa-sm">
              <div>
                <q-input
                  ref="commentInput"
                  v-model="newComment"
                  :placeholder="replyTo ? 'Write a reply...' : 'Write a comment...'"
                  outlined
                  dense
                  type="textarea"
                  rows="3"
                  class="q-pr-none"
                  @keydown.enter.prevent="postComment"
                >
                </q-input>
              </div>
              <div class="row justify-end">
                <div class="col-auto q-pt-sm">
                  <q-btn
                    v-if="replyTo"
                    label="Cancel"
                    flat
                    color="negative"
                    size="sm"
                    @click="cancelReply"
                  />

                  <q-btn
                    :label="replyTo ? 'Reply' : 'Comment'"
                    color="primary"
                    size="sm"
                    class="q-ml-sm"
                    @click="postComment"
                  />
                </div>
              </div>
            </div>

            <div class="comments-list">
              <template v-if="comments.length">
                <div
                  v-for="comment in sortedComments"
                  :key="comment.id"
                  :data-comment-id="comment.id"
                  class="comment-item q-mb-md"
                  :class="{
                    'comment-resolved': comment.resolved,
                    'comment-highlighted': comment.id === replyTo?.id,
                    'comment-flash-highlight': tempHighlightedComment === comment.id,
                  }"
                >
                  <div class="row items-start">
                    <div class="col flex">
                      <div class="column full-width">
                        <div class="q-pa-sm">
                          <p>
                            <span class="text-weight-medium">{{ comment.expand?.user?.name }}</span>
                            <span class="text-caption q-ml-sm text-grey">
                              {{ formatTimeAgo(comment.created_at) }}
                            </span>
                            <span v-if="comment.is_reply" class="text-caption text-grey">
                              &bull; replied to
                              <a
                                href="#"
                                class="text-primary"
                                @click.prevent="highlightComment(comment.parent)"
                              >
                                <span class="text-weight-medium">{{
                                  `${comment.expand?.parent?.expand?.user?.name}'s`
                                }}</span>
                                comment
                              </a>
                            </span>
                          </p>

                          <div
                            class="comment-content"
                            v-html="renderContent(comment.content)"
                          ></div>
                        </div>

                        <div v-if="comment.resolved" class="text-caption q-ma-sm text-positive">
                          Resolved by
                          <span class="text-weight-medium">{{
                            comment.expand?.resolved_by?.name
                          }}</span>
                          {{ formatTimeAgo(comment.resolved_at) }}
                        </div>
                      </div>
                    </div>

                    <!-- <q-separator vertical /> -->

                    <div class="col-auto">
                      <div class="column q-pa-sm">
                        <q-btn
                          flat
                          dense
                          round
                          icon="eva-message-square-outline"
                          class="q-mb-sm"
                          @click="startReply(comment)"
                        />
                        <q-btn
                          flat
                          dense
                          round
                          :icon="
                            comment.resolved
                              ? 'eva-checkmark-circle-2'
                              : 'eva-checkmark-circle-outline'
                          "
                          :color="comment.resolved ? 'positive' : 'grey'"
                          @click="toggleResolved(comment)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <div v-else class="text-grey text-center q-pa-md">No comments yet</div>
            </div>
          </div>

          <div class="empty-space q-px-xl q-my-xl"></div>
        </q-scroll-area>
      </div>

      <q-separator vertical></q-separator>

      <div class="col">
        <q-scroll-area :style="`height: ${heightOfScrollArea}px`">
          <q-card-section>
            <q-card flat bordered class="q-mb-md">
              <q-item dense>
                <q-item-section side>
                  <q-icon name="eva-book-outline" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{
                    card.expand?.lecture?.title || card.expand?.contest?.title
                  }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item dense>
                <q-item-section side>
                  <q-icon name="eva-pricetags-outline" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ card.component }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item dense class="q-pr-xs q-py-xs">
                <q-item-section side>
                  <q-icon
                    :name="COLUMNS_ICONS[currentColumn]"
                    :color="COLUMN_COLORS[currentColumn]"
                  />
                </q-item-section>
                <q-item-section>
                  <q-select
                    v-model="currentColumn"
                    standout
                    :options="columns"
                    option-label="title"
                    option-value="id"
                    dense
                    emit-value
                    map-options
                    @update:model-value="handleColumnChange"
                  />
                </q-item-section>
              </q-item>
            </q-card>

            <q-card flat bordered class="q-mb-md">
              <q-item-label header class="q-py-sm">Contest Details</q-item-label>
              <q-separator v-if="card.contest" />

              <!-- Contest Specific Fields -->
              <q-list v-if="card.contest" dense>
                <q-item>
                  <q-item-section side>
                    <q-icon name="eva-calendar-outline" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>
                      {{
                        card.expand?.contest?.contest_date
                          ? $formatDateForUI(card.expand.contest.contest_date)
                          : 'Not set'
                      }}
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section side>
                    <q-icon name="eva-person-outline" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>
                      {{ card.expand?.contest?.expand?.owner?.name || 'Not assigned' }}
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-item
                  clickable
                  :to="`/courses/${route.params.courseId}/contests`"
                  target="_blank"
                >
                  <q-item-section>
                    <q-item-label>Open Contests</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="eva-external-link-outline" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>

            <q-card flat bordered class="q-mb-md">
              <q-item-label header class="q-py-sm">Assignments</q-item-label>

              <q-separator />

              <!-- Creator Group -->
              <q-card-section>
                <q-select
                  v-model="creator"
                  :options="teamMembers"
                  :class="{ 'unsaved-changes': isDirty.creator }"
                  option-label="name"
                  option-value="id"
                  label="Creator"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                  class="q-mb-sm"
                  @update:model-value="handleAssigneeChange('creator')"
                />
                <q-input
                  v-model="creation_deadline"
                  :class="{ 'unsaved-changes': isDirty.creation_deadline }"
                  label="Creator Deadline"
                  outlined
                  dense
                  @update:model-value="handleDateChange('creation_deadline')"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy
                        ref="creatorProxy"
                        cover
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-date
                          v-model="creation_deadline"
                          mask="YYYY-MM-DD"
                          today-btn
                          @update:model-value="
                            () => {
                              creatorProxy.hide()
                              delay(100).then(() => {
                                // wait for the dates to be updated by the watch
                                handleDateChange('creation_deadline')
                              })
                            }
                          "
                        />
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
                  :class="{ 'unsaved-changes': isDirty.reviewer1 }"
                  option-label="name"
                  option-value="id"
                  label="Reviewer 1"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                  class="q-mb-sm"
                  @update:model-value="handleAssigneeChange('reviewer1')"
                />
                <q-input
                  v-model="r1_deadline"
                  :class="{ 'unsaved-changes': isDirty.r1_deadline }"
                  label="Reviewer 1 Deadline"
                  outlined
                  dense
                  @update:model-value="handleDateChange('r1_deadline')"
                >
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
                          :options="r1OptionsFn"
                          today-btn
                          @update:model-value="
                            () => {
                              r1Proxy.hide()
                              delay(100).then(() => {
                                // wait for the dates to be updated by the watch
                                handleDateChange('r1_deadline')
                              })
                            }
                          "
                        />
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
                  :class="{ 'unsaved-changes': isDirty.reviewer2 }"
                  option-label="name"
                  option-value="id"
                  label="Reviewer 2"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                  class="q-mb-sm"
                  @update:model-value="handleAssigneeChange('reviewer2')"
                />
                <q-input
                  v-model="r2_deadline"
                  :class="{ 'unsaved-changes': isDirty.r2_deadline }"
                  label="Reviewer 2 Deadline"
                  outlined
                  dense
                  @update:model-value="handleDateChange('r2_deadline')"
                >
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
                          :options="r2OptionsFn"
                          today-btn
                          @update:model-value="
                            () => {
                              r2Proxy.hide()
                              delay(100).then(() => {
                                // wait for the dates to be updated by the watch
                                handleDateChange('r2_deadline')
                              })
                            }
                          "
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="q-mb-md">
              <q-item>
                <q-item-section side>
                  <q-icon name="eva-grid-outline" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ card.expand?.course?.title }}</q-item-label>
                </q-item-section>
              </q-item>
              <!-- <q-separator /> -->
            </q-card>
          </q-card-section>
        </q-scroll-area>
      </div>
    </div>

    <!-- <q-separator></q-separator> -->

    <!-- below section is not needed at the moment as everything is saved on blur -->
    <!-- <q-card-section>
      <div class="row items-center q-col-gutter-md">
        <div class="col">
          <q-btn round dense flat icon="eva-trash-2-outline" color="negative" @click="deleteCard" />
        </div>
        <div class="col-auto">
          <q-btn label="Update" color="primary" @click="updateCard" />
        </div>
      </div>
    </q-card-section> -->
  </q-card>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useCourseStore } from 'src/stores/course-store.js'
import { useUserStore } from 'src/stores/user-store.js'
import { useAuthStore } from 'src/stores/auth-store.js'
import { useRoute } from 'vue-router'
import { formatDateForUI } from 'src/boot/filters'
import { useQuasar } from 'quasar'
import { date as QuasarDate } from 'quasar'
import { debounce } from 'quasar'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { formatDistanceToNow } from 'date-fns'
import { pb } from 'src/boot/pocketbase'
import { LECTURE_COLUMNS, CONTEST_COLUMNS } from 'src/constants.js'

const courseStore = useCourseStore()
const userStore = useUserStore()
const route = useRoute()
const $q = useQuasar()
const card = courseStore.selectedCard
const teamMembers = ref([])

// Add local column state
const currentColumn = ref(card.column)

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

const r1OptionsFn = (date) => {
  if (!creation_deadline.value) return true
  const minDate = new Date(creation_deadline.value)
  const maxDate = QuasarDate.addToDate(minDate, { days: 7 })
  return QuasarDate.isBetweenDates(date, minDate, maxDate)
}

const r2OptionsFn = (date) => {
  if (!r1_deadline.value) return true
  const minDate = new Date(r1_deadline.value)
  const maxDate = QuasarDate.addToDate(minDate, { days: 7 })
  return QuasarDate.isBetweenDates(date, minDate, maxDate)
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

const cardQuestions = ref([])

const fetchCardQuestions = async () => {
  if (card.question_count) {
    let filter = card.lecture ? `lecture="${card.lecture}"` : `contest="${card.contest}"`
    filter += ` && type="${card.assignment_type}"`

    const questions = await pb.collection('questions').getFullList({
      filter,
    })

    cardQuestions.value = questions
  }
}

onMounted(() => {
  fetchTeamMembers()
  fetchCardQuestions()
})

const handleQuestionInput = debounce(async (questionId, question) => {
  try {
    await pb.collection('questions').update(question.id, {
      question_id: questionId,
    })
  } catch (err) {
    console.error('Failed to update question:', err)
    $q.notify({
      type: 'negative',
      message: 'Failed to update question ID',
    })
  }
}, 500)

const updateQuestion = (question) => {
  console.log(question)
}

const openQuestion = (question) => {
  console.log(question)
  if (question.type === 'MCQs') {
    const url = `https://django.newtonschool.co/admin/assessments/multiplechoicequestion/${question.question_id}/change/`
    window.open(url, '_blank')
  }
  if (question.type === 'Coding') {
    const url = `https://django.newtonschool.co/admin/assignments/assignmentquestion/${question.question_id}/change/`
    window.open(url, '_blank')
  }
}

// const updateCard = async () => {
//   const updatedCard = {
//     creator: creator.value,
//     reviewer1: reviewer1.value,
//     reviewer2: reviewer2.value,
//     creation_deadline: creation_deadline.value ? new Date(creation_deadline.value) : null,
//     r1_deadline: r1_deadline.value ? new Date(r1_deadline.value) : null,
//     r2_deadline: r2_deadline.value ? new Date(r2_deadline.value) : null,
//   }
//   await courseStore.updateCard(card.id, updatedCard)
// }

// const deleteCard = async () => {
//   // await courseStore.deleteCard(card.id)

//   $q.notify({
//     type: 'negative',
//     message: 'You are not allowed to delete a card',
//   })
// }

// const heightOfScrollArea = window.innerHeight - (48 + 64 + 68.01 + 2 + 4) // 48 is space around dialog,  64 is header height, 68.01 is footer height, 2 is separators height, 4 is buffer
const heightOfScrollArea = window.innerHeight - 48 // 48 is space around dialog,  64 is header height, 1 is separators height // this is when we dont have card header or footer

// Add new refs for local state
const localTitle = ref(card.title || '')
const localDescription = ref(card.description || 'Enter description...')
const titleRef = ref(null)
const descriptionRef = ref(null)
const isDirty = ref({
  title: false,
  description: false,
  creator: false,
  reviewer1: false,
  reviewer2: false,
  creation_deadline: false,
  r1_deadline: false,
  r2_deadline: false,
})

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Debounced save function
const saveChanges = debounce(async (field) => {
  const updates = {}

  if (field === 'title') {
    updates.title = localTitle.value
    isDirty.value.title = false
  } else if (field === 'description') {
    updates.description = localDescription.value
    isDirty.value.description = false
  }

  try {
    await courseStore.updateCard(card.id, updates)
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Failed to save changes',
      position: 'bottom-right',
    })
  }
}, 1000)

// Event handlers
const handleTitleInput = (event) => {
  localTitle.value = event.target.innerText
  isDirty.value.title = true
}

const handleTitleBlur = () => {
  if (isDirty.value.title) {
    saveChanges('title')
  }
}

const handleDescriptionBlur = () => {
  if (isDirty.value.description) {
    saveChanges('description')
  }
}

const handleDescriptionFocus = () => {
  if (localDescription.value === 'Enter description...') {
    localDescription.value = ''
  }
}

const handleDescriptionInput = () => {
  isDirty.value.description = true
}

const editorMode = ref('preview')

// Add computed property for markdown preview
const markdownPreview = computed(() => {
  if (!localDescription.value) return ''
  const rawHtml = marked.parse(localDescription.value)
  return DOMPurify.sanitize(rawHtml)
})

// New handlers for assignee and date changes
const handleAssigneeChange = async (field) => {
  isDirty.value[field] = true
  const updates = {
    [field]:
      field === 'creator'
        ? creator.value
        : field === 'reviewer1'
          ? reviewer1.value
          : reviewer2.value,
  }

  try {
    await courseStore.updateCard(card.id, updates)
    isDirty.value[field] = false
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Failed to update assignee',
      position: 'bottom-right',
    })
  }
}

const handleDateChange = async (field) => {
  isDirty.value[field] = true
  const dateValue =
    field === 'creation_deadline'
      ? creation_deadline.value
      : field === 'r1_deadline'
        ? r1_deadline.value
        : r2_deadline.value

  const updates = {
    [field]: dateValue ? new Date(dateValue) : null,
  }

  if (field === 'creation_deadline') {
    updates.r1_deadline = r1_deadline.value ? new Date(r1_deadline.value) : null
    updates.r2_deadline = r2_deadline.value ? new Date(r2_deadline.value) : null
  }

  if (field === 'r1_deadline') {
    updates.r2_deadline = r2_deadline.value ? new Date(r2_deadline.value) : null
  }

  try {
    await courseStore.updateCard(card.id, updates)
    isDirty.value[field] = false
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Failed to update deadline',
      position: 'bottom-right',
    })
  }
}

// column change handler
const handleColumnChange = async (column) => {
  currentColumn.value = column
  await courseStore.updateCard(card.id, { column })
}

const COLUMNS_ICONS = {
  backlog: 'eva-loader-outline',
  'create-update': 'eva-pause-circle-outline',
  review1: 'eva-checkmark-outline',
  review2: 'eva-done-all-outline',
  finished: 'eva-checkmark-square-2',
  ready: 'eva-checkmark-circle-2-outline',
  'assignment-ready': 'eva-file-text-outline',
  executed: 'eva-flag-outline',
}

const COLUMN_COLORS = {
  backlog: 'blue-grey-5',
  'create-update': 'orange-7',
  review1: 'light-green-7',
  review2: 'green-7',
  finished: 'blue-7',
  ready: 'teal-7',
  'assignment-ready': 'purple-7',
  executed: 'deep-purple-7',
}

const columns = computed(() => {
  // Get the board type from the card's board
  const boardType = card.lecture ? 'lecture' : 'contest'
  return boardType === 'lecture' ? LECTURE_COLUMNS : CONTEST_COLUMNS
})

// Add new refs for comments
const comments = ref([])
const newComment = ref('')
const replyTo = ref(null)
const commentInput = ref(null)

// Fetch comments on mount
onMounted(async () => {
  await fetchComments()
})

// Sort comments by created_at in descending order
const sortedComments = computed(() => {
  return [...comments.value].sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at)
  })
})

// Format time ago
const formatTimeAgo = (date) => {
  if (!date) return ''
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

// Render content with mentions
const renderContent = (content) => {
  // Replace @mentions with links
  const mentionRegex = /@([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
  const contentWithMentions = content.replace(mentionRegex, '<a href="#" class="mention">@$1</a>')
  return DOMPurify.sanitize(contentWithMentions)
}

// Fetch comments
const fetchComments = async () => {
  try {
    const records = await pb.collection('comments').getFullList({
      filter: `card="${card.id}"`,
      expand: 'user,parent.user,resolved_by',
      sort: '-created_at',
    })
    comments.value = records
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to fetch comments',
      position: 'bottom-right',
    })
  }
}

const authStore = useAuthStore()

// Post comment
const postComment = async () => {
  if (!newComment.value.trim()) return

  try {
    const commentData = {
      card: card.id,
      user: authStore.user.id,
      content: newComment.value,
      resolved: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_edited: false,
      is_reply: !!replyTo.value,
      parent: replyTo.value?.id || null,
      top_level_parent: replyTo.value?.top_level_parent || replyTo.value?.id || null,
    }

    // Extract mentioned users
    const mentionRegex = /@([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
    const mentionedEmails = [...newComment.value.matchAll(mentionRegex)].map((match) => match[1])

    if (mentionedEmails.length) {
      const users = await pb.collection('users').getFullList({
        filter: mentionedEmails.map((email) => `email="${email}"`).join('||'),
      })
      commentData.mentioned_users = users.map((user) => user.id)
    }

    await pb.collection('comments').create(commentData)
    newComment.value = ''
    replyTo.value = null
    await fetchComments()

    $q.notify({
      type: 'positive',
      message: 'Comment posted successfully',
      position: 'bottom-right',
    })
  } catch (error) {
    console.error('Failed to post comment:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to post comment',
      position: 'bottom-right',
    })
  }
}

// Start reply
const startReply = (comment) => {
  replyTo.value = comment
  newComment.value = ''
  // Focus the input field after a short delay to ensure the DOM is updated
  setTimeout(() => {
    commentInput.value.focus()
  }, 100)
}

// Cancel reply
const cancelReply = () => {
  replyTo.value = null
  newComment.value = ''
}

// Toggle resolved status
const toggleResolved = async (comment) => {
  try {
    const updates = {
      resolved: !comment.resolved,
      updated_at: new Date().toISOString(),
    }

    // If we're resolving the comment, add resolver info
    if (!comment.resolved) {
      updates.resolved_by = authStore.user.id
      updates.resolved_at = new Date().toISOString()
    } else {
      // If we're unresolving, clear resolver info
      updates.resolved_by = null
      updates.resolved_at = null
    }

    await pb.collection('comments').update(comment.id, updates)
    await fetchComments()
  } catch (error) {
    console.error('Failed to update comment:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to update comment',
      position: 'bottom-right',
    })
  }
}

const tempHighlightedComment = ref(null)

// Highlight a comment temporarily
const highlightComment = (commentId) => {
  tempHighlightedComment.value = commentId
  // Scroll the comment into view
  nextTick(() => {
    const element = document.querySelector(`.comment-item[data-comment-id="${commentId}"]`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
  // Remove highlight after 3 seconds
  setTimeout(() => {
    tempHighlightedComment.value = null
  }, 3000)
}
</script>

<style scoped lang="scss">
.title-editor {
  font-size: 1.5rem;
  font-weight: bold;
  min-height: 2rem;
  padding: 0.5rem;
  border: 1px solid $grey-3;
  border-radius: 4px;
}

.description-wrapper {
  border: 1px solid $grey-3;
  border-radius: 4px;
}

.description-editor {
  font-size: 0.9rem;
  min-height: 5rem;
  padding: 0.5rem;
  border: 1px solid $grey-3;
  border-radius: 4px;
  white-space: pre-wrap;
  font-family: 'JetBrains Mono', monospace;
}

.title-editor:focus,
.description-editor:focus {
  outline: none;
  border-color: var(--q-primary);
}

.unsaved-changes {
  border-color: var(--q-warning);
}

.title-editor:empty::before {
  content: 'Enter title...';
  color: #999;
}

.description-editor:empty::before {
  content: 'Enter description...';
  color: #999;
}

.description-controls {
  display: flex;
  justify-content: flex-start;
}

.markdown-preview {
  font-size: 1rem;
  min-height: 5rem;
  padding: 0.5rem;
  border: 1px solid transparent;
  border-radius: 4px;
  background-color: #f7f7f7;
}

/* Style markdown preview content */
.markdown-preview :deep(*) {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
}

.markdown-preview :deep(h1) {
  font-size: 1.5em;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.markdown-preview :deep(h2) {
  font-size: 1.3em;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.markdown-preview :deep(p) {
  margin: 0.5em 0;
}

.markdown-preview :deep(ul),
.markdown-preview :deep(ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.markdown-preview :deep(code) {
  background-color: #f0f0f0;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
}

.markdown-preview :deep(pre) {
  background-color: #f0f0f0;
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
}

.markdown-preview :deep(blockquote) {
  margin: 0.5em 0;
  padding-left: 1em;
  border-left: 3px solid #ddd;
  color: #666;
}

.markdown-preview :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 0.5em 0;
}

.markdown-preview :deep(th),
.markdown-preview :deep(td) {
  border: 1px solid #ddd;
  padding: 0.5em;
}

.markdown-preview :deep(a) {
  color: var(--q-primary);
  text-decoration: none;
}

.markdown-preview :deep(a:hover) {
  text-decoration: underline;
}

// Add styles for select components
:deep(.q-field) {
  &.unsaved-changes {
    .q-field__control {
      border-color: var(--q-warning);
    }
  }
}

.comment-editor {
  border: 1px solid $grey-3;
  border-radius: 4px;
}

.comment-item {
  border: 1px solid $grey-3;
  border-radius: 4px;

  background-color: white;
  transition: all 0.3s ease;
  scroll-margin: 1rem;

  &.comment-resolved {
    background-color: #f0f9f0;
  }

  &.comment-highlighted {
    border-color: var(--q-primary);
    background-color: #f5f5ff;
    transform: scale(1.01);
  }

  &.comment-flash-highlight {
    animation: flash-highlight 3s ease;
  }
}

@keyframes flash-highlight {
  0%,
  100% {
    border-color: $grey-3;
    background-color: white;
    transform: scale(1);
  }
  10%,
  90% {
    border-color: $amber-9;
    background-color: #fffcf5;
    transform: scale(1.02);
  }
}

.comment-content {
  white-space: pre-wrap;
  font-size: 0.9rem;
  line-height: 1.4;

  :deep(.mention) {
    color: var(--q-primary);
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
}

.comments-list {
  max-width: 800px;
}
</style>
