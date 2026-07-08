<script setup lang="ts">
import Navbar from './components/Navbar.vue';
</script>

<style>
body {
  margin: 0;
  background-color: #0f1117;
}

.main-viewport-content {
  padding-top: 60px;
  min-height: calc(100vh - 60px);
}
</style>
<template>
  <div id="app-layout">
    <Navbar />
    
    <main class="main-viewport-content">
      <router-view />
    </main>
  </div>
</template>