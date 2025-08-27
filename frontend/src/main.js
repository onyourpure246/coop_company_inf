import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import AppNotification from './components/common/Notification.vue'
import './assets/css/global.css'; 
import '@/Sarabun-Regular-normal.js';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { plugin, defaultConfig } from '@formkit/vue'
import config from './formkit.config';
import '@formkit/themes/genesis';
import '@/assets/css/formkit-custom-theme.css';


library.add(fas);

// Create the Vue app
const app = createApp(App);

// Register the FontAwesomeIcon component globally
app.component('font-awesome-icon', FontAwesomeIcon);
app.component('app-notification', AppNotification);
app.use(plugin, defaultConfig(config));

// Use the router
app.use(router);

// Mount the app
app.mount('#app');