<template>
  <div class="profile-header">
    <h1 class="welcome-text">
      Welcome<br />
      <span class="player-name">{{ playerName }}</span>
    </h1>
    
    <div class="info-row">
      <div class="player-identity-group">
        <img :src="profilePicture" alt="Steam Profile Picture" class="profile-pic" />
        
        <div class="meta-badges-cluster">
          <div class="combined-meta-card" :class="{ 'is-in-game': activeSessionName }">
            
            <div class="meta-section">
              <div class="meta-item" v-if="level !== null">
                <span class="card-label">Level</span>
                <span class="card-value">{{ level }}</span>
              </div>

              <div class="meta-item" v-if="joinedDate">
                <span class="card-label">Member Since</span>
                <span class="card-value">
                  {{ new Date(joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }}
                </span>
              </div>
            </div>

            <div class="meta-divider"></div>

            <div class="meta-section session-section">
              <span class="card-label">Active Session</span>
              
              <div class="session-value-wrapper">
                <img 
                  v-if="activeSessionLogo" 
                  :src="`https://cdn.cloudflare.steamstatic.com/steam/apps/${activeSessionSnippet}/logo.png`" 
                  alt="Game Icon" 
                  class="game-session-icon" 
                />
                
                <span class="card-value session-text">
                  {{ activeSessionName || 'No active session' }}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";

const props = defineProps<{
  profilePicture?: string | null | undefined;
  steamId: string;
}>();

const profilePicture = ref<string | undefined>(undefined);
const playerName = ref<string>('');
const level = ref<number | null>(null);
const joinedDate = ref<Date | null>(null);

// Active Session State
const activeSessionName = ref<string | null>(null);
const activeSessionLogo = ref<string | null>(null);
const activeSessionSnippet = ref<string | null>(null);

onMounted(async () => {
  try {
    const { data } = await axios.get(
      `http://localhost:3000/api/users/${props.steamId}`,
    );

    const user = data.steamUser;    

    profilePicture.value = user.avatarUrl;
    playerName.value = user.displayName;
    level.value = user.level;
    joinedDate.value = user.joinDate;
  } catch (err) {
    console.error("Failed to fetch profile user:", err);
  }

  // Fetch active session info
  try {
    const { data } = await axios.get(
      `http://localhost:3000/api/user/activateSession/${props.steamId}`,
    );

    if (data.success && data.activeSession) {
      activeSessionName.value = data.activeSession.gameName;
      activeSessionLogo.value = data.activeSession.logoUrl || null;
      activeSessionSnippet.value = data.activeSession.gameId || null;
    } else {
      activeSessionName.value = null;
      activeSessionLogo.value = null;
      activeSessionSnippet.value = null
    }
  } catch (err) {
    console.error("Failed to fetch active session:", err);
    activeSessionName.value = null;
    activeSessionLogo.value = null;
    activeSessionSnippet.value = null;
  }
});
</script>

<style scoped>
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 40px;
  padding-top: 40px;
  box-sizing: border-box;
  gap: 40px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.welcome-text {
  margin: 0;
  font-family: inherit;
  font-size: 2.5rem;
  color: white;
  text-align: center;
  line-height: 1.2;
}

.player-name {
  display: block;
  font-family: inherit;
}

.info-row {
  display: flex;
  justify-content: center; 
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;    
  padding: 0 40px;    
  box-sizing: border-box;
}

.player-identity-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24px;          
}

.profile-pic {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  object-fit: cover;
  border: 3px solid #42b883;
  box-sizing: border-box;
}

.meta-badges-cluster {
  display: flex;
  flex-direction: column;
  height: 200px;
  box-sizing: border-box;
}

.combined-meta-card {
  display: flex;
  flex-direction: column;
  width: 240px; 
  height: 200px;
  box-sizing: border-box;
  
  background: rgba(10, 16, 26, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), inset 0 0 1px rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  overflow: hidden;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.combined-meta-card.is-in-game {
  animation: greenVibrateGlow 1.8s infinite ease-in-out;
}

@keyframes greenVibrateGlow {
  0% {
    border-color: #42b883;
    box-shadow: 0 0 6px rgba(66, 184, 131, 0.3), 0 4px 16px rgba(0, 0, 0, 0.4);
  }
  50% {
    border-color: #62d8a3;
    box-shadow: 0 0 16px rgba(66, 184, 131, 0.7), 0 0 28px rgba(66, 184, 131, 0.3), 0 4px 16px rgba(0, 0, 0, 0.4);
  }
  100% {
    border-color: #42b883;
    box-shadow: 0 0 6px rgba(66, 184, 131, 0.3), 0 4px 16px rgba(0, 0, 0, 0.4);
  }
}

.meta-section {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  padding: 12px 16px;
  gap: 8px;
}

.meta-item {
  display: flex;
  flex-direction: column;
}

.meta-divider {
  height: 1px;
  width: 100%;
  background: rgba(255, 255, 255, 0.06);
}

.card-label {
  font-family: inherit;
  font-size: 8px;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.75px;
  font-weight: 600;
  line-height: 1;
  margin-bottom: 2px;
  text-align: center;
}

.card-value {
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
  line-height: 1.2;
}

.session-section {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 10px 16px 12px;
  gap: 6px;
  transition: all 0.3s ease;
}

.session-value-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
}

.game-session-icon {
  width: 42px;
  height: 42px;
  border-radius: 6px;
  object-fit: contain;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background-color: rgba(0, 0, 0, 0.3);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
}

.session-text {
  font-family: inherit;
  color: #64748b;
  font-size: 13px;
  word-break: break-word;
  text-align: left;
}

.is-in-game .session-text {
  color: #42b883;
  font-weight: 700;
}
</style>