import LandingPage from '@/view/LandingPage.vue';
import LogIn from '@/view/LogIn.vue';
import RegisterUser from '@/view/RegisterUser.vue';
import ActivateAccount from '@/view/ActivateAccount.vue';
import CreatePost from '@/view/CreatePost.vue';
import BunnyFeed from '@/view/BunnyFeed.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { useStore } from 'vuex';
import UserProfile from '@/view/UserProfile.vue';

const routes = [
  {
    path: '/register',
    name: 'RegisterUser',
    component: RegisterUser,
    meta: { requiresGuest: true }
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
    meta: { requiresGuest: true },
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
    meta: { requiresAuth: true },
  },
  {
    path: '/feed',
    name: 'BunnyFeed',
    component: BunnyFeed
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfile,
    meta: { requiresAuth: true },
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const store = useStore();

  const isAuthenticated = store.state.user.id !== -1;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  }
  else if (isAuthenticated && to.meta.requiresGuest) {
    next('/');
  } else {
    if (to.name === 'UserProfile') {
      if (!to.query.username || to.query.username === "") {
        next('/');
        return;
      }
    }

    next();
  }
});

export default router;
