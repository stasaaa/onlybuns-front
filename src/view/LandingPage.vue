<template>
    <div>
      <p>{{ user.id }}</p>
    </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useStore } from 'vuex';
// import apiClient from '../axios/axios';

const store = useStore();
const user = computed(() => store.getters.getUser);

onMounted(async () => {
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