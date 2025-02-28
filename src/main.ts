import './assets/main.css'
import './assets/flags.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import Button from 'primevue/button';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import router from './router'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import Ripple from 'primevue/ripple';
import StyleClass from 'primevue/styleclass';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import AnimateOnScroll from 'primevue/animateonscroll';
import Toast from 'primevue/toast';

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    },
}, { ripple: true });

app.component('Toast', Toast);
app.component('Button', Button);
app.component('TabView', TabView);
app.component('TabPanel', TabPanel);
app.component('Card', Card);
app.component('InputText', InputText);

app.use(ToastService);
app.use(ConfirmationService);

app.directive('ripple', Ripple);
app.directive('styleclass', StyleClass); 
app.directive('animateonscroll', AnimateOnScroll);

app.mount('#app')
