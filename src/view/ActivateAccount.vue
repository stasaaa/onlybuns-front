<template>
    <div class="container">
        <h1>Account Activation</h1>
        <font-awesome-icon :icon="['fas', 'circle-check']" bounce class="large-icon" style="color: #63E6BE;" v-if="activated && !error"/>
        <font-awesome-icon :icon="['fas', 'spinner']" class="large-icon" spin v-else-if="!activated && !error"/>
        <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="large-icon" v-if="error"/>
        <p v-if="error" style="margin-top: 2vh;">
            Error tring to get the activation code
        </p>
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
.container {
  display: flex;
  flex-direction: column;
  height: 80vh;
  justify-content: center; /* Fixed typo from justify-self to justify-content */
  align-items: center; /* Center icon vertically */
}

.large-icon {
    font-size: 5rem; /* Increase to make it bigger */
}

h1 {
    margin-bottom: 10vh;
}
</style>