<template>
  <div class="registered-users">
    <h1>Registered Users</h1>
    <p>Search for users by name, surname, or email.</p>

    <!-- Search Field -->
    <div class="search-field">
      <input v-model="searchQuery" type="text" placeholder="Search by Name, Surname, or Email" />
    </div>

    <!-- User Table -->
    <table class="user-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Surname</th>
          <th>Email</th>
          <th>Username</th>
        </tr>
      </thead>
      <tbody>
        <!-- Filtered Users -->
        <tr v-for="user in filteredUsers" :key="user.id">
          <td>{{ user.firstName }}</td>
          <td>{{ user.lastName }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.username }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import apiClient from '@/axios/axios';

const users = ref([]);
const store = useStore();
const currentUser = computed(() => store.getters.getUser);

// Search query
const searchQuery = ref('');

// Load users on component mount
onMounted(async () => {
  try {
    console.log('Current User:', currentUser.value.id);
    const response = await apiClient.get('users');
    users.value = response.data.filter(user => user.id !== currentUser.value.id);
    console.log('Users loaded:', users.value);
  } catch (error) {
    console.error('Error loading users:', error);
  }
});

// Computed property for filtered users
const filteredUsers = computed(() => {
  const [nameQuery, surnameQuery, emailQuery] = searchQuery.value.split(',').map(part => part.trim().toLowerCase());
  
  console.log('Parsed Queries:', { nameQuery, surnameQuery, emailQuery });

  return users.value.filter(user => {
    const matchesName = nameQuery ? user.firstName.toLowerCase().includes(nameQuery) : true;
    const matchesSurname = surnameQuery ? user.lastName.toLowerCase().includes(surnameQuery) : true;
    const matchesEmail = emailQuery ? user.email.toLowerCase().includes(emailQuery) : true;

    return matchesName && matchesSurname && matchesEmail;
  });
});


</script>

<style scoped>
.registered-users {
  padding: 20px;
}

.search-field {
  margin-bottom: 10px;
}

.search-field input {
  padding: 5px;
  width: 100%;
  max-width: 300px;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th,
.user-table td {
  padding: 8px;
  border: 1px solid #ddd;
  text-align: left;
}

.user-table th {
  background-color: #f2f2f2;
}
</style>
