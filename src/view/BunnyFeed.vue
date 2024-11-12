<template>
  <div class="page-wrapper">
    
    <div class="feed-container" 
          data-aos="fade-up"
          data-aos-duration="1000">
      <h2>Bunny Feed</h2>
      <div class="posts-grid">
        <CCard 
          v-for="post in posts" 
          :key="post.id" 
          class="post-card"
        >
          <CCardImage 
            v-if="post.image" 
            orientation="top" 
            :src="'data:image/jpeg;base64,' + post.image"
            class="post-image" 
          />
          <div class="interaction-buttons">
            <button class="interaction-btn" v-on:click="alertUser()">
              <font-awesome-icon :icon="['fas', 'carrot']" class="carrot-icon" />
              <span>0</span>
            </button>
            <button class="interaction-btn" v-on:click="alertUser()">
              <font-awesome-icon :icon="['fas', 'comment']" />
              <span>0</span>
            </button>
            <button class="interaction-btn" @click="togglePostOptions" v-if="post.userId === user.id">
              <font-awesome-icon :icon="['fas', 'ellipsis-h']" />
              <div class="post-options" v-if="showPostOptions">
                <button class="post-option" @click="editPost(post)">Edit Post</button>
                <button class="post-option" @click="deletePost(post.id)">Delete Post</button>
              </div>
            </button>
          </div>
          <CCardBody>
            <CNavLink v-on:click="goToAccount(post.username)" class="link">{{ post.username }}</CNavLink>
            <CCardText class="post-description">{{ post.description }}</CCardText>
            <div class="post-location" v-if="post.address">
              <font-awesome-icon :icon="['fas', 'location-dot']" />
              {{ post.address.city }}, {{ post.address.street }}
            </div>
          </CCardBody>
        </CCard>
      </div>
    </div>
    <CAlert 
      v-if="alertUserBool"
      color="light" 
      id="alertUser" 
      @transitionend="onAlertTransitionEnd"
    >
      {{ errorMessage }} <CAlertLink href="/login">login</CAlertLink> or <CAlertLink href="/register">register</CAlertLink>.
    </CAlert>
  </div>
</template>

<script setup>
import apiClient from '@/axios/axios';
import router from '@/router/router';
import { CCard, CCardBody, CCardText, CCardImage, CAlert, CAlertLink, CNavLink } from '@coreui/vue';
import { onMounted, ref, computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const user = computed(() => store.getters.getUser);
const alertUserBool = ref(false);
const alertFadeOut = ref(false);

const posts = ref([]);
const errorMessage = ref('To leave a like or comment please ')

const showPostOptions = ref(false);

const togglePostOptions = () => {
  showPostOptions.value = !showPostOptions.value;
};

const editPost = async (post) => {
  try {
    // Create a copy of the post object to avoid mutating the original
    const editedPost = { ...post };
    console.log(editedPost);

    // Prompt the user for the updated post data
    const updatedDescription = prompt('Enter the updated post description:', editedPost.description);
    if (updatedDescription !== null) {
      editedPost.description = updatedDescription;
    }

    // Send the PUT request to update the post
    const response = await apiClient.put(`posts/${editedPost.id}`, editedPost);
    console.log('Post updated successfully:', response.data);

    // Update the post in the posts array
    const index = posts.value.findIndex((p) => p.id === editedPost.id);
    if (index !== -1) {
      posts.value[index] = editedPost;
    }

    showPostOptions.value = false;
  } catch (error) {
    console.error('Error updating post:', error);
  }
};

const deletePost = async (postId) => {
  try {
    console.log('Deleting post with ID:', postId);
    await apiClient.delete(`posts/${postId}`);
    console.log('Post deleted successfully');

    // Remove the deleted post from the posts array
    posts.value = posts.value.filter((post) => post.id !== postId);
    console.log('Posts array updated:', posts.value);

    showPostOptions.value = false;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('Post not found, cannot delete');
    } else {
      console.error('Error deleting post:', error);
    }
  }
};

onMounted(async () => {
    try {
        const response = await apiClient.get('posts/all');
        posts.value = response.data;
        console.log('Posts loaded:', posts.value);
        console.log('User ID:', user.value.id);
        posts.value.sort((a, b) => {
            const dateA = new Date(a.creationTime); // Convert creationTime to a Date object
            const dateB = new Date(b.creationTime);
            console.log(a.creationTime);
            console.log(b.creationTime);
            console.log("Datum A: ", dateA);
            console.log("Datum B: ", dateB);
            console.log(dateB - dateA);
            return dateB - dateA; // Sort in descending order (newest first)
        });
        posts.value.forEach((post) => {
          apiClient.get(`users/findUsername/${post.userId}`)
          .then((response) => {
            post.username = response.data
          })
          .catch((error) => {
            console.log(error);
          })
        })
    } catch (error) {
        console.error('Error loading posts:', error);
    }
});

const alertUser = () => {
  if (user.value.id === -1) {
    alertUserBool.value = true;
    setTimeout(() => {
      alertFadeOut.value = true;
      onAlertTransitionEnd();
      errorMessage.value = 'To leave a like or comment, please ';
    }, 3000); // Fade out after 3 seconds
  }
}

const onAlertTransitionEnd = () => {
  if (alertFadeOut.value) {
    alertFadeOut.value = false; // Reset fade-out state
    alertUserBool.value = false; // Hide the alert after fade-out
  }
}

const goToAccount = (username) => {
  router.push({ name: 'UserProfile', query: { username } });
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