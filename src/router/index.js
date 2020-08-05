import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/list'
  },

  {
    path: '/v2/order',
    name: 'orderListV2',
    component: () => import('@/views/orderV2/List.vue')
  },
  {
    path: '/v2/order/create',
    name: 'orderCreateV2',
    component: () => import('@/views/orderV2/Create.vue')
  },
  {
    path: '/v2/order/edit/:orderNumber',
    name: 'orderEditV2',
    props: true,
    component: () => import('@/views/orderV2/Edit.vue')
  },
  {
    path: '/v2/order/detail/:orderNumber',
    name: 'orderDetailV2',
    props: true,
    component: () => import('@/views/orderV2/Detail.vue')
  },

  {
    path: '/v2/order/supplier/orderList',
    name: 'orderList',
    component: () => import('@/views/supplierOrderV2/List')
  },
  {
    path: '/v2/order/supplier/orderDetail/:id',
    props: true,
    component: () => import('@/views/supplierOrderV2/Detail'),
    name: 'orderDetail'
  },
  {
    path: '/v2/order/supplier/orderView/:id',
    props: true,
    component: () => import('@/views/supplierOrderV2/View'),
    name: 'orderView'
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
