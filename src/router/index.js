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
    path: '/new/create',
    component: () => import('@/views/orderNew/Create'),
    name: 'Create'
  },
  {
    path: '/edit/:orderNumber',
    component: () => import('@/views/order/Edit'),
    name: 'edit'
  },
  {
    path: '/edits/:orderNumber',
    component: () => import('@/views/order/Edits'),
    name: 'edits'
  },
  {
    path: '/detail/:orderNumber',
    component: () => import('@/views/order/Detail'),
    name: 'detail'
  },
  {
    path: '/view/:orderNumber',
    component: () => import('@/views/order/View'),
    name: 'view'
  },
  {
    path: '/views/:orderNumber',
    component: () => import('@/views/order/Views'),
    name: 'views'
  },
  {
    path: '/back/:orderNumber',
    component: () => import('@/views/order/Back'),
    name: 'Back'
  },
  {
    path: '/send/:orderNumber',
    component: () => import('@/views/order/Send'),
    name: 'Send'
  },
  {
    path: '/sendToProvider/:orderNumber',
    component: () => import('@/views/order/sendToProvider'),
    name: 'Send'
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
  },
  {
    path: '/supplier/orderView/:id',
    component: () => import('@/views/supplierOrder/View'),
    name: 'orderView'
  }
];

const router = new VueRouter({
  routes
});

export default router;
