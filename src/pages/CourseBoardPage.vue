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
                  class="q-mr-md"
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
                <!-- edit board -->

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

    <q-dialog v-model="showEditCard" persistent full-height>
      <CardEditDialog v-if="showEditCard" />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed /* watch */ } from 'vue'
import { useRoute } from 'vue-router'
// import { useQuasar } from 'quasar'
import { useCourseStore } from 'src/stores/course-store.js'
import draggable from 'components/vue.draggable.next/src/vuedraggable.js'
import TaskCard from 'src/components/TaskCard.vue'
import CardEditDialog from 'src/components/CardEditDialog.vue'

const route = useRoute()
// const $q = useQuasar()
const courseStore = useCourseStore()

const courseId = computed(() => route.params.courseId)
const boardId = computed(() => route.params.boardId)

const course = computed(() => courseStore.selectedCourse)
const board = computed(() => courseStore.selectedBoard)

const boardColumns = computed(() => courseStore.selectedBoard.columns)

const selectedColumnIds = ref([])

const columnsToDisplay = computed(() => {
  return boardColumns.value.filter((column) => selectedColumnIds.value.includes(column.id))
})

const boardCards = computed(() => courseStore.selectedBoardCards)

const cardsByColumns = ref({})

const groupCardsByColumns = () => {
  const columns = boardColumns.value
  const organizedCards = {}
  if (!columns.length) {
    return organizedCards
  }

  for (const column of columns) {
    organizedCards[column.id] = boardCards.value.filter((card) => card.column === column.id)
  }

  cardsByColumns.value = organizedCards
}

const fetchCourse = async () => {
  await courseStore.fetchCourse(courseId.value)
}

fetchCourse()

const fetchBoard = async () => {
  await courseStore.fetchBoard(boardId.value)
  groupCardsByColumns()

  selectedColumnIds.value = boardColumns.value.map((column) => column.id)
}

fetchBoard()

const onDragEnd = async (event) => {
  const { item, from, to } = event
  const cardId = item._underlying_vm_.id
  const newColumnId = to.closest('[data-column-id]').dataset.columnId
  const oldColumnId = from.closest('[data-column-id]').dataset.columnId

  if (newColumnId !== oldColumnId) {
    await courseStore.updateCardColumn(cardId, newColumnId)
  }

  // update local state
  const idx = cardsByColumns.value[newColumnId].findIndex((card) => card.id !== cardId)
  cardsByColumns.value[newColumnId][idx].column = newColumnId
}

const openEditBoard = () => {}

const showEditCard = ref(false)

const openEditCard = (card) => {
  courseStore.selectedCard = { ...card }
  showEditCard.value = true
}

// watch(showEditCard, (value) => {
//   if (!value) {
//     //  then update the UI below
//     const card = courseStore.selectedCard

//     const cardOnUIIdx = cardsByColumns.value[card.column].findIndex((c) => c.id === card.id)
//     cardsByColumns.value[card.column][cardOnUIIdx] = courseStore.selectedCard
//   }
// })
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
