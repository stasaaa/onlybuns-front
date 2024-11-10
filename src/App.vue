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
import PostComponent from './components/Post.vue'
import axios from 'axios'

export default {
  name: 'App',
  components: {
    NavBar,
    PostComponent
  },
  data() {
    return {
      posts: [],
      loading: false,
      error: null,
      baseURL: 'http://localhost:8080' // ili koji god port koristi vaš backend
    }
  },
  created() {
    this.fetchPosts()
  },
  methods: {
    async fetchPosts() {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get(`${this.baseURL}/api/posts`)
        this.posts = response.data
      } catch (err) {
        console.error('Error fetching posts:', err)
        this.error = 'Failed to load posts'
      } finally {
        this.loading = false
      }
    },
    async handlePostUpdate() {
      await this.fetchPosts()
    },
    async handlePostDelete(postId) {
      try {
        await axios.delete(`${this.baseURL}/api/posts/${postId}`)
        this.posts = this.posts.filter(p => p.id !== postId)
      } catch (err) {
        console.error('Error deleting post:', err)
      }
    }
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