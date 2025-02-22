require('dotenv').config()
const PocketBase = require('pocketbase/cjs')

const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://127.0.0.1:8090')

const defaultCardTypes = [
  {
    title: 'Lecture Outline',
    fields: [
      { name: 'document_link', type: 'url', required: true },
      { name: 'version', type: 'number', required: true, defaultValue: 1 },
      { name: 'creation_deadline', type: 'date', required: true },
      { name: 'r1_deadline', type: 'date' },
      { name: 'r2_deadline', type: 'date' },
      {
        name: 'estimated_duration',
        type: 'number',
        description: 'Estimated duration in minutes',
      },
      {
        name: 'review_notes',
        type: 'text',
        description: 'Notes from reviewers',
      },
    ],
    is_default: true,
    requires_r1: true,
    requires_r2: true,
    typical_duration_days: 3,
  },
  {
    title: 'Presentation',
    fields: [
      { name: 'slides_link', type: 'url', required: true },
      { name: 'version', type: 'number', required: true, defaultValue: 1 },
      { name: 'creation_deadline', type: 'date', required: true },
      { name: 'r1_deadline', type: 'date' },
      { name: 'r2_deadline', type: 'date' },
    ],
    is_default: true,
  },
  {
    title: 'Lab Outline',
    fields: [
      { name: 'document_link', type: 'url', required: true },
      { name: 'version', type: 'number', required: true, defaultValue: 1 },
      { name: 'creation_deadline', type: 'date', required: true },
      { name: 'r1_deadline', type: 'date' },
      { name: 'r2_deadline', type: 'date' },
      {
        name: 'prerequisites',
        type: 'text',
        description: 'Required software/tools',
      },
    ],
    is_default: true,
  },
  {
    title: 'In-class MCQs',
    fields: [
      { name: 'questions_link', type: 'url', required: true },
      { name: 'version', type: 'number', required: true, defaultValue: 1 },
      {
        name: 'question_count',
        type: 'number',
        description: 'Number of questions',
      },
      { name: 'creation_deadline', type: 'date', required: true },
      { name: 'r1_deadline', type: 'date' },
      { name: 'r2_deadline', type: 'date' },
    ],
    is_default: true,
  },
  {
    title: 'Post-class MCQs',
    fields: [
      { name: 'questions_link', type: 'url', required: true },
      { name: 'version', type: 'number', required: true, defaultValue: 1 },
      {
        name: 'question_count',
        type: 'number',
        description: 'Number of questions',
      },
      { name: 'creation_deadline', type: 'date', required: true },
      { name: 'r1_deadline', type: 'date' },
      { name: 'r2_deadline', type: 'date' },
    ],
    is_default: true,
  },
  {
    title: 'In-class Coding Questions',
    fields: [
      { name: 'questions_link', type: 'url', required: true },
      { name: 'version', type: 'number', required: true, defaultValue: 1 },
      {
        name: 'question_count',
        type: 'number',
        description: 'Number of questions',
      },
      { name: 'creation_deadline', type: 'date', required: true },
      { name: 'r1_deadline', type: 'date' },
      { name: 'r2_deadline', type: 'date' },
    ],
    is_default: true,
  },
  {
    title: 'Post-class Coding Questions',
    fields: [
      { name: 'questions_link', type: 'url', required: true },
      { name: 'version', type: 'number', required: true, defaultValue: 1 },
      {
        name: 'question_count',
        type: 'number',
        description: 'Number of questions',
      },
      { name: 'creation_deadline', type: 'date', required: true },
      { name: 'r1_deadline', type: 'date' },
      { name: 'r2_deadline', type: 'date' },
    ],
    is_default: true,
  },
  {
    title: 'Lab Coding Questions',
    fields: [
      { name: 'questions_link', type: 'url', required: true },
      { name: 'version', type: 'number', required: true, defaultValue: 1 },
      {
        name: 'question_count',
        type: 'number',
        description: 'Number of questions',
      },
      { name: 'creation_deadline', type: 'date', required: true },
      { name: 'r1_deadline', type: 'date' },
      { name: 'r2_deadline', type: 'date' },
    ],
    is_default: true,
  },
]

// Sample data for users
const sampleUsers = [
  {
    email: 'john.doe@example.com',
    password: 'password123',
    passwordConfirm: 'password123',
    name: 'John Doe',
  },
  {
    email: 'jane.smith@example.com',
    password: 'password123',
    passwordConfirm: 'password123',
    name: 'Jane Smith',
  },
  {
    email: 'bob.wilson@example.com',
    password: 'password123',
    passwordConfirm: 'password123',
    name: 'Bob Wilson',
  },
]

// Sample data for courses
const sampleCourses = [
  {
    title: 'Introduction to Programming',
    description: 'A beginner-friendly course covering programming fundamentals',
  },
  {
    title: 'Data Structures and Algorithms',
    description: 'Advanced course covering essential CS concepts',
  },
]

// Sample data for boards
const createSampleBoard = (courseId, createdById) => ({
  title: 'Sprint 1 Board',
  course: courseId,
  created_by: createdById,
  columns: [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'review', title: 'In Review' },
    { id: 'done', title: 'Done' },
  ],
  created_at: new Date().toISOString(),
})

async function createSampleData() {
  try {
    // First, authenticate as admin
    await pb
      .collection('_superusers')
      .authWithPassword(
        process.env.PB_ADMIN_EMAIL || 'admin@example.com',
        process.env.PB_ADMIN_PASSWORD || '1234567890'
      )

    console.log('✓ Authenticated as admin')

    // Create card types if they don't exist
    const existingTypes = await pb.collection('card_types').getList(1, 1)
    if (existingTypes.items.length === 0) {
      for (const cardType of defaultCardTypes) {
        await pb.collection('card_types').create(cardType)
        console.log(`✓ Created card type: ${cardType.title}`)
      }
    }

    // Create sample users
    const createdUsers = []
    for (const userData of sampleUsers) {
      try {
        const user = await pb.collection('users').create(userData)
        createdUsers.push(user)
        console.log(`✓ Created user: ${userData.name}`)

        // Create profile for each user
        await pb.collection('profiles').create({
          user: user.id,
          role: user.email.includes('john.doe') ? 'admin' : 'user',
        })
        console.log(`✓ Created profile for: ${userData.name}`)
      } catch (error) {
        if (!error.message.includes('email already in use')) {
          throw error
        }
      }
    }

    // Get all users (including existing ones)
    const allUsers = await pb.collection('users').getFullList()

    // Create sample courses
    const createdCourses = []
    for (const courseData of sampleCourses) {
      const course = await pb.collection('courses').create({
        ...courseData,
        created_by: allUsers[0].id,
        created_at: new Date().toISOString(),
        scrum_masters: [allUsers[1].id],
      })
      createdCourses.push(course)
      console.log(`✓ Created course: ${courseData.title}`)
    }

    // Create boards for each course
    const createdBoards = []
    for (const course of createdCourses) {
      const board = await pb
        .collection('boards')
        .create(createSampleBoard(course.id, allUsers[0].id))
      createdBoards.push(board)
      console.log(`✓ Created board for course: ${course.title}`)
    }

    // Get card types
    const cardTypes = await pb.collection('card_types').getFullList()

    // Create sample cards for each board
    for (const board of createdBoards) {
      const course = createdCourses.find((c) => c.id === board.course)
      const sampleCards = [
        {
          course: course.id,
          lecture_number: 'L01',
          component: 'Lecture Outline',
          title: 'Introduction to the Course',
          description: 'Overview of course objectives and requirements',
          type: cardTypes.find((t) => t.title === 'Lecture Outline').id,
          status: 'In Creation',
          creator: allUsers[0].id,
          creation_deadline: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          reviewer1: allUsers[1].id,
          r1_deadline: new Date(
            Date.now() + 10 * 24 * 60 * 60 * 1000
          ).toISOString(),
          board: board.id,
          column: 'todo',
          order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          course: course.id,
          lecture_number: 'L01',
          component: 'Presentation',
          title: 'Course Introduction Slides',
          description: 'Presentation slides for the first lecture',
          type: cardTypes.find((t) => t.title === 'Presentation').id,
          status: 'Not Started',
          creator: allUsers[1].id,
          creation_deadline: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          board: board.id,
          column: 'todo',
          order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      for (const cardData of sampleCards) {
        const card = await pb.collection('cards').create(cardData)
        console.log(`✓ Created card: ${cardData.title}`)

        // Create a sample comment for the card
        await pb.collection('comments').create({
          card: card.id,
          user: allUsers[0].id,
          content: 'This is a sample comment for review.',
          resolved: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_edited: false,
          is_reply: false,
        })
        console.log(`✓ Created comment for card: ${cardData.title}`)
      }
    }

    console.log('\nSample data created successfully! 🎉')
  } catch (error) {
    console.error('Error creating sample data:', error)
    process.exit(1)
  }
}

// Run the script
createSampleData()
