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
    path: '/new/:enquiryNumber',
    name: 'rfqNew',
    component: () => import('@/views/rfq/new')
  },
  {
    path: '/detail/:enquiryNumber',
    name: 'rfqDetail',
    component: () => import('@/views/rfq/detail')
  },
  {
    path: '/price/:enquiryNumber',
    name: 'rfqPrice',
    component: () => import('@/views/rfq/priceBids')
  },
  {
    path: '/quotationTemplate',
    name: 'quotationTemplate',
    component: () => import('@/views/rfq/quotationTemplate/index')
  },
  {
    path: '/client/list',
    name: 'rfqSupplierClientList',
    component: () => import('@/views/rfq/supplierClient/index')
  },
  {
    path: '/client/quota/:enquiryNumber',
    name: 'rfqSupplierClientDetail',
    component: () => import('@/views/rfq/supplierClient/quota')
  }
];

const router = new VueRouter({
  routes
});

export default router;
