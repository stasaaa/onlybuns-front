<template>
    <div class="container">
        <CRow>
            <CCol>
                <CFormFloating class="login">
                    <CFormInput type="text" id="email" floating-label="Email" placeholder="name@example.com" 
                        v-model="email"></CFormInput>
                    <CFormInput type="password" id="password" floating-label="Password" placeholder="password123" 
                        v-model="password"></CFormInput>
                    <CButton color="primary" v-on:click.prevent="login">LogIn</CButton>
                </CFormFloating>
            </CCol>
        </CRow>
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
        .then(response => {
            store.dispatch('setUser', response.data)
            sessionStorage.setItem('authToken', token);
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

.login > * {
    margin-bottom: 10px;
    width: 100%;
}
</style>