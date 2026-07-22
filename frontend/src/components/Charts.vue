<template>
  <div class="dashboard-layout-wrapper" :class="{ 'lock-scroll': selectedDay }">
    <div class="dashboard-content-container">
      
      <div class="profile-section">
        <Profile :steamId="steamId" />
      </div>

      <div class="calendar-section group">
        <div class="card-glow-bg"></div>
        <div class="card-inner-bg"></div>

        <div class="card-content">
          <div class="card-header">
            <div class="header-title">
              <div class="icon-wrapper calendar-icon">
                <svg class="icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3>Past 7 Days Activity</h3>
            </div>

            <div class="header-right-badges">
              <div class="trend-badge" :class="sessionStats.weeklyPercentChange >= 0 ? 'positive' : 'negative'">
                {{ sessionStats.weeklyPercentChange >= 0 ? '+' : '' }}{{ sessionStats.weeklyPercentChange }}% vs last week
              </div>
              <span class="badge-live">
                <span class="live-dot"></span>
                Live
              </span>
            </div>
          </div>

          <div class="calendar-grid-container">
            <div 
              v-for="day in past7Days" 
              :key="day.dateKey" 
              class="calendar-day-cell"
              :class="{ 
                'today-highlight': day.isToday, 
                'has-activity': day.games.length > 0,
                'no-activity': day.games.length === 0,
                'clickable': day.games.length > 0
              }"
              @click="openDayDetails(day)"
            >
              <div class="cell-header">
                <span class="cell-date">{{ day.formattedDate }}</span>
                <span v-if="day.games.length > 0" class="activity-badge">{{ day.games.length }} {{ day.games.length === 1 ? 'game' : 'games' }}</span>
              </div>

              <div class="cell-content">
                <template v-if="day.games.length > 0">
                  <div class="duration-display-center">
                    <span class="main-duration-number">{{ formatDuration(day.totalMinutes) }}</span>
                    <span class="duration-subtext">total playtime</span>
                  </div>
                </template>
                <template v-else>
                  <span class="no-activity-text">No activity</span>
                </template>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="time-selector">
              <span>Rolling 7-day timeline</span>
            </div>
          </div>
        </div>
      </div>

      <div class="analytics-row">

        <div class="analytics-card group">
          <div class="card-glow-bg"></div>
          <div class="card-inner-bg"></div>
          <div class="card-content">
            <div class="card-header">
              <div class="header-title">
                <div class="icon-wrapper">
                  <svg class="icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3>Session Insights & Streak</h3>
              </div>
              <span class="badge-live"><span class="live-dot"></span>Active Streak: {{ sessionStats.currentStreak }}d</span>
            </div>

            <div class="metrics-grid">
              <div class="metric-box">
                <span class="metric-label">Longest Session</span>
                <span class="metric-value">{{ formatDuration(sessionStats.longestSession.minutes) }}</span>
                <span class="metric-sub">{{ sessionStats.longestSession.gameName }}</span>
              </div>
              <div class="metric-box">
                <span class="metric-label">Avg Session</span>
                <span class="metric-value">{{ formatDuration(sessionStats.avgSessionMinutes) }}</span>
                <span class="metric-sub">Across all titles</span>
              </div>
              <div class="metric-box">
                <span class="metric-label">Total Launches</span>
                <span class="metric-value">{{ sessionStats.totalLaunches }}</span>
                <span class="metric-sub">Past 30 days</span>
              </div>
            </div>

            <div class="card-footer" style="margin-top: 1rem;">
              <div class="time-selector">
                <span>Engagement metrics</span>
              </div>
            </div>
          </div>
        </div>

        <div class="analytics-card group">
          <div class="card-glow-bg"></div>
          <div class="card-inner-bg"></div>
          <div class="card-content">
            <div class="card-header">
              <div class="header-title">
                <div class="icon-wrapper secondary-icon">
                  <svg class="icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3>Peak Gaming Hours (Avg)</h3>
              </div>
              <span class="badge-live"><span class="live-dot"></span>Live</span>
            </div>

            <div class="chart-container">
              <Bar v-if="hourlyChartData" :data="hourlyChartData" :options="hourlyOptions" />
              <div v-if="!hasHourlyData" class="empty-overlay">
                <span>No Playtime Logged</span>
              </div>
            </div>

            <div class="card-footer">
              <div class="time-selector">
                <span>Time of day average distribution</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div class="analytics-row">

        <div class="analytics-card group">
          <div class="card-glow-bg"></div>
          <div class="card-inner-bg"></div>

          <div class="card-content">
            <div class="card-header">
              <div class="header-title">
                <div class="icon-wrapper">
                    <svg class="icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0-6a10 10 0 100 20 10 10 0 000-20zm0 3a7 7 0 110 14 7 7 0 010-14z" />
                    </svg>
                </div>
                <h3>Genre Breakdown (30 Days)</h3>
              </div>

              <span class="badge-live">
                <span class="live-dot"></span>
                Live
              </span>
            </div>

            <div class="chart-container">
              <Radar v-if="chartData30" :data="chartData30" :options="radarOptions" />
              
              <div v-if="!has30DayData" class="empty-overlay">
                <span>No Playtime Logged</span>
              </div>
            </div>

            <div class="card-footer">
              <div class="time-selector">
                <span>Last 30 days</span>
              </div>
              <button class="btn-details">
                View Details
                <svg class="arrow-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="analytics-card group">
          <div class="card-glow-bg"></div>
          <div class="card-inner-bg"></div>

          <div class="card-content">
            <div class="card-header">
              <div class="header-title">
                <div class="icon-wrapper secondary-icon">
                  <svg class="icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5M9 5M6 9h12a2 2 0 012 2v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5a2 2 0 012-2zm2 4v2m-1-1h2m7 0h.01M17 11h.01" />
                  </svg>
                </div>
                <h3>Most Played Games</h3>
              </div>

              <span class="badge-live">
                <span class="live-dot"></span>
                Live
              </span>
            </div>

            <div class="chart-container">
              <Pie v-if="pieChartData" :data="pieChartData" :options="pieOptions" />

              <div v-if="!hasPieData" class="empty-overlay">
                <span>No Playtime Logged</span>
              </div>
            </div>

            <div class="card-footer">
              <div class="time-selector">
                <span>Last 30 days</span>
              </div>
              <button class="btn-details">
                View Details
                <svg class="arrow-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>

    <div v-if="selectedDay" class="modal-backdrop" @click.self="closeDayDetails">
      <div class="modal-content-card">
        <div class="modal-header">
          <div>
            <h3>Activity Log</h3>
            <span class="modal-date-subtitle">{{ selectedDay.formattedDate }} • {{ formatDuration(selectedDay.totalMinutes) }} Total</span>
          </div>
          <button class="modal-close-btn" @click="closeDayDetails">&times;</button>
        </div>

        <div class="modal-games-list">
          <div v-for="game in selectedDay.games" :key="game.gameId" class="modal-game-row">
            <img :src="game.logoUrl" :alt="game.gameName" class="modal-game-logo" />
            <div class="modal-game-info">
              <span class="modal-game-name">{{ game.gameName }}</span>
              <span class="modal-game-duration">
                Session Playtime: <strong>{{ formatDuration(game.durationMinutes) }}</strong>
                <span v-if="game.timeRangeString" class="modal-time-range" style="margin-left: 0.5rem; opacity: 0.75;">
                  {{ game.timeRangeString }}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  type ChartData,
  type ChartOptions
} from 'chart.js';

import { Radar, Pie, Bar } from 'vue-chartjs';
import { useRoute } from 'vue-router';
import Profile from './Profile.vue';

const route = useRoute();

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
);

const steamId = computed(() => {
  const id = route.params.steamId || route.params.userId;
  return Array.isArray(id) ? id[0] : (id as string) || '';
});

const chartData30 = ref<ChartData<'radar'> | null>(null);
const pieChartData = ref<ChartData<'pie'> | null>(null);
const hourlyChartData = ref<ChartData<'bar'> | null>(null);

const has30DayData = ref(false);
const hasPieData = ref(false);
const hasHourlyData = ref(false);

const sessionStats = ref({
  longestSession: { gameName: 'None', minutes: 0 },
  avgSessionMinutes: 0,
  totalLaunches: 0,
  currentStreak: 0,
  weeklyPercentChange: 0
});

const DEFAULT_GENRE_LABELS = ['Action', 'RPG', 'Strategy', 'Indie', 'Adventure', 'Simulation'];

interface GameActivity {
  gameId: string;
  gameName: string;
  logoUrl: string;
  durationMinutes: number;
  timeRangeString?: string;
}

interface DayActivity {
  dateKey: string;
  formattedDate: string;
  isToday: boolean;
  games: GameActivity[];
  totalMinutes: number;
}

const past7Days = ref<DayActivity[]>([]);
const selectedDay = ref<DayActivity | null>(null);

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
};

const openDayDetails = (day: DayActivity) => {
  if (day.games.length > 0) {
    selectedDay.value = day;
  }
};

const closeDayDetails = () => {
  selectedDay.value = null;
};

const generatePast7DaysGrid = (activityData: Record<string, GameActivity[]> = {}) => {
  const days: DayActivity[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dayNum = String(d.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${dayNum}`;

    const formattedDate = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const isToday = i === 0;

    const games = activityData[dateKey] || [];
    const totalMinutes = games.reduce((acc, g) => acc + g.durationMinutes, 0);

    days.push({
      dateKey,
      formattedDate,
      isToday,
      games,
      totalMinutes
    });
  }
  return days;
};

const radarOptions: ChartOptions<'radar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context: any) => ` ${context.raw} hrs`
      }
    }
  },
  scales: {
    r: {
      suggestedMin: 0,
      suggestedMax: 10,
      angleLines: { color: 'rgba(255, 255, 255, 0.12)' },
      grid: { color: 'rgba(255, 255, 255, 0.08)' },
      pointLabels: {
        color: '#94a3b8',
        font: { size: 10, weight: 500 }
      },
      ticks: {
        display: false,
        backdropColor: 'transparent'
      }
    }
  }
};

const pieOptions: ChartOptions<'pie'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      labels: {
        color: '#cbd5e1',
        font: { 
          size: 12,
          weight: 500 
        },
        boxWidth: 10,
        boxHeight: 10,
        usePointStyle: true,
        padding: 12
      }
    },
    tooltip: {
      callbacks: {
        label: (context: any) => ` ${context.label}: ${context.raw}%`
      }
    }
  }
};

const hourlyOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context: any) => ` Avg: ${context.raw} hrs`
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { 
        color: '#94a3b8', 
        font: { size: 9 },
        maxRotation: 15,
        minRotation: 0
      }
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { color: '#94a3b8', font: { size: 10 }, display: false }
    }
  }
};

const PIE_SLICE_COLORS = [
  '#a855f7',
  '#3b82f6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#64748b'
];

const TIME_BLOCK_LABELS = ['06:00 - 12:00', '12:00 - 17:00', '17:00 - 22:00', '22:00 - 06:00'];

function createRadarDataset(radarPayload: any) {
  const isAvailable = radarPayload && radarPayload.labels && radarPayload.labels.length > 0;

  if (isAvailable) {
    return {
      hasData: true,
      chartData: {
        labels: radarPayload.labels,
        datasets: [{
          label: 'Hours Played',
          data: radarPayload.series,
          backgroundColor: 'rgba(168, 85, 247, 0.25)',
          borderColor: '#a855f7',
          pointBackgroundColor: '#a855f7',
          pointBorderColor: '#ffffff',
          borderWidth: 2,
          pointRadius: 3
        }]
      }
    };
  }

  return {
    hasData: false,
    chartData: {
      labels: DEFAULT_GENRE_LABELS,
      datasets: [{
        label: 'No Playtime',
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(255, 255, 255, 0.01)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        pointBackgroundColor: 'transparent',
        pointBorderColor: 'transparent',
        borderWidth: 1,
        pointRadius: 0
      }]
    }
  };
}

function createPieDataset(topGamesPayload: any) {
  const isAvailable = topGamesPayload && topGamesPayload.labels && topGamesPayload.labels.length > 0;

  if (isAvailable) {
    return {
      hasData: true,
      chartData: {
        labels: topGamesPayload.labels,
        datasets: [{
          data: topGamesPayload.seriesPercentages,
          backgroundColor: PIE_SLICE_COLORS.slice(0, topGamesPayload.labels.length),
          borderColor: '#020617',
          borderWidth: 2
        }]
      }
    };
  }

  return {
    hasData: false,
    chartData: {
      labels: ['No Data'],
      datasets: [{
        data: [100],
        backgroundColor: ['rgba(255, 255, 255, 0.05)'],
        borderColor: '#020617',
        borderWidth: 1
      }]
    }
  };
}

function createHourlyDataset(hourlyPayload: any) {
  const isAvailable = hourlyPayload && hourlyPayload.length > 0;

  if (isAvailable) {
    return {
      hasData: true,
      chartData: {
        labels: TIME_BLOCK_LABELS,
        datasets: [{
          data: hourlyPayload,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: '#3b82f6',
          borderWidth: 1,
          borderRadius: 4
        }]
      }
    };
  }

  return {
    hasData: false,
    chartData: {
      labels: TIME_BLOCK_LABELS,
      datasets: [{
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderRadius: 4
      }]
    }
  };
}

onMounted(async () => {
  past7Days.value = generatePast7DaysGrid();

  try {
    const res = await fetch(`http://localhost:3000/api/playTimeCheck/${steamId.value}?days=30`);
    const data = await res.json();

    const formattedRadar = createRadarDataset(data.radarChartData);
    chartData30.value = formattedRadar.chartData as any;
    has30DayData.value = formattedRadar.hasData;

    const formattedPie = createPieDataset(data.topGamesChartData);
    pieChartData.value = formattedPie.chartData as any;
    hasPieData.value = formattedPie.hasData;

    const formattedHourly = createHourlyDataset(data.peakHoursSeries);
    hourlyChartData.value = formattedHourly.chartData as any;
    hasHourlyData.value = formattedHourly.hasData;

    if (data && data.activityMap) {
      past7Days.value = generatePast7DaysGrid(data.activityMap);
    }

    if (data && data.sessionStats) {
      sessionStats.value = data.sessionStats;
    }

  } catch (error) {
    console.error('Failed to fetch analytics payload:', error);

    const fallbackRadar = createRadarDataset(null);
    const fallbackPie = createPieDataset(null);
    const fallbackHourly = createHourlyDataset(null);

    chartData30.value = fallbackRadar.chartData as any;
    pieChartData.value = fallbackPie.chartData as any;
    hourlyChartData.value = fallbackHourly.chartData as any;
  }
});
</script>

<style scoped>
.dashboard-layout-wrapper {
  min-height: 100vh;
  width: 100vw; 
  position: absolute;
  top: 0;
  left: 0;
  
  background-image:
    linear-gradient(rgba(15, 17, 23, 0.85), rgba(15, 17, 23, 0.85)),
    url('/deep-sea-steam.gif');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  
  padding: 40px 0;
  box-sizing: border-box;
}

.dashboard-layout-wrapper.lock-scroll {
  height: 100vh;
  overflow: hidden;
}

.dashboard-content-container {
  max-width: 1200px;
  width: 90%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
}

.profile-section {
  width: 100%;
  display: flex;
  justify-content: center;
}

.calendar-section {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  border-radius: 0.875rem;
  background-color: #020617;
  padding: 1.25rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
  box-sizing: border-box;
}

.calendar-icon {
  background: linear-gradient(to bottom right, #10b981, #06b6d4);
}

.calendar-grid-container {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
  width: 100%;
  margin-bottom: 1rem;
}

@media (max-width: 1024px) {
  .calendar-grid-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .calendar-grid-container {
    grid-template-columns: 1fr;
  }
}

.calendar-day-cell {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
  min-height: 110px;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.calendar-day-cell.no-activity {
  opacity: 0.5;
}

.calendar-day-cell.no-activity:hover {
  opacity: 0.8;
  border-color: rgba(255, 255, 255, 0.08);
}

.calendar-day-cell.today-highlight {
  border-color: #42b883;
  background: rgba(66, 184, 131, 0.05);
  box-shadow: 0 0 10px rgba(66, 184, 131, 0.15);
}

.calendar-day-cell.has-activity {
  background: rgba(15, 23, 42, 0.9);
  border-color: rgba(255, 255, 255, 0.1);
}

.calendar-day-cell.clickable {
  cursor: pointer;
}

.calendar-day-cell.clickable:hover {
  border-color: #38bdf8;
  transform: translateY(-2px);
}

.cell-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cell-date {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.today-highlight .cell-date {
  color: #42b883;
}

.activity-badge {
  font-size: 9px;
  font-weight: 600;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.cell-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.duration-display-center {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.main-duration-number {
  font-size: 1.15rem;
  font-weight: 700;
  color: #38bdf8;
  letter-spacing: -0.5px;
}

.duration-subtext {
  font-size: 10px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.no-activity-text {
  font-size: 11px;
  color: #475569;
  font-style: italic;
  margin: auto;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content-card {
  background: #020617;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  width: 100%;
  max-width: 450px;
  padding: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-sizing: border-box;
  animation: modalScaleIn 0.2s ease forwards;
}

@keyframes modalScaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.75rem;
}

.modal-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
}

.modal-date-subtitle {
  font-size: 0.75rem;
  color: #38bdf8;
  font-weight: 500;
}

.modal-close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  transition: color 0.2s;
}

.modal-close-btn:hover {
  color: #ffffff;
}

.modal-games-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  padding-right: 4px;
}

.modal-game-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0.75rem;
  border-radius: 8px;
  box-sizing: border-box;
  width: 100%;
}

.modal-game-logo {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  object-fit: cover;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-game-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  flex: 1;
  min-width: 0;
}

.modal-game-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #f8fafc;
}

.modal-game-duration {
  font-size: 0.75rem;
  color: #94a3b8;
}

.modal-game-duration strong {
  color: #cbd5e1;
}

.analytics-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  width: 100%;
}

.analytics-card {
  position: relative;
  display: flex;
  flex: 1 1 450px;
  max-width: 550px;
  flex-direction: column;
  border-radius: 0.875rem;
  background-color: #020617;
  padding: 1.25rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
}

.analytics-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.25);
}

.card-glow-bg {
  position: absolute;
  inset: 0;
  border-radius: 0.75rem;
  background: linear-gradient(to right, #6366f1, #a855f7, #ec4899);
  opacity: 0.2;
  filter: blur(4px);
  transition: opacity 300ms ease;
}

.card-inner-bg {
  position: absolute;
  inset: 1px;
  border-radius: 11px;
  background-color: #020617;
}

.card-content {
  position: relative;
  z-index: 1;
}

.card-header {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-right-badges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-title h3 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
}

.icon-wrapper {
  display: flex;
  height: 2rem;
  width: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background: linear-gradient(to bottom right, #6366f1, #a855f7);
}

.icon-wrapper.secondary-icon {
  background: linear-gradient(to bottom right, #3b82f6, #06b6d4);
}

.icon-svg {
  height: 1rem;
  width: 1rem;
  color: #ffffff;
}

.badge-live {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: 9999px;
  background-color: rgba(16, 185, 129, 0.1);
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #10b981;
}

.live-dot {
  height: 0.375rem;
  width: 0.375rem;
  border-radius: 9999px;
  background-color: #10b981;
}

.trend-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
}

.trend-badge.positive {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.trend-badge.negative {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  height: 280px;
  box-sizing: border-box;
  align-content: center;
}

.metric-box {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 0.35rem;
}

.metric-label {
  font-size: 0.7rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #38bdf8;
}

.metric-sub {
  font-size: 0.65rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.chart-container {
  position: relative;
  margin-bottom: 1rem;
  height: 280px;
  width: 100%;
  border-radius: 0.5rem;
  background-color: rgba(15, 23, 42, 0.5);
  padding: 0.75rem;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  background: radial-gradient(circle, rgba(2, 6, 23, 0.6) 0%, rgba(2, 6, 23, 0) 70%);
}

.empty-overlay span {
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: rgba(15, 23, 42, 0.8);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.time-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #94a3b8;
}

.btn-details {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border: none;
  border-radius: 0.5rem;
  background: linear-gradient(to right, #6366f1, #a855f7);
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #ffffff;
  cursor: pointer;
  transition: all 300ms ease;
}

.btn-details:hover {
  background: linear-gradient(to right, #4f46e5, #9333ea);
}

.arrow-icon {
  height: 0.75rem;
  width: 0.75rem;
}

@media (max-width: 850px) {
  .dashboard-content-container {
    flex-direction: column;
    align-items: center;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
    height: auto;
  }
}
</style>