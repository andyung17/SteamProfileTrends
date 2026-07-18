<template>
  <div class="recommender-dashboard-container">
    <div class="genres-analytics-block">
      <h3 class="analytics-title">Recent Top Genres</h3>
      <div class="game-genres-row-centered" v-if="topUserGenres.length > 0">
        <!-- Pass the loop index directly to the color styling logic -->
        <span 
          v-for="(genre, index) in topUserGenres" 
          :key="genre.name" 
          class="genre-bubble-dynamic"
          :style="getGenreStyleByIndex(index)"
        >
          <span class="genre-text-name">{{ genre.name }}</span>
          
        <span class="genre-hours-badge">
          {{ genre.totalHours.toFixed(1) }} hrs
        </span>
        </span>
      </div>
      <div class="no-genres-fallback" v-else>
        Loading dynamic genre analytics...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

interface GenreData {
  name: string;
  totalHours: number;
}

const route = useRoute();
const topUserGenres = ref<GenreData[]>([]);

onMounted(async () => {
  const userId = route.params.userId || route.params.steamId;

  if (!userId) {
    console.error("No valid user ID identifier extracted from the current path parameter context.");
    return;
  }

  try {
    const { data } = await axios.get(`http://localhost:3000/api/users/${userId}/tags`);
    
    if (data.success && Array.isArray(data.genres)) {
      topUserGenres.value = data.genres;
    }
  } catch (err) {
    console.error("Failed to compile user genre dashboard tags:", err);
  }
});

// 🎨 Maps preset color variations directly by index order (0 through 4)
const getGenreStyleByIndex = (index: number) => {
  const colors = [
    {
      bg: 'rgba(56, 189, 248, 0.15)',    /* Rank 1: Neon Blue */
      border: 'rgba(56, 189, 248, 0.4)',
      text: '#38bdf8'
    },
    {
      bg: 'rgba(249, 115, 22, 0.15)',    /* Rank 2: Warm Orange */
      border: 'rgba(249, 115, 22, 0.4)',
      text: '#f97316'
    },
    {
      bg: 'rgba(168, 85, 247, 0.15)',   /* Rank 3: Bright Purple */
      border: 'rgba(168, 85, 247, 0.4)',
      text: '#a855f7'
    },
    {
      bg: 'rgba(52, 211, 153, 0.15)',    /* Rank 4: Mint Green */
      border: 'rgba(52, 211, 153, 0.4)',
      text: '#34d399'
    },
    {
      bg: 'rgba(239, 68, 68, 0.15)',     /* Rank 5: Crimson Red */
      border: 'rgba(239, 68, 68, 0.4)',
      text: '#ef4444'
    }
  ];

  // Safeguard array matching for anything past top 5
  const choice = colors[index] || {
    bg: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.2)',
    text: '#ffffff'
  };

  return {
    backgroundColor: choice.bg,
    borderColor: choice.border,
    color: choice.text,
    boxShadow: `0 0 10px ${choice.bg}`
  };
};
</script>

<style scoped>
/* ✨ Fixed Spacing Container */
.genres-analytics-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  text-align: center;
  padding-top: 32px; /* Smooth padding downward from the page root border */
  margin-top: 10px;
}

.analytics-title {
  font-family: 'Inter', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0;
}

.game-genres-row-centered {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 20px;
  width: 100%;
}

.genre-bubble-dynamic {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 6px 14px 6px 16px;
  border: 1px solid;       
  border-radius: 20px;     
  backdrop-filter: blur(4px);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  user-select: none;
}

.genre-bubble-dynamic:hover {
  transform: translateY(-2px);
}

.genre-text-name {
  color: inherit;
}

.genre-hours-badge {
  font-size: 10px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.08);
  padding: 2px 8px;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.5px;
}

.no-genres-fallback {
  color: #64748b;
  font-style: italic;
  margin-top: 16px;
  font-size: 0.9rem;
}
</style>