<template>
  <div class="registered-users">
    <h1>Registered Users</h1>

    <!-- Search Fields Container -->
    <div class="search-container">
      <div class="search-field">
        <span class="search-label">Search by name, surname and email:</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="('Name', 'Surname', 'Email')"
          class="search-input"
        />
      </div>

      <!-- Post Count Range Filter -->
      <div class="post-count-container">
        <span class="post-count-label">Search by number of posts:</span>
        <div class="post-count-inputs">
          <input
            v-model.number="minPosts"
            type="number"
            placeholder="Min Posts"
            class="post-count-input"
          />
          <input
            v-model.number="maxPosts"
            type="number"
            placeholder="Max Posts"
            class="post-count-input"
          />
        </div>
      </div>

      <!-- Sort Buttons -->
      <div class="sort-buttons">
        <button @click="toggleEmailSort" class="sort-button">
          Sort by Email
          <span v-if="sortBy === 'email'">({{ sortOrder }})</span>
        </button>
        <button @click="toggleFollowingSort" class="sort-button">
          Sort by Following
          <span v-if="sortBy === 'following'">({{ followingSortOrder }})</span>
        </button>
      </div>
    </div>

    <!-- User Table -->
    <table class="user-table" v-if="displayedUsers.length > 0">
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
        <tr v-for="user in displayedUsers" :key="user.id">
          <td>{{ user.firstName }}</td>
          <td>{{ user.lastName }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.numberOfPosts }}</td>
          <td>{{ user.numberOfFollowing }}</td>
        </tr>
      </tbody>
    </table>
    <div v-else class="no-users">No users found.</div>

    <!-- Pagination Controls -->
    <div class="pagination-controls" v-if="totalPages > 1">
      <button @click="prevPage" :disabled="page === 0">Previous</button>
      <span>Page {{ page + 1 }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="page + 1 >= totalPages">Next</button>
    </div>
  </div>
</template>

<script setup>
import apiClient from "@/axios/axios";
import { computed, onMounted, ref, watch } from "vue";
import { useStore } from "vuex";

const users = ref([]);
const page = ref(0);
const size = 5;

const store = useStore();
const currentUser = computed(() => store.getters.getUser);

const searchQuery = ref("");
const minPosts = ref(null);
const maxPosts = ref(null);

const sortBy = ref("email"); // default: email or following
const sortOrder = ref("asc"); // for email
const followingSortOrder = ref("asc"); // for following

const totalPages = computed(() => Math.ceil(users.value.length / size));

const displayedUsers = computed(() => {
  const sortedUsers = [...users.value];

  if (sortBy.value === "email") {
    sortedUsers.sort((a, b) => {
      if (!a.email) return 1;
      if (!b.email) return -1;
      if (sortOrder.value === "asc") {
        return a.email.localeCompare(b.email);
      } else {
        return b.email.localeCompare(a.email);
      }
    });
  } else if (sortBy.value === "following") {
    sortedUsers.sort((a, b) => {
      const cmp = a.numberOfFollowing - b.numberOfFollowing;
      return followingSortOrder.value === "asc" ? cmp : -cmp;
    });
  }

  const start = page.value * size;
  return sortedUsers.slice(start, start + size);
});

const loadUsers = async () => {
  const params = new URLSearchParams();

  // Uvek tražimo veliki broj da bismo radili paginaciju frontend
  params.append("page", 0);
  params.append("size", 1000);

  if (searchQuery.value.trim() !== "") {
    params.append("searchQuery", searchQuery.value.trim());
  }
  if (minPosts.value !== null && minPosts.value !== "") {
    params.append("minPosts", minPosts.value);
  }
  if (maxPosts.value !== null && maxPosts.value !== "") {
    params.append("maxPosts", maxPosts.value);
  }

  try {
    const response = await apiClient.get(`/users?${params.toString()}`);
    users.value = response.data.content.filter(
      (user) => user.id !== currentUser.value.id
    );
    page.value = 0; // resetuj stranicu na novu pretragu/sortiranje
  } catch (error) {
    console.error("Error loading users:", error);
  }
};

onMounted(loadUsers);

watch(
  [searchQuery, minPosts, maxPosts],
  () => {
    loadUsers();
  }
);

watch(
  [sortBy, sortOrder, followingSortOrder],
  () => {
    page.value = 0; // resetuj page kad se menja sortiranje
  }
);

const toggleEmailSort = () => {
  if (sortBy.value !== "email") {
    sortBy.value = "email";
    sortOrder.value = "asc";
  } else {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  }
  page.value = 0;
};

const toggleFollowingSort = () => {
  if (sortBy.value !== "following") {
    sortBy.value = "following";
    followingSortOrder.value = "asc";
  } else {
    followingSortOrder.value =
      followingSortOrder.value === "asc" ? "desc" : "asc";
  }
  page.value = 0;
};

const prevPage = () => {
  if (page.value > 0) {
    page.value--;
  }
};

const nextPage = () => {
  if (page.value + 1 < totalPages.value) {
    page.value++;
  }
};
</script>



<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Delius+Swash+Caps&display=swap");

.registered-users {
  background-image: url("@/assets/bunnyTile.png");
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
  font-family: "Delius Swash Caps", cursive;
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

.search-field,
.post-count-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
}

.search-label {
  font-family: "Delius Swash Caps", cursive;
  color: #e53717;
  font-size: 1.2rem;
  white-space: nowrap;
  min-width: 220px;
}

.post-count-label {
  font-family: "Delius Swash Caps", cursive;
  color: #e53717;
  font-size: 1.2rem;
  white-space: nowrap;
  min-width: 220px;
}

.search-input {
  flex: 1;
  max-width: 400px;
  padding: 0.8rem 1rem;
  border: 2px solid #c9d6c8;
  border-radius: 15px;
  background-color: #e6ece5;
  font-family: "Delius Swash Caps", cursive;
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
  font-family: "Delius Swash Caps", cursive;
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
  font-family: "Delius Swash Caps", cursive;
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
  font-family: "Delius Swash Caps", cursive;
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

.pagination-controls {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.pagination-controls button {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  border: none;
  background-color: #ec5d43;
  color: white;
  font-family: "Delius Swash Caps", cursive;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.pagination-controls button:disabled {
  background-color: #c9d6c8;
  cursor: not-allowed;
}

.pagination-controls button:hover:not(:disabled) {
  background-color: #c8442d;
}

.pagination-controls span {
  font-family: "Delius Swash Caps", cursive;
  color: #4a4a4a;
  font-size: 1.1rem;
  font-weight: bold;
}

.no-users {
  margin-top: 2rem;
  font-family: "Delius Swash Caps", cursive;
  color: #b66f61;
  font-style: italic;
  font-size: 1.2rem;
  text-align: center;
}
</style>