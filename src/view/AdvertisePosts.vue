<template>
  <div class="advertise-container">
    <h2>Advertise Posts</h2>
    <div class="posts-grid">
      <div
        v-for="post in posts"
        :key="post.id"
        class="post-card"
      >
        <!-- Post Image -->
        <img 
          v-if="post.imageUrl" 
          :src="post.imageUrl" 
          :alt="post.description" 
          class="post-image"
        />
        
        <!-- Post Content -->
        <div class="post-content">
          <div class="post-header">
            <h4 class="post-username">@{{ post.username }}</h4>
            <span class="post-date">{{ formatDate(post.creationTime) }}</span>
          </div>
          
          <p class="post-description">{{ post.description }}</p>
          
          <div v-if="post.location" class="post-location">
            <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
            {{ post.location }}
          </div>

          <!-- Advertise Button -->
          <button 
            @click="advertisePost(post.id)"
            :disabled="advertisingPost === post.id"
            class="advertise-btn"
          >
            <font-awesome-icon 
              v-if="advertisingPost === post.id" 
              :icon="['fas', 'spinner']" 
              class="fa-spin" 
            />
            <span v-else>Suggest advertising</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <CAlert
      v-if="showAlert"
      :color="alertType"
      dismissible
      @close="showAlert = false"
      class="alert-message"
    >
      {{ alertMessage }}
    </CAlert>
  </div>
</template>

<script setup>
import apiClient from '@/axios/axios';
import { CAlert } from '@coreui/vue';
import { onMounted, ref } from 'vue';

const posts = ref([]);
const advertisingPost = ref(null);
const showAlert = ref(false);
const alertType = ref('success');
const alertMessage = ref('');

const loadPosts = async () => {
  try {
    const response = await apiClient.get('posts/all');
    posts.value = response.data;

    // Sort by creation time (newest first)
    posts.value.sort((a, b) => new Date(b.creationTime) - new Date(a.creationTime));

    // Load usernames for posts
    for (const post of posts.value) {
      try {
        const userRes = await apiClient.get(`users/findUsername/${post.userId}`);
        post.username = userRes.data;
      } catch {
        post.username = 'Unknown User';
      }
    }
  } catch (error) {
    console.error('Error loading posts:', error);
    showAlertMessage('Error loading posts', 'danger');
  }
};

const advertisePost = async (postId) => {
  advertisingPost.value = postId;
  
  try {
    const response = await apiClient.post(`/api/ad/approve-ad/${postId}`);
    showAlertMessage(response.data, 'success');
  } catch (error) {
    console.error('Error advertising post:', error);
    if (error.response?.status === 404) {
      showAlertMessage('Post not found', 'danger');
    } else {
      showAlertMessage('Failed to advertise post', 'danger');
    }
  } finally {
    advertisingPost.value = null;
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const showAlertMessage = (message, type) => {
  alertMessage.value = message;
  alertType.value = type;
  showAlert.value = true;
  
  // Auto-hide after 4 seconds
  setTimeout(() => {
    showAlert.value = false;
  }, 4000);
};

onMounted(() => {
  loadPosts();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Delius+Swash+Caps&display=swap');

.advertise-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  min-height: 100vh;
  background: linear-gradient(to top, rgba(230, 236, 229, 0), rgba(230, 236, 229, 1)), 
              url('@/assets/bunnyTile.png');
  background-size: 100% auto;
  background-position: center;
  background-repeat: repeat;
}

h2 {
  font-family: 'Delius Swash Caps', cursive;
  color: #ec5d43;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.post-card {
  background-color: #e6ece5;
  border: 2px solid #c9d6c8;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.post-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  display: block;
}

.post-content {
  padding: 1rem;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.post-username {
  font-family: 'Delius Swash Caps', cursive;
  color: #4A4A4A;
  font-size: 1.1rem;
  margin: 0;
}

.post-date {
  font-family: 'Delius Swash Caps', cursive;
  color: #888;
  font-size: 0.8rem;
}

.post-description {
  font-family: 'Delius Swash Caps', cursive;
  color: #4A4A4A;
  margin: 0.5rem 0;
  line-height: 1.4;
}

.post-location {
  font-family: 'Delius Swash Caps', cursive;
  color: #ec5d43;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 1rem;
}

.advertise-btn {
  width: 100%;
  padding: 0.8rem 1rem;
  background-color: #ed7864;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Delius Swash Caps', cursive;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.advertise-btn:hover:not(:disabled) {
  background-color: #ec5d43;
  transform: translateY(-1px);
}

.advertise-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.alert-message {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
}

.fa-spin {
  animation: fa-spin 1s infinite linear;
}

@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .posts-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    padding: 0.5rem;
  }
  
  .advertise-container {
    padding: 0.5rem;
  }
}

@media (max-width: 480px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }
}
</style>