import { defineStore, acceptHMRUpdate } from 'pinia'

import { pb } from '../boot/pocketbase'

export const useCourseStore = defineStore('course', {
  state: () => ({
    // page: 1,
    perPage: 50,
    // totalItems: 100,
    // totalPages: 5,
    items: [],
    selectedCourse: null,
    selectedCourseBoards: [],
    selectedCourseMembers: [],
    selectedBoard: null,
    selectedBoardCards: [],

    selectedCard: null,
  }),

  persist: true,

  getters: {
    courses() {
      return this.items
    },
  },

  actions: {
    async fetchCourses() {
      const items = await pb.collection('courses').getFullList({ sort: 'title' })
      this.items = items
    },

    async createCourse(data) {
      await pb.collection('courses').create({
        ...data,
        created_at: new Date().toISOString(),
        created_by: pb.authStore.record.id,
        scrum_masters: JSON.stringify([pb.authStore.record.id]),
      })
      this.fetchCourses()
    },

    async updateCourse(courseId, data) {
      let record = await pb.collection('courses').update(courseId, data)
      this.fetchCourses()
      return record
    },

    async fetchCourse(courseId) {
      this.selectedCourse = await pb.collection('courses').getOne(courseId)
      this.selectedCourseBoards = await pb
        .collection('boards')
        .getFullList({ filter: `(course="${courseId}")` })
    },

    async fetchBoard(boardId) {
      this.selectedBoard = await pb.collection('boards').getOne(boardId)
      this.selectedBoardCards = await pb.collection('cards').getFullList({
        filter: `(board="${boardId}")`,
        expand: 'type,creator,reviewer1,reviewer2',
        sort: 'order',
      })
    },

    async updateCardColumn(cardId, columnId) {
      await pb.collection('cards').update(cardId, { column: columnId })
      // this.fetchBoard(this.selectedBoard.id)
    },

    async updateCard(cardId, data) {
      console.log('updateCard', cardId, data)
      const record = await pb.collection('cards').update(cardId, data)
      // Refresh the card in the local state
      const cardIndex = this.selectedBoardCards.findIndex(card => card.id === cardId)
      if (cardIndex !== -1) {
        this.selectedBoardCards[cardIndex] = record
      }
      return record
    },

    async fetchCourseTeam(courseId) {
      const record = await pb.collection('course_teams').getFirstListItem(`course="${courseId}"`, {
        expand: 'members',
      })
      return record
    },

    async addTeamMembers(courseId, memberIds) {
      // First try to get existing team
      try {
        const existingTeam = await pb.collection('course_teams').getFirstListItem(`course="${courseId}"`)
        // Update existing team with new members
        const updatedMembers = [...new Set([...existingTeam.members, ...memberIds])]
        await pb.collection('course_teams').update(existingTeam.id, {
          members: updatedMembers,
        })
      } catch (err) {
        console.error('Failed to add team members:', err)
        // If no team exists, create new one
        await pb.collection('course_teams').create({
          course: courseId,
          members: memberIds,
        })
      }
    },

    async removeTeamMember(courseId, memberId) {
      const team = await pb.collection('course_teams').getFirstListItem(`course="${courseId}"`)
      const updatedMembers = team.members.filter(id => id !== memberId)
      await pb.collection('course_teams').update(team.id, {
        members: updatedMembers,
      })
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCourseStore, import.meta.hot))
}
