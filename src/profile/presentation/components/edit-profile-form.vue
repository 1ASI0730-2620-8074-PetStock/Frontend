<script setup>
import {ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {Profile} from "../../domain/model/profile.entity.js";
import {StringValidator} from "../../../shared/domain/model/string-validator.js";

const props = defineProps({
  profile: {type: Profile, required: true}
});
const emit = defineEmits(['save', 'cancel']);

const {t} = useI18n();

const form = ref({firstName: '', lastName: '', email: '', password: ''});
const submitted = ref(false);

// copies the profile data into the form (also when the profile changes)
watch(() => props.profile, (profile) => {
  form.value.firstName = profile.firstName;
  form.value.lastName = profile.lastName;
  form.value.email = profile.email;
  form.value.password = '';
}, {immediate: true});

/** @returns {boolean} true if the text is empty. */
function isEmpty(value) {
  return !StringValidator.isNotEmptyString(value);
}

/** @returns {boolean} true if the email has a basic valid format. */
function isValidEmail(value) {
  return value.includes('@') && value.includes('.');
}

/** @returns {boolean} true if all required fields are correct. */
function isFormValid() {
  return !isEmpty(form.value.firstName)
      && !isEmpty(form.value.lastName)
      && !isEmpty(form.value.email)
      && isValidEmail(form.value.email);
}

/** validates the form and sends the data to the parent view. */
function onSubmit() {
  submitted.value = true;
  if (!isFormValid()) return;

  const updatedProfile = new Profile({
    ...props.profile,
    firstName: form.value.firstName.trim(),
    lastName: form.value.lastName.trim(),
    email: form.value.email.trim()
  });
  emit('save', {profile: updatedProfile, password: form.value.password});
}
</script>

<template>
  <form class="edit-profile-form" novalidate @submit.prevent="onSubmit">
    <div class="avatar">
      <pv-avatar v-if="profile.photoUrl" :image="profile.photoUrl" shape="circle" size="xlarge"
                 :aria-label="profile.fullName"/>
      <pv-avatar v-else :label="profile.initials" shape="circle" size="xlarge" :aria-label="profile.fullName"/>
    </div>

    <div class="field">
      <label for="firstName">{{ t('edit-profile.first-name') }}</label>
      <pv-input-text id="firstName" v-model="form.firstName" :placeholder="t('edit-profile.first-name-placeholder')"
                     :invalid="submitted && isEmpty(form.firstName)" aria-required="true"/>
      <small v-if="submitted && isEmpty(form.firstName)" class="error" role="alert">
        {{ t('edit-profile.required') }}
      </small>
    </div>

    <div class="field">
      <label for="lastName">{{ t('edit-profile.last-name') }}</label>
      <pv-input-text id="lastName" v-model="form.lastName" :placeholder="t('edit-profile.last-name-placeholder')"
                     :invalid="submitted && isEmpty(form.lastName)" aria-required="true"/>
      <small v-if="submitted && isEmpty(form.lastName)" class="error" role="alert">
        {{ t('edit-profile.required') }}
      </small>
    </div>

    <div class="field">
      <label for="email">{{ t('edit-profile.email') }}</label>
      <pv-input-text id="email" v-model="form.email" type="email" :placeholder="t('edit-profile.email-placeholder')"
                     :invalid="submitted && (isEmpty(form.email) || !isValidEmail(form.email))" aria-required="true"/>
      <small v-if="submitted && isEmpty(form.email)" class="error" role="alert">
        {{ t('edit-profile.required') }}
      </small>
      <small v-else-if="submitted && !isValidEmail(form.email)" class="error" role="alert">
        {{ t('edit-profile.invalid-email') }}
      </small>
    </div>

    <div class="field">
      <label for="password">{{ t('edit-profile.password') }}</label>
      <pv-password input-id="password" v-model="form.password" :feedback="false" toggle-mask
                   :placeholder="t('edit-profile.password-placeholder')"/>
      <small>{{ t('edit-profile.password-hint') }}</small>
    </div>

    <pv-button type="submit" :label="t('edit-profile.save')" icon="pi pi-check" class="w-full"/>
    <pv-button type="button" :label="t('edit-profile.cancel')" text class="w-full" @click="emit('cancel')"/>
  </form>
</template>

<style scoped>
.edit-profile-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.avatar {
  display: flex;
  justify-content: center;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.field :deep(input) {
  width: 100%;
}

.error {
  color: #d32f2f;
}

.w-full {
  width: 100%;
}
</style>