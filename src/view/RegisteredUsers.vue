<template>
  <div class="registered-users">
    <h1>Registered Users</h1>

    <!-- Search Field -->
    <div class="search-field">
      <input v-model="searchQuery" type="text" placeholder="Search by ('Name', 'Surname', 'Email')" />
      <button @click="toggleEmailSort" class="sort-button">Sort by Email</button>
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
        <!-- Filtered and Sorted Users -->
        <tr v-for="user in sortedAndFilteredUsers" :key="user.id">
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

// Sorting state for email
const sortOrder = ref('asc'); // Tracks current sort order for email sorting

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
  
  return users.value.filter(user => {
    const matchesName = nameQuery ? user.firstName.toLowerCase().includes(nameQuery) : true;
    const matchesSurname = surnameQuery ? user.lastName.toLowerCase().includes(surnameQuery) : true;
    const matchesEmail = emailQuery ? user.email.toLowerCase().includes(emailQuery) : true;

    return matchesName && matchesSurname && matchesEmail;
  });
});

// Computed property for sorted and filtered users
const sortedAndFilteredUsers = computed(() => {
  // Sort the filtered users by email
  const sortedUsers = [...filteredUsers.value].sort((a, b) => {
    if (sortOrder.value === 'asc') {
      return a.email.localeCompare(b.email);
    } else {
      return b.email.localeCompare(a.email);
    }
  });
  return sortedUsers;
});

// Toggle sort order function
const toggleEmailSort = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
};
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

.search-field {
  margin-bottom: 2rem;
  width: 100%;
  max-width: 500px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.search-field input {
  width: 70%;
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

.sort-button {
  width: 28%;
  padding: 0.8rem 1rem;
  border: 2px solid #fffddb;
  border-radius: 15px;
  background-color: #fffddb;
  font-family: 'Delius Swash Caps', cursive;
  font-size: 1rem;
  color: #4a4a4a;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sort-button:hover {
  background-color: #ed9787;
  border: 2px solid #ed9787;
  transform: translateY(-2px);
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
