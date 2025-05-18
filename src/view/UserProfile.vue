<template>
    <div class="page-wrapper">
        <div v-if="userNotFound" class="page">
            <div class="menu">
                <div class="profile-details">
                    <div :class="['stats', { 'non-edit-mode': !editMode }]">
                        <div class="username">
                            <p v-if="!editMode">{{ username }}</p>
                            <input v-else type="text" class="edit-input" placeholder="Username" v-model="editDetails.username"/>
                        </div>
                        <div class="follow-stats">
                            <p>Followers {{ profileUser.followers }}</p>
                            <p>Following {{ profileUser.followers }}</p>
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
                        <!-- TODO -->
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
                </div>
                <div class="edit" v-show="usersProfile">
                    <p  v-on:click="edit()" v-if="!editMode">
                        <font-awesome-icon :icon="['fas', 'pen-to-square']" /> Edit profile info
                    </p>
                    <div v-else class="edit-mode-buttons">
                        <p v-on:click="saveChanges()">Save Changes</p>
                        <p v-on:click="cancle()">Cancle</p>
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
/* eslint-disable */
import apiClient from '@/axios/axios';
import { CCardText, CNavItem, CSidebar, CSidebarBrand, CSidebarHeader, CSidebarNav } from '@coreui/vue';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import bunnyImage from '@/assets/rabbit-marker.png'
import Post from '@/components/Post.vue';

const store = useStore();
const user = computed(() => store.getters.getUser);

const route = useRoute();
const username = computed(() => route.query.username);
const profileUser = ref([]);

const userNotFound = ref(false);
const usersProfile = ref(false);

const testPost = ref({
    likes: 10,
    description: "Cute bunny ^^"
});

const editMode = ref(false);
const editDetails = ref({
    id: -1,
    username: '',
    firstName: '',
    lastName: '',
    password: ''
});

onMounted(async () => {
  try {
    const response = await apiClient.get(`users/find/${username.value}`);
    profileUser.value = response.data;

    if (profileUser.value === null) {
      userNotFound.value = false;
      return;
    }

    userNotFound.value = true;
    usersProfile.value = profileUser.value.id === user.value.id;
    if(usersProfile) {
        editDetails.value.id = profileUser.value.id;
        editDetails.value.username = profileUser.value.username;
        editDetails.value.firstName = profileUser.value.firstName;
        editDetails.value.lastName = profileUser.value.lastName;
        editDetails.value.password = profileUser.value.password;
    }

  } catch (error) {
    console.log(error);
  }
});

function edit() {
    editMode.value = !editMode.value;
}

function saveChanges() {
    //TODO

    editMode.value = !editMode.value;
}

function cancle() {
    if(editDetails.value.id !== profileUser.value.id ||
        editDetails.value.username !== profileUser.value.username ||
        editDetails.value.firstName !== profileUser.value.firstName ||
        editDetails.value.lastName !== profileUser.value.lastName ||
        editDetails.value.password !== profileUser.value.password) {
        //TODO
    }

    editMode.value = !editMode.value;

}

</script>

<style scoped>
.page-wrapper {
    width: 100%;
    height: 100%;
    margin: 0%;
    padding: 0%;
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
  justify-content: center; /* Fixed typo from justify-self to justify-content */
  align-items: center; /* Center icon vertically */
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
}

.follow-stats {
    display: flex;
    flex-direction: row;
    position: absolute;
    left: 500px;
    gap: 250px;
}
</style>