<template>
    <div class="container">
      <CRow :xs="{ gutter: 2 }">
        <CCol md="6">
          <CFormFloating class="registration">
            <CFormInput
              type="email"
              id="email"
              floatingLabel="Email address"
              placeholder="name@example.com"
              v-model="user.email"
            />
            <CFormInput
              type="text"
              id="firstName"
              floatingLabel="Name"
              placeholder="Name"
              v-model="user.firstName"
            />
            <CFormInput
              type="text"
              id="LastName"
              floatingLabel="Surname"
              placeholder="Surname"
              v-model="user.lastName"
            />
            <CFormInput
              type="text"
              id="username"
              floatingLabel="Username"
              placeholder="username"
              v-model="user.username"
            />
            <CFormInput
              type="password"
              id="floatingPassword"
              floatingLabel="Password"
              placeholder="Password"
              v-model="user.password"
              :invalid="passwordState"
            />
            <CFormInput
              type="password"
              id="confirm_password"
              floatingLabel="Confirm Password"
              placeholder="Password"
              v-model="user.passwordConfirm"
              :valid="passwordConfirmState"
            />
          </CFormFloating>
        </CCol>
  
        <CCol md="6">
          <CFormFloating class="registration">
            <CFormSelect v-model="user.address.country" aria-label="Select country" floatingLabel="Country">
              <option disabled value="">Select a country</option>
              <option v-for="country in countries" :key="country.cca3" :value="country.cca3">
                {{ country.name.common }}
              </option>
            </CFormSelect>
            <CFormInput
              type="text"
              v-model="user.address.postalCode"
              id="postalCode"
              placeholder="Postal Code"
              floatingLabel="Postal Code"
            />
            <CFormInput
              type="text"
              v-model="user.address.city"
              id="city"
              placeholder="City"
              floatingLabel="City"
            />
            <CFormInput
              type="text"
              v-model="user.address.street"
              id="street"
              placeholder="Enter street name"
              floatingLabel="Street Name"
            />
            <CFormInput
              type="text"
              v-model="user.address.number"
              id="number"
              placeholder="Enter street number"
              floatingLabel="Street Number"
              />
            </CFormFloating>
            </CCol>
        </CRow>
  
        <CRow>
            <CCol md="12" class="text-center">
                <CButton :disabled="isFormInvalid" color="primary" class="submit-btn" @click="registerUser">
                    Register
                </CButton>
            </CCol>
        </CRow>
  
        <div class="validation-messages text-center">
            <div v-if="!isPasswordValid" class="password-tooltip">
                Password must have at least 8 characters
            </div>
  
            <div v-if="!isPasswordMatch" class="password-tooltip">
            Passwords do not match.
            </div>
        </div>
    </div>
</template>
  
<script setup>
import { ref, computed, onMounted } from 'vue';
import { CFormFloating, CFormInput, CButton, CFormSelect, CRow, CCol } from '@coreui/vue';
import apiClient from '../axios/axios';
import { useStore } from 'vuex';
  
const store = useStore();

const user = ref({
    email: '',
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    passwordConfirm: '',
    address: {
      country: '',
      postalCode: '',
      city: '',
      street: '',
      number: ''
    }
});
  
const countries = computed(() => store.getters.getCountries);
store.dispatch('fetchCountries');
  
const isPasswordMatch = computed(() => user.value.password === user.value.passwordConfirm);
const passwordState = computed(() => user.value.password.length < 8 ? true : null);
const isPasswordValid = computed(() => user.value.password.length >= 8);
const passwordConfirmState = computed(() => isPasswordMatch.value ? true : null);
  
const isFormInvalid = computed(() => {
    const checkValues = (obj) => {
      return Object.values(obj).some(value =>
        value === null ||
        value === undefined ||
        (typeof value === 'string' && value.trim() === '')
      );
    };
    return checkValues(user.value) || checkValues(user.value.address);
});
  
onMounted(() => {
    
});
  
const registerUser = () => {
    if (!isPasswordValid.value || !isPasswordMatch.value || isFormInvalid.value) {
      alert('Please fill out all required fields correctly.');
      return;
    }
  
    apiClient.post('authentication/register', user.value)
      .then((response) => {
        if (response.data === true) {
          alert('Registration successful, please validate your email');
        }
      })
      .catch((error) => {
        console.log(error);
        alert(error.response.data)
    });
};
</script>
  
<style scoped>
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: auto;
    flex-direction: column;
    height: 80vh;
}
  
.registration > * {
    margin-bottom: 10px;
    width: 100%;
}
  
.password-tooltip {
    margin-top: 5px;
    font-size: 0.875rem;
    color: #dc3545;
    top: 100%;
    left: 0;
    padding: 5px;
}
  
.submit-btn {
    width: 100%;
}
  
.validation-messages {
    margin-top: 10px;
    text-align: center;
}
</style>  