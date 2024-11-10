<template>
    <div class="create-post-container">
      <form @submit.prevent="handleSubmit" class="post-form">
        <h2>Create New Post</h2>
        
        <div class="form-group">
          <label for="description">Description:</label>
          <textarea 
            id="description"
            v-model="formData.description"
            placeholder="Write your post description..."
            required
            rows="4"
          ></textarea>
        </div>
  
        <div class="form-group">
          <label for="image">Image URL:</label>
          <input 
            type="text"
            id="image"
            v-model="formData.image"
            placeholder="Enter image URL"
            required
          >
        </div>
  
        <div class="form-group">
          <label for="location">Location:</label>
          <input 
            type="text"
            id="location"
            v-model="formData.location"
            placeholder="Enter location (e.g. street name)"
            required
          >
        </div>
  
        <button type="submit" class="submit-btn" :disabled="!isUserLoggedIn">
        {{ isUserLoggedIn ? 'Create Post' : 'Please login first' }}
      </button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useStore } from 'vuex'
  import apiClient from '../axios/axios';
  
  const store = useStore()

  const userId = computed(() => store.state.user.id)
  const isUserLoggedIn = computed(() => store.state.user.id !== -1)

  const formData = ref({
    description: '',
    image: '',
    location: '',
    userId: userId
  })
  
  const handleSubmit = () => {
    const token = sessionStorage.getItem('token');
    console.log('Using token:', token);
    
    const postData = {
        description: formData.value.description,
        image: formData.value.image,
        location: formData.value.location,
        userId: store.state.user.id
    };

    console.log('Sending data:', postData);

    apiClient.post('/posts/create', postData, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then((response) => {
        console.log('Success:', response);
        alert('Post successfully created.');
    })
    .catch((error) => {
        console.log('Full error:', error);
        alert(error.response?.data || 'Error creating post');
    });
}

  </script>
  
  <style scoped>
  .create-post-container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background-color: white;
  }
  
  .post-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  h2 {
    text-align: center;
    color: #333;
    margin-bottom: 1.5rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  label {
    font-weight: 600;
    color: #444;
  }
  
  input, textarea {
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  textarea {
    resize: vertical;
    min-height: 100px;
  }
  
  .submit-btn {
    background-color: #f18571;
    color: white;
    padding: 1rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .submit-btn:hover {
    background-color: #ec5d43;
  }
  
  input:focus, textarea:focus {
    outline: none;
    border-color: #f18571;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  }
  </style>