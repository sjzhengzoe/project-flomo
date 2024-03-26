import { createRouter, createWebHistory, Router } from "vue-router";

// 初始化路由
const router: Router = createRouter({
  history: createWebHistory(`/`),
  routes: [
    {
      path: "/",
      component: () => import("@/pages/home.vue"),
    },
    {
      path: "/:pathMatch(.*)",
      redirect: "/",
    },
  ],
});

export default router;
