<template>
  <nav class="steam-hotbar">
    <div class="hotbar-content">
      <div class="hotbar-left" @click="goHome">
        <img src="../assets/steam-search-logo.png" alt="Steam Lookup Logo" class="hotbar-logo" />
        <span class="hotbar-title">SteamTracker</span>
      </div>
      <div class="hotbar-left" @click="goRecommendations">
        <span class="nav-item">Recommendation</span>
      </div>
      <div class="hotbar-center">
        <input/>
      </div>

      <div class="hotbar-right">
        <router-link :to="'/dashboard/user/' + $route.params.steamId" class="nav-item">Dashboard</router-link>
      </div>

      <div class="hotbar-right">
        <router-link to="/" class="nav-item">Sign Out</router-link>
        </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();


const goHome = () => {

router.push('/homepage/user/' + (router.currentRoute.value.params.steamId || router.currentRoute.value.params.userId));
};
const goRecommendations = () => {
  router.push('/recommendations/' + router.currentRoute.value.params.steamId);
};
</script>

<style scoped>
.steam-hotbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 60px;
  z-index: 999;
  
  background-color: rgba(11, 17, 26, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.hotbar-content {
  max-width: 1100px;
  width: 90%;
  height: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hotbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.hotbar-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.hotbar-title {
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.5px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: color 0.2s ease;
}

.hotbar-title:hover, .router-link-active {
  color: #66c0f4;
}

.hotbar-right {
  display: flex;
  gap: 20px;
}

.nav-item {
  font-family: 'Inter', sans-serif;
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-item:hover, .router-link-active {
  color: #66c0f4;
}
</style>