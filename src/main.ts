import './assets/main.css'
import './assets/flags.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import Ripple from 'primevue/ripple';
import StyleClass from 'primevue/styleclass';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';

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

app.use(ToastService);
app.use(ConfirmationService);

app.directive('ripple', Ripple);
app.directive('styleclass', StyleClass); 

app.mount('#app')
