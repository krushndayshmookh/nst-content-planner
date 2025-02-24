<template>
  <q-card
    class="q-mb-md hoverable"
    :class="{
      'red-outline': isDelayed,
      'bg-red-1': isDelayed,
    }"
    @click="openCardDetails"
  >
    <div class="q-py-xs q-px-sm">
      <q-badge v-if="props.card.lecture" color="blue-8" style="max-width: 100%">
        <span class="ellipsis">
          {{ props.card.expand?.lecture?.title }}
        </span>
      </q-badge>

      <q-badge :color="TYPE_COLORS.bg" :text-color="TYPE_COLORS.text" style="max-width: 100%">
        <span class="ellipsis">{{ courseComponent }}</span>
      </q-badge>

      <q-badge
        v-if="props.card.assignment_type"
        color="secondary"
        style="max-width: 100%"
        class="q-ml-xs"
      >
        <span class="ellipsis">{{ props.card.assignment_type }}</span>
      </q-badge>

      <q-badge v-if="props.card.set_name" color="orange" style="max-width: 100%" class="q-ml-xs">
        <span class="ellipsis">{{ props.card.set_name }}</span>
      </q-badge>
    </div>

    <q-separator />

    <q-item class="q-px-sm">
      <q-item-section>
        <div class="text-subtitle2 text-weight-medium">{{ props.card.title }}</div>

        <div v-if="props.card.question_count" class="text-caption text-grey-8">
          {{ props.card.question_count }} questions
        </div>

        <div v-if="props.card.description" class="text-caption text-grey-8 q-mt-xs">
          {{ props.card.description }}
        </div>

        <div v-if="props.card.file_link || props.card.assignment_link" class="q-mt-xs">
          <q-chip v-if="props.card.file_link" dense size="sm" icon="eva-file-outline" clickable>
            Has File
          </q-chip>
          <q-chip
            v-if="props.card.assignment_link"
            dense
            size="sm"
            icon="eva-link-outline"
            clickable
          >
            Has Assignment
          </q-chip>
        </div>
      </q-item-section>

      <!-- <q-item-section side>
        <div class="column items-end">
          <q-badge
            v-if="props.card.contest && props.card.assignment_is_verified !== undefined"
            :color="props.card.assignment_is_verified ? 'positive' : 'warning'"
            :label="props.card.assignment_is_verified ? 'Verified' : 'Not Verified'"
          />

          <q-badge
            class="q-mt-xs"
            :color="getStatusColor(props.card.status)"
            :label="props.card.status"
          />
        </div>
      </q-item-section> -->
    </q-item>

    <q-separator />

    <!-- <q-item v-if="props.card.contest" class="q-px-sm">
      <q-item-section>
        <div class="text-caption">
          <div v-if="props.card.expand?.contest?.contest_date" class="q-mb-xs">
            Contest Date: {{ $formatDateForUI(props.card.expand.contest.contest_date) }}
          </div>
          <div v-if="props.card.expand?.contest?.contest_ready_at" class="q-mb-xs">
            Ready At: {{ $formatDateForUI(props.card.expand.contest.contest_ready_at) }}
          </div>
          <div v-if="props.card.expand?.contest?.contest_owner" class="q-mb-xs">
            Owner: {{ props.card.expand.contest.contest_owner }}
          </div>
        </div>
      </q-item-section>
    </q-item> -->

    <q-item class="q-px-sm">
      <q-item-section>
        <q-card flat bordered>
          <q-item v-if="props.card.column === 'backlog'" class="q-px-sm">
            <q-item-section side class="q-pr-sm">
              <q-avatar round color="primary" text-color="white" size="sm">
                <q-icon name="eva-person-outline" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label caption>
                <span class=""> {{ props.card.expand?.creator?.name || 'NA' }} </span>
              </q-item-label>
              <q-item-label v-if="props.card.creation_deadline">
                {{ $formatDateForUI(props.card.creation_deadline) }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-else-if="props.card.column === 'create-update'" class="q-px-sm">
            <q-item-section side class="q-pr-sm">
              <q-avatar
                v-if="props.card.creator && props.card.creation_deadline"
                round
                color="primary"
                text-color="white"
                size="sm"
              >
                <q-icon name="eva-person-outline" />
              </q-avatar>

              <q-icon
                v-else
                round
                color="negative"
                text-color="red"
                size="sm"
                name="eva-alert-circle-outline"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>
                <span
                  :class="{
                    'text-red-10': !props.card.creator,
                  }"
                >
                  {{ props.card.expand?.creator?.name || 'Not Assigned' }}
                </span>
              </q-item-label>
              <q-item-label :caption="!props.card.creation_deadline">
                <span
                  :class="{
                    'text-red-10': !props.card.creation_deadline,
                  }"
                >
                  {{ $formatDateForUI(props.card.creation_deadline) || 'No Deadline' }}
                </span>
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-else-if="props.card.column === 'review1'" class="q-px-sm">
            <q-item-section side class="q-pr-sm">
              <q-avatar
                v-if="props.card.reviewer1 && props.card.r1_deadline"
                round
                color="primary"
                text-color="white"
                size="sm"
              >
                <q-icon name="eva-person-outline" />
              </q-avatar>

              <q-icon
                v-else
                round
                color="negative"
                text-color="red"
                size="sm"
                name="eva-alert-circle-outline"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>
                <span
                  :class="{
                    'text-red-10': !props.card.reviewer1,
                  }"
                >
                  {{ props.card.expand?.reviewer1?.name || 'Not Assigned' }}
                </span>
              </q-item-label>
              <q-item-label :caption="!props.card.r1_deadline">
                <span
                  :class="{
                    'text-red-10': !props.card.r1_deadline,
                  }"
                >
                  {{ $formatDateForUI(props.card.r1_deadline) || 'No Deadline' }}
                </span>
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-else-if="props.card.column === 'review2'" class="q-px-sm">
            <q-item-section side class="q-pr-sm">
              <q-avatar
                v-if="props.card.reviewer2 && props.card.r2_deadline"
                round
                color="primary"
                text-color="white"
                size="sm"
              >
                <q-icon name="eva-person-outline" />
              </q-avatar>

              <q-icon
                v-else
                round
                color="negative"
                text-color="red"
                size="sm"
                name="eva-alert-circle-outline"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>
                <span
                  :class="{
                    'text-red-10': !props.card.reviewer2,
                  }"
                >
                  {{ props.card.expand?.reviewer2?.name || 'Not Assigned' }}
                </span>
              </q-item-label>
              <q-item-label :caption="!props.card.r2_deadline">
                <span
                  :class="{
                    'text-red-10': !props.card.r2_deadline,
                  }"
                >
                  {{ $formatDateForUI(props.card.r2_deadline) || 'No Deadline' }}
                </span>
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-else>
            <q-item-section side>
              <q-icon name="eva-checkmark-circle-outline" color="green" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-green-10"> Done </q-item-label>
            </q-item-section>
          </q-item>
        </q-card>
      </q-item-section>
    </q-item>

    <!-- TODO: Add context menu -->
    <q-menu
      touch-position
      context-menu
      @show="contextMenuOpen = true"
      @hide="contextMenuOpen = false"
    >
      <q-list dense style="min-width: 100px">
        <q-item v-close-popup clickable>
          <q-item-section>Open...</q-item-section>
        </q-item>
        <q-item v-close-popup clickable>
          <q-item-section>New</q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable>
          <q-item-section>Preferences</q-item-section>
          <q-item-section side>
            <q-icon name="keyboard_arrow_right" />
          </q-item-section>

          <q-menu anchor="top end" self="top start">
            <q-list>
              <q-item v-for="n in 3" :key="n" dense clickable>
                <q-item-section>Submenu Label</q-item-section>
                <q-item-section side>
                  <q-icon name="keyboard_arrow_right" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>
        <q-separator />
        <q-item v-close-popup clickable>
          <q-item-section>Quit</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-card>
</template>

<script setup>
import { computed, ref } from 'vue'

const emit = defineEmits(['edit'])

const props = defineProps({
  card: {
    type: Object,
    required: true,
  },
})

const contextMenuOpen = ref(false)

const courseComponent = props.card.component

const TYPE_COLORS_SRC = {
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

const TYPE_COLORS =
  TYPE_COLORS_SRC[
    Object.keys(TYPE_COLORS_SRC).includes(courseComponent) ? courseComponent : 'default'
  ]

// card has three dates: creation_deadline, r1_deadline, r2_deadline
// if the status is create/update and the creation_deadline is passed, the card is delayed
// if the status is review1 and the r1_deadline is passed, the card is delayed
// if the status is review2 and the r2_deadline is passed, the card is delayed
// if the status is done, the card is not delayed
// if the status is backlog, the card is not delayed

const isDelayed = computed(() => {
  if (props.card.column === 'backlog' || props.card.column === 'create-update') {
    return new Date(props.card.creation_deadline) < new Date()
  } else if (props.card.column === 'review1') {
    return new Date(props.card.r1_deadline) < new Date()
  } else if (props.card.column === 'review2') {
    return new Date(props.card.r2_deadline) < new Date()
  }
  return false
})

// function getStatusColor(status) {
//   const statusColors = {
//     'Not Started': 'grey',
//     'In Creation': 'blue',
//     'Creation Done': 'light-blue',
//     'In R1 Review': 'orange',
//     'R1 Approved': 'light-green',
//     'In R2 Review': 'deep-orange',
//     Final: 'green',
//     Blocked: 'red',
//   }
//   return statusColors[status] || 'grey'
// }

function openCardDetails() {
  if (!contextMenuOpen.value) emit('edit', props.card)
}
</script>

<style scoped lang="scss">
.red-outline {
  border: 1px solid red;
}

.q-badge + .q-badge {
  margin-left: 4px;
}
</style>
