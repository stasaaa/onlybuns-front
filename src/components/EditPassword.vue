<template>
    <CFormFloating class="form">
        <CFormInput
            v-model="password"
            type="text"
            floating-label="New Password"
            placeholder="Example123"
            required
            minlength="8"
            aria-describedby="newPasswordHelp"
            :invalid="passwordState"
        />

        <CFormInput
            v-model="passwordConfirm"
            type="text"
            floating-label="Confirm New Password"
            placeholder="Example123"
            required
            minlength="8"
            aria-describedby="confirmPasswordHelp"
            :invalid="passwordConfirmState"
        />
        <small id="confirmPasswordHelp" class="form-text text-muted">
            Password must be at least 8 characters long and match the New Password.
        </small>

        <CButton v-on:click="changePassword">Change Password</CButton>
    </CFormFloating>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue';
import { CButton, CFormFloating, CFormInput } from '@coreui/vue';
import apiClient from '@/axios/axios';

const props = defineProps({
    user: {
        type: Object,
        required: true
    }
});

const userCopy = ref({ ...props.user });

const password = ref('');
const passwordConfirm = ref('');

const passwordState = computed(() => password.value.length < 8);
const passwordConfirmState = computed(() => passwordConfirm.value !== password.value || passwordConfirm.value.length < 8);

// Function to handle the form submission
function changePassword() {
    if (!passwordState.value && !passwordConfirmState.value) {
        // Add your password change logic here

        userCopy.value.password = password.value;
        console.log(userCopy.value);
        apiClient.put(`authentication/update-password`, userCopy.value)
        .then(() => {
            alert('Password changed successfully!');
        })
        .catch((error) => {
            console.log(error);
        })
    } else {
        alert('Please check the password fields!');
    }
}
</script>

<style scoped>
.form {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 2%;
}

.form > * {
    width: 20vw;
    margin: 0.2%;
}

.form-text {
    font-size: 0.8rem;
    color: #6c757d;
}
</style>