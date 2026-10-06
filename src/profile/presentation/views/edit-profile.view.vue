<script setup>
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useProfileStore from "../../application/profile.store.js";
import EditProfileForm from "../components/edit-profile-form.vue";

const {t} = useI18n();
const router = useRouter();
const profileStore = useProfileStore();

const saved = ref(false);
const saveError = ref(false);

onMounted(() => {
  // if the user opens /profile/edit directly, the profile is not loaded yet
  if (!profileStore.profile) {
    const userId = localStorage.getItem('userId') || 1;
    profileStore.fetchProfile(userId);
  }
});

/**
 * receives the data from the form and saves it.
 * @param {{profile: object, password: string}} data - edited profile and new password.
 */
function saveProfile(data) {
  saved.value = false;
  saveError.value = false;
  profileStore.updateProfile(data.profile, data.password).then(ok => {
    saved.value = ok;
    saveError.value = !ok;
  });
}

/** returns to "my profile". */
function goBack() {
  router.push({name: 'profile'});
}
</script>

<template>
  <div class="edit-profile-page">
    <pv-button icon="pi pi-angle-left" rounded outlined severity="secondary"
               :aria-label="t('profile.back')" @click="goBack"/>
    <h1>{{ t('edit-profile.title') }}</h1>

    <div v-if="saved" class="success-message" role="status">
      <i class="pi pi-check-circle" aria-hidden="true"></i>
      <div>
        <strong>{{ t('edit-profile.success-title') }}</strong>
        <p>{{ t('edit-profile.success-detail') }}</p>
      </div>
    </div>
    <p v-if="saveError" class="error" role="alert">{{ t('edit-profile.save-error') }}</p>

    <edit-profile-form v-if="profileStore.profile" :profile="profileStore.profile"
                       @save="saveProfile" @cancel="goBack"/>
  </div>
</template>

<style scoped>
.edit-profile-page {
  max-width: 480px;
  text-align: left;
  margin: 0 auto;
  padding: 1rem;
}

.success-message {
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
  color: #2e7d32;
  margin-bottom: 1rem;
}

.success-message i {
  font-size: 1.6rem;
}

.success-message p {
  margin: 0.2rem 0 0;
  font-size: 0.9rem;
}

.error {
  color: #d32f2f;
}
</style>