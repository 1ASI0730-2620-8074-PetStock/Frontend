<script setup>
import {onMounted} from "vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useProfileStore from "../../application/profile.store.js";

const {t, locale} = useI18n();
const router = useRouter();
const profileStore = useProfileStore();

onMounted(() => {
  // iam saves the userid when the user signs in. the "1" is only for testing without login.
  const userId = localStorage.getItem('userId') || 1;
  profileStore.fetchProfile(userId);
});

/** opens the edit profile view. */
function goToEditProfile() {
  router.push({name: 'profile-edit'});
}

/** changes the language of the app between english and spanish. */
function toggleLanguage() {
  locale.value = locale.value === 'en' ? 'es' : 'en';
}

/** returns to the previous page. */
function goBack() {
  router.back();
}
</script>

<template>
  <div class="profile-page">
    <pv-button icon="pi pi-angle-left" rounded outlined severity="secondary"
               :aria-label="t('profile.back')" @click="goBack"/>
    <h1>{{ t('profile.title') }}</h1>

    <!-- profile card -->
    <section v-if="profileStore.profile" class="profile-card" :aria-label="t('profile.title')">
      <div class="profile-header">
        <pv-avatar v-if="profileStore.profile.photoUrl" :image="profileStore.profile.photoUrl"
                   shape="circle" size="xlarge" :aria-label="profileStore.profile.fullName"/>
        <pv-avatar v-else :label="profileStore.profile.initials"
                   shape="circle" size="xlarge" :aria-label="profileStore.profile.fullName"/>
        <div>
          <h2>
            {{ profileStore.profile.fullName }}
            <pv-tag :value="t('profile.active')" severity="warn"/>
          </h2>
          <p class="role">{{ profileStore.profile.role }}</p>
          <p class="email">{{ profileStore.profile.email }}</p>
        </div>
      </div>
      <pv-button :label="t('profile.edit')" icon="pi pi-pencil" class="w-full" @click="goToEditProfile"/>
    </section>

    <p v-else-if="profileStore.errors.length" class="error" role="alert">{{ t('profile.load-error') }}</p>

    <!-- settings -->
    <section class="settings" :aria-label="t('profile.settings')">
      <h3>{{ t('profile.settings') }}</h3>
      <ul>
        <li>
          <button type="button" class="settings-item" :aria-label="t('profile.language')" @click="toggleLanguage">
            <i class="pi pi-globe" aria-hidden="true"></i>
            <span class="settings-text">
              <strong>{{ t('profile.language') }}</strong>
              <small>{{ t('profile.language-value') }}</small>
            </span>
            <pv-tag :value="locale.toUpperCase()" severity="warn"/>
          </button>
        </li>
        <li class="settings-item">
          <i class="pi pi-bell" aria-hidden="true"></i>
          <span class="settings-text">
            <strong>{{ t('profile.notifications') }}</strong>
            <small>{{ t('profile.notifications-detail') }}</small>
          </span>
        </li>
        <li class="settings-item">
          <i class="pi pi-home" aria-hidden="true"></i>
          <span class="settings-text">
            <strong>{{ t('profile.business') }}</strong>
            <small>{{ t('profile.business-detail') }}</small>
          </span>
        </li>
        <li class="settings-item">
          <i class="pi pi-question-circle" aria-hidden="true"></i>
          <span class="settings-text">
            <strong>{{ t('profile.help') }}</strong>
            <small>{{ t('profile.help-detail') }}</small>
          </span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.profile-page {
  max-width: 480px;
  text-align: left;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.profile-card,
.settings ul {
  border: 1px solid #f0e2d8;
  border-radius: 16px;
  padding: 1rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.profile-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.role,
.email {
  margin: 0.2rem 0;
  font-size: 0.9rem;
}

.settings ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.settings-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  width: 100%;
  padding: 0.8rem 1rem;
  border: none;
  border-bottom: 1px solid #f0e2d8;
  background: none;
  text-align: left;
  font: inherit;
  color: inherit;
}

button.settings-item {
  cursor: pointer;
}

.settings-text {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.w-full {
  width: 100%;
}

.error {
  color: #d32f2f;
}
</style>