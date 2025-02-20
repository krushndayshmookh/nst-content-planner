<template>
  <q-page class="q-pa-md">
    <div v-if="course" class="q-mb-md row items-center">
      <div class="col">
        <div class="text-h6">{{ course.title }} - Team Members</div>
      </div>
      <div class="col text-right">
        <q-btn
          color="primary"
          icon="eva-plus-outline"
          label="Add Members"
          @click="openAddMembers"
        />
      </div>
    </div>

    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6">Team Members</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div v-if="loading" class="text-center q-pa-md">
          <q-spinner color="primary" size="2em" />
          <div class="q-mt-sm">Loading team members...</div>
        </div>

        <div v-else-if="!courseTeamMembers?.length" class="text-center q-pa-md text-grey">
          No team members added yet
        </div>

        <q-list v-else>
          <q-item v-for="member in courseTeamMembers" :key="member.id">
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white">
                {{ member.name?.[0]?.toUpperCase() || 'U' }}
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ member.name }}</q-item-label>
              <q-item-label caption>{{ member.email }}</q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="eva-trash-2-outline"
                @click="confirmRemoveMember(member)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- Add Members Dialog -->
    <q-dialog v-model="showAddMembers" position="right" persistent full-height>
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-h6">
            Add Team Members
            <q-btn v-close-popup class="float-right" flat dense round icon="eva-close-outline" />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-select
            v-model="selectedUsers"
            :options="availableUsers"
            option-label="name"
            option-value="id"
            multiple
            use-chips
            outlined
            dense
            label="Select Users"
            class="q-mb-md"
          >
            <template #option="{ itemProps, opt, selected, toggleOption }">
              <q-item v-bind="itemProps">
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white">
                    {{ opt.name?.[0]?.toUpperCase() || 'U' }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ opt.name }}</q-item-label>
                  <q-item-label caption>{{ opt.email }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-checkbox
                    dense
                    :model-value="selected"
                    @update:model-value="toggleOption(opt)"
                  />
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-btn
            class="full-width"
            color="primary"
            label="Add Selected Members"
            :disable="!selectedUsers.length"
            @click="addMembers"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Confirm Remove Dialog -->
    <q-dialog v-model="showConfirmRemove">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="eva-alert-triangle-outline" color="negative" text-color="white" />
          <span class="q-ml-sm">Are you sure you want to remove this member?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-close-popup flat label="Cancel" color="primary" />
          <q-btn v-close-popup flat label="Remove" color="negative" @click="removeMember" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'

import { useCourseStore } from 'src/stores/course-store.js'
import { useUserStore } from 'src/stores/user-store.js'

const $q = useQuasar()
const route = useRoute()
const courseStore = useCourseStore()
const userStore = useUserStore()

const courseId = computed(() => route.params.courseId)
const course = computed(() => courseStore.selectedCourse)

const loading = ref(true)
const courseTeam = ref(null)
const courseTeamMembers = computed(() => courseTeam.value?.expand?.members)
const availableUsers = ref([])
const selectedUsers = ref([])

const showAddMembers = ref(false)
const showConfirmRemove = ref(false)
const memberToRemove = ref(null)

const fetchCourseTeam = async () => {
  try {
    loading.value = true
    courseTeam.value = await courseStore.fetchCourseTeam(courseId.value)
  } catch (err) {
    console.error('Failed to load team members:', err)
    $q.notify({
      type: 'negative',
      message: 'Failed to load team members',
    })
  } finally {
    loading.value = false
  }
}

const fetchAvailableUsers = async () => {
  try {
    availableUsers.value = await userStore.fetchUsers()
    // Filter out users who are already team members
    if (courseTeam.value?.members) {
      const memberIds = courseTeam.value.members
      console.log('memberIds', memberIds)
      availableUsers.value = availableUsers.value.filter((u) => !memberIds.includes(u.id))
    }
  } catch (err) {
    console.error('Failed to load available users:', err)
    $q.notify({
      type: 'negative',
      message: 'Failed to load available users',
    })
  }
}

const openAddMembers = async () => {
  await fetchAvailableUsers()
  selectedUsers.value = []
  showAddMembers.value = true
}

const addMembers = async () => {
  try {
    await courseStore.addTeamMembers(
      courseId.value,
      selectedUsers.value.map((u) => u.id),
    )
    await fetchCourseTeam()
    showAddMembers.value = false
    $q.notify({
      type: 'positive',
      message: 'Team members added successfully',
    })
  } catch (err) {
    console.error('Failed to add team members:', err)
    $q.notify({
      type: 'negative',
      message: 'Failed to add team members',
    })
  }
}

const confirmRemoveMember = (member) => {
  memberToRemove.value = member
  showConfirmRemove.value = true
}

const removeMember = async () => {
  if (!memberToRemove.value) return

  try {
    await courseStore.removeTeamMember(courseId.value, memberToRemove.value.id)
    await fetchCourseTeam()
    $q.notify({
      type: 'positive',
      message: 'Team member removed successfully',
    })
  } catch (err) {
    console.error('Failed to remove team member:', err)
    $q.notify({
      type: 'negative',
      message: 'Failed to remove team member',
    })
  } finally {
    memberToRemove.value = null
  }
}

onMounted(() => {
  fetchCourseTeam()
})
</script>
