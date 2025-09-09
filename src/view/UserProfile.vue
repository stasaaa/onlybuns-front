<template>
  <div class="page-wrapper">
    <div v-if="!userNotFound" class="page">
      <div class="menu">
        <div class="profile-details">
          <div :class="['stats', { 'non-edit-mode': !editMode }]">
            <div class="username">
              <p>{{ profileUser.username }}</p>
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
            <p>{{ profileUser.firstName }} {{ profileUser.lastName }}</p>
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

          <div class="password-edit" v-if="editMode">
            <div class="edit-input-full-name">
              <p>Old Password</p>
              <input type="password" v-model="passwordEdit.old"/>
            </div>
            <div class="edit-input-full-name">
              <p>New Password</p>
              <input type="password" v-model="passwordEdit.new"/>
              <br/>
              <p>Confirm New Password</p>
              <input type="password" v-model="passwordEdit.confirmNew"/>
              <p style="color: red;">{{errorMsg}}</p>
            </div>
            <div>
              <button
                v-on:click="changePassword()"
                style="margin-top: 9rem;">
                Save Password Change
              </button>
            </div>
          </div>

          <div class="buttons">
            <button class="button" @click="changeToPosts">
              <img :src="bunnyImage" class="barIcon" /> Bunnies Located
            </button>
            <button class="button" @click="changeToComments">
              <font-awesome-icon
                class="commentIcon"
                :icon="['fas', 'comment']"
              />
              Comments
            </button>
            <button class="button" @click="changeToUserLocation">
              <font-awesome-icon :icon="['fas', 'map-location-dot']" /> User's
              Location
            </button>
          </div>

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

      <div v-if="showComments == 'POST'">
        <div class="content" v-if="posts.length">
          <PostComponent
            v-for="post in posts"
            :key="post.id"
            :post="post"
            :userId="user.id"
            @post-updated="refreshPosts"
            @post-edited="updatePost"
            @post-deleted="removePost"
          />
        </div>
        <div v-else>
          <p>No Posts</p>
        </div>
      </div>
      <div v-else-if="showComments == 'COMMENT'">
        <div class="comments">
          <div class="comment" v-for="comment in comments" :key="comment.id">
            <div class="comment-info">
              <p>{{ profileUser.username }}</p>
              <p>{{ comment.creationTime }}</p>
            </div>
            <div>
              <p>{{ comment.content }}</p>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <div class="map">
          <MapComponent ref="mapRef"
                        :changeUserLocation="false"
                        :userLocation="[profileUser.address.latitude, profileUser.address.longitude]"
                        :showUserLocation="true"
                        :multipleBunnies="false" 
                        :disableClick="true"/>
        </div>
      </div>
    </div>

    <div v-else class="error">
      <h1>Unable to go to {{ username }}'s profile</h1>
    </div>

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
          </li>
          <li v-if="followersList.length === 0">No followers found.</li>
        </ul>
        <button @click="closeFollowersDialog">Close</button>
      </div>
    </div>

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
import PostComponent from "@/components/Post.vue";
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

const updatePost = (updatedPost) => {
  const index = posts.value.findIndex((p) => p.id === updatedPost.id);
  if (index !== -1) posts.value[index] = updatedPost;
};

const removePost = (postId) => {
  posts.value = posts.value.filter((p) => p.id !== postId);
};

function getComments() {
  apiClient.get(`/comments/user/${profileUser.value.id}`)
  .then((response) => {
    console.log('AAAAAAAAAAAA')
    console.log(response)
    comments.value = response.data
  })
  .catch((error) => {
    console.log('BBBBBBBBBBBB')
    console.log(error)
  })
}

function refreshPosts() {
  getPosts()
}

function changeToComments() {
  showComments.value = 'COMMENT'
  getComments();
}

function changeToPosts() {
  showComments.value = 'POST'
}

function changeToUserLocation() {
  showComments.value = 'MAP'
}

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

const posts = ref([])

const passwordEdit = ref({
  old: '',
  new: '',
  confirmNew: ''
})

const errorMsg = ref("")

const showComments = ref('POST')
const comments = ref([])

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
      await getPosts();
      await getComments();

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
import MapComponent from "@/components/MapComponent.vue";

const isFollowingMap = reactive({});
const followLoadingMap = reactive({});

async function getPosts() {
  apiClient.get(`/posts/user/${profileUser.value.id}`)
  .then(async (response) => {
    posts.value = response.data
    console.log(posts.value)

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
  })
  .catch((error) => {
    alert(error)
  })
}

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
    const response = await apiClient.get(`/following/${profileUser.value.username}/followers`);
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
    const response = await apiClient.get(`/following/${profileUser.value.username}/followed`);
    followingList.value = response.data;
    await updateFollowStatusForList(followingList.value);
  } catch (error) {
    followingList.value = [];
  } finally {
    followingLoading.value = false;
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

function changePassword() {
  try {
    if(passwordEdit.value.old == "" ||
      passwordEdit.value.new == "" ||
      passwordEdit.value.confirmNew == ""
    ) {
      errorMsg.value = "All fileds are required"
      return
    }

    if(passwordEdit.value.confirmNew !== passwordEdit.value.new) {
      errorMsg.value = "Passwords do not match"
      return
    }

    var updatePassword = {
      userId: user.value.id,
      oldPassword: passwordEdit.value.old,
      newPassword: passwordEdit.value.new,
      confirmNewPassword: passwordEdit.value.confirmNew
    }



    apiClient.put(`/authentication/update-password`, updatePassword)
    .then(() => {
      alert("Password successfully changed")
      errorMsg.value = ""
      passwordEdit.value.old = ""
      passwordEdit.value.new = ""
      passwordEdit.value.confirmNew = ""
    })
    .catch((error) => {
      errorMsg.value = error.response?.data || "Unexpected error"
    })
  } catch (error) {
    alert(error);
  }
}

function edit() {
  editMode.value = true;
}

function saveChanges() {
  let updateProfileInfo = {
    id: user.value.id,
    firstName: editDetails.value.firstName,
    lastName: editDetails.value.lastName,
    username: editDetails.value.username
  }

  apiClient.post(`/users`, updateProfileInfo)
  .then((response) => {
    const userData = response.data;
    store.dispatch('setUser', userData);
    sessionStorage.setItem('user', JSON.stringify(userData));

    profileUser.value = userData
    user.value = userData
    editMode.value = false; 
  }).catch((error) => {
    console.log(error)
  })
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
  margin-left: 1rem;
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

.password-edit{
  display: flex;
  justify-content: center;
  gap: 2rem;
  border: 2px solid lightgray;
  border-radius: 10px;
  padding: 2rem;
}

.password-edit input {
  width: 20rem;
  margin-bottom: 1rem;
}

.comments {
  columns: 300px 5;
}

.comment {
  background-color: lightgray;
  border-radius: 10px;
  padding: 5px;
  break-inside: avoid;
}

.comment-info {
  display: flex;
  justify-content: space-evenly;
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
