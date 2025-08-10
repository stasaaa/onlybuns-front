<template>
  <div class="page-wrapper">
    <div v-if="!userNotFound" class="page">
      <div class="menu">
        <div class="profile-details">
          <div :class="['stats', { 'non-edit-mode': !editMode }]">
            <div class="username">
              <p v-if="!editMode">{{ profileUser.username }}</p>
              <input
                v-else
                type="text"
                class="edit-input"
                placeholder="Username"
                v-model="editDetails.username"
              />
            </div>
            <div class="follow-stats">
              <p @click="openFollowersDialog" class="clickable">
                Followers {{ profileStats.followersCount }}
              </p>
              <p @click="openFollowingDialog" class="clickable">
                Following {{ profileStats.followingCount }}
              </p>
            </div>
          </div>

          <p>{{ profileUser.email }}</p>

          <div class="full-name" v-if="!editMode">
            <p>{{ profileUser.firstName }}</p>
            <p>{{ profileUser.lastName }}</p>
          </div>
          <div class="edit-input-full-name" v-else>
            <input
              type="text"
              placeholder="First Name"
              v-model="editDetails.firstName"
            />
            <input
              type="text"
              placeholder="Last Name"
              v-model="editDetails.lastName"
            />
          </div>

          <div class="password-edit">
            <!-- TODO: implementacija promene lozinke -->
          </div>

          <div class="buttons">
            <button class="button">
              <img :src="bunnyImage" class="barIcon" /> Bunnies Located
            </button>
            <button class="button">
              <font-awesome-icon
                class="commentIcon"
                :icon="['fas', 'comment']"
              />
              Comments
            </button>
            <button class="button">
              <font-awesome-icon :icon="['fas', 'map-location-dot']" /> User's
              Location
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
              {{ isFollowing ? "Unfollow" : "Follow" }}
            </button>
          </div>
        </div>

        <div class="edit" v-show="usersProfile">
          <p v-if="!editMode" @click="edit">
            <font-awesome-icon :icon="['fas', 'pen-to-square']" /> Edit profile
            info
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
    <!-- Modal za Followers -->
    <div
      v-if="showFollowersDialog"
      class="modal-overlay"
      @click.self="closeFollowersDialog"
    >
      <div class="modal-content">
        <h3>Followers</h3>
        <div v-if="followersLoading">Loading followers...</div>
        <ul v-else>
          <li
            v-for="follower in followersList"
            :key="follower.id"
            class="modal-user-row"
          >
            <span
              >{{ follower.username }} ({{ follower.firstName }}
              {{ follower.lastName }})</span
            >
            <button
              class="modal-follow-btn"
              :disabled="followLoadingMap[follower.id]"
              @click="toggleFollowInModal(follower)"
            >
              {{ isFollowingMap[follower.id] ? "Unfollow" : "Follow" }}
            </button>
          </li>
          <li v-if="followersList.length === 0">No followers found.</li>
        </ul>
        <button @click="closeFollowersDialog">Close</button>
      </div>
    </div>

    <!-- Modal za Following -->
    <div
      v-if="showFollowingDialog"
      class="modal-overlay"
      @click.self="closeFollowingDialog"
    >
      <div class="modal-content">
        <h3>Following</h3>
        <div v-if="followingLoading">Loading following...</div>
        <ul v-else>
          <li
            v-for="user in followingList"
            :key="user.id"
            class="modal-user-row"
          >
            <span
              >{{ user.username }} ({{ user.firstName }}
              {{ user.lastName }})</span
            >
            <button
              class="modal-follow-btn"
              :disabled="followLoadingMap[user.id]"
              @click="toggleFollowInModal(user)"
            >
              {{ isFollowingMap[user.id] ? "Unfollow" : "Follow" }}
            </button>
          </li>
          <li v-if="followingList.length === 0">No users followed.</li>
        </ul>
        <button @click="closeFollowingDialog">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>

import bunnyImage from "@/assets/rabbit-marker.png";
import apiClient from "@/axios/axios";
import Post from "@/components/Post.vue";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";


const showFollowersDialog = ref(false);
const showFollowingDialog = ref(false);
const followersList = ref([]);
const followingList = ref([]);
const followersLoading = ref(false);
const followingLoading = ref(false);

const loadingProfile = ref(false);

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
  followingCount: 0,
});

const editMode = ref(false);
const editDetails = ref({
  id: -1,
  username: "",
  firstName: "",
  lastName: "",
  password: "",
});

const testPost = ref({
  likes: 10,
  description: "Cute bunny ^^",
});


watch(
  username,
  async (newUsername, oldUsername) => {
    if (!newUsername || newUsername === oldUsername) return;

    loadingProfile.value = true;


    if (showFollowersDialog.value) showFollowersDialog.value = false;
    if (showFollowingDialog.value) showFollowingDialog.value = false;

    followersList.value = [];
    followingList.value = [];

    try {
      const response = await apiClient.get(
        `users/find/${encodeURIComponent(newUsername)}`
      );
      profileUser.value = response.data;

      if (!profileUser.value || Object.keys(profileUser.value).length === 0) {
        userNotFound.value = true;
        loadingProfile.value = false;
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
          password: profileUser.value.password,
        });
      }

      await loadProfileStats();

      if (!usersProfile.value) {
        await checkFollowStatus();
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      userNotFound.value = true;
    } finally {
      loadingProfile.value = false;
    }
  },
  { immediate: true }
);

function openFollowersDialog() {
  if (!username.value) return;
  showFollowersDialog.value = true;
  loadFollowers();
}

function openFollowingDialog() {
  if (!username.value) return;
  showFollowingDialog.value = true;
  loadFollowing();
}

function closeFollowersDialog() {
  showFollowersDialog.value = false;
  followersList.value = [];
}

function closeFollowingDialog() {
  showFollowingDialog.value = false;
  followingList.value = [];
}

import { reactive } from "vue";

const isFollowingMap = reactive({}); // prati da li korisnik prati određenog usera
const followLoadingMap = reactive({}); // loading state za dugmad u modalu


async function updateFollowStatusForList(users) {
  for (const u of users) {
    try {
      const encoded = encodeURIComponent(u.username);
      const res = await apiClient.get(`/following/is-following/${encoded}`);
      isFollowingMap[u.id] = res.data.isFollowing;
      followLoadingMap[u.id] = false;
    } catch {
      isFollowingMap[u.id] = false;
      followLoadingMap[u.id] = false;
    }
  }
}


async function loadFollowers() {
  if (followersLoading.value) return;
  if (!username.value) {
    followersList.value = [];
    followersLoading.value = false;
    return;
  }
  followersLoading.value = true;
  try {
    const encoded = encodeURIComponent(username.value);
    const response = await apiClient.get(`/following/${encoded}/followers`);
    followersList.value = response.data;
    await updateFollowStatusForList(followersList.value);
  } catch (error) {
    followersList.value = [];
  } finally {
    followersLoading.value = false;
  }
}

async function loadFollowing() {
  if (followingLoading.value) return;
  if (!username.value) {
    followingList.value = [];
    followingLoading.value = false;
    return;
  }
  followingLoading.value = true;
  try {
    const encoded = encodeURIComponent(username.value);
    const response = await apiClient.get(`/following/${encoded}/following`);
    followingList.value = response.data;
    await updateFollowStatusForList(followingList.value);
  } catch (error) {
    followingList.value = [];
  } finally {
    followingLoading.value = false;
  }
}

async function toggleFollowInModal(user) {
  if (followLoadingMap[user.id]) return;
  followLoadingMap[user.id] = true;
  const encoded = encodeURIComponent(user.username);
  try {
    if (isFollowingMap[user.id]) {
      await apiClient.delete(`/following/unfollow/${encoded}`);
      isFollowingMap[user.id] = false;
      profileStats.value.followersCount = Math.max(
        0,
        profileStats.value.followersCount - 1
      );
    } else {
      await apiClient.post(`/following/follow/${encoded}`);
      isFollowingMap[user.id] = true;
      profileStats.value.followersCount++;
    }
  } catch (error) {
    console.error("Error toggling follow in modal:", error);
  } finally {
    followLoadingMap[user.id] = false;
  }
}


async function loadProfileStats() {
  try {
    const encoded = encodeURIComponent(username.value);

    const followersRes = await apiClient.get(
      `/following/${encoded}/followers/count`
    );
    profileStats.value.followersCount = followersRes.data.count ?? 0;

    const followingRes = await apiClient.get(
      `/following/${encoded}/following/count`
    );
    profileStats.value.followingCount = followingRes.data.count ?? 0;

    const postsRes = await apiClient.get(`/users/${encoded}/posts/count`);
    profileStats.value.postsCount = postsRes.data ?? 0;
  } catch (error) {
    console.error("Error loading profile stats:", error);
  }
}

// Proveri da li trenutni user prati profil koji gledamo
async function checkFollowStatus() {
  try {
    const encoded = encodeURIComponent(username.value);
    const response = await apiClient.get(`/following/is-following/${encoded}`);
    isFollowing.value = response.data.isFollowing;
  } catch (error) {
    console.error("Error checking follow status:", error);
    isFollowing.value = false;
  }
}

// Toggle follow/unfollow akcija
async function toggleFollow() {
  if (followLoading.value) return;
  followLoading.value = true;
  const encoded = encodeURIComponent(username.value);

  try {
    if (isFollowing.value) {
      await apiClient.delete(`/following/unfollow/${encoded}`);
      isFollowing.value = false;
      profileStats.value.followersCount = Math.max(
        0,
        profileStats.value.followersCount - 1
      );
    } else {
      await apiClient.post(`/following/follow/${encoded}`);
      isFollowing.value = true;
      profileStats.value.followersCount++;
    }
  } catch (error) {
    console.error("Error toggling follow:", error);
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
    password: profileUser.value.password,
  });
  editMode.value = false;
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Delius+Swash+Caps&display=swap");

.page-wrapper {
  max-width: 1000px;
  margin: 2rem auto;
  font-family: "Delius Swash Caps", cursive;
  color: #4a4a4a;
  background-color: #f5f5f0;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  min-height: 80vh;
}

.page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Menu/Profile details styling */
.menu {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-details {
  background: white;
  border-radius: 12px;
  padding: 1.8rem 2rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.07);
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.username p,
.username input {
  font-size: 1.8rem;
  font-weight: 600; /* blaži bold */
  color: #ec5d43;
}

.edit-input {
  font-size: 1.6rem;
  padding: 0.3rem 0.6rem;
  border: 2px solid #ec5d43;
  border-radius: 8px;
  outline-offset: 2px;
}

.stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  position: relative;
}

.follow-stats {
  display: flex;
  gap: 3rem;
  font-weight: 500; /* blaži */
  color: #ec5d43;
  cursor: pointer;
}

.follow-stats p:hover {
  text-decoration: underline;
}

.full-name p {
  font-size: 1.4rem;
  font-weight: 400; /* normalno */
  color: #4a4a4a;
  margin-right: 1.2rem;
}

.edit-input-full-name input {
  font-size: 1.3rem;
  padding: 0.3rem 0.6rem;
  border: 2px solid #ec5d43;
  border-radius: 8px;
  outline-offset: 2px;
  width: 45%;
}

.buttons {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
}

.button {
  flex: 1;
  height: 45px;
  background-color: #ec5d43;
  border: none;
  color: white;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.3s ease;
}

.button:hover {
  background-color: #d94d33;
}

.barIcon {
  width: 24px;
  height: 24px;
}

.commentIcon {
  font-size: 1.3rem;
}

.follow-button-container {
  margin-top: 1.5rem;
}

.action-button.follow-button {
  width: 150px;
  padding: 10px 0;
  font-weight: 600; /* blaži */
  border-radius: 12px;
  border: 2px solid #ec5d43;
  background-color: #ec5d43;
  color: white;
  transition: background-color 0.3s ease, color 0.3s ease;
  cursor: pointer;
  font-size: 1.1rem;
}

.action-button.follow-button.following {
  background-color: transparent;
  color: #4a4a4a;
  border-color: #dbdbdb;
}

.action-button.follow-button.following:hover {
  background-color: #fafafa;
}

.action-button.follow-button:hover {
  background-color: #d94d33;
  border-color: #d94d33;
}

.edit {
  align-self: flex-end;
  font-weight: 600;
  color: #ec5d43;
  cursor: pointer;
  user-select: none;
}

.edit > * {
  margin-left: 1.2rem;
}

.modal-user-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 0.5rem;
  border-bottom: 1px solid #eee;
  font-weight: 500;
  color: #4a4a4a;
  font-family: "Delius Swash Caps", cursive; /* tvoj font */
}

.modal-follow-btn {
  background-color: #ec5d43;
  border: none;
  border-radius: 12px;
  padding: 4px 10px;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-family: "Delius Swash Caps", cursive;
}

.modal-follow-btn:hover:not(:disabled) {
  background-color: #d94d33;
}

.modal-follow-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.edit-mode-buttons p {
  display: inline-block;
  cursor: pointer;
  color: #ec5d43;
  font-weight: 600;
  font-family: "Delius Swash Caps", cursive;
}

.edit-mode-buttons p:hover {
  text-decoration: underline;
}

/* Content section */
.content {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  font-family: "Delius Swash Caps", cursive;
  font-weight: 400;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.modal-content {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  width: 420px; /* malo šire */
  max-height: 70vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  font-family: "Delius Swash Caps", cursive;
  font-weight: 400;
}

.modal-content h3 {
  font-size: 1.8rem;
  color: #ec5d43;
  margin-bottom: 1rem;
  font-weight: 700;
  text-align: center;
  font-family: "Delius Swash Caps", cursive;
}

.modal-content ul {
  list-style: none;
  padding-left: 0;
  max-height: 300px;
  overflow-y: auto;
}

.modal-content li {
  padding: 0.4rem 0;
  font-size: 1.1rem;
  border-bottom: 1px solid #eee;
  font-family: "Delius Swash Caps", cursive;
  font-weight: 400;
  color: #4a4a4a;
}

.modal-content li a {
  color: #4a4a4a;
  text-decoration: none;
  font-weight: 600;
  font-family: "Delius Swash Caps", cursive;
}

.modal-content li a:hover {
  color: #ec5d43;
  text-decoration: underline;
}

/* Modal close button styling */
.modal-content button {
  margin-top: 1.2rem;
  display: block;
  width: 100%;
  padding: 0.7rem 0;
  border: none;
  border-radius: 12px;
  background-color: #ec5d43;
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background-color 0.3s ease;
  font-family: "Delius Swash Caps", cursive;
}

.modal-content button:hover {
  background-color: #d94d33;
}

/* Error view */
.error {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
  font-size: 2rem;
  font-weight: 700;
  color: #ec5d43;
  text-align: center;
  padding: 0 2rem;
  font-family: "Delius Swash Caps", cursive;
}

/* Responsive */
@media (max-width: 768px) {
  .page-wrapper {
    margin: 1rem;
    padding: 1rem;
  }

  .buttons {
    flex-direction: column;
  }

  .button {
    width: 100%;
  }

  .edit-input-full-name input {
    width: 100%;
  }

  .modal-content {
    width: 90%;
    max-height: 60vh;
  }
}
</style>
