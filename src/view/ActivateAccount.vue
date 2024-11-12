<template>
 <div class = "page-wrapper">
    <div class="container">
        <h1>Account activated!</h1>
        <font-awesome-icon :icon="['fas', 'circle-check']" bounce class="large-icon" style="color: #ec5d43;" v-if="activated && !error"/>
        <font-awesome-icon :icon="['fas', 'spinner']" class="large-icon" spin v-else-if="!activated && !error"/>
        <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="large-icon" v-if="error"/>
        <p v-if="error" style="margin-top: 2vh;">
            Error trying to get the activation code
        </p>
    </div>
</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/axios/axios';

const activated = ref(false);
const error = ref(false);
const route = useRoute();
const token = route.query.token;

onMounted(async () => {
    if (!token || token.trim() === '') {
        error.value = true;
        return;
    }

    try {
        const response = await apiClient.get(`authentication/activate`, {
            params: { token: token }
        });
        activated.value = true;
        error.value = false;
        console.log("Account activated:", response.data);
    } catch (error) {
        activated.value = false;
        console.error("Error activating account:", error);
        error.value = true;
    }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Delius+Swash+Caps&display=swap');

.container {
  display: flex;
  flex-direction: column;
  height: 80vh;
  justify-content: center;
  align-items: center;
}

.page-wrapper {
  /*background-image: url('@/assets/bunnyTile.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;*/
  background-color: #e6ece5;
  min-height: 100vh;
  width: 100%;
  padding: 2rem;
  display: flex;
  justify-content: center;
}

.large-icon {
    font-size: 5rem;
}

h1, p {
    margin-bottom: 10vh;
    font-family: 'Delius Swash Caps', cursive;
}
</style>
