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
  // the id of the signed-in user comes from the iam bounded context
  profileStore.fetchProfile(identityStore.currentUser.id);
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

/** closes the session (iam) and sends the user to the login view. */
function signOut() {
  identityStore.logout();
  router.push({name: 'login'});
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div class="title-row">
        <pv-button icon="pi pi-angle-left" rounded outlined class="back-button"
                   :aria-label="t('profile.back')" @click="goBack"/>
        <h1>{{ t('profile.title') }}</h1>
      </div>
      <img src="/font/logo-petstock.png" alt="PetStock" class="brand-logo"/>
    </header>

    <div class="profile-layout">
      <!-- profile card -->
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

      <!-- settings -->
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

      <!-- sign out (wireflow 07) -->
      <pv-button :label="t('profile.sign-out')" icon="pi pi-sign-out" class="primary-button sign-out"
                 :aria-label="t('profile.sign-out')" @click="signOut"/>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 2.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-logo {
  height: 56px;
}

.back-button {
  color: var(--primary-color);
  border-color: var(--beige-color);
}

/* desktop: card on the left, settings on the right */
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
  border: 1px solid #F3E5DC;
  border-radius: 16px;
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

.primary-button {
  width: 100%;
  background: var(--primary-color);
  border-color: var(--primary-color);
  border-radius: 12px;
  font-weight: 700;
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

/* tablet and mobile: one column */
@media (max-width: 900px) {
  .page {
    padding: 1.5rem 1rem;
  }

  .profile-layout {
    grid-template-columns: 1fr;
    grid-template-areas:
      "card"
      "settings"
      "signout";
  }
}
</style>