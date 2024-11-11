<template>
    <CNavbar expand="lg" color-scheme="light" class="navbar-custom">
        <CContainer fluid>
            <CNavbarBrand>
                <router-link to="/" class="nav-link brand-link">OnlyBuns</router-link>
            </CNavbarBrand>

            <CNavbarToggler @click.prevent="visible = !visible" />

            <CCollapse class="navbar-collapse" :visible="visible">
                <!-- All navigation items on the right -->
                <CNavbarNav class="ms-auto">
                    <!-- Logged in user navigation -->
                    <template v-if="user.id !== -1">
                        <!-- Posts & Feed Dropdown -->
                        <CDropdown variant="nav-item">
                            <CDropdownToggle class="nav-item-custom">Posts & Feed</CDropdownToggle>
                            <CDropdownMenu>
                                <CDropdownItem href="/feed">Feed</CDropdownItem>
                                <CDropdownItem href="/createPost">Create Post</CDropdownItem>
                                <CDropdownItem href="/near-me">Near Me</CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>

                        <!-- Analytics Dropdown -->
                        <CDropdown variant="nav-item">
                            <CDropdownToggle class="nav-item-custom">Analytics</CDropdownToggle>
                            <CDropdownMenu>
                                <CDropdownItem href="/trends">Trends</CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>

                        <!-- User Dropdown -->
                        <CDropdown variant="nav-item">
                            <CDropdownToggle class="nav-item-custom">User</CDropdownToggle>
                            <CDropdownMenu>
                                <CDropdownItem href="/profile">Profile</CDropdownItem>
                                <CDropdownItem href="/chat">Chat</CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>

                        <!-- Logout Button -->
                        <CNavItem>
                            <CButton v-on:click.prevent="logout()" class="logout-btn">
                                <font-awesome-icon :icon="['fas', 'power-off']" />
                            </CButton>
                        </CNavItem>
                    </template>

                    <!-- Login/Register for non-logged in users -->
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
import { useStore } from 'vuex';
import { computed, ref } from 'vue';
import { 
    CButton, 
    CNavbar, 
    CNavbarBrand, 
    CNavbarNav, 
    CNavItem, 
    CNavLink, 
    CNavbarToggler, 
    CCollapse, 
    CContainer,
    CDropdown,
    CDropdownToggle,
    CDropdownMenu,
    CDropdownItem
} from '@coreui/vue';
import router from '@/router/router';

const store = useStore();
const user = computed(() => store.getters.getUser);

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
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
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