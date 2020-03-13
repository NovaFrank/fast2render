import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "/list"
  },
  // {
  //   path: '/peizhi/:id/:valueText',
  //   name: 'peizhi',
  //   component: () => import('@/views/Peizhi.vue')
  // },
  // {
  //   path: '/peizhi-list',
  //   name: 'peizhiList',
  //   component: () => import('@/views/PeizhiList.vue')
  // },
  {
    path: "/list",
    name: "list",
    component: () => import("@/views/List.vue")
  },
  {
    path: "/create",
    component: () => import("@/views/Create"),
    name: "Create"
  },
  {
    path: "/edit/:id",
    component: () => import("@/views/Edit"),
    name: "Edit"
  },
  {
    path: "/inapproval/:id",
    component: () => import("@/views/InApproval"),
    name: "inApproval"
  }
];

const router = new VueRouter({
  routes
});

export default router;
