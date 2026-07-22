<template>
  <nav class="steam-hotbar">
    <div class="hotbar-content">
      
      <div class="hotbar-section left">
        <div class="brand-group" @click="goHome">
          <img src="../assets/steam-search-logo.png" alt="Steam Lookup Logo" class="hotbar-logo" />
          <span class="hotbar-title">SteamTracker</span>
        </div>
        
        <span class="nav-item" @click="goRecommendations">Recommendation</span>
      </div>

      <div class="hotbar-section center">
        <div class="search-input-wrapper">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search games or Steam ID..." 
            class="search-input"
          />
        </div>
      </div>

      <div class="hotbar-section right">
        <router-link 
          :to="{ 
            name: 'Charts', 
            params: { steamId: $route.params.steamId || $route.params.userId } 
          }" 
          class="nav-item"
        >
          Charts
        </router-link>
        
        <!-- <router-link :to="'/dashboard/user/' + ($route.params.steamId || $route.params.userId)" class="nav-item">
          Dashboard
        </router-link> -->
        
        <router-link to="/" class="nav-item">
          Sign Out
        </router-link>
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
  router.push('/recommendations/' + (router.currentRoute.value.params.steamId || router.currentRoute.value.params.userId));
};
</script>

<style scoped>
.steam-hotbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  z-index: 999;
  
  background-color: rgba(11, 17, 26, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.hotbar-content {
  max-width: 1280px; 
  width: 90%;
  height: 100%;
  margin: 0 auto;
  
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}

.hotbar-section {
  display: flex;
  align-items: center;
}

.hotbar-section.left {
  justify-content: flex-start;
  gap: 20px;
}

.hotbar-section.center {
  justify-content: center;
  width: 100%;
  max-width: 300px;
}

.hotbar-section.right {
  justify-content: flex-end;
  gap: 20px;
}

.brand-group {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex-shrink: 0;
}

.hotbar-logo {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.hotbar-title {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.3px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: color 0.2s ease;
  white-space: nowrap;
}

.brand-group:hover .hotbar-title {
  color: #66c0f4;
}

.nav-item {
  font-family: 'Inter', sans-serif;
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
  white-space: nowrap;
}

.nav-item:hover, 
.router-link-active {
  color: #66c0f4;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 12px;
  width: 14px;
  height: 14px;
  stroke: #64748b;
  pointer-events: none;
  transition: stroke 0.2s ease;
}

.search-input {
  width: 100%;
  padding: 6px 14px 6px 34px;
  background-color: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  color: #f3f4f6;
  font-size: 0.825rem;
  outline: none;
  transition: all 0.25s ease-in-out;
}

.search-input::placeholder {
  color: #64748b;
}

.search-input:hover {
  border-color: rgba(56, 189, 248, 0.4);
  background-color: rgba(15, 23, 42, 0.85);
}

.search-input:focus {
  border-color: #38bdf8;
  background-color: #0b1320;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.25);
}

.search-input-wrapper:focus-within .search-icon {
  stroke: #38bdf8;
}

@media (max-width: 1024px) {
  .hotbar-content {
    gap: 12px;
  }
  
  .hotbar-section.left,
  .hotbar-section.right {
    gap: 12px;
  }

  .nav-item {
    font-size: 0.8rem;
  }
  
  .hotbar-section.center {
    max-width: 220px;
  }
}
</style>