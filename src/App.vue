<template>
  <NavBar></NavBar>
  <router-view></router-view>
  <div class="posts-container">
    <div v-if="loading">Loading posts...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <PostComponent 
        v-for="post in posts"
        :key="post.id"
        :post="post"
        :currentUserId="1"
        @post-updated="fetchPosts"
        @post-deleted="handlePostDelete"
      />
    </div>
  </div>
</template>

<script>
import '@coreui/coreui/dist/css/coreui.min.css'
import NavBar from './components/NavBar.vue'
//import MapComponent from './components/MapComponent.vue';
// <MapComponent :center="[51.505, -0.09]" :zoom="13" />

export default {
  name: 'App',
  components: {
    NavBar
    //,MapComponent
  }
}
</script>

<style scoped>
.posts-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background-color: #fffddb;
}
</style>