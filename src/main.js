import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia';
import router from '@/shared/router';
import i18n from "./i18n.js";
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';

import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'
import ToggleSwitch from 'primevue/toggleswitch'
import DatePicker from 'primevue/datepicker'
import Checkbox from 'primevue/checkbox'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'
import RadioButton from 'primevue/radiobutton'
import Textarea from 'primevue/textarea'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

createApp(App)
    .use(i18n)
    .use(router)
    .use(PrimeVue, {
        ripple: true,
        theme: {
            preset: Aura,
            options: {
                darkModeSelector: false
            }
        }
    })
    .use(createPinia())
    .component('pv-input-text', InputText)
    .component('pv-password', Password)
    .component('pv-button', Button)
    .component('pv-select', Select)
    .component('pv-input-number', InputNumber)
    .component('ToggleSwitch', ToggleSwitch)
    .component('pv-date-picker', DatePicker)
    .component('pv-checkbox', Checkbox)
    .component('pv-card', Card)
    .component('pv-tag', Tag)
    .component('pv-avatar', Avatar)
    .component('pv-radio-button', RadioButton)
    .component('pv-textarea', Textarea)
    .component('pv-icon-field', IconField)
    .component('pv-input-icon', InputIcon)
    .mount('#app')
