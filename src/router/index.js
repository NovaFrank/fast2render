import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/list',
    name: 'rfq',
    component: function() {
      return import(/* webpackChunkName: "about" */ '@/views/rfq/index');
    }
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
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
});

export default router;
