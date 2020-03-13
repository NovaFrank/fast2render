import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
  },
  {
    path: '/list',
    name: 'rfq',
    component: () => import('@/views/rfq/index')
  },
  {
    path: '/detail',
    name: 'rfqDetail',
    component: () => import('@/views/rfq/newAndView')
  },
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router
