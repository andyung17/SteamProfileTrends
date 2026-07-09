import { createRouter, createWebHistory } from "vue-router";

import NewHome from "../components/NewHome.vue";
import HomeView from "../components/HomeView.vue";
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
      component: HomeView,
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
