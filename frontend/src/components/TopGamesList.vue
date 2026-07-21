<template>
  <div class="top-games-section">
    <div class="section-header">
      <h2 class="section-title">Top games</h2>
      <router-link 
        :to="`/user/${route.params.steamId}/played`" 
        class="view-all-link"
      >
        View all &rarr;
      </router-link>
    </div>

    <div class="games-grid" v-if="topGames && topGames.length > 0">
      <div 
        v-for="(game, index) in topGames" 
        :key="game.gameCatalog?.steamAppid || index"
        class="game-rank-card"
        @click="navigateToGame(game.gameCatalog?.steamAppid)"
      >
        <!-- Keep rank number on top-left -->
        <span :class="['rank-number', getRankClass(index)]">
          {{ index + 1 }}
        </span>

        <!-- ⭐ Top Right Dynamic Medal Effect (Only for Ranks 1, 2, and 3) -->
        <div v-if="index < 3" :class="['medal-container', `medal-${getRankClass(index)}`]">
          <div class="medal-circle">
            <svg class="star-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          </div>
          
          <div class="star-cluster">
            <div class="twinkle-star star-a"></div> 
            <div class="twinkle-star delay-twinkle star-b"></div>
            <div class="twinkle-star star-c"></div>
          </div>
        </div>
        
        <img 
          :src="game.gameCatalog?.iconUrl || '/placeholder-icon.png'" 
          :alt="game.gameCatalog?.name" 
          class="game-icon"
        />

        <div class="game-meta">
          <span class="game-name" :title="game.gameCatalog?.name">
            {{ game.gameCatalog?.name }}
          </span>
          <span class="hours-played">
            {{ formatHours(game.totalHoursPlayed) }}
          </span>
        </div>
      </div>
    </div>
    
    <div class="no-games-fallback" v-else>
      No record data found
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

interface GameCatalog {
  steamAppid: number;
  name: string;
  iconUrl: string | null;
}

interface GameInstance {
  totalHoursPlayed: number;
  gameCatalog: GameCatalog;
}

const getRankClass = (index: number) => {
  if (index === 0) return 'rank-gold';
  if (index === 1) return 'rank-silver';
  if (index === 2) return 'rank-bronze';
  return 'rank-default';
};

const route = useRoute();
const router = useRouter();
const topGames = ref<GameInstance[]>([]);

const formatHours = (decimalHours: number): string => {
  if (!decimalHours || decimalHours <= 0) return '0h 0m';
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours}h ${minutes}m`;
};

const navigateToGame = (appid: number | undefined) => {
  if (!appid) return;
  router.push(`/user/${route.params.steamId}/game/${appid}`);
};

onMounted(async () => {
  try {
    const userId = route.params.steamId; 
    const { data } = await axios.get(`http://localhost:3000/api/users/${userId}/game`);
    
    if (data.success && Array.isArray(data.games)) {
      topGames.value = data.games.slice(0, 5);
    }
  } catch (error) {
    console.error('Failed to resolve client-side leaderboard data payload array:', error);
  }
});
</script>

<style scoped>
.top-games-section {
  width: 100%;
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 40px;
  box-sizing: border-box;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
}

.section-title {
  font-family: 'Inter', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0;
}

.view-all-link {
  font-size: 0.9rem;
  color: #38bdf8;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.view-all-link:hover {
  color: #7dd3fc;
  text-decoration: underline;
}

/* 🚀 FIX 1: Increased gap between cards from 16px to 24px */
.games-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 24px; 
  width: 100%;
}

.game-rank-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: rgba(13, 22, 38, 0.65);
  border: 1px solid rgba(56, 189, 248, 0.08);
  border-radius: 8px;
  padding: 14px;
  position: relative;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.game-rank-card:hover {
  background: rgba(20, 35, 60, 0.85);
  border-color: rgba(56, 189, 248, 0.3);
  transform: translateY(-4px);
}

/* 🚀 FIX 2: Tucked the rank number slightly inward from -8px to -4px */
.rank-number {
  position: absolute;
  top: -4px;
  left: -4px;
  width: 22px;
  height: 22px;
  background: #101f35;
  border: 2px solid #38bdf8;
  border-radius: 50%;
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 800;
  color: #38bdf8;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.rank-gold { border-color: #f5b041; color: #f5b041; }
.rank-silver { border-color: #94a3b8; color: #94a3b8; }
.rank-bronze { border-color: #b86b4c; color: #b86b4c; }

/* 🚀 FIX 3: Tucked the medal container slightly inward from -6px to -4px */
.medal-container {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 26px;
  height: 26px;
  z-index: 3;
}

.medal-circle {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  animation: shine 4s ease-in-out infinite;
}

.star-icon {
  width: 14px;
  height: 14px;
  color: whitesmoke;
}

.medal-rank-gold .medal-circle { background-color: #f5b041; }
.medal-rank-silver .medal-circle { background-color: #94a3b8; }
.medal-rank-bronze .medal-circle { background-color: #b86b4c; }

.star-cluster {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.twinkle-star {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #fff;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  animation: twinkle 2s alternate ease-in-out infinite;
}

.medal-rank-gold .twinkle-star { background: #ffe066; }
.medal-rank-silver .twinkle-star { background: #e2e8f0; }
.medal-rank-bronze .twinkle-star { background: #fcd3c1; }

.star-a { top: -4px; left: 18px; width: 5px; height: 5px; }
.star-b { top: 8px; right: -6px; width: 4px; height: 4px; }
.star-c { bottom: -2px; right: 2px; width: 4.5px; height: 4.5px; }

.delay-twinkle {
  animation-duration: 3s;
}

.game-icon {
  width: 100%;
  aspect-ratio: 460 / 215;
  height: auto;
  border-radius: 6px;
  object-fit: cover;
  background: #090d16;
  margin-bottom: 12px;
}

.game-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

.game-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: left;
}

.hours-played {
  font-size: 0.85rem;
  font-weight: 700;
  color: #34d399; 
  margin-top: 3px;
  text-align: left;
}

.no-games-fallback {
  color: #64748b;
  font-style: italic;
  padding: 20px 0;
}

/* Animations */
@keyframes shine {
  0% {
    background-image: linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 60%);
    background-size: 200% 200%;
    background-position: 100% 100%;
  }
  20%, 100% {
    background-position: 0% 0%;
  }
}

@keyframes twinkle {
  0%, 100% { transform: scale(0.8); opacity: 0.5; }
  50% { transform: scale(1.4); opacity: 1; }
}
</style>