<template>
  <div class="dashboard-layout-wrapper">
    <div class="dashboard-content-container">
      <Profile :steamId="steamId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Profile from './Profile.vue';

const route = useRoute();

const steamId = computed(() => {
  return route.params.steamId as string;
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

.dashboard-content-container {
  max-width: 1000px;
  width: 90%;
  margin: 0 auto;
}
</style>