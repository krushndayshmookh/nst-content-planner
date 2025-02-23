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

      <q-breadcrumbs-el
        v-if="board"
        class="text-grey-7"
        :label="board.title"
        icon="eva-checkmark-square-outline"
        :to="`/courses/${courseId}/boards/${boardId}`"
      />

      <q-breadcrumbs-el v-if="board" label="Task List" icon="eva-list-outline" />
    </q-breadcrumbs>

    <q-card flat bordered>
      <q-card-section>
        <div class="row items-center">
          <div class="col-auto">
            <div class="text-body1 text-weight-medium">{{ board.title }}</div>
          </div>

          <div class="col">
            <div class="row items-center justify-end q-col-gutter-md">
              <div class="col-auto">
                <q-input
                  v-model="filter"
                  borderless
                  placeholder="Search tasks..."
                  outlined
                  dense
                  clearable
                  class="q-mr-md"
                >
                  <template #append>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>

              <div class="col-auto">
                <q-btn outline color="primary" icon="eva-funnel-outline" label="Filters">
                  <q-menu>
                    <q-list>
                      <q-item v-ripple tag="label">
                        <q-item-section>
                          <q-checkbox v-model="showAllColumns" label="Show all columns" />
                        </q-item-section>
                      </q-item>
                      <q-separator />
                      <q-item v-for="col in columns" :key="col.name" v-ripple tag="label">
                        <q-item-section>
                          <q-checkbox v-model="visibleColumns" :val="col.name" :label="col.label" />
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>

              <div class="col-auto">
                <q-btn
                  outline
                  color="primary"
                  icon="eva-grid-outline"
                  label="Board View"
                  :to="`/courses/${courseId}/boards/${boardId}`"
                />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table
          :rows="boardCards"
          :columns="columns"
          :visible-columns="visibleColumns"
          row-key="id"
          :filter="filter"
          :pagination="{ rowsPerPage: 20, sortBy: 'lecture', descending: true }"
          flat
          bordered
        >
          <template #body="props">
            <q-tr :props="props" :class="STATUS_COLORS[props.row.column]">
              <q-td key="lecture" :props="props">
                {{ props.row.lecture_number }}
              </q-td>
              <q-td key="component" :props="props">
                {{ props.row.component }}
              </q-td>
              <q-td key="status" :props="props">
                <q-select
                  v-model="props.row.column"
                  borderless
                  :options="boardColumns"
                  option-label="title"
                  option-value="id"
                  dense
                  options-dense
                  emit-value
                  map-options
                  @update:model-value="updateCardColumn(props.row.id, $event)"
                />
              </q-td>
              <q-td key="creator" :props="props">
                <q-select
                  v-model="props.row.creator"
                  borderless
                  :options="teamMembers"
                  option-label="name"
                  option-value="id"
                  dense
                  options-dense
                  emit-value
                  map-options
                  @update:model-value="updateCardField(props.row.id, 'creator', $event)"
                />
              </q-td>
              <q-td key="creation_deadline" :props="props">
                <q-input
                  v-model="props.row.creation_deadline"
                  borderless
                  dense
                  type="date"
                  @update:model-value="updateCardField(props.row.id, 'creation_deadline', $event)"
                />
              </q-td>
              <q-td key="reviewer1" :props="props">
                <q-select
                  v-model="props.row.reviewer1"
                  borderless
                  :options="teamMembers"
                  option-label="name"
                  option-value="id"
                  dense
                  options-dense
                  emit-value
                  map-options
                  @update:model-value="updateCardField(props.row.id, 'reviewer1', $event)"
                />
              </q-td>
              <q-td key="r1_deadline" :props="props">
                <q-input
                  v-model="props.row.r1_deadline"
                  borderless
                  dense
                  type="date"
                  @update:model-value="updateCardField(props.row.id, 'r1_deadline', $event)"
                />
              </q-td>
              <q-td key="reviewer2" :props="props">
                <q-select
                  v-model="props.row.reviewer2"
                  borderless
                  :options="teamMembers"
                  option-label="name"
                  option-value="id"
                  dense
                  options-dense
                  emit-value
                  map-options
                  @update:model-value="updateCardField(props.row.id, 'reviewer2', $event)"
                />
              </q-td>
              <q-td key="r2_deadline" :props="props">
                <q-input
                  v-model="props.row.r2_deadline"
                  borderless
                  dense
                  type="date"
                  @update:model-value="updateCardField(props.row.id, 'r2_deadline', $event)"
                />
              </q-td>
              <q-td key="actions" :props="props">
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="eva-edit-outline"
                  @click="openEditCard(props.row)"
                >
                  <q-tooltip>Edit Details</q-tooltip>
                </q-btn>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showEditCard" persistent full-height>
      <CardEditDialog v-if="showEditCard" />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCourseStore } from 'src/stores/course-store.js'
import { useUserStore } from 'src/stores/user-store.js'
import CardEditDialog from 'src/components/CardEditDialog.vue'

const route = useRoute()
const $q = useQuasar()
const courseStore = useCourseStore()
const userStore = useUserStore()

const courseId = computed(() => route.params.courseId)
const boardId = computed(() => route.params.boardId)

const course = computed(() => courseStore.selectedCourse)
const board = computed(() => courseStore.selectedBoard)
const boardColumns = computed(() => courseStore.selectedBoard.columns)
const boardCards = computed(() => courseStore.selectedBoardCards)
const teamMembers = ref([])

const filter = ref('')
const showAllColumns = ref(true)

const columns = [
  { name: 'lecture', label: 'Lecture', field: 'lecture', align: 'left', sortable: true },
  { name: 'component', label: 'Component', field: 'component', align: 'left', sortable: true },
  { name: 'status', label: 'Status', field: 'column', align: 'left', sortable: true },
  { name: 'creator', label: 'Creator', field: 'creator', align: 'left', sortable: true },
  { name: 'reviewer1', label: 'Reviewer 1', field: 'reviewer1', align: 'left', sortable: true },
  { name: 'reviewer2', label: 'Reviewer 2', field: 'reviewer2', align: 'left', sortable: true },
  {
    name: 'creation_deadline',
    label: 'Creation Deadline',
    field: 'creation_deadline',
    align: 'left',
    sortable: true,
  },
  {
    name: 'r1_deadline',
    label: 'R1 Deadline',
    field: 'r1_deadline',
    align: 'left',
    sortable: true,
  },
  {
    name: 'r2_deadline',
    label: 'R2 Deadline',
    field: 'r2_deadline',
    align: 'left',
    sortable: true,
  },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
]

const visibleColumns = ref(columns.map((col) => col.name))

const showEditCard = ref(false)

const fetchCourse = async () => {
  await courseStore.fetchCourse(courseId.value)
}

const fetchBoard = async () => {
  await courseStore.fetchBoard(boardId.value)
}

const fetchTeamMembers = async () => {
  const team = await courseStore.fetchCourseTeam(courseId.value)
  const users = await userStore.fetchUsers()
  teamMembers.value = users.filter((user) => team.members.includes(user.id))
}

fetchCourse()
fetchBoard()
fetchTeamMembers()

const updateCardColumn = async (cardId, columnId) => {
  try {
    await courseStore.updateCardColumn(cardId, columnId)
    $q.notify({
      type: 'positive',
      message: 'Card status updated successfully',
    })
  } catch (error) {
    console.error('Failed to update card status:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to update card status',
    })
  }
}

const updateCardField = async (cardId, field, value) => {
  try {
    const updateData = {
      [field]: field.includes('deadline') ? new Date(value) : value,
    }
    await courseStore.updateCard(cardId, updateData)
    $q.notify({
      type: 'positive',
      message: 'Card updated successfully',
    })
  } catch (error) {
    console.error('Failed to update card:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to update card',
    })
  }
}

const openEditCard = (card) => {
  courseStore.selectedCard = { ...card }
  showEditCard.value = true
}

const STATUS_COLORS = {
  backlog: 'bg-grey-1',
  'create-update': 'bg-blue-2',
  review1: 'bg-light-green-2',
  review2: 'bg-green-2',
  finished: 'bg-purple-2',
  blocked: 'bg-red-2',
}
</script>

<style scoped>
.q-table__card {
  width: 100%;
}
</style>
