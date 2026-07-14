import { createRouter, createWebHistory } from "vue-router";

import NewHome from "../components/NewHome.vue";
import Homepage from "../components/Homepage.vue";
import Dashboard from "../components/Dashboard.vue";
import GameInfo from "../components/GameInfo.vue";
import Recommender from "../components/Recommender.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "NewHome",
      component: NewHome,
    },
    {
      path: "/dashboard/user/:steamId",
      name: "Dashboard",
      alias: "/dashboard",
      component: Dashboard,
    },
    {
      path: "/homepage/user/:steamId",
      name: "Homepage",
      component: Homepage,
    },
    {
      path: "/Recommender",
      name: "Recommender",
      component: Recommender,
    },
    {
      path: "/game/:id/",
      name: "GameInfo",
      component: GameInfo,
    },
  ],
});

export default router;
