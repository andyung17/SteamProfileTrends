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
          <!-- Steam Level Ring -->
          
          <div class="steam-level-badge">
            <span class="level-label">Level</span>
            <span class="level-number">{{ level }}</span>
          </div>
          <div class="joined-date-card" v-if="joinedDate">
            <span class="card-label">Member Since</span>
            <span class="card-value">
              {{ new Date(joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }}
            </span>
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

.player-identity-group {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 24px;            
}

.profile-pic {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  object-fit: cover;
  border: 3px solid #42b883;
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
  
  width: 58px;
  height: 58px;
  
  background: #101822;
  border: 3px solid #eab308;
  border-radius: 50%;
  
  box-shadow: 0 0 12px rgba(234, 179, 8, 0.25),
              inset 0 0 8px rgba(0, 0, 0, 0.8);
  
  padding: 0; 
  margin: 0;
  
  transition: transform 0.2s ease;
}

.level-label {
  font-size: 8px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.5px;
  font-weight: 700;
  margin: 0 0 -1px 0;
  line-height: 1;
}
.level-number {
  font-size: 16px;
  font-weight: 800;
  color: #ffffff; 
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  font-family: 'Inter', sans-serif;
  line-height: 1.1;
  margin: 0;
}

.meta-badges-cluster {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 12px;
  height: 200px;
  box-sizing: border-box;
}

.joined-date-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  
  width: 130px;
  height: 54px;
  padding: 0 14px;
  box-sizing: border-box;
  
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  backdrop-filter: blur(4px);
}

.card-label {
  font-size: 8px;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.75px;
  font-weight: 600;
  line-height: 1;
  margin-bottom: 4px;
}
.card-value {
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
  line-height: 1;
}

</style>