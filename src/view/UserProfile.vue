<template>
    <div>
        <div v-if="!userNotFound">
            <CSidebar>
                <CSidebarHeader>
                    <CSidebarBrand>{{ username }}</CSidebarBrand>
                </CSidebarHeader>
            </CSidebar>
        </div>
        <div v-else>

        </div>
    </div>
</template>

<script setup>
import apiClient from '@/axios/axios';
import { CSidebar, CSidebarBrand, CSidebarHeader } from '@coreui/vue';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

const store = useStore();
const user = computed(() => store.getters.getUser);

const route = useRoute();
const username = computed(() => route.query.username);

const userNotFound = ref(false)

onMounted(async () => {
    user
    apiClient
})
</script>

<style scoped>

</style>