<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs class="text-primary q-mb-md">
      <template #separator>
        <q-icon size="1.5em" name="chevron_right" color="grey-7" />
      </template>

      <q-breadcrumbs-el class="text-grey-7" label="Home" icon="home" to="/" />
      <q-breadcrumbs-el label="Users" icon="eva-people-outline" />
    </q-breadcrumbs>

    <div class="q-mb-md row items-center">
      <div class="col">
        <div class="text-h6">Users</div>
      </div>
      <div class="col text-right">
        <q-btn color="primary" icon="eva-plus-outline" label="User" @click="openCreateUser" />
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div v-for="user in users" :key="user.id" class="col-3" style="height: 200px">
        <q-card
          class="cursor-pointer hoverable"
          style="height: 100%; display: flex; flex-direction: column"
        >
          <q-card-section style="flex-grow: 1">
            <q-chip
              :color="user.profile?.role === 'admin' ? 'primary' : 'grey'"
              text-color="white"
              size="sm"
              class="float-right"
            >
              {{ user.profile?.role }}
            </q-chip>
            <div class="text-h6">
              {{ user.name }}
            </div>
            <div class="text-subtitle2">
              {{ user.profile?.email }}
            </div>
            <div class="text-subtitle2">Campus: {{ user.profile?.campus }}</div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right">
            <q-btn flat color="primary" label="Edit" @click.stop="openEditUser(user)" />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="showUserDialog" position="right" persistent full-height>
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{ isEditing ? 'Edit User' : 'Create User' }}
            <q-btn v-close-popup class="float-right" flat dense round icon="eva-close-outline" />
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-input v-model="userName" label="Name" outlined dense class="q-mb-md" />
          <q-input
            v-model="userEmail"
            label="Email"
            type="email"
            outlined
            dense
            class="q-mb-md"
            :disable="isEditing && !isAdmin"
          />
          <template v-if="!isEditing || isAdmin">
            <q-input
              v-model="userPassword"
              label="Password"
              type="password"
              outlined
              dense
              class="q-mb-md"
            />
          </template>
          <q-select
            v-model="userRole"
            :options="['user', 'admin']"
            label="Role"
            outlined
            dense
            class="q-mb-md"
          />
          <q-select
            v-model="userCampus"
            :options="['ADYPU', 'RU']"
            label="Campus"
            outlined
            dense
            class="q-mb-md"
          />

          <q-btn
            class="full-width"
            :label="isEditing ? 'Update' : 'Create'"
            color="primary"
            @click="isEditing ? updateUser() : createUser()"
          />
        </q-card-section>
        <q-separator />
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from 'src/stores/user-store.js'
import { useAuthStore } from 'src/stores/auth-store.js'

const userStore = useUserStore()
const authStore = useAuthStore()

const users = computed(() => userStore.users)
const isAdmin = computed(() => authStore.user?.profile?.role === 'admin')

const fetchUsers = () => {
  userStore.fetchUsers()
}

fetchUsers()

const showUserDialog = ref(false)
const isEditing = ref(false)
const selectedUser = ref(null)

const userName = ref('')
const userEmail = ref('')
const userPassword = ref('')
const userRole = ref('user')
const userCampus = ref('ADYPU')

const resetForm = () => {
  userName.value = ''
  userEmail.value = ''
  userPassword.value = ''
  userRole.value = 'user'
  userCampus.value = 'ADYPU'
  selectedUser.value = null
  isEditing.value = false
}

const openCreateUser = () => {
  resetForm()
  showUserDialog.value = true
}

const openEditUser = (user) => {
  selectedUser.value = user
  userName.value = user.name || ''
  userEmail.value = user.email
  userPassword.value = ''
  userRole.value = user.profile?.role || 'user'
  userCampus.value = user.profile?.campus || 'ADYPU'
  isEditing.value = true
  showUserDialog.value = true
}

const createUser = async () => {
  await userStore.createUser({
    name: userName.value,
    email: userEmail.value,
    password: userPassword.value,
    role: userRole.value,
    campus: userCampus.value,
  })
  showUserDialog.value = false
  resetForm()
}

const updateUser = async () => {
  if (!selectedUser.value) return

  const updateData = {
    id: selectedUser.value.id,
    name: userName.value,
    role: userRole.value,
    campus: userCampus.value,
  }

  // Only include email and password if admin is editing
  if (isAdmin.value) {
    updateData.email = userEmail.value
    if (userPassword.value) {
      updateData.password = userPassword.value
    }
  }

  await userStore.updateUser(updateData)
  showUserDialog.value = false
  resetForm()
}
</script>
