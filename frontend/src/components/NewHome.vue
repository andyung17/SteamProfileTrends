<template>
  <div class="auth-landing-wrapper">
    <div class="glow-orb orb-one"></div>
    <div class="glow-orb orb-two"></div>

    <div class="auth-card">
      <div class="brand-section">
        <div class="brand-logo">
            <img src="../assets/hero.png" alt="Steam Icon" class="logo-icon" />
        </div>
        <h1 class="app-title">Steam<span class="accent-text">PersonalAnalytics</span></h1>
        <p class="app-subtitle">Track your playtime, and discover your next game.</p>
      </div>

      <div class="divider-line"></div>

      <div class="action-section">
        <p class="prompt-text">Sign in with your Steam account to sync your library and get personalized recommendations instantly.</p>
        
        <button @click="redirectToSteamOAuth" class="steam-login-btn" :disabled="isConnecting">
          <img 
            src="https://community.cloudflare.steamstatic.com/public/images/signinthroughsteam/sits_02.png" 
            alt="Sign in through Steam" 
            class="steam-btn-img"
          />
          <span v-if="isConnecting" class="loading-spinner"></span>
        </button>
        
        <p class="secure-notice">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="lock-icon">
            <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clip-rule="evenodd" />
          </svg>
          Secure login via Steam OpenID. We never see your password.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isConnecting = ref(false);

const redirectToSteamOAuth = () => {
  isConnecting.value = true;
  
  const backendAuthUrl = 'http://localhost:3000/api/auth/steam';
  
  window.location.href = backendAuthUrl;
};
</script>

<style scoped>

.auth-landing-wrapper {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  
  background-color: #0d1117;
  overflow: hidden;
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.12;
  pointer-events: none;
}
.orb-one {
  top: 15%;
  left: 20%;
  width: 350px;
  height: 350px;
  background-color: #38bdf8;
}
.orb-two {
  bottom: 15%;
  right: 20%;
  width: 400px;
  height: 400px;
  background-color: #a855f7;
}

.auth-card {
  position: relative;
  width: 100%;
  max-width: 440px;
  background: rgba(17, 24, 39, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 40px 32px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  text-align: center;
  z-index: 10;
}

.brand-logo {
  display: inline-flex;
  padding: 14px;
  background: rgba(56, 189, 248, 0.1);
  border-radius: 12px;
  color: #38bdf8;
  margin-bottom: 20px;
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.15);
}
.logo-icon {
  width: 42px;
  height: 42px;
}
.app-title {
  font-size: 28px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.5px;
  margin: 0 0 12px 0;
}
.accent-text {
  color: #38bdf8;
}
.app-subtitle {
  font-size: 14px;
  line-height: 1.5;
  color: #9ca3af;
  margin: 0;
  padding: 0 8px;
}

.divider-line {
  height: 1px;
  width: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08) 50%, transparent);
  margin: 32px 0;
}

.prompt-text {
  font-size: 13px;
  line-height: 1.6;
  color: #9ca3af;
  margin-bottom: 24px;
}
.steam-login-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.steam-login-btn:hover {
  transform: scale(1.03);
}
.steam-login-btn:active {
  transform: scale(0.98);
}
.steam-login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.steam-btn-img {
  display: block;
  height: 48px;
  object-fit: contain;
}

.secure-notice {
  display: flex;
  flex-direction: column;
  align-items: center; 
  gap: 8px;    
    font-size: 13px;         
  text-align: center;
  color: #4b5563; 
}

.lock-icon {
  width: 18px;  /* Scales nicely alongside standard UI text sizes */
  height: 18px;
  flex-shrink: 0; /* Prevents the browser from squeezing the icon if text wraps */
}
</style>