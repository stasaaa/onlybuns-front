<template>
 <div class="page-wrapper">
    <div class="container">
        <CRow>
            <CCol>
                <CFormFloating class="login">
                    <CFormInput type="text" id="email" floating-label="Email" placeholder="name@example.com" 
                        v-model="email"></CFormInput>
                    <CFormInput type="password" id="password" floating-label="Password" placeholder="password123" 
                        v-model="password"></CFormInput>
                    <CButton class = "custom-button" v-on:click.prevent="login">Login</CButton>
                </CFormFloating>
            </CCol>
        </CRow>
    </div>
 </div>
</template>

<script setup>
import { CButton, CCol, CFormFloating, CFormInput, CRow } from '@coreui/vue';
import { ref } from 'vue';
import apiClient from '../axios/axios';
import { useStore } from 'vuex';
import router from '@/router/router';

const store = useStore();

const email = ref('');
const password = ref('');

const login = () => {
    apiClient.post('authentication/login', {
        email: email.value,
        password: password.value
    })
    .then((response) => {
        store.dispatch('setToken', response.data.token);
        var token = response.data.token
        apiClient.get('authentication/userDetails', {
            params: {
                email: email.value
            },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(userResponse => {
            const userData = userResponse.data;
            
            store.dispatch('setUser', userData);
            sessionStorage.setItem('user', JSON.stringify(userData));

            router.push('/');
        })
        .catch(error => {
            console.error(error);
        });

    }).catch((error) => {
        console.log(error);
        
        if (error.response) {
            const statusCode = error.response.status;
            
            if (statusCode === 401) {
                alert('Invalid username or password or acount is not activated');
            } else if (statusCode === 403) {
                const errorMessage = error.response.data;
                alert(errorMessage);
            } else {
                alert('An unknown error occurred.');
            }
        } else {
            alert('Network error. Please try again later.');
        }
    });
}
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

.page-wrapper {
  background-image: url('@/assets/bunnyTile.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0; 
}

.login > * {
    margin-bottom: 10px;
    width: 100%;
}

.custom-button {
    background-color: #ed9787 !important;
    border-color: #ed9787 !important;
}

.custom-button:hover {
    background-color: #f18571 !important;
    border-color: #f18571 !important;
}
</style>