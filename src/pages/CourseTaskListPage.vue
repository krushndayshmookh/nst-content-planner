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
                  v-model="filter.search"
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
                <q-btn-dropdown
                  outline
                  color="primary"
                  :label="hasActiveFilters ? `Filters (${getActiveFiltersCount})` : 'Filters'"
                  class="q-mr-md"
                  :icon="hasActiveFilters ? 'eva-funnel' : 'eva-funnel-outline'"
                  @show="initializeTempFilters"
                >
                  <q-list style="min-width: 350px" padding>
                    <q-item-label header>Filter Options</q-item-label>

                    <q-item>
                      <q-item-section>
                        <q-select
                          v-model="tempFilterColumn"
                          :options="boardColumns"
                          option-label="title"
                          option-value="id"
                          label="Status"
                          outlined
                          dense
                          multiple
                          emit-value
                          map-options
                          clearable
                          class="full-width"
                          use-input
                          use-chips
                        />
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-select
                          v-model="tempFilterComponent"
                          :options="componentOptions"
                          option-label="label"
                          option-value="value"
                          label="Component"
                          outlined
                          dense
                          multiple
                          emit-value
                          map-options
                          clearable
                          class="full-width"
                          use-input
                          use-chips
                        />
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-select
                          v-model="tempFilterCreator"
                          :options="teamMembers"
                          option-label="name"
                          option-value="id"
                          label="Creator"
                          outlined
                          dense
                          multiple
                          emit-value
                          map-options
                          clearable
                          class="full-width"
                          use-input
                          use-chips
                        />
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-select
                          v-model="tempFilterReviewer"
                          :options="teamMembers"
                          option-label="name"
                          option-value="id"
                          label="Reviewer"
                          outlined
                          dense
                          multiple
                          emit-value
                          map-options
                          clearable
                          class="full-width"
                          use-input
                          use-chips
                        />
                      </q-item-section>
                    </q-item>

                    <q-separator spaced />

                    <q-item>
                      <q-item-section>
                        <div class="row justify-end q-gutter-sm">
                          <q-btn
                            flat
                            label="Clear"
                            :disable="!hasTempFilters"
                            :color="hasActiveFilters ? 'primary' : 'grey'"
                            @click="clearAllTempFilters"
                          />
                          <q-btn
                            v-close-popup
                            color="primary"
                            label="Apply"
                            @click="applyFilters"
                          />
                        </div>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </div>

              <div class="col-auto">
                <q-select
                  v-model="visibleColumns"
                  :options="columns"
                  map-options
                  emit-value
                  option-label="label"
                  option-value="name"
                  placeholder="Columns"
                  outlined
                  dense
                  class="q-mr-md"
                  multiple
                  hide-bottom-space
                  style="width: 200px"
                  input-class="ellipsis"
                  :display-value="`${visibleColumns.length}/${columns.length} columns`"
                />
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
          :filter-method="filterTable"
          :pagination="{ rowsPerPage: 20, sortBy: 'lecture', descending: true }"
          flat
          bordered
          dense
          :wrap-cells="false"
          class="compact-table"
          style="height: calc(100vh - 250px)"
        >
          <template #body="props">
            <q-tr :props="props" :class="STATUS_COLORS[props.row.column]">
              <q-td key="lecture" :props="props" class="q-py-xs">
                <div class="row items-center">
                  <div class="col">
                    <q-badge
                      v-if="props.row.lecture"
                      color="blue-8"
                      style="max-width: 100%"
                      class="text-no-wrap"
                    >
                      <span class="ellipsis">
                        {{ props.row.expand?.lecture?.title }}
                      </span>
                    </q-badge>
                    <q-badge
                      v-else-if="props.row.contest"
                      color="blue-8"
                      style="max-width: 100%"
                      class="text-no-wrap"
                    >
                      <span class="ellipsis">
                        {{ props.row.expand?.contest?.title }}
                      </span>
                    </q-badge>
                  </div>
                  <div v-if="isDelayed(props.row)" class="col-auto">
                    <q-icon
                      name="eva-alert-triangle-outline"
                      size="xs"
                      color="negative"
                      class="q-ml-sm"
                    >
                      <q-tooltip>This card has passed deadlines</q-tooltip>
                    </q-icon>
                  </div>
                </div>
              </q-td>
              <q-td key="component" :props="props" class="q-py-xs">
                <div class="row items-center">
                  <q-badge
                    :color="getTypeColor(props.row.component).bg"
                    :text-color="getTypeColor(props.row.component).text"
                    style="max-width: 100%"
                    class="text-no-wrap"
                  >
                    <span class="ellipsis">{{ props.row.component }}</span>
                  </q-badge>
                  <q-badge
                    v-if="props.row.assignment_type"
                    color="secondary"
                    style="max-width: 100%"
                    class="q-ml-xs text-no-wrap"
                  >
                    <span class="ellipsis">{{ props.row.assignment_type }}</span>
                  </q-badge>
                  <q-badge
                    v-if="props.row.set_name"
                    color="orange"
                    style="max-width: 100%"
                    class="q-ml-xs text-no-wrap"
                  >
                    <span class="ellipsis">{{ props.row.set_name }}</span>
                  </q-badge>
                </div>
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
              <q-td key="creation_deadline" :props="props" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date
                    v-model="props.row.creation_deadline"
                    mask="YYYY-MM-DD"
                    @update:model-value="updateCardField(props.row.id, 'creation_deadline', $event)"
                  />
                </q-popup-proxy>
                <div class="row items-center">
                  <div
                    class="col"
                    :class="{ 'text-negative': isDateDelayed(props.row.creation_deadline) }"
                  >
                    {{ formatDate(props.row.creation_deadline) }}
                  </div>
                  <div class="col-auto">
                    <q-icon name="event" size="xs" color="grey-7" />
                  </div>
                </div>
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
              <q-td key="r1_deadline" :props="props" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date
                    v-model="props.row.r1_deadline"
                    mask="YYYY-MM-DD"
                    @update:model-value="updateCardField(props.row.id, 'r1_deadline', $event)"
                  />
                </q-popup-proxy>
                <div class="row items-center">
                  <div
                    class="col"
                    :class="{ 'text-negative': isDateDelayed(props.row.r1_deadline) }"
                  >
                    {{ formatDate(props.row.r1_deadline) }}
                  </div>
                  <div class="col-auto">
                    <q-icon name="event" size="xs" color="grey-7" />
                  </div>
                </div>
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
              <q-td key="r2_deadline" :props="props" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date
                    v-model="props.row.r2_deadline"
                    mask="YYYY-MM-DD"
                    @update:model-value="updateCardField(props.row.id, 'r2_deadline', $event)"
                  />
                </q-popup-proxy>
                <div class="row items-center">
                  <div
                    class="col"
                    :class="{ 'text-negative': isDateDelayed(props.row.r2_deadline) }"
                  >
                    {{ formatDate(props.row.r2_deadline) }}
                  </div>
                  <div class="col-auto">
                    <q-icon name="event" size="xs" color="grey-7" />
                  </div>
                </div>
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

    <q-dialog v-model="showEditCard" full-height>
      <CardEditDialog v-if="showEditCard" />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCourseStore } from 'src/stores/course-store.js'
import { useUserStore } from 'src/stores/user-store.js'
import CardEditDialog from 'src/components/CardEditDialog.vue'
import { storeToRefs } from 'pinia'

const route = useRoute()
const $q = useQuasar()
const courseStore = useCourseStore()
const userStore = useUserStore()

const courseId = computed(() => route.params.courseId)
const boardId = computed(() => route.params.boardId)

// Use storeToRefs for better reactivity
const {
  selectedCourse: course,
  selectedBoard: board,
  selectedBoardCards: boardCards,
} = storeToRefs(courseStore)
const boardColumns = computed(() => courseStore.selectedBoard?.columns || [])

const teamMembers = ref([])

const filter = ref({
  column: [],
  component: [],
  creator: [],
  reviewer: [],
  search: '',
})

// Temporary filter states (pending changes)

const tempFilterColumn = ref([])
const tempFilterComponent = ref([])
const tempFilterCreator = ref([])
const tempFilterReviewer = ref([])

// Add computed properties for filter options
const componentOptions = computed(() => {
  const components = new Set(boardCards.value?.map((card) => card.component) || [])
  return Array.from(components).map((component) => ({
    label: component,
    value: component,
  }))
})

const isDelayed = (row) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const deadlines = [row.creation_deadline, row.r1_deadline, row.r2_deadline]

  return deadlines.some((deadline) => {
    if (!deadline) return false
    const d = new Date(deadline)
    d.setHours(0, 0, 0, 0)
    return d < today
  })
}

const isDateDelayed = (date) => {
  if (!date) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d < today
}

const columns = computed(() => [
  {
    name: 'lecture',
    label: board.value?.type === 'contest' ? 'Contest' : 'Lecture',
    field: (row) =>
      board.value?.type === 'contest' ? row.expand?.contest?.title : row.expand?.lecture?.title,
    align: 'left',
    sortable: true,
  },
  { name: 'component', label: 'Component', field: 'component', align: 'left', sortable: true },
  { name: 'status', label: 'Status', field: 'column', align: 'left', sortable: true },
  { name: 'creator', label: 'Creator', field: 'creator', align: 'left', sortable: true },
  {
    name: 'creation_deadline',
    label: 'Creation Deadline',
    field: 'creation_deadline',
    align: 'left',
    sortable: true,
    format: (val) => formatDate(val),
  },
  { name: 'reviewer1', label: 'Reviewer 1', field: 'reviewer1', align: 'left', sortable: true },
  {
    name: 'r1_deadline',
    label: 'R1 Deadline',
    field: 'r1_deadline',
    align: 'left',
    sortable: true,
    format: (val) => formatDate(val),
  },
  { name: 'reviewer2', label: 'Reviewer 2', field: 'reviewer2', align: 'left', sortable: true },
  {
    name: 'r2_deadline',
    label: 'R2 Deadline',
    field: 'r2_deadline',
    align: 'left',
    sortable: true,
    format: (val) => formatDate(val),
  },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
])

const visibleColumns = ref([])

// Initialize visible columns after columns are computed
watch(
  columns,
  (newColumns) => {
    if (visibleColumns.value.length === 0) {
      visibleColumns.value = newColumns.map((col) => col.name)
    }
  },
  { immediate: true },
)

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

watch(showEditCard, (value) => {
  if (!value) {
    courseStore.groupCardsByColumns()
  }
})

const STATUS_COLORS = {
  backlog: 'bg-grey-1',
  'create-update': 'bg-blue-2',
  review1: 'bg-light-green-2',
  review2: 'bg-green-2',
  finished: 'bg-purple-2',
  blocked: 'bg-red-2',
}

const TYPE_COLORS = {
  'Lecture Outline': {
    bg: 'light-green-2',
    text: 'light-green-10',
  },
  Presentation: {
    bg: 'purple-2',
    text: 'purple-10',
  },
  'Lab Outline': {
    bg: 'green-2',
    text: 'green-10',
  },
  'In-class': {
    bg: 'blue-2',
    text: 'blue-10',
  },
  'Post-class': {
    bg: 'light-blue-2',
    text: 'light-blue-10',
  },
  Lab: {
    bg: 'red-2',
    text: 'red-10',
  },
  Contest: {
    bg: 'pink-2',
    text: 'pink-10',
  },
  // Default color for any other type
  default: {
    bg: 'gray-2',
    text: 'gray-10',
  },
}

const getTypeColor = (component) => {
  return TYPE_COLORS[component] || TYPE_COLORS.default
}

const formatDate = (date) => {
  if (!date) return ''
  if (date instanceof Date) {
    return date.toISOString().split('T')[0]
  }
  // Handle string dates
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().split('T')[0]
}

// Custom filter function for the table
const filterTable = (rows) => {
  return rows.filter((row) => {
    const matchesSearch =
      !filter.value.search ||
      row.component?.toLowerCase().includes(filter.value.search.toLowerCase()) ||
      row.expand?.lecture?.title?.toLowerCase().includes(filter.value.search.toLowerCase()) ||
      row.expand?.contest?.title?.toLowerCase().includes(filter.value.search.toLowerCase())

    const matchesStatus = !filter.value.column.length || filter.value.column.includes(row.column)
    const matchesComponent =
      !filter.value.component.length || filter.value.component.includes(row.component)
    const matchesCreator =
      !filter.value.creator.length || filter.value.creator.includes(row.creator)
    const matchesReviewer =
      !filter.value.reviewer.length ||
      filter.value.reviewer.includes(row.reviewer1) ||
      filter.value.reviewer.includes(row.reviewer2)

    return matchesSearch && matchesStatus && matchesComponent && matchesCreator && matchesReviewer
  })
}

const hasActiveFilters = computed(() => {
  return (
    filter.value.column.length > 0 ||
    filter.value.component.length > 0 ||
    filter.value.creator.length > 0 ||
    filter.value.reviewer.length > 0
  )
})

const getActiveFiltersCount = computed(() => {
  return (
    filter.value.column.length +
    filter.value.component.length +
    filter.value.creator.length +
    filter.value.reviewer.length +
    (filter.value.search ? 1 : 0)
  )
})

const hasTempFilters = computed(() => {
  return (
    tempFilterColumn.value?.length > 0 ||
    tempFilterComponent.value?.length > 0 ||
    tempFilterCreator.value?.length > 0 ||
    tempFilterReviewer.value?.length > 0
  )
})

// Initialize temporary filters with current values when dropdown opens
const initializeTempFilters = () => {
  tempFilterColumn.value = [...filter.value.column]
  tempFilterComponent.value = [...filter.value.component]
  tempFilterCreator.value = [...filter.value.creator]
  tempFilterReviewer.value = [...filter.value.reviewer]
}

// Apply temporary filters to active filters
const applyFilters = () => {
  filter.value.column = tempFilterColumn.value ? [...tempFilterColumn.value] : []
  filter.value.component = tempFilterComponent.value ? [...tempFilterComponent.value] : []
  filter.value.creator = tempFilterCreator.value ? [...tempFilterCreator.value] : []
  filter.value.reviewer = tempFilterReviewer.value ? [...tempFilterReviewer.value] : []
  // Force table to refresh
  boardCards.value = [...boardCards.value]
}

// Clear all temporary filters
const clearAllTempFilters = () => {
  tempFilterColumn.value = []
  tempFilterComponent.value = []
  tempFilterCreator.value = []
  tempFilterReviewer.value = []
}
</script>
