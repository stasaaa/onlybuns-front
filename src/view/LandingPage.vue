<template>
    <div class="landing-page">
      <div class="logo-container">
        <img src="@/assets/onlyBunsLogoCircle.png" alt="OnlyBuns Logo" class="logo">
      </div>
    </div>
</template>

<script setup>
</script>

<style scoped>
.landing-page {
    height: 100vh;
    width: 100%;
    margin: 0;
    padding: 0;
    background-color : #e6ece5
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

</style>
