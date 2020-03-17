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
    name: 'rfqList',
    component: () => import('@/views/rfq/index')
  },
  {
    path: '/new',
    name: 'rfqNew',
    component: () => import('@/views/rfq/new')
  },
  {
    path: '/detail',
    name: 'rfqDetail',
    component: () => import('@/views/rfq/detail')
  },
  {
    path: '/price',
    name: 'rfqPrice',
    component: () => import('@/views/rfq/priceBids')
  }
];

const router = new VueRouter({
  routes
});

export default router;
