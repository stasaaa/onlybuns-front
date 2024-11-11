<template>
  <div class="container">
    <div class="left">
      <CFormTextarea
        class="textbox"
        id="description"
        label="Post description"
        rows="3"
        v-model="post.description">
      </CFormTextarea>
      <MapComponent @map-clicked="handleMapData"></MapComponent>
    </div>
    <div class="right">
      <FileField @file-selected="handleFileSelected" :initialImage="missingImage" />
      <CButton color="secondary" style="width: auto;" @click="triggerFileInput">
        <font-awesome-icon :icon="['fas', 'file-arrow-up']" /> Upload
      </CButton>
    </div>
  </div>
  <CButton v-on:click.prevent="createPost">Create Post</CButton>
</template>
  
  <script setup>
  import { ref } from 'vue';
  import { CButton, CFormTextarea } from '@coreui/vue';
  import MapComponent from '@/components/MapComponent.vue';
  import FileField from '@/components/FileField.vue';
  import { useStore } from 'vuex';
  import apiClient from '@/axios/axios';
  
  const store = useStore();
  
  // Initialize formData for the image
  const formData = new FormData();
  
  const post = ref({
    description: '',
    userId: store.state.user.id,
    image: null,
    location: {
      country: '',
      postalCode: 0,
      city: '',
      street: '',
      number: 0,
      latitude: 0,
      longitude: 0
    }
  });
  
  const missingImage = require('@/assets/missing-image.png');
  
  const handleFileSelected = (file) => {
    // Append the file to formData
    console.log(file)
    formData.append('image', file);
    post.value.image = file; // Update the post object with the formData
  };
  
  const triggerFileInput = () => {
    document.getElementById('file-field').click();
  };
  
  const handleMapData = (data) => {
    const { lat, lng, address } = data;
  
    post.value.location = {
      latitude: lat,
      longitude: lng,
      country: address.country || '',
      city: address.city || '',
      street: address.street || '',
      postalCode: address.postalcode || 0,
      number: address.street_number || 0
    };
  };
  
const createPost = () => {
  // Check if required fields are filled
  if (!post.value.description || !post.value.location.latitude || !post.value.image) {
    console.error("All fields must be filled out!");
    return;
  }

  formData.append('description', post.value.description); // Description
  formData.append('userId', post.value.userId); // User ID (can be from Vuex store or wherever)
  formData.append('address', JSON.stringify(post.value.location)); // Serialize address as JSON string

  for (let [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`${key}:`, value.name);  // Log the name of the file
    } else {
      console.log(`${key}:`, value);  // Log other fields
    }
  }

  // Send the POST request with formData and appropriate headers
  apiClient.post('posts/create', formData, {
    headers: {
      'Authorization': `Bearer ${store.state.token}`,
      'Content-Type': 'multipart/form-data',
    }
  })
  .then(() => {
    alert('Post created successfully');
  })
  .catch(error => {
    console.error("Error creating post: ", error);
  });
};
  </script>
  
  <style scoped>
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 80vh;
  }
  
  .left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 5vh;
    width: 40vw;
    height: 80vh;
  }
  
  .left > * {
    width: 100%;
    margin-bottom: 10px;
  }
  
  .right {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    margin-top: 5vh;
    width: 40vw;
  }
  
  .right > * {
    width: 100%;
    margin-bottom: 10px;
  }
  
  #mapContainer {
    width: 100%;
    height: 50%;
  }

  .create-post-container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background-color: white;
  }

  .page-wrapper {
    background-image: url('@/assets/bunnyTile.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    min-height: 100vh;
    width: 100%;
    padding: 1px;
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
    background-color: #ed9787;
    color: #4A4A4A;
    padding: 1rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .submit-btn:hover {
    background-color: #f18571;
  }
  
  input:focus, textarea:focus {
    outline: none;
    border-color: #f18571;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  }
  </style>
  
