<template>
    <div class="container">
        <div class="others">
            <router-link to="/" class="link">Home</router-link>
        </div>
        <div class="account">
            <div v-if="user.id !== -1">
                <CButton v-on:click.prevent="logout()">Logout</CButton>
            </div>
            <div v-else>
                <router-link to="/login" class="link">Login</router-link>
                <router-link to="/register" class="link">Register</router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useStore } from 'vuex';
import { computed } from 'vue';
import { CButton } from '@coreui/vue';
import router from '@/router/router';

const store = useStore();
const user = computed(() => store.getters.getUser);

const logout = async () => {
    await store.dispatch('resetUser');
    await store.dispatch('resetToken');
    sessionStorage.removeItem('authToken');
    router.push('/');
}
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