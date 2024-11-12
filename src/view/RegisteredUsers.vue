<template>
  <div class="registered-users">
    <h1>Registered Users</h1>

    <!-- Search Field -->
    <div class="search-field">
      <input v-model="searchQuery" type="text" placeholder="Search by ('Name', 'Surname', 'Email')" />
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
@import url('https://fonts.googleapis.com/css2?family=Delius+Swash+Caps&display=swap');

.registered-users {
  background-image: url('@/assets/bunnyTile.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
  width: 100%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.registered-users h1 {
  font-family: 'Delius Swash Caps', cursive;
  color: #ec5d43;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
}

.registered-users p {
  font-family: 'Delius Swash Caps', cursive;
  color: #e53717;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.search-field {
  margin-bottom: 2rem;
  width: 100%;
  max-width: 500px;
}

.search-field input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid #c9d6c8;
  border-radius: 15px;
  background-color: #e6ece5;
  font-family: 'Delius Swash Caps', cursive;
  font-size: 1rem;
  color: #4a4a4a;
}

.search-field input:focus {
  outline: none;
  border-color: #fffddb; 
  box-shadow: 0 0 0 3px rgba(236, 93, 67, 0.2);
}

.user-table {
  width: 100%;
  max-width: 800px;
  border-collapse: collapse;
  background-color: #e6ece5;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.user-table th,
.user-table td {
  padding: 1rem;
  border: 1px solid #c9d6c8;
  text-align: left;
  font-family: 'Delius Swash Caps', cursive;
  color: #4a4a4a;
}

.user-table th {
  background-color: #c9d6c8;
  font-size: 1.2rem;
}

.user-table td {
  font-size: 1rem;
}
</style>
