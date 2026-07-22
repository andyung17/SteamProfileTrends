<template>
  <div class="recent-games-container">
    <h2 class="section-title">Session History</h2>
    <span class="section-subtitle">Detailed history of tracked gaming sessions</span>

    <div v-if="isLoading" class="dashboard-loader-container">
      <div class="steam-pulse-spinner"></div>
      <p class="loader-text">Synchronizing Session History & Benchmarks...</p>
    </div>

    <div v-else-if="completedSessions.length === 0" class="no-history-msg">
      Play something to add into your history.
    </div>

    <div v-else class="games-list-box">
      <div 
        v-for="session in completedSessions" 
        :key="session.id" 
        class="recent-game-row"
        @click="handleSessionClick(session)"
      >
        <div class="game-meta-group">
          <img :src="session.gameInstance?.gameCatalog?.iconUrl" :alt="session.gameInstance?.gameCatalog?.logoUrl" class="game-row-icon" />
          <span class="game-row-name">{{ session.gameInstance?.gameCatalog?.name || 'Unknown Game' }}</span>
        </div>

        <div class="game-metrics-group">
          <div class="mini-badge main-story">
            <span class="mini-val">{{ formatDate(session.endAt) }}</span>
            <span class="mini-lbl">Date Played</span>
          </div>

          <div class="mini-badge achievements">
            <span class="mini-val">{{ session.totalDuration }}</span>
            <span class="mini-lbl">Mins</span>
          </div>
        </div>

      </div>
    </div>
    
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const props = defineProps<{
  steamId: string;
  gameId?: string;
}>();


const sessions = ref<any[]>([]);
const isLoading = ref<boolean>(true);

const completedSessions = computed(() => {
  return sessions.value.filter(session => session.endAt && session.totalDuration);
});

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

const handleSessionClick = (session: any) => {
  const appId = session.gameInstance?.gameCatalog?.steamAppid || session.gameId;
  const currentUserId = session.userId || props.steamId; 

  router.push({
    name: "GameInfo", 
    params: { 
      userId: currentUserId, 
      id: appId 
    },
    state: { 
      sessionData: session,
      userId: currentUserId,
      steamAppid: appId
    }
  });
};

onMounted(async () => {
  isLoading.value = true;
  try {
    const userId = props.steamId || router.currentRoute.value.params.steamId || router.currentRoute.value.params.userId;
    const gameId = props.gameId;

    if (!userId) {
      console.error('Cannot fetch session history: User ID missing.');
      return;
    }

    let url = `http://localhost:3000/api/user/sessionhistory/${userId}`;

    // console.log("GAMEID " + gameId)

    if (gameId) {
      url = `http://localhost:3000/api/user/${userId}/singlesessionhistory/${gameId}`;
    }

    console.log(url)

    const { data } = await axios.get(url);
    if (data.success) {
      sessions.value = data.history;
    }
  } catch (err) {
    console.error('Failed to fetch session history:', err);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>

.recent-games-container {
  max-width: 900px;
  margin: 40px auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.section-title { font-size: 24px; color: #fff; margin-bottom: 4px; }
.section-subtitle { font-size: 12px; color: rgba(255, 255, 255, 0.4); display: block; margin-bottom: 16px; }
.games-list-box { background: rgba(10, 15, 26, 0.6); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 8px; display: flex; flex-direction: column; gap: 8px; }
.recent-game-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: rgba(255, 255, 255, 0.02); border-radius: 6px; transition: all 0.2s ease; cursor: pointer; }
.recent-game-row:hover { background: rgba(255, 255, 255, 0.05); transform: translateX(4px); }
.game-meta-group { display: flex; align-items: center; gap: 16px; }
.game-row-icon { width: 92px; height: 43px; object-fit: cover; border-radius: 4px; background: #111; }
.game-row-name { color: #fff; font-size: 16px; font-weight: 500; }
.game-metrics-group { display: flex; align-items: center; gap: 12px; }
.mini-badge { display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 70px; padding: 6px 10px; background: rgba(0, 0, 0, 0.3); border-left: 3px solid #fff; border-radius: 4px; }
.mini-badge.main-story { border-color: #fb923c; }
.mini-badge.main-story .mini-val { color: #fb923c; }
.mini-badge.achievements { border-color: #10b981; }
.mini-badge.achievements .mini-val { color: #10b981; }
.mini-val { font-size: 14px; font-weight: 700; white-space: nowrap; }
.mini-lbl { font-size: 9px; text-transform: uppercase; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.5px; margin-top: 2px; }
.dashboard-loader-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; width: 100%; }
.steam-pulse-spinner { width: 50px; height: 50px; border: 3px solid rgba(56, 189, 248, 0.1); border-top-color: #38bdf8; border-radius: 50%; animation: spin 1s cubic-bezier(0.55, 0.055, 0.675, 0.19) infinite; box-shadow: 0 0 15px rgba(56, 189, 248, 0.2); }
.loader-text { margin-top: 20px; font-size: 14px; color: rgba(255, 255, 255, 0.5); letter-spacing: 0.5px; animation: pulseText 1.8s ease-in-out infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulseText { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.9; } }

.no-history-msg {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  text-align: center;
  padding: 40px;
  background: rgba(10, 15, 26, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
</style>