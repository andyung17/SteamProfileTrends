<template>
  
<div 
  class="game-info-container" 
  :style="{ '--dynamic-bg-url': gameIcon ? `url(${gameIcon})` : 'none' }"
>
<div class="navigation-top-bar">
    <span class="breadcrumb-back" @click="$router.back()">
      <span class="arrow-sym">&larr;</span> Return to Dashboard
    </span>
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
            <span class="value">{{ game_achievement_percentage }}%</span>
          </div>
        </div>

        <div class="game-genres-row" v-if="game_genres && game_genres.length > 0">
          <span 
            v-for="genre in game_genres" 
            :key="genre" 
            class="genre-bubble"
          >
            {{ genre }}
          </span>
        </div>
      </div>

    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const gameName = ref<string>('Loading game...');
const appId = ref<string | number>('');
const game_recent_hours_played = ref<number | null>(null);
const game_total_hours_played = ref<number | null>(null);
const game_main_story = ref<string | null>(null);
const game_completionist = ref<string | null>(null);
const game_achievement_percentage = ref<number | null>(null);
const game_genres = ref<string[]>([]);
const gameIcon = ref<string | null>(null);

onMounted(() => {

  window.scrollTo({ top: 0, behavior: 'instant' });

if (history.state?.gameData) {
    const game = history.state.gameData;
    
    gameName.value = game.name;   
    appId.value = game.steam_appid;
    game_recent_hours_played.value = game.recent_hoursPlayed;
    game_total_hours_played.value = game.total_hoursPlayed; 
    game_main_story.value = game.main_story; 
    game_completionist.value = game.completionist;
    game_achievement_percentage.value = game.achievements?.percentage ?? 0;
    game_genres.value = game.genres || [];  
    gameIcon.value = game.icon_url?.replace('header.jpg', 'library_hero.jpg');
    
  } else {
    appId.value = route.params.id as string;
  }

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
  margin-bottom: 30px;
}

.game-title {
  font-size: 3rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: -1px;
  margin: 0;
  line-height: 1.1;
}

.game-id {
  color: rgba(255, 255, 255, 0.6);
  font-family: monospace;
  font-size: 1.1rem;
  margin: 10px 0 0 0;
}

.stats-container {
  display: flex;
  flex-direction: row;
  gap: 16px;
  max-width: 600px;
  
  justify-content: center;
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

.stat-badge.achievements-pill {
  border-color: #10b981;
  background: linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, transparent 100%);
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

.genre-bubble {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.75px;
  
  color: #c7e7fe;
  
  background: rgba(92, 144, 241, 0.65); 
  
  padding: 5px 12px;
  
  border: 1px solid rgba(87, 186, 231, 0.25);
  border-radius: 20px;
  
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4),
              0 0 10px rgba(125, 211, 252, 0.05);
              
  transition: all 0.25s ease-in-out;
}

.navigation-top-bar {
  width: 100%;
  max-width: none;   
  margin: 0;            
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

</style>