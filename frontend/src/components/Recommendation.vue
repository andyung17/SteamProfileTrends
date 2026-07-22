<template>
  <div class="recommender-dashboard-container">
    <div class="genres-analytics-block">
      <h3 class="analytics-title">Recent Top Genres</h3>
      <div class="game-genres-row-centered" v-if="topUserGenres.length > 0">
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

    <div class="filters-card-homepage">
      <h3 class="card-title">Filter Recommendations</h3>

      <div class="filters-grid">
        <div class="filter-group">
          <div class="filter-header">
            <label class="filter-label">RELEASE DATE</label>
            <span class="filter-value text-blue">{{ releaseDateLabels[filters.releaseDate] }}</span>
          </div>
          <div class="slider-container">
            <input
              type="range"
              min="0"
              max="3"
              step="1"
              v-model.number="filters.releaseDate"
              class="sleek-slider blue-slider"
              :style="{ '--fill-percent': (filters.releaseDate / 3) * 100 + '%' }"
            />
          </div>
          <div class="ticks-labels">
            <span>Any</span>
            <span>New</span>
            <span>&lt;5 Years</span>
            <span>10+ Years</span>
          </div>
        </div>
        <div class="filter-group">
          <div class="filter-header">
            <label class="filter-label">MAX PRICE</label>
            <span class="filter-value text-blue">{{ priceLabels[filters.price] }}</span>
          </div>
          <div class="slider-container">
            <input
              type="range"
              min="0"
              max="3"
              step="1"
              v-model.number="filters.price"
              class="sleek-slider blue-slider"
              :style="{ '--fill-percent': (filters.price / 3) * 100 + '%' }"
            />
          </div>
          <div class="ticks-labels">
            <span>$0 - $10</span>
            <span>$10 - $20</span>
            <span>$20 - $30</span>
            <span>$30+</span>
          </div>
        </div>

        <div class="filter-group">
          <div class="filter-header">
            <label class="filter-label">MIN STEAM REVIEW</label>
            <span 
              class="filter-value" 
              :style="{ color: getReviewColor(filters.minReview) }"
            >
              {{ reviewLabels[filters.minReview] }}
            </span>
          </div>
          <div class="slider-container">
            <input
              type="range"
              min="0"
              max="4"
              step="1"
              v-model.number="filters.minReview"
              class="sleek-slider dynamic-review-slider"
              :style="{ 
                '--fill-percent': (filters.minReview / 4) * 100 + '%',
                '--track-color': getReviewColor(filters.minReview)
              }"
            />
          </div>
          <div class="ticks-labels">
            <span>Negative</span>
            <span>Mixed</span>
            <span>Mostly +</span>
            <span>Positive</span>
            <span>Overwhelming +</span>
          </div>
        </div>

        <div class="filter-group">
          <div class="filter-header">
            <label class="filter-label">PLATFORMS</label>
          </div>
          <div class="platform-container">
            <div class="platform-segmented-bar">
              <button
                type="button"
                class="platform-btn"
                :class="{ active: filters.platforms.windows }"
                @click="filters.platforms.windows = !filters.platforms.windows"
              >
                <span class="platform-icon">🪟</span>
                <span>Windows</span>
              </button>

              <button
                type="button"
                class="platform-btn"
                :class="{ active: filters.platforms.linux }"
                @click="filters.platforms.linux = !filters.platforms.linux"
              >
                <span class="platform-icon">🐧</span>
                <span>Linux</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

interface GenreData {
  name: string;
  totalHours: number;
}

const route = useRoute();
const topUserGenres = ref<GenreData[]>([]);

const releaseDateLabels = ["Any Time", "New Releases", "Within 5 Years", "10+ Years"];
const priceLabels = ["$0 - $10", "$10 - $20", "$20 - $30", "$30+"];
const reviewLabels = [
  "Negative",
  "Mixed",
  "Mostly Positive",
  "Positive",
  "Overwhelmingly Positive",
];

const filters = reactive({
  releaseDate: 2,
  price: 3,
  minReview: 2,
  platforms: {
    windows: true,
    linux: false,
  },
});

const getReviewColor = (step: number) => {
  switch (step) {
    case 0:
      return '#ef4444';
    case 1:
      return '#f97316';
    case 2:
    case 3:
    case 4:
    default:
      return '#34d399';
  }
};

watch(
  filters,
  (updatedFilters) => {
    console.log("Updated filter criteria:", updatedFilters);
  },
  { deep: true }
);

onMounted(async () => {
  const userId = route.params.userId || route.params.steamId;
  if (!userId) return;

  try {
    const { data } = await axios.get(`http://localhost:3000/api/users/${userId}/tags`);
    if (data.success && Array.isArray(data.genres)) {
      topUserGenres.value = data.genres;
    }
  } catch (err) {
    console.error("Failed to compile user genre dashboard tags:", err);
  }
});

const getGenreStyleByIndex = (index: number) => {
  const colors = [
    { bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.4)', text: '#38bdf8' },
    { bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.4)', text: '#f97316' },
    { bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.4)', text: '#a855f7' },
    { bg: 'rgba(52, 211, 153, 0.15)', border: 'rgba(52, 211, 153, 0.4)', text: '#34d399' },
    { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#ef4444' }
  ];

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
.recommender-dashboard-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 32px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.genres-analytics-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  text-align: center;
  padding-top: 32px;
  margin-top: 10px;
}

.analytics-title {
  font-family: inherit;
  font-size: 1.35rem;
  font-weight: 700;
  color: #ffffff;
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
  font-family: inherit;
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
  font-family: inherit;
  font-size: 10px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.08);
  padding: 2px 8px;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.5px;
}

.no-genres-fallback {
  font-family: inherit;
  color: #64748b;
  font-style: italic;
  margin-top: 16px;
  font-size: 0.9rem;
}

.filters-card-homepage {
  background: #080e18;
  border: 1px solid #131c2d;
  border-radius: 12px;
  padding: 28px 32px;
  width: 100%;
  max-width: 900px;
  box-sizing: border-box;
}

.card-title {
  font-family: inherit;
  font-size: 1.35rem;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 28px;
  color: #ffffff;
  text-align: left;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px 48px;
  align-items: start;
}

@media (max-width: 680px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 20px;
  margin-bottom: 12px;
}

.filter-label {
  font-family: inherit;
  font-size: 11px;
  text-transform: uppercase;
  color: #5d6c82;
  letter-spacing: 0.75px;
  font-weight: 700;
}

.filter-value {
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  transition: color 0.15s ease;
}

.text-blue {
  color: #38bdf8;
}

.slider-container {
  position: relative;
  display: flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  box-sizing: border-box;
}

.sleek-slider {
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  background: linear-gradient(
    to right,
    var(--track-color) 0%,
    var(--track-color) var(--fill-percent),
    #131c2d var(--fill-percent),
    #131c2d 100%
  );
  transition: background 0.15s ease;
  margin: 0;
}

.blue-slider {
  --track-color: #38bdf8;
}

.sleek-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid var(--track-color);
  box-shadow: 0 0 8px var(--track-color);
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.sleek-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.ticks-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  padding: 0 8px;
  font-family: inherit;
  font-size: 10px;
  color: #475569;
  font-weight: 600;
}

.ticks-labels span {
  text-align: center;
  flex: 1;
}

.ticks-labels span:first-child {
  text-align: left;
}

.ticks-labels span:last-child {
  text-align: right;
}

.platform-container {
  display: flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
}

.platform-segmented-bar {
  display: flex;
  width: 100%;
  background: #04080f;
  border: 1px solid #131c2d;
  border-radius: 20px;
  padding: 3px;
  gap: 6px;
  align-items: center;
}

.platform-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 16px;
  padding: 6px 12px;
  font-family: inherit;
  color: #5d6c82;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.platform-btn:hover {
  color: #94a3b8;
}

.platform-btn.active {
  background: rgba(56, 189, 248, 0.12);
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.35);
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.15);
}

.platform-icon {
  font-size: 13px;
}
</style>