import { createRouter, createWebHistory } from "vue-router";

import NewHome from "../components/NewHome.vue";
import Homepage from "../components/Homepage.vue";
import Dashboard from "../components/Dashboard.vue";
import GameInfo from "../components/GameInfo.vue";
import Recommendation from "../components/Recommendation.vue";
import EntireGamesList from "../components/EntireGamesList.vue";

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
      path: "/recommendations/:steamId",
      name: "Recommendation",
      component: Recommendation,
    },
    {
      path: "/user/:userId/game/:id",
      name: "GameInfo",
      component: GameInfo,
    },
    {
      path: "/user/:userId/played",
      name: "EntireGamesList",
      component: EntireGamesList,
    },
  ],
});

export default router;
