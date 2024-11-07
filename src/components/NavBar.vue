<template>
    <div class="container">
        <div class="others">
            <router-link to="/" class="link">Home</router-link>
        </div>
        <div class="account">
            <router-link to="/login" class="link">Login</router-link>
            <router-link to="/register" class="link">Register</router-link>
        </div>
    </div>
</template>

<script setup>

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