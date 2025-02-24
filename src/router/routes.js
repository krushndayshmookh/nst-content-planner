const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'index',
        path: '',
        component: () => import('pages/IndexPage.vue'),
      },
      {
        name: 'auth',
        path: 'auth/:authCard?',
        component: () => import('pages/AuthPage.vue'),
      },
      {
        name: 'users',
        path: 'users',
        component: () => import('pages/UsersPage.vue'),
      },
      {
        name: 'courses',
        path: 'courses',
        component: () => import('pages/CoursesPage.vue'),
      },
      {
        name: 'course',
        path: 'courses/:courseId',
        component: () => import('pages/CoursePage.vue'),
      },
      {
        name: 'course-team',
        path: 'courses/:courseId/team',
        component: () => import('pages/CourseTeamPage.vue'),
      },
      {
        name: 'course-contests',
        path: 'courses/:courseId/contests',
        component: () => import('pages/CourseContests.vue'),
      },
      {
        name: 'lectures',
        path: 'courses/:courseId/lectures',
        component: () => import('pages/CourseLectures.vue'),
      },
      {
        name: 'course-board',
        path: 'courses/:courseId/boards/:boardId',
        component: () => import('pages/CourseBoardPage.vue'),
      },
      {
        name: 'course-task-list',
        path: 'courses/:courseId/boards/:boardId/list',
        component: () => import('pages/CourseTaskListPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
