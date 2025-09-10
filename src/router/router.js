
import AppAnalytics from "@/components/AppAnalytics.vue";
import ActivateAccount from '@/view/ActivateAccount.vue';
import BunnyFeed from '@/view/BunnyFeed.vue';
import ChatPage from '@/view/ChatPage.vue';
import CreatePost from '@/view/CreatePost.vue';
import LandingPage from '@/view/LandingPage.vue';
import LogIn from '@/view/LogIn.vue';
import NearMe from '@/view/NearMe.vue';
import RegisteredUsers from '@/view/RegisteredUsers.vue';
import RegisterUser from '@/view/RegisterUser.vue';
import TrendingPage from '@/view/TrendingPage.vue';
import UserProfile from '@/view/UserProfile.vue';
import AdvertisePosts from "@/view/AdvertisePosts.vue";
import { createRouter, createWebHistory } from 'vue-router';
import { useStore } from 'vuex';

const routes = [
  {
    path: "/register",
    name: "RegisterUser",
    component: RegisterUser,
    meta: { requiresGuest: true },
  },
  {
    path: "/",
    name: "LandingPage",
    component: LandingPage,
  },
  {
    path: "/login",
    name: "LogIn",
    component: LogIn,
    meta: { requiresGuest: true },
  },
  {
    path: "/activate",
    name: "ActivateAccount",
    component: ActivateAccount,
  },
  {
    path: "/createPost",
    name: "CreatePost",
    component: CreatePost,
    meta: { requiresAuth: true },
  },
  {
    path: "/feed",
    name: "BunnyFeed",
    component: BunnyFeed,
  },
  {
    path: "/registered-users",
    name: "RegisteredUsers",
    component: RegisteredUsers,
    meta: { requiresAuth: true, requiresAdmin: true },

  },
  {
    path: "/profile",
    name: "UserProfile",
    component: UserProfile,
    meta: {requiresAuth: true}
  },
  {
    path: '/trends',
    name: 'TrendingPage',
    component: TrendingPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/'
  },
  {
    path: '/near-me',
    name: 'NearMe',
    component: NearMe,
    meta: { requiresAuth: true },
  }
  ,
  {
    path: "/analytics",
    name: "Analytics",
    component: AppAnalytics,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/:catchAll(.*)",
    redirect: "/",
  },
  {
    path: "/chat",
    name: "ChatPage",
    component: ChatPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/advertise-posts',
    name: 'AdvertisePosts',
    component: AdvertisePosts,
    meta: { requiresAuth: true, requiresAdmin: true }
  },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const store = useStore();
  const isAuthenticated = store.state.user.id !== -1;
  const isAdmin = store.state.user.userRole === "ADMIN";

  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
  } else if (isAuthenticated && to.meta.requiresGuest) {
    next("/");
  } else if (to.meta.requiresAdmin && !isAdmin) {
    next("/"); // Redirect non-admin users to home
  } else {
    if (to.name === "UserProfile") {
      if (!to.query.username || to.query.username === "") {
        next("/");
        return;
      }
    }
    next();
  }
});

export default router;
