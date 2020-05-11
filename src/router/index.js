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
    component: () => import('@/views/order/List.vue')
  },
  {
    path: '/create',
    component: () => import('@/views/order/Create'),
    name: 'Create'
  },
  {
    path: '/edit/:id',
    component: () => import('@/views/order/Edit'),
    name: 'Edit'
  },
  {
    path: '/detail/:id',
    component: () => import('@/views/order/Detail'),
    name: 'Detail'
  },
  {
    path: '/view/:id',
    component: () => import('@/views/order/View'),
    name: 'View'
  },
  {
    path: '/supplier/orderList',
    name: 'orderList',
    component: () => import('@/views/supplierOrder/List')
  },
  {
    path: '/supplier/orderDetail/:id',
    component: () => import('@/views/supplierOrder/Detail'),
    name: 'orderDetail'
  }
];

const router = new VueRouter({
  routes
});

export default router;
