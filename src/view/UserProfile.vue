<template>
  <div class="page-wrapper">
    <div v-if="!userNotFound" class="page">
      <div class="menu">
        <div class="profile-details">
          <div :class="['stats', { 'non-edit-mode': !editMode }]">
            <div class="username">
              <p v-if="!editMode">{{ profileUser.username }}</p>
              <input v-else type="text" class="edit-input" placeholder="Username" v-model="editDetails.username"/>
            </div>
            <div class="follow-stats">
              <p>Followers {{ profileStats.followersCount }}</p>
              <p>Following {{ profileStats.followingCount }}</p>
            </div>
          </div>

          <p>{{ profileUser.email }}</p>

          <div class="full-name" v-if="!editMode">
            <p>{{ profileUser.firstName }}</p>
            <p>{{ profileUser.lastName }}</p>
          </div>
          <div class="edit-input-full-name" v-else>
            <input type="text" placeholder="First Name" v-model="editDetails.firstName"/>
            <input type="text" placeholder="Last Name" v-model="editDetails.lastName"/>
          </div>

          <div class="password-edit">
            <!-- TODO: implementacija promene lozinke -->
          </div>

          <div class="buttons">
            <button class="button">
              <img :src="bunnyImage" class="barIcon"/> Bunnies Located
            </button>
            <button class="button">
              <font-awesome-icon class="commentIcon" :icon="['fas', 'comment']" /> Comments
            </button>
            <button class="button">
              <font-awesome-icon :icon="['fas', 'map-location-dot']" /> User's Location
            </button>
          </div>

          <!-- Dugme za follow/unfollow ako nije tvoj profil -->
          <div v-if="!usersProfile" class="follow-button-container">
            <button
              class="action-button follow-button"
              :class="{ following: isFollowing }"
              :disabled="followLoading"
              @click="toggleFollow"
            >
              {{ isFollowing ? 'Unfollow' : 'Follow' }}
            </button>
          </div>
        </div>

        <div class="edit" v-show="usersProfile">
          <p v-if="!editMode" @click="edit">
            <font-awesome-icon :icon="['fas', 'pen-to-square']" /> Edit profile info
          </p>
          <div v-else class="edit-mode-buttons">
            <p @click="saveChanges">Save Changes</p>
            <p @click="cancel">Cancel</p>
          </div>
        </div>
      </div>

      <div class="content">
        <Post :post="testPost"></Post>
      </div>
    </div>

    <div v-else class="error">
      <h1>Unable to go to {{ username }}'s profile</h1>
    </div>
  </div>
</template>

<script setup>
import bunnyImage from '@/assets/rabbit-marker.png';
import apiClient from '@/axios/axios';
import Post from '@/components/Post.vue';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

const store = useStore();
const user = computed(() => store.getters.getUser);

const route = useRoute();
const username = computed(() => route.query.username);

const profileUser = ref({});
const userNotFound = ref(true);
const usersProfile = ref(false);

const isFollowing = ref(false);
const followLoading = ref(false);

const profileStats = ref({
  postsCount: 0,
  followersCount: 0,
  followingCount: 0
});

const editMode = ref(false);
const editDetails = ref({
  id: -1,
  username: '',
  firstName: '',
  lastName: '',
  password: ''
});

const testPost = ref({
  likes: 10,
  description: "Cute bunny ^^"
});

onMounted(async () => {
  try {
    const response = await apiClient.get(`users/find/${encodeURIComponent(username.value)}`);
    profileUser.value = response.data;

    if (!profileUser.value || Object.keys(profileUser.value).length === 0) {
      userNotFound.value = true;
      return;
    }

    userNotFound.value = false;
    usersProfile.value = profileUser.value.id === user.value.id;

    if (usersProfile.value) {
      Object.assign(editDetails.value, {
        id: profileUser.value.id,
        username: profileUser.value.username,
        firstName: profileUser.value.firstName,
        lastName: profileUser.value.lastName,
        password: profileUser.value.password
      });
    }

    await loadProfileStats();

    if (!usersProfile.value) {
      await checkFollowStatus();
    }
  } catch (error) {
    console.error(error);
    userNotFound.value = true;
  }
});

async function loadProfileStats() {
  try {
    const encoded = encodeURIComponent(username.value);

    const followersRes = await apiClient.get(`/following/${encoded}/followers/count`);
    profileStats.value.followersCount = followersRes.data.count ?? 0;

    const followingRes = await apiClient.get(`/following/${encoded}/following/count`);
    profileStats.value.followingCount = followingRes.data.count ?? 0;

    const postsRes = await apiClient.get(`/users/${encoded}/posts/count`);
    profileStats.value.postsCount = postsRes.data ?? 0;
  } catch (error) {
    console.error('Error loading profile stats:', error);
  }
}

async function checkFollowStatus() {
  try {
    const encoded = encodeURIComponent(username.value);
    const response = await apiClient.get(`/following/is-following/${encoded}`);
    isFollowing.value = response.data.isFollowing;
  } catch (error) {
    console.error('Error checking follow status:', error);
    isFollowing.value = false;
  }
}

async function toggleFollow() {
  if (followLoading.value) return;
  followLoading.value = true;
  const encoded = encodeURIComponent(username.value);

  try {
    if (isFollowing.value) {
      await apiClient.delete(`/following/unfollow/${encoded}`);
      isFollowing.value = false;
      profileStats.value.followersCount = Math.max(0, profileStats.value.followersCount - 1);
    } else {
      await apiClient.post(`/following/follow/${encoded}`);
      isFollowing.value = true;
      profileStats.value.followersCount++;
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
  } finally {
    followLoading.value = false;
  }
}

function edit() {
  editMode.value = true;
}

function saveChanges() {
  // TODO: implement save API call, update profileUser with editDetails
  editMode.value = false;
}

function cancel() {
  Object.assign(editDetails.value, {
    id: profileUser.value.id,
    username: profileUser.value.username,
    firstName: profileUser.value.firstName,
    lastName: profileUser.value.lastName,
    password: profileUser.value.password
  });
  editMode.value = false;
}
</script>

<style scoped>
/* Tvoji postojeći stilovi - možeš ih zadržati */
.page-wrapper {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.menu {
  display: flex;
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
  justify-content: center;
  align-items: center;
}

.buttons {
  display: flex;
  flex-direction: row;
  gap: 4vw;
  align-items: center;
}

.button {
  height: 8vh;
  width: 15vw;
  max-width: 250px;
  cursor: pointer;
}

.edit {
  flex: content;
  padding-top: 20px;
  padding-right: 40px;
  display: flex;
  align-self: flex-start;
  justify-content: right;
}

.edit > * {
  align-items: center;
  gap: 0.5vw;
  white-space: nowrap;
  cursor: pointer;
}

.profile-details {
  flex: auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-left: 4vw;
  padding-top: 2vh;
  gap: 10px;
}

.full-name {
  display: flex;
  gap: 1vw;
}

.edit-input-full-name {
  display: flex;
  gap: 1vw;
  margin-bottom: 10px;
}

.edit-input {
  margin-bottom: 10px;
}

.edit-mode-buttons > * {
  width: fit-content;
  justify-self: right;
}

.stats {
  display: flex;
  justify-content: space-between;
  align-items: left;
  position: relative;
  width: 100%;
}

.follow-stats {
  display: flex;
  flex-direction: row;
  position: absolute;
  right: 20px;
  gap: 2rem;
  font-weight: 600;
  color: #ec5d43;
}

.follow-button-container {
  margin-top: 1rem;
}

.action-button {
  padding: 8px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  font-family: 'Delius Swash Caps', cursive;
}

.follow-button {
  background-color: #ec5d43;
  color: white;
  border-color: #ec5d43;
}

.follow-button:hover {
  background-color: #d94d33;
  border-color: #d94d33;
}

.follow-button.following {
  background-color: transparent;
  color: #4A4A4A;
  border-color: #dbdbdb;
}

.follow-button.following:hover {
  background-color: #fafafa;
}
</style>
