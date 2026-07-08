<template>
    <h2 class="recent-games-title">Recent Games</h2>
    <div class="recent-game-text">2 week recent activity</div>
    <div class="recent-games">
        <div v-for="game in games" :key="game.appid" class="game-row">
        <img :src="game.iconUrl" :alt="game.name" class="game-icon" />
        <span class="game-name" @click="() => handleGameClick(game)">{{ game.name }}</span>
        <span class="game-hours">{{ game.hoursPlayed }} hr</span>
        </div>
    </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const props = defineProps<{
  steamId: string;
}>();

interface RecentGame {
  appid: number;
  name: string;
  hoursPlayed: number;
  iconUrl: string;
}

const games = ref<RecentGame[]>([]);

const handleGameClick = (game: RecentGame) => {
  console.log("Sending this game object:", game);
  router.push({
    name: "GameInfo", 
    params: { name: game.name, id: game.appid }, 
    state: { gameData: { ...game } }
  });
};

onMounted(async () => {
  try {
    const { data } = await axios.get(`http://localhost:3000/api/recent-games/${props.steamId}`);
    games.value = data.games;
  } catch (err) {
    console.error('Failed to fetch recent games:', err);
  }
});
</script>

<style scoped>

.recent-games-title {
    text-align: left;
    color: white;
    font-size: 1.8rem;
    padding: 16px 24px;
    gap: 16px;
    width: 80%;
    max-width: 80%;
    font-family: 'Inter', sans-serif;
    margin: 0 auto;
}

.recent-games {
    border: 2px solid #e74c3c;
    border-radius: 8px;
    padding: 16px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 80%;
    max-width: 80%;
    margin: 0 auto;
    box-sizing: border-box;
    font-family: 'Inter', sans-serif;
}

.game-row {
    display: flex;
    align-items: center;
    gap: 16px;
    font-family: 'Inter', sans-serif;
}

.game-icon {
  width: 80px;
  height: 38px;
  border-radius: 4px;
  object-fit: cover;
  font-family: 'Inter', sans-serif;
}

.game-name {
  font-size: 1.1rem;
  color: white;
  flex: 1;
  min-width: 180px;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: color 0.2s ease;
}

.game-name:hover {
  color: #42b883;
  text-decoration: underline;
}

.game-hours {
  font-size: 1rem;
  font-weight: bold;
  font-family: 'Inter', sans-serif;
  color: #f1c40f;
  min-width: 60px;
  text-align: right;
}
</style>