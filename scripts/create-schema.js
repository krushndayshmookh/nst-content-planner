require('dotenv').config()
const PocketBase = require('pocketbase/cjs')

const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://127.0.0.1:8090')

const CONTENT_TYPES = [
  'Lecture Outline',
  'Presentation',
  'In-class MCQs',
  'Post-class MCQs',
  'In-class Coding Qs',
  'Post-class Coding Qs',
  'Lab Coding Qs',
  'Lab Outline',
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

const CONTEST_TYPES = Object.keys(CONTEST_TYPE_SETS)

const LINK_TYPES_SLUGS = {
  assignment: 'contest_assignment_link',
  assessment: 'contest_assessment_link',
  multiplechoice: 'contest_multiplechoice_link',
  assignmentuestion: 'contest_coding_link',
}

async function cleanUp() {
  const collectionsToDelete = [
    'logs',
    'comments',
    'cards',
    'boards',
    'card_types',
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
    await pb.collections.create({
      name: 'profiles',
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
        },
        {
          name: 'role',
          type: 'select',
          values: ['user', 'admin'],
          required: true,
          defaultValue: 'user',
        },
        {
          name: 'campus',
          type: 'select',
          values: ['ADYPU', 'RU'],
          required: true,
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
        },
        {
          name: 'created_at',
          type: 'date',
          required: true,
          defaultValue: new Date().toISOString(),
        },
        {
          name: 'scrum_masters',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: null,
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
    await pb.collections.create({
      name: 'course_teams',
      fields: [
        {
          name: 'course',
          type: 'relation',
          required: true,
          collectionId: courses.id,
          cascadeDelete: true,
        },
        {
          name: 'members',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: null,
        },
      ],
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: "@request.auth.role = 'admin'",
    })

    // Create lectures collection
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
        },
        {
          name: 'created_by',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
        },
        {
          name: 'created_at',
          type: 'date',
          required: true,
          defaultValue: new Date().toISOString(),
        },
      ],
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: "@request.auth.role = 'admin'",
    })

    console.log('✓ Created lectures collection')

    const assessmentTypes = await pb.collection('card_types').getFullList()
    const assessmentTypeIds = assessmentTypes.map((type) => type.id)

    console.log(assessmentTypeIds)

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
          name: 'course',
          type: 'relation',
          required: true,
          collectionId: courses.id,
          cascadeDelete: true,
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
        },
        {
          name: 'created_at',
          type: 'date',
          required: true,
          defaultValue: new Date().toISOString(),
        },
      ],
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: "@request.auth.role = 'admin'",
    })

    console.log('✓ Created boards collection')

    // Create card_types collection
    const cardTypes = await pb.collections.create({
      name: 'card_types',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'fields',
          type: 'json',
          required: true,
        },
        {
          name: 'is_default',
          type: 'bool',
          required: true,
        },
      ],
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: "@request.auth.role = 'admin'",
    })

    console.log('✓ Created card_types collection')

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
        },
        {
          name: 'lecture_number',
          type: 'text',
          required: false,
        },
        {
          name: 'component',
          type: 'select',
          required: true,
          values: [
            'Lecture Outline',
            'Presentation',
            'In-class MCQs',
            'Post-class MCQs',
            'In-class Coding Questions',
            'Post-class Coding Questions',
            'Lab Coding Questions',
            'Lab Outline',
            'Contest',
          ],
        },
        {
          name: 'contest_assignment_link',
          type: 'url',
        },
        {
          name: 'contest_assessment_link',
          type: 'url',
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
          name: 'type',
          type: 'relation',
          required: true,
          collectionId: cardTypes.id,
          cascadeDelete: false,
        },
        {
          name: 'link',
          type: 'url',
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
        },
        {
          name: 'creator',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
        },
        {
          name: 'creation_deadline',
          type: 'date',
        },
        {
          name: 'reviewer1',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
        },
        {
          name: 'r1_deadline',
          type: 'date',
        },
        {
          name: 'reviewer2',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
        },
        {
          name: 'r2_deadline',
          type: 'date',
        },
        {
          name: 'board',
          type: 'relation',
          required: true,
          collectionId: boards.id,
          cascadeDelete: true,
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
        {
          name: 'created_at',
          type: 'date',
          required: true,
          defaultValue: new Date().toISOString(),
        },
        {
          name: 'updated_at',
          type: 'date',
          required: true,
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

    await pb.collections.update(comments.id, {
      fields: [
        {
          name: 'card',
          type: 'relation',
          required: true,
          collectionId: cards.id,
          cascadeDelete: true,
        },
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
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
          maxSelect: null,
        },
        {
          name: 'resolved',
          type: 'bool',
          defaultValue: false,
        },
        {
          name: 'resolved_by',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
        },
        {
          name: 'resolved_at',
          type: 'date',
        },
        {
          name: 'created_at',
          type: 'date',
          required: true,
          defaultValue: new Date().toISOString(),
        },
        {
          name: 'updated_at',
          type: 'date',
          required: true,
        },
        {
          name: 'is_edited',
          type: 'bool',
          defaultValue: false,
        },
        {
          name: 'is_reply',
          type: 'bool',
          defaultValue: false,
        },
        {
          name: 'parent',
          type: 'relation',
          collectionId: comments.id,
          cascadeDelete: false,
        },
        {
          name: 'top_level_parent',
          type: 'relation',
          collectionId: comments.id,
          cascadeDelete: false,
        },
      ],
    })

    console.log('✓ Created comments collection')

    // Create logs collection
    await pb.collections.create({
      name: 'logs',
      type: 'base',
      fields: [
        {
          name: 'log',
          type: 'text',
          required: true,
        },
        {
          name: 'created_at',
          type: 'date',
          required: true,
          defaultValue: new Date().toISOString(),
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
          minSelect: 1,
        },
      ],
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
    })

    console.log('✓ Created logs collection')

    console.log('\nSchema creation completed successfully! 🎉')
  } catch (error) {
    console.error('Error creating schema:', error)
    process.exit(1)
  }
}

createSchema()
