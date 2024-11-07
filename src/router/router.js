import LandingPage from '@/view/LandingPage.vue';
import LogIn from '@/view/LogIn.vue';
import RegisterUser from '@/view/RegisterUser.vue';
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/register',
    name: 'RegisterUser',
    component: RegisterUser,
  },
  {
    path: '/',
    name: 'LandingPage',
    component: LandingPage
  },
  {
    path: '/login',
    name: 'LogIn',
    component: LogIn
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;