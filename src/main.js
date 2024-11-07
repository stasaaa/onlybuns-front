import { createApp } from 'vue';
import App from './App.vue';
import router from './router/router';
import store from './store/store';
import CoreUI from '@coreui/vue';

const app = createApp(App);

app.use(router);
app.use(store);
app.use(CoreUI);

app.mount('#app');