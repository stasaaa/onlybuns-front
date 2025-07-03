<template>
    <div class="page-wrapper">
        <div class="user-container" v-if="userNotFound">
            <div class="user-details">
                <CAvatar class="avatar">{{profileUser.username}}</CAvatar>
                <div class="count">
                    <p><b>0</b> posts</p>
                    <p><b>0</b> followers</p>
                    <p><b>0</b> following</p>
                </div>
                <label v-if="profileUser.username === user.username" v-on:click="changePassword()" class="details"
                    ><font-awesome-icon :icon="['fas', 'pen']" /> Edit password</label>
                <CModal
                    alignment="center"
                    :visible="passwordChange"
                    @close="() => { passwordChange = false }">
                    <CModalBody>
                        <EditPassword :user="profileUser"/>
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="secondary" @click="() => { passwordChange = false }">
                            Close
                        </CButton>
                    </CModalFooter>
                </CModal>
            </div>
            <div class="profile-details">
                <label>{{ profileUser.firstName }} {{ profileUser.lastName }}</label>
                <label>{{ profileUser.email }}</label>
            </div>
            <div class="scroll">
                <div class="posts-grid" ref="scrollComponent">
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
                            <button class="interaction-btn" v-on:click="toggleLike(post)">
                            <font-awesome-icon :icon="['fas', 'carrot']" class="carrot-icon" />
                            <span>{{ post.likes }}</span> <!-- Display likes count -->
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
                <div v-if="!hasMorePosts">
                    <label>End of user's posts</label>
                </div>
            </div>
        </div>
        <div v-else class="error">
            <h1>Unable to go to {{ username }}'s profile</h1>
        </div>
    </div>
</template>

<script setup>
import apiClient from '@/axios/axios';
import EditPassword from '@/components/EditPassword.vue';
import { CAvatar, CCard, CCardBody, CCardText, CCardImage, CNavLink, CModal, CModalBody, CModalFooter, CButton } from '@coreui/vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
// import bunnyImage from '@/assets/rabbit-marker.png'

const store = useStore();
const user = computed(() => store.getters.getUser);

const passwordChange = ref(false);

const route = useRoute();
const username = computed(() => route.query.username);
const profileUser = ref([]);

const userNotFound = ref(false);
const usersProfile = ref(false);

const page = ref(0);
const pageSize = ref(10);

const posts = ref([]);
const scrollComponent = ref(null);
const hasMorePosts = ref(true);

const showPostOptions = ref(false);
const alertUserBool = ref(false);
const alertFadeOut = ref(false);
const errorMessage = ref("");

onMounted(async () => {
    getUserDetails();
    getPosts(username, page, pageSize);
    window.addEventListener("scroll", handleScroll);
})

onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
})

const changePassword = () => {
    passwordChange.value = true;
}

const handleScroll = () => {
  let element = scrollComponent.value;
  if (element && element.getBoundingClientRect().bottom < window.innerHeight) {
    page.value = page.value + 1;
    getPosts(username.value, page.value, pageSize.value);
  }
};

function getUserDetails () {
    apiClient.get(`users/find/${username.value}`)
    .then((response) => {
        console.log(response.data);
        profileUser.value = response.data;
        if(profileUser.value === null) {
            userNotFound.value = false;
            if (profileUser.value.id === user.value.id) {
                usersProfile.value = true;
            } else {
                usersProfile.value = false;
            }
            return;
        }
        userNotFound.value = true;
    })
    .catch((error) => {
        console.log(error);
    })
}

async function getPosts(username, page, pageSize) {
    if (!hasMorePosts.value) return;
    apiClient.get(`posts/pagedForUser/${username.value}/${page.value}/${pageSize.value}`)
    .then((response) => {
        console.log(response.data);
        posts.value.push(...response.data);
        if (response.data.length <= 0) {
            hasMorePosts.value = false;
        }
    })
    .catch((error) => {
        console.log(error);
    })
}

const togglePostOptions = () => {
  showPostOptions.value = !showPostOptions.value;
};

const toggleLike = async (post) => {
  if (user.value.id === -1) {
    alertUserBool.value = true;
    setTimeout(() => {
      alertFadeOut.value = true;
      onAlertTransitionEnd();
      errorMessage.value = 'To leave a like or comment, please ';
    }, 3000); // Fade out after 3 seconds
    return;
  }
  try {
    // Toggle the liked status locally
    post.liked = !post.liked;

    // Update likes count based on the new liked status
    post.likes += post.liked ? 1 : -1;

    // Call the backend to persist the like/unlike action
    await apiClient.post(`/posts/${post.id}/toggle-like`, { liked: post.liked });
  } catch (error) {
    console.error('Error toggling like:', error);

    // If there’s an error, revert the changes
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
  }
};

const editPost = async (post) => {
  try {
    console.log('number of likes!!!!', post.likes);
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

const onAlertTransitionEnd = () => {
  if (alertFadeOut.value) {
    alertFadeOut.value = false; // Reset fade-out state
    alertUserBool.value = false; // Hide the alert after fade-out
  }
}
</script>

<style scoped>
.page-wrapper {
    box-sizing: border-box;
    margin: 0;
}

.barIcon {
    height: 5vh;
    width: 5vh;
}

.commentIcon {
    height: 3vh;
    width: 3vh;
}

.error {
  display: flex;
  flex-direction: column;
  height: 80vh;
  justify-content: center; /* Fixed typo from justify-self to justify-content */
  align-items: center; /* Center icon vertically */
}

.details {
    padding: 1%;
}

.details:hover {
    cursor: pointer;
}

.large-icon {
    font-size: 5rem;
}

.user-container {
    display: flex;
    flex-direction: column;
    min-height: 90vh;
}

.user-details {
    display: flex;
    box-sizing: border-box;
    align-items: center;
    margin: 2% 0 2% 5%;
    padding: 0%;
}

.avatar {
    background-color: antiquewhite;
    color: black;
    margin: 1%;
    width: 10rem;
    height: 10rem;
    font-size: 2rem;
}

.count {
    display: flex;
    justify-content: space-around;
    width: 60%;
    margin-left: 4%;
    margin-right: 10%;
}

.profile-details {
    display: flex;
    flex-direction: column;
    text-align: left;
    margin-left: 6%;
}

.scroll {
    box-sizing: border-box;
    flex: 1;
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
  margin: 1% 0%;
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