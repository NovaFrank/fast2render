import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/list'
  },
  {
    path: '/list',
    name: 'list',
    component: () => import('@/views/List.vue')
  },
  {
    path: '/create',
    component: () => import('@/views/Create'),
    name: 'Create'
  },
  {
    path: '/edit/:id',
    component: () => import('@/views/Edit'),
    name: 'Edit'
  },
  {
    path: '/detail/:id',
    component: () => import('@/views/Detail'),
    name: 'Detail'
  }
];

const router = new VueRouter({
  routes
});

export default router;
