import { createApp } from 'vue';
import App from './App.vue';
import router from './router/router';
import store from './store/store';
import CoreUI from '@coreui/vue';
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(fas)
const app = createApp(App);

app.use(router);
app.use(store);
app.use(CoreUI);

app.component('font-awesome-icon', FontAwesomeIcon);

app.mount('#app');