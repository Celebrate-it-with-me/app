// Import Pinia
import {createPinia} from "pinia";
// Import Pinia Logger
import PiniaLogger from "pinia-logger";
// Import Vue Final Modal
import {createVfm} from "vue-final-modal";
// Import Router
import router from '@/router/index.ts';
// Import Locales
import i18n from '../locales/i18n';

// Register Plugin Function
export function registerPlugin(app) {
    // Create a new instance of Pinia
    const pinia = createPinia();

    // Use Pinia Logger
    pinia.use(
        PiniaLogger({
            // Expand Logs by default
            expanded: true,
            // Disable Logger for Production Environment
            disabled: import.meta.env.PROD
        })
    );

    // Use Vue Final Modal, Router and Pinia middleware in Vue App
    app
        .use(i18n)
        .use(createVfm())
        .use(router)
        .use(pinia);

    // Fetch cookie for sanctum from API
    fetch(`${import.meta.env.VITE_API_URL}sanctum/csrf-cookie`)
}
