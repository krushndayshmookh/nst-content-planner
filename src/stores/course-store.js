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
    // New state properties
    selectedColumnIds: [],
    cardsByColumns: {},
    // Contest related state
    courseContests: [],
    // Lecture related state
    lectures: [],
  }),

  persist: true,

  getters: {
    courses() {
      return this.items
    },
    columnsToDisplay() {
      if (!this.selectedBoard?.columns) return []
      return this.selectedBoard.columns.filter((column) =>
        this.selectedColumnIds.includes(column.id),
      )
    },
  },

  actions: {
    async fetchCourses() {
      const items = await pb.collection('courses').getFullList({ sort: 'title' })
      this.items = items
    },

    async createCourse(data) {
      // Create the course
      const course = await pb.collection('courses').create({
        ...data,
        created_at: new Date().toISOString(),
        created_by: pb.authStore.record.id,
        scrum_masters: JSON.stringify([pb.authStore.record.id]),
      })

      // Create an empty team for the course
      await pb.collection('course_teams').create({
        course: course.id,
        members: [],
      })

      this.fetchCourses()
      return course
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

    async createBoard(data) {
      const record = await pb.collection('boards').create(data)
      this.selectedCourseBoards.push(record)
      return record
    },

    async createLecture(data) {
      const record = await pb.collection('lectures').create({
        ...data,
        created_at: new Date().toISOString(),
      })
      await this.fetchLectures()
      return record
    },

    async createCard(data) {
      return await pb.collection('cards').create(data)
    },

    async createQuestion(data) {
      return await pb.collection('questions').create(data)
    },

    async createBulkLectures(lectures) {
      const batch = pb.createBatch()

      for (const lecture of lectures) {
        batch.collection('lectures').create(lecture)
      }

      return await batch.send()
    },

    async createBulkContests(contests) {
      const batch = pb.createBatch()

      for (const contest of contests) {
        batch.collection('contests').create(contest)
      }

      const result = await batch.send()

      return result
    },

    async createBulkCards(cards) {
      const batch = pb.createBatch()

      for (const card of cards) {
        batch.collection('cards').create(card)
      }

      return await batch.send()
    },

    async createBulkQuestions(questions) {
      const batch = pb.createBatch()

      for (const question of questions) {
        batch.collection('questions').create(question)
      }

      const results = await batch.send()
      // Return the IDs of created questions
      return results.map((result) => result.body.id)
    },

    async fetchBoard(boardId) {
      this.selectedBoard = await pb.collection('boards').getOne(boardId)
      this.selectedBoardCards = await pb.collection('cards').getFullList({
        filter: `(board="${boardId}")`,
        expand: 'creator,reviewer1,reviewer2,course,lecture,contest,contest.contest_owner',
        sort: 'order',
      })

      // Initialize selected columns
      this.selectedColumnIds = this.selectedBoard.columns.map((column) => column.id)
      this.groupCardsByColumns()
    },

    groupCardsByColumns() {
      const columns = this.selectedBoard?.columns || []
      const organizedCards = {}

      if (!columns.length) {
        this.cardsByColumns = organizedCards
        return
      }

      // Initialize all columns including unknown
      for (const column of columns) {
        organizedCards[column.id] = []
      }
      organizedCards['unknown'] = []

      // Distribute cards to their columns
      for (const card of this.selectedBoardCards) {
        const columnExists = columns.some((col) => col.id === card.column)
        if (columnExists) {
          organizedCards[card.column].push(card)
        } else {
          organizedCards['unknown'].push(card)
        }
      }

      this.cardsByColumns = organizedCards

      // Add unknown column to board columns if it has cards
      if (organizedCards['unknown'].length > 0 && !columns.find((col) => col.id === 'unknown')) {
        this.selectedBoard.columns.push({ id: 'unknown', title: 'Unknown' })
        this.selectedColumnIds.push('unknown')
      }
    },

    async updateCardColumn(cardId, newColumnId, oldColumnId) {
      await pb.collection('cards').update(cardId, { column: newColumnId })

      // Update local state
      const cardIndex = this.selectedBoardCards.findIndex((card) => card.id === cardId)
      if (cardIndex !== -1) {
        this.selectedBoardCards[cardIndex].column = newColumnId
      }

      // Update cardsByColumns
      const card = this.cardsByColumns[oldColumnId || 'unknown'].find((c) => c.id === cardId)
      if (card) {
        // Remove from old column (could be unknown)
        this.cardsByColumns[oldColumnId || 'unknown'] = this.cardsByColumns[
          oldColumnId || 'unknown'
        ].filter((c) => c.id !== cardId)

        // Add to new column
        if (!this.cardsByColumns[newColumnId]) {
          this.cardsByColumns[newColumnId] = []
        }
        card.column = newColumnId
        this.cardsByColumns[newColumnId].push(card)

        // Remove unknown column if it's empty
        if (oldColumnId === 'unknown' && this.cardsByColumns['unknown'].length === 0) {
          this.selectedBoard.columns = this.selectedBoard.columns.filter(
            (col) => col.id !== 'unknown',
          )
          this.selectedColumnIds = this.selectedColumnIds.filter((id) => id !== 'unknown')
          delete this.cardsByColumns['unknown']
        }
      }
    },

    async updateCard(cardId, data) {
      // console.info('updateCard', cardId, data)
      await pb.collection('cards').update(cardId, data)
      const updatedCard = await pb.collection('cards').getOne(cardId, {
        expand: 'creator,reviewer1,reviewer2,course,lecture,contest,contest.contest_owner',
      })

      // Update the card in selectedBoardCards
      const cardIndex = this.selectedBoardCards.findIndex((c) => c.id === cardId)
      if (cardIndex !== -1) {
        this.selectedBoardCards[cardIndex] = updatedCard
      }

      // Update selectedCard if it's the same card
      if (this.selectedCard?.id === cardId) {
        this.selectedCard = updatedCard
      }

      this.groupCardsByColumns()
      return updatedCard
    },

    async fetchCourseContests(courseId) {
      const records = await pb.collection('contests').getFullList({
        filter: `course="${courseId}"`,
        sort: 'created_at',
        expand: 'contest_owner',
      })
      this.courseContests = records
      return records
    },

    async createContest(data) {
      const record = await pb.collection('contests').create(data)
      await this.fetchCourseContests(data.course)
      return record
    },

    async updateContest(data) {
      const { id, ...updateData } = data
      const record = await pb.collection('contests').update(id, updateData)
      // Refresh the contests list
      if (this.selectedCourse) {
        await this.fetchCourseContests(this.selectedCourse.id)
      }
      return record
    },

    async fetchCourseTeam(courseId) {
      try {
        const record = await pb
          .collection('course_teams')
          .getFirstListItem(`course="${courseId}"`, {
            expand: 'members',
          })
        // Store team members in selectedCourseMembers
        this.selectedCourseMembers = record.expand?.members || []
        return record
      } catch (error) {
        console.error('Error fetching course team:', error)
        this.selectedCourseMembers = []
        return null
      }
    },

    async addTeamMembers(courseId, memberIds) {
      // First try to get existing team
      try {
        const existingTeam = await pb
          .collection('course_teams')
          .getFirstListItem(`course="${courseId}"`)
        // Update existing team with new members

        if (!Array.isArray(existingTeam.members)) {
          existingTeam.members = [existingTeam.members]
        }

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
      const updatedMembers = team.members.filter((id) => id !== memberId)
      await pb.collection('course_teams').update(team.id, {
        members: updatedMembers,
      })
    },

    async fetchLectures() {
      const records = await pb.collection('lectures').getFullList({
        sort: 'title',
        expand: 'course',
      })
      this.lectures = records
      return records
    },

    async updateLecture(data) {
      const { id, ...updateData } = data
      const record = await pb.collection('lectures').update(id, updateData)
      await this.fetchLectures()
      return record
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCourseStore, import.meta.hot))
}
