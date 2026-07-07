<template>
  <div class="profile-header">
    <h1 class="welcome-text">
      Welcome<br />
      <span class="player-name">{{ playerName }}</span>
    </h1>
    <div class="info-row">
      <img :src="profilePicture" alt="Steam Profile Picture" class="profile-pic" />
      <!-- <div>joined {{ joinDate }}</div> -->
      <div class="level-badge">
        <span class="level-label">LEVEL</span>
        <span class="profile-level">{{ level }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";

const props = defineProps<{
  profilePicture: string | null | undefined;
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

.level-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 2px solid white;
  padding: 10px 16px;
  border-radius: 6px;
  margin-top: 8px;
}

.level-label {
  font-size: 0.9rem;
  color: #888;
  text-transform: uppercase;
}

.profile-level {
  font-size: 1.8rem;
  font-weight: bold;
  color: #f1c40f;
}
</style>