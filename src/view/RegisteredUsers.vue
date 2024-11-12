<template>
    <div class="registered-users">
      <h1>Registered Users</h1>
      <p>Ovde možete videti sve registrovane korisnike.</p>
  
      <table class="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Surname</th>
            <th>Email</th>
            <th>Username</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
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
  import { ref, onMounted } from 'vue';
  //import { useStore } from 'vuex';
  import apiClient from '@/axios/axios';
  
  //const store = useStore();
  const users = ref([]);
  
  // Učitavanje liste registrovanih korisnika kada se stranica učita
  onMounted(async () => {
    try {
        const response = await apiClient.get('users');
        users.value = response.data;
        console.log('Users loaded:', users.value);
    } catch (error) {
        console.error('Error loading posts:', error);
    }
  });
  </script>
  
  <style scoped>
  .registered-users {
    padding: 20px;
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
  