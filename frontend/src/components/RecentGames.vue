<template>
  <div class="recent-games-container">
    <h2 class="section-title">Recent Games</h2>
    <span class="section-subtitle">2 week recent activity</span>

    <div v-if="isLoading" class="dashboard-loader-container">
      <div class="steam-pulse-spinner"></div>
      <p class="loader-text">Synchronizing Steam Profile & HLTB Benchmarks...</p>
    </div>

    <div v-else class="games-list-box">
      <div 
        v-for="game in games" 
        :key="game.steam_appid" 
        class="recent-game-row"
        @click="handleGameClick(game)"
      >
        <div class="game-meta-group">
          <img :src="game.iconUrl" :alt="game.name" class="game-row-icon" />
          <span class="game-row-name">{{ game.name }}</span>
        </div>

        <div class="game-metrics-group">
          <div class="mini-badge hours">
            <span class="mini-val">{{ game.recent_hoursPlayed }}</span>
            <span class="mini-lbl">hrs</span>
          </div>

          <div class="mini-badge main-story">
            <span class="mini-val">{{ game.main_story || 'N/A' }} hrs</span>
            <span class="mini-lbl">main story</span>
          </div>

          <div class="mini-badge completionist">
            <span class="mini-val">{{ game.completionist || 'N/A' }} hrs</span>
            <span class="mini-lbl">Completionist</span>
          </div>

          <div class="mini-badge achievements">
            <span class="mini-val">
              {{ !game.achievements?.total ? 'N/A' : (game.achievements?.percentage ?? 0) + '%' }}
            </span>
            <span class="mini-lbl">Achievements</span>
          </div>
        </div>

      </div>
    </div>
    
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import type { GameInformation } from '../types/game';
import { toRaw } from 'vue';

const router = useRouter();
const props = defineProps<{
  steamId: string;
}>();

const games = ref<GameInformation[]>([]);
const isLoading = ref<boolean>(true);

const handleGameClick = (game: GameInformation) => {
  console.log("Game clicked successfully!", game);

  const gameDataToSend = {
      name: game.name,
      steam_appid: game.steam_appid,
      recent_hoursPlayed: game.recent_hoursPlayed,
      total_hoursPlayed: game.total_hoursPlayed,
      main_story: game.main_story ?? 'N/A',
      completionist: game.completionist ?? 'N/A',
      achievements: game.achievements ? toRaw(game.achievements) : { unlocked: 0, total: 0, percentage: 0 },
      iconUrl: game.iconUrl,
      genres: game.genres ? toRaw(game.genres) : []
  };

  router.push({
    name: "GameInfo", 
    params: { id: game.steam_appid },
    state: { gameData: gameDataToSend }
  });
};

onMounted(async () => {

  isLoading.value = true;

  try {
    const { data } = await axios.get(`http://localhost:3000/api/recent-games/${props.steamId}`);
    
    games.value = data.games.map((game: any) => ({
      steam_appid: game.steam_appid || game.appid || game.appId,
      name: game.name,
      recent_hoursPlayed: game.recent_hoursPlayed !== undefined ? game.recent_hoursPlayed : game.hoursplayed,
      total_hoursPlayed: game.total_hoursPlayed !== undefined ? game.total_hoursPlayed : game.hoursplayed,
      iconUrl: game.iconUrl || game.iconurl,
      main_story: null,
      completionist: null
    }));

    await Promise.all(
      games.value.map(async (game) => {
              
              // Fetch HLTB Times safely
              try {
                const hltbRes = await axios.get(`http://localhost:3000/api/game-details/${encodeURIComponent(game.name)}`);
                game.main_story = hltbRes.data?.main_story ?? 'N/A';
                game.completionist = hltbRes.data?.completionist ?? 'N/A';
              } catch (hltbErr) {
                console.error(`HLTB bypass for ${game.name}:`, hltbErr);
                game.main_story = 'N/A';
                game.completionist = 'N/A';
              }

              // Fetch Achievements safely
              try {
                const achRes = await axios.get(
                  `http://localhost:3000/api/game-achievements/${game.steam_appid}?steamId=${props.steamId}`
                );
                game.achievements = {
                  unlocked: achRes.data.unlockedCount,
                  total: achRes.data.totalCount,
                  percentage: achRes.data.percentage
                }
              } catch (achErr) {
                console.error(`Achievements bypass for ${game.name}:`, achErr);
                // Defaults are already set to 0 in the map above
              }

              try {
                const genreRes = await axios.get(`http://localhost:3000/api/game-genres/${game.steam_appid}`);
                if (genreRes.data.success) {
                  console.log(`Genres fetched for ${game.name}:`, genreRes.data.genres);
                  game.genres = genreRes.data.genres; 
                }
              } catch (err) {
                console.error("Failed loading genres", err);
              }
              
            })
      
    );

  } catch (err) {
    console.error('Failed to fetch recent games:', err);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.recent-games-container {
  max-width: 900px;
  margin: 40px auto;
  font-family: sans-serif;
}

.section-title {
  font-size: 24px;
  color: #fff;
  margin-bottom: 4px;
}

.section-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  display: block;
  margin-bottom: 16px;
}

.games-list-box {
  background: rgba(10, 15, 26, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recent-game-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 6px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.recent-game-row:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(4px);
}

.game-meta-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.game-row-icon {
  width: 92px;
  height: 43px;
  object-fit: cover;
  border-radius: 4px;
  background: #111;
}

.game-row-name {
  color: #fff;
  font-size: 16px;
  font-weight: 500;
}

.game-metrics-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mini-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 70px;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.3);
  border-left: 3px solid #fff;
  border-radius: 4px;
}

.mini-badge.hours {
  border-color: #38bdf8; /* Blue */
}
.mini-badge.hours .mini-val { color: #38bdf8; }

.mini-badge.main-story {
  border-color: #fb923c; /* Orange */
}
.mini-badge.main-story .mini-val { color: #fb923c; }

.mini-badge.completionist {
  border-color: #c084fc; /* Purple */
}
.mini-badge.completionist .mini-val { color: #c084fc; }

.mini-badge.achievements {
  border-color: #10b981; /* Emerald Green */
}
.mini-badge.achievements .mini-val { color: #10b981; }

.mini-val {
  font-size: 14px;
  font-weight: 700;
}

.mini-lbl {
  font-size: 9px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.5px;
  margin-top: 2px;
}

.dashboard-loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  width: 100%;
}

.steam-pulse-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(56, 189, 248, 0.1);
  border-top-color: #38bdf8;
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.55, 0.055, 0.675, 0.19) infinite;
  
  box-shadow: 0 0 15px rgba(56, 189, 248, 0.2);
}

.loader-text {
  margin-top: 20px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.5px;
  animation: pulseText 1.8s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulseText {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.9;
  }
}

</style>