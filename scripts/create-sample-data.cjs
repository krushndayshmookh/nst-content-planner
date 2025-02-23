require('dotenv').config()
const PocketBase = require('pocketbase/cjs')

const { LECTURE_COLUMNS, CONTEST_COLUMNS } = require(__dirname + '/create-schema.cjs')

const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://127.0.0.1:8090')

const sampleUsers = [
  {
    email: 'krushn@nst.com',
    password: 'password123',
    passwordConfirm: 'password123',
    name: 'Krushn',
  },
  {
    email: 'raghav@nst.com',
    password: 'password123',
    passwordConfirm: 'password123',
    name: 'Raghav',
  },
  {
    email: 'aryan@nst.com',
    password: 'password123',
    passwordConfirm: 'password123',
    name: 'Aryan',
  },
]

const getSampleProfiles = (users) => {
  return [
    {
      user: users[0].id,
      email: users[0].email,
      role: 'admin',
      campus: 'ADYPU',
    },
    {
      user: users[1].id,
      email: users[1].email,
      role: 'user',
      campus: 'ADYPU',
    },
    {
      user: users[2].id,
      email: users[2].email,
      role: 'user',
      campus: 'RU',
    },
  ]
}

const getSampleCourses = (users) => {
  return [
    {
      title: 'Introduction to Programming',
      description: 'A beginner-friendly course covering programming fundamentals',
      created_by: sampleUsers[0].id,
      scrum_masters: [users[0].id],
    },
  ]
}

const getSampleCourseTeams = (courses, users) => {
  return [
    {
      course: courses[0].id,
      members: [users[0].id, users[1].id, users[2].id],
    },
  ]
}

const getSampleLectures = (courses) => {
  return [
    {
      title: 'Lecture 1',
      course: courses[0].id,
    },
  ]
}

const getSampleContests = (courses) => {
  return [
    {
      title: 'Contest 1',
      course: courses[0].id,
      contest_type: 'End Semester',
      contest_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]
}

const getSampleContestBoards = (courses, users) => {
  return [
    {
      title: 'Contest Board',
      type: 'contest',
      course: courses[0].id,
      created_by: users[0].id,
      columns: CONTEST_COLUMNS,
    },
  ]
}

const getSampleContentBoards = (courses, users) => {
  return [
    {
      title: 'Lecture Board',
      type: 'lecture',
      course: courses[0].id,
      created_by: users[0].id,
      columns: LECTURE_COLUMNS,
    },
  ]
}

const getSampleCards = (courses, users, contentBoards, contestBoards, lectures, contests) => {
  return [
    {
      course: courses[0].id,
      lecture: lectures[0].id,
      component: 'Lecture Outline',
      title: 'Introduction to the Course',
      description: 'Overview of course objectives and requirements',
      status: 'Not Started',
      creator: users[0].id,
      creation_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      reviewer1: users[1].id,
      r1_deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      board: contentBoards[0].id,
      column: 'backlog',
      order: 1,
      // content fields
      file_link: 'https://www.google.com',
      question_count: null,
      questions: [],
      assignment_type: null,
      assignment_link: null,
      assignment_is_verified: false,
      set_name: null,
    },
    {
      course: courses[0].id,
      contest: contests[0].id,
      component: 'Contest',
      title: 'Contest 1 Coding',
      description: 'Contest 1 Coding Questions',
      status: 'Not Started',
      creator: users[1].id,
      creation_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      reviewer1: users[0].id,
      r1_deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      board: contestBoards[0].id,
      column: 'backlog',
      order: 1,
      // content fields
      file_link: null,
      question_count: 2,
      questions: [],
      assignment_type: 'Coding',
      assignment_link: 'https://www.google.com',
      assignment_is_verified: false,
      set_name: 'ADYPU - A',
    },
  ]
}

const getSampleComments = (cards, users) => {
  return [
    {
      card: cards[0].id,
      user: users[0].id,
      content: 'This is a sample comment for review.',
      resolved: false,
    },
  ]
}

async function createSampleData() {
  try {
    // First, authenticate as admin
    await pb
      .collection('_superusers')
      .authWithPassword(
        process.env.PB_ADMIN_EMAIL || 'admin@example.com',
        process.env.PB_ADMIN_PASSWORD || '1234567890',
      )

    console.log('✓ Authenticated as admin')

    for (const user of sampleUsers) {
      await pb.collection('_pb_users_auth_').create(user)
    }

    const users = await pb.collection('_pb_users_auth_').getFullList()

    const sampleProfiles = getSampleProfiles(users)

    for (const profile of sampleProfiles) {
      await pb.collection('profiles').create(profile)
    }

    let courses = getSampleCourses(users)

    for (const course of courses) {
      await pb.collection('courses').create(course)
    }

    courses = await pb.collection('courses').getFullList()

    let courseTeams = getSampleCourseTeams(courses, users)

    for (const courseTeam of courseTeams) {
      await pb.collection('course_teams').create(courseTeam)
    }

    courseTeams = await pb.collection('course_teams').getFullList()

    let lectures = getSampleLectures(courses)

    for (const lecture of lectures) {
      await pb.collection('lectures').create(lecture)
    }

    lectures = await pb.collection('lectures').getFullList()

    let contests = getSampleContests(courses)

    for (const contest of contests) {
      await pb.collection('contests').create(contest)
    }

    contests = await pb.collection('contests').getFullList()

    let contestBoards = getSampleContestBoards(courses, users)
    let contentBoards = getSampleContentBoards(courses, users)

    for (const contestBoard of contestBoards) {
      await pb.collection('boards').create(contestBoard)
    }

    for (const contentBoard of contentBoards) {
      await pb.collection('boards').create(contentBoard)
    }

    contestBoards = await pb.collection('boards').getFullList({
      filter: `(type="contest")`,
    })
    contentBoards = await pb.collection('boards').getFullList({
      filter: `(type="lecture")`,
    })

    let cards = getSampleCards(courses, users, contentBoards, contestBoards, lectures, contests)

    for (const card of cards) {
      await pb.collection('cards').create(card)
    }

    cards = await pb.collection('cards').getFullList()

    let comments = getSampleComments(cards, users)

    for (const comment of comments) {
      await pb.collection('comments').create(comment)
    }

    comments = await pb.collection('comments').getFullList()

    console.log('\nSample data created successfully! 🎉')

    // log counts of each collection
    console.log(`\nItems created:`)
    console.log(`- _pb_users_auth_: ${users.length}`)
    console.log(`- profiles: ${sampleProfiles.length}`)
    console.log(`- courses: ${courses.length}`)
    console.log(`- course_teams: ${courseTeams.length}`)
    console.log(`- lectures: ${lectures.length}`)
    console.log(`- contests: ${contests.length}`)
    console.log(`- contest_boards: ${contestBoards.length}`)
    console.log(`- content_boards: ${contentBoards.length}`)
    console.log(`- cards: ${cards.length}`)
    console.log(`- comments: ${comments.length}`)
  } catch (error) {
    console.error('Error creating sample data:', error)
    process.exit(1)
  }
}

// Run the script
createSampleData()
