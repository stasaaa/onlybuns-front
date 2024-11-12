<template>
  <div class="registered-users">
    <h1>Registered Users</h1>

    <!-- Search Fields Container -->
    <div class="search-container">
      <div class="search-field">
        <span class="search-label">Search by name, surname and email:</span>
        <input v-model="searchQuery" type="text" placeholder="('Name', 'Surname', 'Email')" class="search-input"/>
      </div>

      <!-- Post Count Range Filter -->
      <div class="post-count-container">
        <span class="post-count-label">Search by number of posts:</span>
        <div class="post-count-inputs">
          <input v-model.number="minPosts" type="number" placeholder="Min Posts" class="post-count-input"/>
          <input v-model.number="maxPosts" type="number" placeholder="Max Posts" class="post-count-input"/>
        </div>
      </div>

      <!-- Sort Buttons -->
      <div class="sort-buttons">
        <button @click="toggleEmailSort" class="sort-button">
          Sort by Email
        </button>
        <button @click="toggleFollowingSort" class="sort-button">
          Sort by Following
        </button>
      </div>
    </div>

    <!-- User Table -->
    <table class="user-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Surname</th>
          <th>Email</th>
          <th>Username</th>
          <th>Number of posts</th>
          <th>Number of following</th>
        </tr>
      </thead>
      <tbody>
        <!-- Filtered and Sorted Users -->
        <tr v-for="user in sortedAndFilteredUsers" :key="user.id">
          <td>{{ user.firstName }}</td>
          <td>{{ user.lastName }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.numberOfPosts }}</td>
          <td>{{ user.numberOfFollowing }}</td>
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
const minPosts = ref(null);  // Minimum number of posts filter
const maxPosts = ref(null);  // Maximum number of posts filter

// Sorting state for email
const sortOrder = ref('asc'); // Tracks current sort order for email sorting
const followingSortOrder = ref('asc');   // Sort order for number of following
const sortBy = ref('email');             // Track current sort field ('email' or 'following')

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

    const matchesMinPosts = minPosts.value !== null ? user.numberOfPosts >= minPosts.value : true;
    const matchesMaxPosts = maxPosts.value !== null ? user.numberOfPosts <= maxPosts.value : true;

    return matchesName && matchesSurname && matchesEmail && matchesMinPosts && matchesMaxPosts;
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
  sortBy.value = 'email';
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
};

// Toggle sort order function for following
const toggleFollowingSort = () => {
  sortBy.value = 'following';
  followingSortOrder.value = followingSortOrder.value === 'asc' ? 'desc' : 'asc';
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

.search-container {
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.search-field, .post-count-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
}

.search-label {
  font-family: 'Delius Swash Caps', cursive;
  color: #e53717;
  font-size: 1.2rem;
  white-space: nowrap;
  min-width: 220px; /* Ensures alignment between both search sections */
}

.post-count-label {
  font-family: 'Delius Swash Caps', cursive;
  color: #e53717;
  font-size: 1.2rem;
  white-space: nowrap;
  min-width: 220px; /* Ensures alignment between both search sections */
}

.search-input {
  flex: 1;
  max-width: 400px;
  padding: 0.8rem 1rem;
  border: 2px solid #c9d6c8;
  border-radius: 15px;
  background-color: #e6ece5;
  font-family: 'Delius Swash Caps', cursive;
  font-size: 1rem;
  color: #4a4a4a;
}

.post-count-inputs {
  display: flex;
  gap: 0.5rem;
  flex: 1;
  max-width: 400px;
}

.post-count-input {
  flex: 1;
  padding: 0.8rem 1rem;
  border: 2px solid #c9d6c8;
  border-radius: 15px;
  background-color: #e6ece5;
  font-family: 'Delius Swash Caps', cursive;
  font-size: 1rem;
  color: #4a4a4a;
}

.sort-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.sort-button {
  padding: 0.8rem 1.5rem;
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
  color: white;
  transform: translateY(-2px);
}

.user-table {
  width: 100%;
  max-width: 800px;
  border-collapse: collapse;
  background-color: #e6ece5;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
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

input:focus {
  outline: none;
  border-color: #fffddb; 
  box-shadow: 0 0 0 3px rgba(236, 93, 67, 0.2);
}
</style>
