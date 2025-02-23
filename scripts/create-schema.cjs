require('dotenv').config()
const PocketBase = require('pocketbase/cjs')

const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://127.0.0.1:8090')

const COMPONENT_TYPES = [
  'Lecture Outline',
  'Lab Outline',
  'Presentation',
  'In-class',
  'Post-class',
  'Lab',
  'Contest',
]

const CONTEST_TYPE_SETS = {
  'Contest 1': ['ADYPU - A', 'ADYPU - B', 'ADYPU - C', 'RU - A', 'RU - B'],
  'Contest 2': ['ADYPU - A', 'ADYPU - B', 'ADYPU - C', 'RU - A', 'RU - B'],
  'Contest 3': ['ADYPU - A', 'ADYPU - B', 'ADYPU - C', 'RU - A', 'RU - B'],
  'Contest 4': ['ADYPU - A', 'ADYPU - B', 'ADYPU - C', 'RU - A', 'RU - B'],
  'Mid Semester': ['ADYPU - A', 'ADYPU - B', 'ADYPU - C', 'RU - A', 'RU - B'],
  'End Semester': ['ADYPU - A', 'ADYPU - B', 'ADYPU - C', 'RU - A', 'RU - B'],
  'Mock Interview': ['ADYPU - A', 'RU - A'],
  'End Semester Retest': ['ADYPU - A'],
}

const CARD_CONTENT = [
  // for Outlines & Presentation
  {
    name: 'file_link',
    type: 'text',
  },

  // for questions
  {
    name: 'question_count',
    type: 'number',
  },
  {
    name: 'questions',
    type: 'relation',
    collectionId: 'to-replace-with-questions-id',
    cascadeDelete: false,
    maxSelect: 999,
  },
  {
    name: 'assignment_type',
    type: 'select',
    values: ['MCQs', 'Coding', 'AI Mock Interview'],
  },

  // for Contest
  {
    name: 'assignment_link',
    type: 'text',
  },
  {
    name: 'assignment_is_verified',
    type: 'bool',
  },
  {
    name: 'set_name',
    type: 'text',
  },
]

const CONTEST_TYPES = Object.keys(CONTEST_TYPE_SETS)

const LECTURE_COLUMNS = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'create-update', title: 'Create/Update' },
  { id: 'review1', title: 'Review 1' },
  { id: 'review2', title: 'Review 2' },
  { id: 'finished', title: 'Finished' },
]

const CONTEST_COLUMNS = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'create-update', title: 'Question Create/Update' },
  { id: 'review1', title: 'Review 1' },
  { id: 'review2', title: 'Review 2' },
  { id: 'ready', title: 'Question Ready' },
  { id: 'assignment-ready', title: 'Assignment Ready' },
  { id: 'executed', title: 'Executed' },
]

exports.LECTURE_COLUMNS = LECTURE_COLUMNS
exports.CONTEST_COLUMNS = CONTEST_COLUMNS

async function cleanUp() {
  const collectionsToDelete = [
    'logs',
    'comments',
    'cards',
    'questions',
    'boards',
    'card_types',
    'contests',
    'lectures',
    'course_teams',
    'courses',
    'profiles',
  ]
  const existingCollections = await pb.collections.getFullList()

  for (const collName of collectionsToDelete) {
    const id = existingCollections.find((c) => c.name === collName)?.id

    if (id) {
      await pb.collections.delete(id)
    }
  }

  // cleanup items of _pb_users_auth_
  const users = await pb.collection('_pb_users_auth_').getFullList()
  for (const user of users) {
    await pb.collection('_pb_users_auth_').delete(user.id)
  }

  console.log('✓ Cleaned up all collections')
}

async function createSchema() {
  try {
    // First, authenticate as admin
    await pb
      .collection('_superusers')
      .authWithPassword(
        process.env.PB_ADMIN_EMAIL || 'admin@example.com',
        process.env.PB_ADMIN_PASSWORD || '1234567890',
      )

    console.log('✓ Authenticated as admin')

    // cleanup all collections
    await cleanUp()

    // Create profiles collection
    const profiles = await pb.collections.create({
      name: 'profiles',
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'email',
          type: 'text',
          required: true,
        },
        {
          name: 'role',
          type: 'select',
          values: ['user', 'admin'],
          required: true,
          maxSelect: 1,
        },
        {
          name: 'campus',
          type: 'select',
          values: ['ADYPU', 'RU'],
          required: true,
          maxSelect: 1,
        },
      ],
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
    })

    console.log('✓ Created profiles collection')

    // Create courses collection
    const courses = await pb.collections.create({
      name: 'courses',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
        },
        {
          name: 'created_by',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'created_at',
          type: 'autodate',
          onCreate: true,
          onUpdate: false,
        },

        {
          name: 'scrum_masters',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 999,
        },
      ],
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: "@request.auth.role = 'admin'",
    })

    console.log('✓ Created courses collection')

    // Create course teams collection
    const courseTeams = await pb.collections.create({
      name: 'course_teams',
      fields: [
        {
          name: 'course',
          type: 'relation',
          required: true,
          collectionId: courses.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'members',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 999,
        },
        {
          name: 'created_at',
          type: 'autodate',
          onCreate: true,
          onUpdate: false,
        },
        {
          name: 'updated_at',
          type: 'autodate',
          onCreate: true,
          onUpdate: true,
        },
      ],
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: "@request.auth.role = 'admin'",
    })

    console.log('✓ Created course teams collection')

    // Create lecture and contest collections
    const lectures = await pb.collections.create({
      name: 'lectures',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'course',
          type: 'relation',
          required: true,
          collectionId: courses.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'created_at',
          type: 'autodate',
          onCreate: true,
          onUpdate: false,
        },
        {
          name: 'updated_at',
          type: 'autodate',
          onCreate: true,
          onUpdate: true,
        },
      ],
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: "@request.auth.role = 'admin'",
    })

    const contests = await pb.collections.create({
      name: 'contests',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'course',
          type: 'relation',
          required: true,
          collectionId: courses.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'contest_type',
          type: 'select',
          required: true,
          values: CONTEST_TYPES,
          maxSelect: 1,
        },
        {
          name: 'contest_date',
          type: 'date',
        },
        {
          name: 'contest_ready_at',
          type: 'date',
        },
        {
          name: 'contest_owner',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'created_at',
          type: 'autodate',
          onCreate: true,
          onUpdate: false,
        },
        {
          name: 'updated_at',
          type: 'autodate',
          onCreate: true,
          onUpdate: true,
        },
      ],
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: "@request.auth.role = 'admin'",
    })

    console.log('✓ Created lectures collection')
    console.log('✓ Created contests collection')

    // Create boards collection
    const boards = await pb.collections.create({
      name: 'boards',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['lecture', 'contest'],
          maxSelect: 1,
        },
        {
          name: 'course',
          type: 'relation',
          required: true,
          collectionId: courses.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'columns',
          type: 'json',
          required: true,
        },
        {
          name: 'created_by',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'created_at',
          type: 'autodate',
          onCreate: true,
          onUpdate: false,
        },
        {
          name: 'updated_at',
          type: 'autodate',
          onCreate: true,
          onUpdate: true,
        },
      ],
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: "@request.auth.role = 'admin'",
    })

    console.log('✓ Created boards collection')

    // Create questions collection
    const questions = await pb.collections.create({
      name: 'questions',
      fields: [
        {
          name: 'question_id',
          type: 'text',
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['MCQs', 'Coding'],
        },
        {
          name: 'is_reviewed',
          type: 'bool',
        },
        {
          name: 'final_reviewer',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'final_reviewed_at',
          type: 'date',
        },
        {
          name: 'initial_reviewer',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'initial_review_deadline',
          type: 'date',
        },
        {
          name: 'final_created_at',
          type: 'date',
        },
        {
          name: 'final_creator',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'initial_creator',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'initial_creation_deadline',
          type: 'date',
        },
        {
          name: 'lecture',
          type: 'relation',
          collectionId: lectures.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'contest',
          type: 'relation',
          collectionId: contests.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'created_at',
          type: 'autodate',
          onCreate: true,
          onUpdate: false,
        },
        {
          name: 'updated_at',
          type: 'autodate',
          onCreate: true,
          onUpdate: true,
        },
      ],
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: "@request.auth.role = 'admin'",
    })

    console.log('✓ Created questions collection')

    const questionIdx = CARD_CONTENT.findIndex((card) => card.name === 'questions')
    CARD_CONTENT[questionIdx].collectionId = questions.id

    // Create cards collection
    const cards = await pb.collections.create({
      name: 'cards',
      fields: [
        {
          name: 'course',
          type: 'relation',
          required: true,
          collectionId: courses.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'lecture',
          type: 'relation',
          required: false,
          collectionId: lectures.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'contest',
          type: 'relation',
          required: false,
          collectionId: contests.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'component',
          type: 'select',
          required: true,
          values: COMPONENT_TYPES,
          maxSelect: 1,
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'editor',
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: [
            'Not Started',
            'In Creation',
            'Creation Done',
            'In R1 Review',
            'R1 Approved',
            'In R2 Review',
            'Final',
            'Blocked',
          ],
          maxSelect: 1,
        },
        {
          name: 'creator',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'creation_deadline',
          type: 'date',
        },
        {
          name: 'initial_creator',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'initial_creation_deadline',
          type: 'date',
        },
        {
          name: 'reviewer1',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'r1_deadline',
          type: 'date',
        },
        {
          name: 'initial_reviewer1',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'initial_r1_deadline',
          type: 'date',
        },
        {
          name: 'reviewer2',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'r2_deadline',
          type: 'date',
        },
        {
          name: 'initial_reviewer2',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'initial_r2_deadline',
          type: 'date',
        },
        {
          name: 'final_created_at',
          type: 'date',
        },
        {
          name: 'final_review1_at',
          type: 'date',
        },
        {
          name: 'final_review2_at',
          type: 'date',
        },
        {
          name: 'board',
          type: 'relation',
          required: true,
          collectionId: boards.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'column',
          type: 'text',
          required: true,
        },
        {
          name: 'order',
          type: 'number',
        },
        ...CARD_CONTENT,
        {
          name: 'created_at',
          type: 'autodate',
          onCreate: true,
          onUpdate: false,
        },
        {
          name: 'updated_at',
          type: 'autodate',
          onCreate: true,
          onUpdate: true,
        },
      ],
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: "@request.auth.role = 'admin'",
    })

    console.log('✓ Created cards collection')

    // Create comments collection
    const comments = await pb.collections.create({
      name: 'comments',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: "@request.auth.role = 'admin'",
    })

    // need to update comments collection for self-relations as id is generated later

    await pb.collections.update(comments.id, {
      fields: [
        {
          name: 'card',
          type: 'relation',
          required: true,
          collectionId: cards.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'content',
          type: 'editor',
          required: true,
        },
        {
          name: 'mentioned_users',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 999,
        },
        {
          name: 'resolved',
          type: 'bool',
        },
        {
          name: 'created_at',
          type: 'autodate',
          onCreate: true,
          onUpdate: false,
        },
        {
          name: 'updated_at',
          type: 'autodate',
          onCreate: true,
          onUpdate: true,
        },
        {
          name: 'is_edited',
          type: 'bool',
        },
        {
          name: 'is_reply',
          type: 'bool',
        },
        {
          name: 'parent',
          type: 'relation',
          collectionId: comments.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'top_level_parent',
          type: 'relation',
          collectionId: comments.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'resolved_by',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'resolved_at',
          type: 'date',
        },
      ],
    })

    console.log('✓ Created comments collection')

    // Create logs collection
    const logs = await pb.collections.create({
      name: 'logs',
      fields: [
        {
          name: 'log',
          type: 'text',
          required: true,
        },
        {
          name: 'created_at',
          type: 'autodate',
          onCreate: true,
          onUpdate: false,
        },
        {
          name: 'related_items',
          type: 'json',
        },
        {
          name: 'created_by',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
      ],
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
    })

    console.log('✓ Created logs collection')

    // print all collections ids
    console.log('Collections IDs:')
    console.log('Profiles:', profiles.id)
    console.log('Courses:', courses.id)
    console.log('Course Teams:', courseTeams.id)
    console.log('Lectures:', lectures.id)
    console.log('Contests:', contests.id)
    console.log('Boards:', boards.id)
    console.log('Questions:', questions.id)
    console.log('Cards:', cards.id)
    console.log('Comments:', comments.id)
    console.log('Logs:', logs.id)

    console.log('\nSchema creation completed successfully! 🎉')
  } catch (error) {
    console.error('Error creating schema:', error)
    process.exit(1)
  }
}

createSchema()
