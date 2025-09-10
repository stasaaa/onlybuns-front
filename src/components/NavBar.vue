<template>
  <CNavbar expand="lg" color-scheme="light" class="navbar-custom">
    <CContainer fluid>
      <CNavbarBrand>
        <router-link to="/" class="nav-link brand-link">OnlyBuns</router-link>
      </CNavbarBrand>

      <CNavbarToggler @click.prevent="visible = !visible" />

      <CCollapse class="navbar-collapse" :visible="visible">
        <CNavbarNav class="ms-auto">

          <!-- Logged in user navigation -->
          <template v-if="isLoggedIn">

            <!-- Posts & Feed Dropdown -->
            <CDropdown variant="nav-item">
              <CDropdownToggle class="nav-item-custom">Posts & Feed</CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem v-if="!isAdmin" href="/feed">Feed</CDropdownItem>
                <CDropdownItem v-if="!isAdmin" href="/createPost">Create Post</CDropdownItem>
                <CDropdownItem v-if="!isAdmin" href="/near-me">Near Me</CDropdownItem>
                <CDropdownItem v-if="isAdmin" href="/all-posts">All Posts</CDropdownItem>
                <CDropdownItem v-if="isAdmin" href="/advertise-posts">Advertise Posts</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>

            <!-- Analytics Dropdown -->
            <CDropdown variant="nav-item">
              <CDropdownToggle class="nav-item-custom">Analytics</CDropdownToggle>
              <CDropdownMenu> 
                <CDropdownItem href="/trends">Trends</CDropdownItem>
                <CDropdownItem v-if="isAdmin" href="/analytics">App Analytics</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>

            <!-- User Dropdown -->
            <CDropdown variant="nav-item">
              <CDropdownToggle class="nav-item-custom">User</CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem :href="'/profile?username=' + user.username">Profile</CDropdownItem>
                <CDropdownItem  href="/chat">Chat</CDropdownItem>
                <CDropdownItem v-if="isAdmin" href="/registered-users">Registered Users</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>

            <!-- Logout Button -->
            <CNavItem>
              <CButton v-on:click.prevent="logout()" class="logout-btn">
                <font-awesome-icon :icon="['fas', 'power-off']" />
              </CButton>
            </CNavItem>
          </template>

          <!-- Login/Register for Non-Logged In Users -->
          <div v-else style="display: flex;">
            <CNavLink href="/login" class="nav-item-custom">Login</CNavLink>
            <CNavLink href="/register" class="nav-item-custom">Register</CNavLink>
          </div>

        </CNavbarNav>
      </CCollapse>
    </CContainer>
  </CNavbar>
</template>

<script setup>
import router from '@/router/router';
import {
  CButton,
  CCollapse,
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CNavbar,
  CNavbarBrand,
  CNavbarNav,
  CNavbarToggler,
  CNavItem,
  CNavLink
} from '@coreui/vue';
import { computed, ref } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const user = computed(() => store.getters.getUser);

const isLoggedIn = computed(() => user.value && user.value.id !== -1);
const isAdmin = computed(() => user.value.userRole === 'ADMIN');

const visible = ref(false);

const logout = async () => {
  await store.dispatch('resetUser');
  await store.dispatch('resetToken');
  sessionStorage.removeItem('authToken');
  router.push('/');
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Delius+Swash+Caps&display=swap');

.navbar-custom {
  background-color: #F5F5F0;
  padding: 1rem 2rem;
}

.brand-link {
  font-family: 'Delius Swash Caps', cursive;
  font-weight: 700;
  font-size: 1.5rem;
  color: #ec5d43;
  text-decoration: none;
}

.nav-item-custom {
  font-family: 'Delius Swash Caps', cursive;
  font-weight: 600;
  color: #4A4A4A;
  padding: 0.5rem 1rem;
}

.nav-item-custom:hover {
  color: #ec5d43;
}

.logout-btn {
  background-color: #F5F5F0;
  border: none;
  width: 40px;
  height: 40px;
  color: #4A4A4A;
  margin-left: 0.5rem;
}

.logout-btn:hover {
  background-color: #f18571;
  color: white;
}

:deep(.dropdown-menu) {
  background-color: #F5F5F0;
  border: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

:deep(.dropdown-item) {
  font-family: 'Delius Swash Caps', cursive;
  color: #4A4A4A;
}

:deep(.dropdown-item:hover) {
  background-color: #e6ece5;
  color: #ec5d43;
}

.nav-item {
  margin-left: 0.5rem;
}
</style>
