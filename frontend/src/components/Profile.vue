<template>
  <div class="profile-header">
    <h1 class="welcome-text">
      Welcome<br />
      <span class="player-name">{{ playerName }}</span>
    </h1>
    <div class="info-row">
      <img :src="profilePicture" alt="Steam Profile Picture" class="profile-pic" />
      <!-- <div>joined {{ joinDate }}</div> -->
      <div class="steam-level-badge">
        <span class="level-label">Level</span>
        <span class="level-number">{{ level }}</span>
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

onMounted(async () => {
  try {
    const { data } = await axios.get(
      `http://localhost:3000/api/profile/${props.steamId}`,
    );
    profilePicture.value = data.avatarFull;
    playerName.value = data.playerName;
    level.value = data.level;
  } catch (err) {
    console.error("Failed to fetch profile data:", err);
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
}

.welcome-text {
  margin: 0;
  font-size: 2.5rem;
  color: white;
  text-align: center;
  line-height: 1.2;
}

.player-name {
  display: block;
}

.info-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  padding: 0 30px;
  box-sizing: border-box;
}

.profile-pic {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  object-fit: cover;
  border: 3px solid #42b883;
  margin-left: 5%;
}

.steam-level-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  min-width: 64px;
  height: 64px;
  padding: 4px;
  
  background: linear-gradient(135deg, rgba(20, 28, 47, 0.8) 0%, rgba(10, 14, 23, 0.9) 100%);
  
  border: 1px solid rgba(56, 189, 248, 0.25); 
  border-radius: 8px;
  
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4),
              inset 0 0 8px rgba(56, 189, 248, 0.05);
              
  transition: all 0.3s ease;
}

.steam-level-badge:hover {
  border-color: rgba(56, 189, 248, 0.6);
  box-shadow: 0 4px 16px rgba(56, 189, 248, 0.2),
              inset 0 0 12px rgba(56, 189, 248, 0.1);
  transform: translateY(-2px);
}

/* "LEVEL" Label Style */
.level-label {
  font-size: 9px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 1px;
  font-weight: 600;
  margin-bottom: -2px;
}

.level-number {
  font-size: 22px;
  font-weight: 800;
  
  color: #eab308; 
  text-shadow: 0 2px 4px rgba(234, 179, 8, 0.3);
  font-family: 'Courier New', Courier, monospace;
}
</style>