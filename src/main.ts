import { createApp } from 'vue';
import store from './stores';
import App from './App.vue';
import './style.css';

const app = createApp(App);

app.use(store);

app.mount('#app');
