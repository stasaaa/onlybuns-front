<template>
    <CNavbar expand="lg" color-scheme="light" class="bg-light">
        <CContainer fluid>
        <!-- Home Link on the left -->
            <CNavbarBrand>
                <router-link to="/" class="nav-link">Home</router-link>
            </CNavbarBrand>
  
        <!-- Navbar Toggler for mobile responsiveness -->
           <CNavbarToggler @click.prevent="visible = !visible" />
  
        <!-- Navbar Collapse for mobile-friendly navigation -->
            <CCollapse class="navbar-collapse" :visible="visible">
                <CNavbarNav class="ms-auto"> <!-- ms-auto: pushes nav items to the right -->
            <!-- Show logout button only if the user is logged in -->
                    <CNavItem v-if="user.id !== -1">
                        <CButton v-on:click.prevent="logout()">
                            <font-awesome-icon :icon="['fas', 'power-off']" />
                        </CButton>
                    </CNavItem>
  
            <!-- Show Login and Register buttons only if the user is not logged in -->
                    <div v-else style="display: flex;">
                        <CNavLink href="/login">Login</CNavLink>
                        <CNavLink href="/register">Register</CNavLink>
                    </div>
                </CNavbarNav>
            </CCollapse>
        </CContainer>
    </CNavbar>
</template>
  
<script setup>
import { useStore } from 'vuex';
import { computed, ref } from 'vue';
import { CButton, CNavbar, CNavbarBrand, CNavbarNav, CNavItem, CNavLink, CNavbarToggler, CCollapse, CContainer } from '@coreui/vue';
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

</style>