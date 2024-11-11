import { createApp } from 'vue';
import App from './App.vue';
import router from './router/router';
import store from './store/store';
import CoreUI from '@coreui/vue';
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import 'leaflet/dist/leaflet.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

library.add(fas)
const app = createApp(App);

app.use(router);
app.use(store);
app.use(CoreUI);

AOS.init({
    offset: 120
});

window.addEventListener('load', AOS.refresh);
window.addEventListener('resize', AOS.refresh);

app.component('font-awesome-icon', FontAwesomeIcon);

app.mount('#app');