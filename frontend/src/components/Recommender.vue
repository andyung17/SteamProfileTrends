<template>
<div class="recommender-dashboard-container">
  
  <div class="genres-analytics-block">
    <h3 class="analytics-title">Recent Top Genres</h3>
    <div class="game-genres-row-centered">
      <span 
        v-for="genre in topUserGenres" 
        :key="genre" 
        class="genre-bubble-dynamic"
        :style="getGenreStyle(genre)"
      >
        <span class="genre-text-name">{{ genre }}</span>
        
        <span class="genre-hours-badge">
          {{ rawGenreHours[genre] ? Math.round(rawGenreHours[genre]) : 0 }} hrs
        </span>
      </span>
    </div>
  </div>

</div>

</template>

<script setup lang="ts">

import { ref, onMounted } from 'vue';

const topUserGenres = ref<string[]>([]);
const rawGenreHours = ref<Record<string, number>>({});

onMounted(() => {
    if (history.state?.genreHoursData) {
    const data = history.state.genreHoursData;
    rawGenreHours.value = data;

    topUserGenres.value = Object.keys(data)
      .sort((a, b) => data[b] - data[a])
      .slice(0, 5);
    
    console.log("Recommender successfully loaded top genres:", topUserGenres.value);
  } else {
    console.warn("No genre data found in history state. Using fallback.");
    // topUserGenres.value = ['Simulation', 'Strategy', 'Indie'];
  }

});

const getGenreStyle = (genre: string) => {

  const name = genre.toLowerCase();

  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    indie: {
      bg: 'rgba(56, 189, 248, 0.15)',    /* Neon Blue */
      border: 'rgba(56, 189, 248, 0.4)',
      text: '#38bdf8'
    },
    strategy: {
      bg: 'rgba(249, 115, 22, 0.15)',    /* Warm Orange */
      border: 'rgba(249, 115, 22, 0.4)',
      text: '#f97316'
    },
    simulation: {
      bg: 'rgba(168, 85, 247, 0.15)',   /* Bright Purple */
      border: 'rgba(168, 85, 247, 0.4)',
      text: '#a855f7'
    },
    adventure: {
      bg: 'rgba(52, 211, 153, 0.15)',    /* Mint Green */
      border: 'rgba(52, 211, 153, 0.4)',
      text: '#34d399'
    },
    action: {
      bg: 'rgba(239, 68, 68, 0.15)',     /* Crimson Red */
      border: 'rgba(239, 68, 68, 0.4)',
      text: '#ef4444'
    }
  };

  const fallback = {
    bg: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.2)',
    text: '#ffffff'
  };

  const choice = colorMap[name] || fallback;

  return {
    backgroundColor: choice.bg,
    borderColor: choice.border,
    color: choice.text,
    boxShadow: `0 0 10px ${choice.bg}`
  };
};

</script>

<style scoped>
.genres-analytics-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  text-align: center;
}

.game-genres-row-centered {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
  width: 100%;
}

.genre-bubble-dynamic {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 6px 16px;
  border: 1px solid;
  border-radius: 20px;
  backdrop-filter: blur(4px);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  user-select: none;
}

.genre-bubble-dynamic:hover {
  transform: translateY(-2px);
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

</style>