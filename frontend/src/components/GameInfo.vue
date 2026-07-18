<template>
  <div 
    class="game-info-container" 
    :style="{ '--dynamic-bg-url': gameIcon ? `url(${gameIcon})` : 'none' }"
  >
    <div class="navigation-top-bar">
      <div 
        class="breadcrumb-back" 
        @click="$router.push({ name: 'Homepage', params: { steamId: `${$route.params.userId}` } })"
      >
        <span class="arrow-sym">◀</span> Back to Homepage
      </div>
    </div>

    <div class="game-content-wrapper">
      <div class="game-header-row">
        <div class="title-block">
          <h1 class="game-title">{{ gameName }}</h1>
          <a 
            :href="`https://store.steampowered.com/app/${appId}`" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="visit-game-link"
          >
            <span>visit game </span>
            
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2.5" 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              class="redirect-icon"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>

        <div class="game-info-dashboard">
          <div class="stats-container">
            <div class="stat-badge current">
              <span class="label">Current Hours</span>
              <span class="value">{{ game_total_hours_played }} <small>hrs</small></span>
            </div>
            
            <div class="stat-badge main-story">
              <span class="label">Main Story</span>
              <span class="value">{{ game_main_story }} <small>hrs</small></span>
            </div>
            
            <div class="stat-badge completionist">
              <span class="label">Completionist</span>
              <span class="value">{{ game_completionist }} <small>hrs</small></span>
            </div>

            <div class="stat-badge achievements-pill">
              <span class="label">Achievements</span>
              <span class="value">
                  {{ game_achievement_gained }}/{{ game_achievement_total }}
              </span>
            </div>
          </div>

          <div class="game-genres-row" v-if="displayedGenres && displayedGenres.length > 0">
            <span 
              v-for="genre in displayedGenres" 
              :key="genre" 
              class="genre-bubble"
            >
              {{ genre }}
            </span>
          </div>
        </div>
      </div>

      <div class="session-view-wrapper" v-if="activeUserId">
        <SessionView :steam-id="activeUserId" :gameId="gameId"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import SessionView from './SessionView.vue'; 

const route = useRoute();

const gameName = ref<string>('Loading game...');
const appId = ref<string | number>('');
const game_recent_hours_played = ref<number | null>(null);
const game_total_hours_played = ref<number | null>(null);
const game_main_story = ref<string | null>(null);
const game_completionist = ref<string | null>(null);
const game_achievement_gained = ref<number | null>(null);
const game_achievement_total = ref<number | null>(null);
const game_genres = ref<string[]>([]);
const gameIcon = ref<string | null>(null);
const isExpanded = ref(false);

const activeUserId = computed(() => (route.params.userId || route.params.steamId) as string);
const gameId = computed(() => (route.params.id) as string).value;

onMounted(async () => {
  window.scrollTo({ top: 0, behavior: 'instant' });
  
  const userId = activeUserId.value;
  const steamAppid = route.params.id as string;

  if (!userId || !steamAppid) return;

  try {
    const { data } = await axios.get(`http://localhost:3000/api/users/${userId}/game/${steamAppid}`);

    // console.log("GMAEID" + gameId.value)
    
    if (data.success && data.gameInfo) {
      const info = data.gameInfo;
      const catalog = info.gameCatalog || {};

      gameName.value = catalog.name || 'Unknown Game';
      appId.value = String(info.steamAppid);
      game_recent_hours_played.value = info.recentHoursPlayed || 0;
      game_total_hours_played.value = info.totalHoursPlayed || 0;
      game_main_story.value = catalog.mainStory || 'N/A';
      game_completionist.value = catalog.completionist || 'N/A';

      game_achievement_gained.value = info.achievements?.unlocked ?? 0;
      game_achievement_total.value = info.achievements?.total ?? 0;

      game_genres.value = catalog.genres || [];
      game_total_hours_played.value = Number((info.totalHoursPlayed || 0).toFixed(1));

      gameIcon.value = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${info.steamAppid}/library_hero.jpg` || catalog.logoUrl;
    }
  } catch (err) {
    console.error('Failed to fetch game details info:', err);
  }
});

const displayedGenres = computed(() => {
  if (isExpanded.value) {
    return game_genres.value;
  }
  return game_genres.value;
});
</script>

<style scoped>
.game-info-container {
  padding: 80px 40px; 
  min-height: 100vh;
  width: 100%;
  position: relative; 
  background-color: #0b111a; 
  overflow-x: hidden;
  z-index: 1; 
}

.game-info-container::before {
  content: "";
  position: fixed; 
  top: 0; 
  left: 0; 
  width: 100vw;
  height: 100vh;
  
  background-image: var(--dynamic-bg-url);
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  
  opacity: 0.15;           
  z-index: -1; 
}

.visit-game-link {
  display: inline-block;
  color: #66c0f4;
  text-decoration: none;
  
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-style: italic;
  letter-spacing: 0.5px;
  font-size: 1.1rem;
  
  margin-top: 8px;
  transition: color 0.2s ease, text-shadow 0.2s ease;
}

.visit-game-link:hover {
  color: #c7e7fe;
  text-shadow: 0 0 8px rgba(102, 192, 244, 0.5);
}

.redirect-icon {
  width: 14px;
  height: 14px;
  transform: translateY(-1px); 
}

.game-content-wrapper {
  color: white;
  z-index: 10; 
}

.game-header-row {
  margin-bottom: 40px;
}

.game-title {
  font-size: 3rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: -1px;
  margin: 0;
  line-height: 1.1;
}

.game-info-dashboard {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px; 
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.stats-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  width: 100%;
  margin: 20px auto;
}

.stat-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 120px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-top: 4px solid #fff;
  border-radius: 4px;
}

.stat-badge.current {
  border-color: #38bdf8;
  background: linear-gradient(180deg, rgba(56, 189, 248, 0.08) 0%, transparent 100%);
}
.stat-badge.main-story {
  border-color: #fb923c;
  background: linear-gradient(180deg, rgba(251, 146, 60, 0.08) 0%, transparent 100%);
}
.stat-badge.completionist {
  border-color: #a855f7;
  background: linear-gradient(180deg, rgba(168, 85, 247, 0.08) 0%, transparent 100%);
}
.stat-badge.achievements-pill {
  border-color: #10b981;
  background: linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, transparent 100%);
}

.label {
  font-size: 0.95rem;
  color: #9ca3af;
}

.value {
  font-family: 'Courier New', Courier, monospace;
  font-size: 1.2rem;
  font-weight: bold;
  color: #f3f4f6;
}

.value small {
  font-size: 0.8rem;
  color: #6b7280;
}

.game-genres-row {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
  margin-top: -8px; 
  padding-bottom: 8px;
}

.navigation-top-bar {
  width: 100%;
  max-width: none;   
  margin: 0 0 20px 0;                  
  display: flex;
  justify-content: flex-start; 
  padding: 0 40px;       
  box-sizing: border-box;
}

.breadcrumb-back {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.3) !important;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s ease;
}

.arrow-sym {
  color: inherit;
  font-size: 14px;
}

.breadcrumb-back:hover {
  color: #38bdf8 !important;
}

.genre-bubble {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #e0f2fe; 
  background: rgba(56, 189, 248, 0.1); 
  padding: 6px 14px;
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 6px; 
  backdrop-filter: blur(4px);
  cursor: default;
  transition: all 0.3s ease;
}

.genre-bubble:hover {
  background: rgba(56, 189, 248, 0.2);
  border-color: rgba(56, 189, 248, 0.5);
  transform: translateY(-2px);
}

/* 📊 Session View Style Container */
.session-view-wrapper {
  width: 100%;
  margin-top: 40px;
}
</style>