<template>
  <q-card style="min-width: 850px">
    <q-card-section>
      <div class="text-h6">
        Edit Card
        <q-btn v-close-popup class="float-right" flat dense round icon="eva-close-outline" />
      </div>
    </q-card-section>

    <q-separator></q-separator>

    <div class="row">
      <div class="col-8">
        <q-scroll-area :style="`height: ${heightOfScrollArea}px`">
          <!-- <q-input v-model="courseTitle" label="Title" outlined dense class="q-mb-md" /> -->
          <!-- <q-input v-model="courseDescription" label="Description" outlined dense class="q-mb-md" /> -->

          <pre>{{ card }}</pre>

          <div class="empty-space q-px-xl q-my-xl"></div>
        </q-scroll-area>
      </div>
      <q-separator vertical></q-separator>
      <div class="col">
        <q-scroll-area :style="`height: ${heightOfScrollArea}px`">
          <q-card-section>
            <q-select></q-select>
          </q-card-section>
        </q-scroll-area>
      </div>
    </div>

    <q-separator></q-separator>

    <q-card-section>
      <div class="row items-center q-col-gutter-md">
        <div class="col">
          <q-btn round dense flat icon="eva-trash-2-outline" color="negative" @click="deleteCard" />
        </div>
        <div class="col-auto">
          <q-btn  label="Update" color="primary" @click="updateCard" />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useCourseStore } from 'src/stores/course-store.js'

const courseStore = useCourseStore()

const card = courseStore.selectedCard

const deleteCard = async () => {
  await courseStore.deleteCard(card.id)
}

const updateCard = async () => {
  await courseStore.updateCard(card)
}

const heightOfScrollArea = window.innerHeight - (48 + 64 + 68.01 + 2 + 4) // 48 is space around dialog,  64 is header height, 68.01 is footer height, 2 is separators height, 4 is buffer
</script>

<style scoped></style>
