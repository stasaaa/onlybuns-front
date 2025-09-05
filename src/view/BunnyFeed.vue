<template>
  <div class="feed-container">
    <h2>Bunny Feed</h2>
    <div class="posts-list">
      <PostComponent
        v-for="post in posts"
        :key="post.id"
        :post="post"
        :userId="user.id"
        :followed-users-ids="followedUsersIds"
        @post-updated="refreshPosts"
        @post-edited="updatePost"
        @post-deleted="removePost"
        @alert-user="showLoginAlert"
      />
    </div>

    <CAlert
      v-if="alertUserBool"
      color="light"
      id="alertUser"
      @transitionend="onAlertTransitionEnd"
    >
      {{ errorMessage }}
      <CAlertLink href="/login">login</CAlertLink> or
      <CAlertLink href="/register">register</CAlertLink>.
    </CAlert>
  </div>
</template>

<script setup>
import apiClient from '@/axios/axios';
import PostComponent from '@/components/Post.vue';
import { CAlert, CAlertLink } from '@coreui/vue';
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const user = computed(() => store.getters.getUser);

const posts = ref([]);
const alertUserBool = ref(false);
const alertFadeOut = ref(false);
const errorMessage = ref('To leave a like or comment, please ');
const followedUsersIds = ref([]);

const fetchFollowedUsersIds = async () => {
  if (user.value && user.value.id !== -1) {
    try {
      const response = await apiClient.get("/users/me/followed-ids");
      followedUsersIds.value = response.data;
    } catch (error) {
      console.error("Failed to fetch followed users", error);
    }
  }
};

const loadPosts = async () => {
  try {
    const response = await apiClient.get('posts/all');
    posts.value = response.data;

    posts.value.sort((a, b) => new Date(b.creationTime) - new Date(a.creationTime));

    // Load usernames and comments for posts
    for (const post of posts.value) {
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
  } catch (error) {
    console.error('Error loading posts:', error);
  }
};

onMounted(() => {
  loadPosts();
  fetchFollowedUsersIds();
});

const refreshPosts = () => {
  loadPosts();
};

const updatePost = (updatedPost) => {
  const index = posts.value.findIndex((p) => p.id === updatedPost.id);
  if (index !== -1) posts.value[index] = updatedPost;
};

const removePost = (postId) => {
  posts.value = posts.value.filter((p) => p.id !== postId);
};

const showLoginAlert = () => {
  alertUserBool.value = true;
  setTimeout(() => {
    alertFadeOut.value = true;
    onAlertTransitionEnd();
  }, 3000);
};

const onAlertTransitionEnd = () => {
  if (alertFadeOut.value) {
    alertFadeOut.value = false;
    alertUserBool.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Delius+Swash+Caps&display=swap');

.page-wrapper {
  background: linear-gradient(to top, rgba(230, 236, 229, 0), rgba(230, 236, 229, 1)), 
              url('@/assets/bunnyTile.png');
  background-size: 100% auto;
  background-position: center;
  background-repeat: repeat;
  min-height: 100vh;
  width: 100%;
  padding: 1rem;
}

.feed-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

h2 {
  font-family: 'Delius Swash Caps', cursive;
  color: #ec5d43;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.posts-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  padding: 1rem;
}

.post-card {
  width: 100%;
  max-width: 500px;
  margin: 0;
  padding: 0;
  background-color: #e6ece5;
  border: 2px solid #c9d6c8;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
  overflow: hidden;
}

.post-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  display: block;
  border-bottom: 2px solid #c9d6c8;
}

.comment-input {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
}

.comment-box {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #c9d6c8;
  border-radius: 5px;
}

.comment-btn {
  padding: 0.5rem 1rem;
  background-color: #ec5d43;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-family: 'Delius Swash Caps', cursive;
  transition: background-color 0.2s ease;
}

.comment-btn:hover {
  background-color: #c94530;
}

.comments-list {
  margin-top: 1rem;
  padding: 0 1rem;
  font-family: 'Delius Swash Caps', cursive;
  color: #4A4A4A;
}

.comment {
  margin-bottom: 0.5rem;
}

.interaction-buttons {
  display: flex;
  gap: 1rem;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #c9d6c8;
}

.interaction-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4A4A4A;
  font-family: 'Delius Swash Caps', cursive;
  cursor: pointer;
  transition: all 0.2s ease;
}

.interaction-btn:hover {
  color: #ec5d43;
}

.interaction-btn .carrot-icon {
  transform: rotate(315deg);
}

.post-description {
  padding: 1rem;
  margin: 0;
  font-family: 'Delius Swash Caps', cursive;
  color: #4A4A4A;
}

.post-location {
  padding: 0 1rem 1rem;
  margin: 0;
  font-family: 'Delius Swash Caps', cursive;
  color: #ec5d43;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

#alertUser {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 9999;
  opacity: 1;
  transition: opacity 0.5s ease-in-out;
  -webkit-animation: fadeIn 3s linear forwards;
  animation: fadeIn 3s linear forwards;
}

.post-options {
  position: absolute;
  background-color: #fff;
  border: 1px solid #c9d6c8;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  z-index: 100;
  right: 1rem;
  top: 3rem;
}

.post-option {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Delius Swash Caps', cursive;
  color: #4A4A4A;
}

.post-option:hover {
  background-color: #f5f5f5;
}

@keyframes fadeIn {
  0%, 100% {
    opacity: 0;
  }
  20%, 80% {
    opacity: 1;
  }
}

.link:hover {
  cursor: pointer;
}
</style>