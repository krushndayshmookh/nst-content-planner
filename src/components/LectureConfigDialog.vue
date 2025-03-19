<template>
  <q-dialog v-model="dialogModel" position="right" persistent full-height>
    <q-card style="width: 800px">
      <q-card-section>
        <div class="text-h6">
          {{ title }}
          <q-btn v-close-popup class="float-right" flat dense round icon="eva-close-outline" />
        </div>
      </q-card-section>
      <q-separator></q-separator>
      <q-card-section class="q-pa-none">
        <q-tabs
          v-model="activeTab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          narrow-indicator
        >
          <q-tab name="basic" label="Basic Info" />
          <q-tab name="config" label="Configuration" />
          <q-tab name="json" label="JSON" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="activeTab" animated>
          <q-tab-panel name="basic">
            <q-input v-model="config.title" label="Title" outlined dense class="q-mb-md" />
          </q-tab-panel>

          <q-tab-panel name="config">
            <div class="row q-col-gutter-md">
              <div v-if="mode === 'board'" class="col-12">
                <q-input
                  v-model.number="config.numberOfLectues"
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
                    v-for="(component, index) in config.componentTypes"
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
                        @click="config.componentTypes.splice(index, 1)"
                      />
                    </q-item-section>
                  </q-item>
                </q-list>

                <q-btn
                  flat
                  color="primary"
                  label="Add Component"
                  class="q-mt-sm"
                  @click="addComponent"
                />
              </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="json">
            <q-input
              v-model="configJson"
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
          :label="loading ? loadingText : actionButtonText"
          color="primary"
          :loading="loading"
          @click="handleCreate"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  mode: {
    type: String,
    default: 'board', // 'board' or 'single'
    validator: (val) => ['board', 'single'].includes(val)
  },
  title: {
    type: String,
    default: 'Configure Lecture'
  },
  courseId: {
    type: String,
    required: true
  },
  initialConfig: {
    type: Object,
    default: () => ({
      title: '',
      numberOfLectues: 10,
      componentTypes: [
        {
          name: 'Lesson',
          contentType: 'document',
          assignmentTypes: []
        },
        {
          name: 'Practice',
          contentType: 'assignment',
          assignmentTypes: [
            { name: 'Multiple Choice', count: 3 },
            { name: 'Short Answer', count: 2 }
          ]
        }
      ]
    })
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: 'Creating...'
  },
  actionButtonText: {
    type: String,
    default: 'Create'
  }
})

const emit = defineEmits(['update:modelValue', 'create'])

// Computed property for v-model binding
const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Active tab state
const activeTab = ref('basic')

// Config state (clone the initial config to avoid modifying props)
const config = ref({ ...props.initialConfig })
const configJson = ref(JSON.stringify(config.value, null, 2))
const jsonError = ref(false)

// Reset config when dialog opens
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    // Dialog opened
    config.value = JSON.parse(JSON.stringify(props.initialConfig))
    configJson.value = JSON.stringify(config.value, null, 2)
    jsonError.value = false
    activeTab.value = 'basic'
  }
})

// Update JSON when config changes
watch(() => config.value, () => {
  configJson.value = JSON.stringify(config.value, null, 2)
}, { deep: true })

// Add a new component to the configuration
const addComponent = () => {
  config.value.componentTypes.push({
    name: '',
    contentType: 'document',
    assignmentTypes: [] // Initialize empty but will be populated if contentType is assignment
  })
}

// Update config from JSON input
const updateConfigFromJson = (newValue) => {
  try {
    const parsed = JSON.parse(newValue)
    config.value = parsed
    jsonError.value = false
  } catch (error) {
    console.error('Failed to update config from JSON:', error)
    jsonError.value = true
  }
}

// Handle create button click
const handleCreate = () => {
  if (jsonError.value) {
    $q.notify({
      type: 'negative',
      message: 'Please fix the JSON format errors before continuing'
    })
    return
  }

  // For single lecture mode, ensure numberOfLectues is 1
  if (props.mode === 'single') {
    config.value.numberOfLectues = 1
  }

  // Emit create event with config
  emit('create', config.value)
}
</script>

<style scoped>
.monospace {
  font-family: monospace;
}
</style>
