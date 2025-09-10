<template>
  <div class="feed-container">
    <h2>Bunny Feed</h2>

    <div class="posts-list">
      <template v-if="isAdmin">
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
      </template>

      <template v-else>
 
        <PostComponent
          v-for="post in posts.filter(p => p.isFollowedUser || p.userId === user.id)"
          :key="post.id"
          :post="post"
          :userId="user.id"
          :followed-users-ids="followedUsersIds"
          @post-updated="refreshPosts"
          @post-edited="updatePost"
          @post-deleted="removePost"
          @alert-user="showLoginAlert"
        />

     
        <div v-if="posts.some(p => !p.isFollowedUser && p.userId !== user.id)" class="end-of-followed">
          <p>You reached the end of the posts you follow, see more:</p>
        </div>

 
        <PostComponent
          v-for="post in posts.filter(p => !p.isFollowedUser && p.userId !== user.id)"
          :key="post.id"
          :post="post"
          :userId="user.id"
          :followed-users-ids="followedUsersIds"
          @post-updated="refreshPosts"
          @post-edited="updatePost"
          @post-deleted="removePost"
          @alert-user="showLoginAlert"
        />
      </template>
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

const isAdmin = computed(() => user.value?.userRole === 'ADMIN');

const posts = ref([]);
const followedUsersIds = ref([]);
const alertUserBool = ref(false);
const alertFadeOut = ref(false);
const errorMessage = ref('To leave a like or comment, please ');


const fetchFollowedUsersIds = async () => {
  if (user.value && user.value.id !== -1) {
    try {
      const response = await apiClient.get(`/following/${user.value.username}/followed`);
      followedUsersIds.value = response.data.map(u => u.id);
    } catch (error) {
      console.error("Failed to fetch followed users", error);
    }
  }
};


const loadPosts = async () => {
  try {
    const response = await apiClient.get('posts/all');
    const allPosts = response.data;

    allPosts.sort((a, b) => new Date(b.creationTime) - new Date(a.creationTime));

    posts.value = allPosts.map(post => ({
      ...post,
      isFollowedUser: !isAdmin.value && followedUsersIds.value.includes(post.userId)
    }));

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

onMounted(async () => {
  if (!isAdmin.value) {
    await fetchFollowedUsersIds();
  }
  await loadPosts();
});

const refreshPosts = () => loadPosts();

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

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
}

.end-of-followed {
  width: 100%;
  text-align: center;
  padding: 1rem;
  font-family: 'Delius Swash Caps', cursive;
  font-size: 0.9rem;
  color: #4a4a4a;
  border-top: 1px dashed #c9d6c8;
  margin-bottom: 1rem;
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
</style>
