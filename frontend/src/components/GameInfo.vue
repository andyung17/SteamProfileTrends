<template>
  <div 
    class="game-info-container" 
    :style="{ '--dynamic-bg-url': gameIcon ? `url(${gameIcon})` : 'none' }"
  >
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
            <p class="game-id">App ID: {{ appId }}</p>
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
const gameIcon = ref<string | null>(null);

onMounted(() => {

if (history.state?.gameData) {
    const game = history.state.gameData;
    
    gameName.value = game.name;   
    appId.value = game.appid; 
    gameIcon.value = game.iconUrl.replace('header.jpg', 'library_hero.jpg');
    
  } else {
    appId.value = route.params.id as string;
    gameName.value = route.params.name as string;
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
</style>