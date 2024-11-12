<template>
    <div class="page-wrapper">
        <div v-if="userNotFound">
            <CSidebar>
                <CSidebarHeader style="display: flex; flex-direction: column;">
                    <CSidebarBrand>{{ username }}</CSidebarBrand>
                    <CCardText>{{ profileUser.email }}</CCardText>
                    <CCardText>{{ profileUser.firstName }}</CCardText>
                    <CCardText>{{ profileUser.lastName }}</CCardText>
                </CSidebarHeader>
                <CSidebarNav>
                    <CNavItem href="#">
                        <p><img :src="bunnyImage" class="barIcon"/> Bunnies located</p>
                    </CNavItem>
                    <CNavItem href="#">
                        <p><font-awesome-icon class="commentIcon" :icon="['fas', 'comment']" /></p>
                    </CNavItem>
                </CSidebarNav>
            </CSidebar>
        </div>
        <div v-else class="error">
            <h1>Unable to go to {{ username }}'s profile</h1>
        </div>
    </div>
</template>

<script setup>
import apiClient from '@/axios/axios';
import { CCardText, CNavItem, CSidebar, CSidebarBrand, CSidebarHeader, CSidebarNav } from '@coreui/vue';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import bunnyImage from '@/assets/rabbit-marker.png'

const store = useStore();
const user = computed(() => store.getters.getUser);

const route = useRoute();
const username = computed(() => route.query.username);
const profileUser = ref([]);

const userNotFound = ref(false);
const usersProfile = ref(false);

onMounted(async () => {
    apiClient.get(`users/find/${username.value}`)
    .then((response) => {
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
})
</script>

<style scoped>
.page-wrapper {
    min-height: 88.9vh;
    width: 100%;
    height: 100%;
    margin: 0%;
    padding: 0%;
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
</style>