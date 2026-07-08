import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../components/HomeView.vue";
import GameInfo from "../components/GameInfo.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Home",
      alias: "/home",
      component: HomeView,
    },
    {
      path: "/",
      name: "Reccommendations",
      alias: "/recommendations",
      component: HomeView,
    },
    {
      path: "/game/:id/",
      name: "GameInfo",
      component: GameInfo,
    },
  ],
});

export default router;
