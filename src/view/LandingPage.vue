<template>
    <div class="landing-page">
      <div class="logo-container">
        <img src="@/assets/onlyBunsLogoCircle.png" alt="OnlyBuns Logo" class="logo">
      </div>
    </div>
    <div>
      <BunnyFeed></BunnyFeed>
    </div>
</template>

<script setup>
import BunnyFeed from './BunnyFeed.vue';

</script>

<style scoped>

.landing-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
  background-color: #e6ece5;
  background-image: linear-gradient(to bottom, rgba(230, 236, 229, 1), rgba(230, 236, 229, 0));
  background-repeat: no-repeat;
}

.logo-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.logo {
  max-width: 400px;
  height: auto;
}

.feed-wrapper {
  background-color: #e6ece5; /* Match landing page background */
  padding-top: 2rem; /* Add padding as needed for spacing */
}

html {
  scroll-behavior: smooth;
}
</style>
