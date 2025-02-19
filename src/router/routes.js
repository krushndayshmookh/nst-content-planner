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
        name: 'courses',
        path: 'courses',
        component: () => import('pages/CoursesPage.vue'),
      }
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
