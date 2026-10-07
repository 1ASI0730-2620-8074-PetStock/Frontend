<script setup>
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useProfileStore from "../../application/profile.store.js";
import {useIdentityStore} from "../../../iam/application/identity.store.js";
import EditProfileForm from "../components/edit-profile-form.vue";

const {t} = useI18n();
const router = useRouter();
const profileStore = useProfileStore();
const identityStore = useIdentityStore();

const saved = ref(false);
const saveError = ref(false);

onMounted(() => {
  // If the user opens /profile/edit directly, the profile is not loaded yet
  if (!profileStore.profile) {
    profileStore.fetchProfile(identityStore.currentUser.id);
  }
});

/**
 * Receives the data from the form and saves it.
 * @param {{profile: Object, password: string}} data - Edited profile and new password.
 */
function saveProfile(data) {
  saved.value = false;
  saveError.value = false;
  profileStore.updateProfile(data.profile, data.password).then(ok => {
    saved.value = ok;
    saveError.value = !ok;
    // The name in the top bar (IAM session) is updated too
    if (ok) {
      identityStore.updateCurrentUser({
        name: data.profile.firstName,
        lastName: data.profile.lastName,
        email: data.profile.email
      });
    }
  });
}

/** Returns to "My profile". */
function goBack() {
  router.push({name: 'profile'});
}
</script>

<template>
  <div class="edit-profile-page">
    <header class="page-header">
      <pv-button icon="pi pi-angle-left" rounded outlined class="back-button"
                 :aria-label="t('profile.back')" @click="goBack"/>
      <h1>{{ t('edit-profile.title') }}</h1>
    </header>

    <div v-if="profileStore.profile" class="edit-layout">
      <!-- Left: photo and current data -->
      <section class="card photo-card" :aria-label="profileStore.profile.fullName">
        <pv-avatar v-if="profileStore.profile.photoUrl" :image="profileStore.profile.photoUrl"
                   shape="circle" class="avatar" :aria-label="profileStore.profile.fullName"/>
        <pv-avatar v-else :label="profileStore.profile.initials"
                   shape="circle" class="avatar" :aria-label="profileStore.profile.fullName"/>
        <h2>{{ profileStore.profile.fullName }}</h2>
        <p class="email">{{ profileStore.profile.email }}</p>
      </section>

      <!-- Right: messages and form -->
      <section class="card form-card">
        <div v-if="saved" class="success-message" role="status">
          <i class="pi pi-check-circle" aria-hidden="true"></i>
          <div>
            <strong>{{ t('edit-profile.success-title') }}</strong>
            <p>{{ t('edit-profile.success-detail') }}</p>
          </div>
        </div>
        <p v-if="saveError" class="error" role="alert">{{ t('edit-profile.save-error') }}</p>

        <edit-profile-form :profile="profileStore.profile" @save="saveProfile" @cancel="goBack"/>
      </section>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.page-header h1 {
  font-size: 2rem;
}

.back-button {
  color: var(--primary-color);
  border-color: var(--beige-color);
  background: #FFFFFF;
}

/* Desktop: photo on the left, form on the right */
.edit-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1.5rem;
  align-items: start;
}

.card {
  background: #FFFFFF;
  border: 1px solid #EEDFC8;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(47, 32, 25, 0.03);
  padding: 1.5rem;
}

.photo-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.4rem;
}

.avatar {
  width: 120px;
  height: 120px;
  font-size: 2.5rem;
  background: #FFF3EB;
  color: var(--primary-color);
  border: 3px solid var(--primary-color);
  margin-bottom: 0.5rem;
}

.email {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.success-message {
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
  color: #2E7D32;
  background: #EEF7EE;
  border-radius: 12px;
  padding: 0.8rem 1rem;
  margin-bottom: 1.2rem;
}

.success-message i {
  font-size: 1.6rem;
}

.success-message p {
  font-size: 0.9rem;
}

.error {
  color: #D32F2F;
  margin-bottom: 1rem;
}

/* Tablet and mobile: one column */
@media (max-width: 900px) {
  .edit-layout {
    grid-template-columns: 1fr;
  }
}
</style>
