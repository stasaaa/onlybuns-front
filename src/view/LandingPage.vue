<template>
    <div class="container">
        <CCard 
            v-for="post in posts" 
            :key="post.id" 
            style="width: 18rem;"
            class="card-item"
        >
            <CCardImage 
                v-if="post.image" 
                orientation="top" 
                :src="'data:image/jpeg;base64,' + post.image" 
            />
            <CCardBody>
                <CCardText>{{ post.description }}</CCardText>
            </CCardBody>
        </CCard>
    </div>
</template>

<script setup>
import apiClient from '@/axios/axios';
import { CCard, CCardBody, CCardText, CCardImage } from '@coreui/vue';
import { onMounted, ref } from 'vue';

const posts = ref([]);

onMounted(async () => {
    apiClient.get('posts/all')
    .then((response) => {
        posts.value = response.data;
    })
    .catch((error) => {
        console.log(error);
    });
});
</script>

<style scoped>
.container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr)); /* This ensures up to 4 items per row */
    gap: 20px; /* Space between cards */
    padding: 20px;
    justify-items: center; /* Center items horizontally */
}

.card-item {
    /* Optional: Add a border or shadow to cards for better visuals */
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
