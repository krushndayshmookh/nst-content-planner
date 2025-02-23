export const LECTURE_COLUMNS = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'create-update', title: 'Create/Update' },
  { id: 'review1', title: 'Review 1' },
  { id: 'review2', title: 'Review 2' },
  { id: 'finished', title: 'Finished' },
]

export const CONTEST_COLUMNS = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'create-update', title: 'Question Create/Update' },
  { id: 'review1', title: 'Review 1' },
  { id: 'review2', title: 'Review 2' },
  { id: 'ready', title: 'Question Ready' },
  { id: 'assignment-ready', title: 'Assignment Ready' },
  { id: 'executed', title: 'Executed' },
]

export const ICONS = {
  // // Navigation and UI
  // HOME: 'home',
  // CHEVRON_RIGHT: 'chevron_right',
  // CLOSE: 'eva-close-outline',
  // EDIT: 'eva-edit-outline',
  // DELETE: 'eva-trash-2-outline',
  // ADD: 'eva-plus-outline',
  // MENU: 'eva-menu-outline',
  // DARK_MODE: 'eva-moon-outline',
  // LIGHT_MODE: 'eva-sun-outline',
  // SIGN_OUT: 'eva-power-outline',
  // FILTER: 'eva-funnel-outline',
  // SEARCH: 'search',

  // // Course and Board Related
  // COURSES: 'eva-grid-outline',
  // COURSE: 'eva-book-outline',
  // TEAM: 'eva-people-outline',
  // USERS: 'eva-people-outline',
  // BOARD: 'eva-checkmark-square-outline',
  // TASK_LIST: 'eva-list-outline',
  // LECTURE: 'eva-book-outline',
  // CONTEST: 'eva-award-outline',
  // TAG: 'eva-pricetags-outline',

  // Status and Progress
  ALERT: 'eva-alert-triangle-outline',
  ERROR: 'eva-alert-circle-outline',
  LOADING: 'eva-loader-outline',
  IN_PROGRESS: 'eva-pause-circle-outline',
  REVIEW: 'eva-checkmark-outline',
  REVIEW_ALL: 'eva-done-all-outline',
  DONE: 'eva-checkmark-square-2',
  RESOLVED: 'eva-checkmark-circle-2',
  UNRESOLVED: 'eva-checkmark-circle-outline',

  // // Comments and Messages
  // COMMENT: 'eva-message-square-outline',
  // PERSON: 'eva-person-outline',
}

export const COLORS = {
  // Status Colors
  BACKLOG: 'grey-1',
  CREATE_UPDATE: 'blue-2',
  REVIEW1: 'light-green-2',
  REVIEW2: 'green-2',
  FINISHED: 'purple-2',
  BLOCKED: 'red-2',

  // Component Type Colors
  LECTURE_OUTLINE: {
    bg: 'light-green-2',
    text: 'light-green-10',
  },
  PRESENTATION: {
    bg: 'purple-2',
    text: 'purple-10',
  },
  LAB_OUTLINE: {
    bg: 'green-2',
    text: 'green-10',
  },
  IN_CLASS_MCQS: {
    bg: 'blue-2',
    text: 'blue-10',
  },
  POST_CLASS_MCQS: {
    bg: 'light-blue-2',
    text: 'light-blue-10',
  },
  IN_CLASS_CODING: {
    bg: 'amber-2',
    text: 'amber-10',
  },
  POST_CLASS_CODING: {
    bg: 'deep-orange-2',
    text: 'deep-orange-10',
  },
  LAB_CODING: {
    bg: 'red-2',
    text: 'red-10',
  },
  CONTEST: {
    bg: 'pink-2',
    text: 'pink-10',
  },
}

export const CONTENT_TYPES = {
  DOCUMENT: 'document',
  ASSIGNMENT: 'assignment',
}

export const ASSIGNMENT_TYPES = {
  MCQS: 'MCQs',
  CODING: 'Coding',
  AI_MOCK_INTERVIEW: 'AI Mock Interview',
}

export const COMPONENT_TYPES = {
  LECTURE_OUTLINE: 'Lecture Outline',
  LAB_OUTLINE: 'Lab Outline',
  PRESENTATION: 'Presentation',
  IN_CLASS: 'In-class',
  POST_CLASS: 'Post-class',
  LAB: 'Lab',
}

export const CONTEST_TYPES = {
  CONTEST_1: 'Contest 1',
  CONTEST_2: 'Contest 2',
  CONTEST_3: 'Contest 3',
  CONTEST_4: 'Contest 4',
  MID_SEMESTER: 'Mid Semester',
  END_SEMESTER: 'End Semester',
  MOCK_INTERVIEW: 'Mock Interview',
  END_SEMESTER_RETEST: 'End Semester Retest',
}

export const DEFAULT_LECTURE_BOARD_CONFIG = {
  numberOfLectues: 24,
  columns: LECTURE_COLUMNS,
  componentTypes: [
    { name: COMPONENT_TYPES.LECTURE_OUTLINE, contentType: CONTENT_TYPES.DOCUMENT },
    { name: COMPONENT_TYPES.LAB_OUTLINE, contentType: CONTENT_TYPES.DOCUMENT },
    { name: COMPONENT_TYPES.PRESENTATION, contentType: CONTENT_TYPES.DOCUMENT },
    {
      name: COMPONENT_TYPES.IN_CLASS,
      contentType: CONTENT_TYPES.ASSIGNMENT,
      assignmentTypes: [
        { name: ASSIGNMENT_TYPES.MCQS, count: 5 },
        { name: ASSIGNMENT_TYPES.CODING, count: 2 },
      ],
    },
    {
      name: COMPONENT_TYPES.POST_CLASS,
      contentType: CONTENT_TYPES.ASSIGNMENT,
      assignmentTypes: [
        { name: ASSIGNMENT_TYPES.MCQS, count: 5 },
        { name: ASSIGNMENT_TYPES.CODING, count: 2 },
      ],
    },
    {
      name: COMPONENT_TYPES.LAB,
      contentType: CONTENT_TYPES.ASSIGNMENT,
      assignmentTypes: [{ name: ASSIGNMENT_TYPES.CODING, count: 4 }],
    },
  ],
}

export const DEFAULT_CONTEST_BOARD_CONFIG = {
  columns: CONTEST_COLUMNS,
  componentType: 'Contest',
  contestTypes: [
    {
      name: CONTEST_TYPES.CONTEST_1,
      assignmentTypes: [
        { name: ASSIGNMENT_TYPES.MCQS, count: 10 },
        { name: ASSIGNMENT_TYPES.CODING, count: 5 },
      ],
    },
    {
      name: CONTEST_TYPES.CONTEST_2,
      assignmentTypes: [
        { name: ASSIGNMENT_TYPES.MCQS, count: 10 },
        { name: ASSIGNMENT_TYPES.CODING, count: 5 },
      ],
    },
    {
      name: CONTEST_TYPES.CONTEST_3,
      assignmentTypes: [
        { name: ASSIGNMENT_TYPES.MCQS, count: 10 },
        { name: ASSIGNMENT_TYPES.CODING, count: 5 },
      ],
    },
    {
      name: CONTEST_TYPES.CONTEST_4,
      assignmentTypes: [
        { name: ASSIGNMENT_TYPES.MCQS, count: 10 },
        { name: ASSIGNMENT_TYPES.CODING, count: 5 },
      ],
    },
    {
      name: CONTEST_TYPES.MID_SEMESTER,
      assignmentTypes: [
        { name: ASSIGNMENT_TYPES.MCQS, count: 15 },
        { name: ASSIGNMENT_TYPES.CODING, count: 6 },
      ],
    },
    {
      name: CONTEST_TYPES.END_SEMESTER,
      assignmentTypes: [
        { name: ASSIGNMENT_TYPES.MCQS, count: 20 },
        { name: ASSIGNMENT_TYPES.CODING, count: 10 },
      ],
    },
    {
      name: CONTEST_TYPES.MOCK_INTERVIEW,
      assignmentTypes: [{ name: ASSIGNMENT_TYPES.AI_MOCK_INTERVIEW, count: 100 }],
    },
    {
      name: CONTEST_TYPES.END_SEMESTER_RETEST,
      assignmentTypes: [
        { name: ASSIGNMENT_TYPES.MCQS, count: 15 },
        { name: ASSIGNMENT_TYPES.CODING, count: 10 },
      ],
    },
  ],
}
