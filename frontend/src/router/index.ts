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
      path: "/game/:id/:name",
      name: "GameInfo", // <--- This name must match what you put in router.push
      component: GameInfo,
    },
  ],
});

export default router;
