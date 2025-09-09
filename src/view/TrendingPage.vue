<template>
  <div class="container">
    <div class="basic-info">
      <p>All Time Posts Count: <b>{{ postsCount.totalPosts }}</b></p>
      <p>Number of Posts Made Last Month: <b>{{ postsCount.lastMonthPosts }}</b></p>
    </div>

    <hr class="separator" />
    <p>Five Most Liked Posts Last</p>
    <div class="liked-posts">
      <PostComponent
        v-for="post in fivePosts"
        :key="post.id"
        :post="post"
        :userId="user.id"
        :followed-users-ids="followedUsersIds"
        @post-updated="refreshFivePosts"
        @post-edited="updateFivePost"
        @post-deleted="removeFivePost"
      />
    </div>

    <hr class="separator" />
    <p>Ten Most Liked Posts Ever</p>
    <div class="liked-posts">
      <PostComponent
        v-for="post in tenPosts"
        :key="post.id"
        :post="post"
        :userId="user.id"
        :followed-users-ids="followedUsersIds"
        @post-updated="refreshFivePosts"
        @post-edited="updateFivePost"
        @post-deleted="removeFivePost"
      />
    </div>

    <hr class="separator" />
    <p>Users Than Likes the Most Posts Last Week</p>
    <div class="liked-posts">
      <div v-for="user in topUsers" :key="user.id" class="user-details">
        <p>{{ user.username }}</p>
        <p>{{ user.firstName }} {{ user.lastName }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import apiClient from '@/axios/axios'
import { onMounted, ref, computed } from 'vue'
import PostComponent from '@/components/Post.vue';
import { useStore } from 'vuex';

const store = useStore();
const user = computed(() => store.getters.getUser);

const postsCount = ref({
  totalPosts: 0,
  lastMonthPosts: 0
})

const fivePosts = ref([])
const tenPosts = ref([])
const topUsers = ref([])

onMounted(() => {
  getCounts()
  getFivePosts()
  getTenPosts()
  getTopUsers()
})

function getCounts() {
  apiClient.get('/posts/post-quantity')
  .then((response) => {
    postsCount.value = response.data
  })
  .catch((error) => {
    console.log(error)
  })
}

function getFivePosts() {
  apiClient.get('/posts/five-most-liked-last-week')
  .then(async (response) => {
    fivePosts.value = response.data
    fivePosts.value.sort((a, b) => b.likes - a.likes)

    for (const post of fivePosts.value) {
      try {
        const userRes = await apiClient.get(`users/findUsername/${post.userId}`);
        post.username = userRes.data;
      } catch {
        post.username = 'Unknown User';
      }

      try {
        const commentsRes = await apiClient.get(`comments/${post.id}`);
        const comments = commentsRes.data;
        for (const comment of comments) {
          try {
            const userRes = await apiClient.get(`users/findUsername/${comment.userId}`);
            comment.username = userRes.data;
          } catch {
            comment.username = 'Unknown User';
          }
        }
        post.comments = comments.sort((a, b) => new Date(b.creationTime) - new Date(a.creationTime));
      } catch {
        post.comments = [];
      }
    }
  })
  .catch((error) => {
    console.log(error)
  })
}

function getTenPosts() {
  apiClient.get('/posts/top-ten')
  .then(async (response) => {
    tenPosts.value = response.data
    tenPosts.value.sort((a, b) => b.likes - a.likes)

    for (const post of tenPosts.value) {
      try {
        const userRes = await apiClient.get(`users/findUsername/${post.userId}`);
        post.username = userRes.data;
      } catch {
        post.username = 'Unknown User';
      }

      try {
        const commentsRes = await apiClient.get(`comments/${post.id}`);
        const comments = commentsRes.data;
        for (const comment of comments) {
          try {
            const userRes = await apiClient.get(`users/findUsername/${comment.userId}`);
            comment.username = userRes.data;
          } catch {
            comment.username = 'Unknown User';
          }
        }
        post.comments = comments.sort((a, b) => new Date(b.creationTime) - new Date(a.creationTime));
      } catch {
        post.comments = [];
      }
    }
  })
  .catch((error) => {
    console.log(error)
  })
}

function  getTopUsers() {
  apiClient.get("/users/ten-users-liking-most-last-week")
  .then((response) => {
    topUsers.value = response.data
  })
  .catch((error) => {
    console.log(error)
  })
}

</script>

<style scoped>
html, body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
}

.container {
  height: 100%;
  min-width: 100%;
}

.basic-info {
  display: flex;
  justify-content: space-evenly;
  padding: 1rem;
}

.liked-posts {
  display: flex;
  overflow-x: auto;
  gap: 1rem;
  scroll-behavior: smooth;
  padding: 1rem;
}

.liked-posts > * {
  flex: 0 0 auto;
}

.separator {
  border: none;
  height: 2px;
  background-color: #ccc;
  margin: 1rem 0;
}

.liked-posts::-webkit-scrollbar {
  height: 8px; /* visina scroll bara */
}

.liked-posts::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.liked-posts::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.user-details {
  flex: 0.15;
  background-color: #ec5d43;
  color: white;
  border-radius: 20px;
  padding: 1rem;
}
</style>