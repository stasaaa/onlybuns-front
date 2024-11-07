<template>
    <div v-if="users.length > 0">
            <ul>
                <li v-for="user in users" :key="user.id">{{ user.username }}</li>
            </ul>
        </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import apiClient from '../axios/axios';

const users = ref([]);

onMounted(async () => {
  try {
    const response = await apiClient.get('authentication');
    users.value = response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
  }
});
</script>

<style scoped>
.container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: bisque;
    height: 10vh;
    padding: 20px;
}

.link {
    margin: 10px;
}
</style>