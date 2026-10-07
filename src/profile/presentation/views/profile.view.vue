<script setup>
import {onMounted} from "vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useProfileStore from "../../application/profile.store.js";
import {useIdentityStore} from "../../../iam/application/identity.store.js";

const {t, locale} = useI18n();
const router = useRouter();
const profileStore = useProfileStore();
const identityStore = useIdentityStore();

onMounted(() => {
  // The id of the signed-in user comes from the IAM bounded context
  profileStore.fetchProfile(identityStore.currentUser.id);
});

/** Opens the edit profile view. */
function goToEditProfile() {
  router.push({name: 'profile-edit'});
}

/** Changes the language of the app between English and Spanish. */
function toggleLanguage() {
  locale.value = locale.value === 'en' ? 'es' : 'en';
  localStorage.setItem('locale', locale.value);
}

/** Closes the session (IAM) and sends the user to the login view. */
function signOut() {
  identityStore.logout();
  router.push({name: 'login'});
}
</script>

<template>
  <div class="profile-page">
    <header class="page-header">
      <h1>{{ t('profile.title') }}</h1>
      <p>{{ t('profile.subtitle') }}</p>
    </header>

    <div class="profile-layout">
      <!-- Profile card -->
      <section class="card profile-card" :aria-label="t('profile.title')">
        <template v-if="profileStore.profile">
          <pv-avatar v-if="profileStore.profile.photoUrl" :image="profileStore.profile.photoUrl"
                     shape="circle" class="avatar" :aria-label="profileStore.profile.fullName"/>
          <pv-avatar v-else :label="profileStore.profile.initials"
                     shape="circle" class="avatar" :aria-label="profileStore.profile.fullName"/>
          <h2>{{ profileStore.profile.fullName }}</h2>
          <span class="status-badge">{{ t('profile.active') }}</span>
          <p class="role">{{ profileStore.profile.role }}</p>
          <p class="email">{{ profileStore.profile.email }}</p>
          <pv-button :label="t('profile.edit')" icon="pi pi-pencil" class="primary-button"
                     @click="goToEditProfile"/>
        </template>
        <p v-else-if="profileStore.errors.length" class="error" role="alert">{{ t('profile.load-error') }}</p>
      </section>

      <!-- Settings -->
      <section class="card settings" :aria-label="t('profile.settings')">
        <h3>{{ t('profile.settings') }}</h3>
        <ul>
          <li>
            <button type="button" class="settings-item clickable" :aria-label="t('profile.language')"
                    @click="toggleLanguage">
              <i class="pi pi-globe settings-icon" aria-hidden="true"></i>
              <span class="settings-text">
                <strong>{{ t('profile.language') }}</strong>
                <small>{{ t('profile.language-value') }}</small>
              </span>
              <span class="language-badge">{{ locale.toUpperCase() }}</span>
            </button>
          </li>
          <li class="settings-item">
            <i class="pi pi-bell settings-icon" aria-hidden="true"></i>
            <span class="settings-text">
              <strong>{{ t('profile.notifications') }}</strong>
              <small>{{ t('profile.notifications-detail') }}</small>
            </span>
          </li>
          <li class="settings-item">
            <i class="pi pi-home settings-icon" aria-hidden="true"></i>
            <span class="settings-text">
              <strong>{{ t('profile.business') }}</strong>
              <small>{{ t('profile.business-detail') }}</small>
            </span>
          </li>
          <li class="settings-item">
            <i class="pi pi-question-circle settings-icon" aria-hidden="true"></i>
            <span class="settings-text">
              <strong>{{ t('profile.help') }}</strong>
              <small>{{ t('profile.help-detail') }}</small>
            </span>
          </li>
        </ul>
      </section>

      <!-- Sign out (Wireflow 07) -->
      <pv-button :label="t('profile.sign-out')" icon="pi pi-sign-out" class="primary-button sign-out"
                 :aria-label="t('profile.sign-out')" @click="signOut"/>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 1.5rem;
}

.page-header h1 {
  font-size: 2rem;
}

.page-header p {
  color: var(--secondary-color);
}

/* Desktop: card on the left, settings on the right */
.profile-layout {
  display: grid;
  grid-template-columns: 340px 1fr;
  grid-template-areas:
    "card settings"
    "signout settings";
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

.profile-card {
  grid-area: card;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.4rem;
}

.avatar {
  width: 96px;
  height: 96px;
  font-size: 2rem;
  background: #FFF3EB;
  color: var(--primary-color);
  border: 3px solid var(--primary-color);
  margin-bottom: 0.5rem;
}

.status-badge,
.language-badge {
  background: #FFF3EB;
  color: var(--primary-color);
  border: 1px solid #FADCC9;
  border-radius: 8px;
  padding: 0.1rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 700;
}

.role {
  color: var(--secondary-color);
}

.email {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

/* Same orange button used in the sales module */
.primary-button {
  width: 100%;
  background: var(--primary-color);
  border-color: var(--primary-color);
  border-radius: 12px;
  padding: 0.7rem 1.5rem;
  font-weight: 600;
}

.primary-button:hover {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
}

.settings {
  grid-area: settings;
}

.settings h3 {
  margin-bottom: 1rem;
}

.settings ul {
  list-style: none;
}

.settings-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 1rem 0.5rem;
  border: none;
  border-bottom: 1px solid #F3E5DC;
  background: none;
  text-align: left;
  font: inherit;
  color: inherit;
}

.clickable {
  cursor: pointer;
}

.clickable:hover {
  background: var(--bg-cream);
}

.settings-icon {
  color: var(--secondary-color);
  font-size: 1.2rem;
}

.settings-text {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.settings-text small {
  color: var(--text-muted);
}

.sign-out {
  grid-area: signout;
}

.error {
  color: #D32F2F;
}

/* Tablet and mobile: one column */
@media (max-width: 900px) {
  .profile-layout {
    grid-template-columns: 1fr;
    grid-template-areas:
      "card"
      "settings"
      "signout";
  }
}
</style>
