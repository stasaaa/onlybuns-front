import LandingPage from '@/view/LandingPage.vue';
import LogIn from '@/view/LogIn.vue';
import RegisterUser from '@/view/RegisterUser.vue';
import ActivateAccount from '@/view/ActivateAccount.vue';
import CreatePost from '@/view/CreatePost.vue';
import { createRouter, createWebHistory } from 'vue-router';
import CreatePost from '@/view/CreatePost.vue';
import { useStore } from 'vuex';  // Import the useStore hook

const routes = [
  {
    path: '/register',
    name: 'RegisterUser',
    component: RegisterUser,
    meta: { requiresGuest: true },  // Add metadata for pages that require unauthenticated users
  },
  {
    path: '/',
    name: 'LandingPage',
    component: LandingPage,
  },
  {
    path: '/login',
    name: 'LogIn',
    component: LogIn,
    meta: { requiresGuest: true },  // Allow only unauthenticated users
  },
  {
    path: '/activate',
    name: 'ActivateAccount',
    component: ActivateAccount,
  },
  {
    path: '/createPost',
    name: 'CreatePost',
    component: CreatePost,
    meta: { requiresAuth: true },  // Add metadata for pages that require authentication
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const store = useStore();

  const isAuthenticated = store.state.user.id !== -1;  // Check if the user is authenticated

  // If the user is not authenticated and trying to access a protected route
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');  // Redirect to login page
  } 
  // If the user is authenticated and trying to access login/register pages, redirect them away
  else if (isAuthenticated && to.meta.requiresGuest) {
    next('/');  // Redirect to the landing page (or another appropriate route)
  } else {
    next();  // Proceed as usual
  }
});

export default router;
