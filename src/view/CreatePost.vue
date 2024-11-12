<template>
  <div class="page-wrapper">
    <div class="create-post-container">
      <h2>Create New Bunny Post</h2>
      
      <div class="form-content">
        <div class="form-group">
          <label>What's on your mind?</label>
          <CFormTextarea
            class="textbox"
            id="description"
            placeholder="Share your bunny thoughts..."
            rows="3"
            v-model="post.description">
          </CFormTextarea>
        </div>

        <div class="form-group">
          <label>Share a photo!</label>
          <FileField @file-selected="handleFileSelected" :initialImage="missingImage" />
          <CButton class="upload-btn" @click="triggerFileInput">
            <font-awesome-icon :icon="['fas', 'file-arrow-up']" /> Upload Photo
          </CButton>
        </div>

        <div class="form-group">
          <label>Where did you spot this bunny?</label>
          <MapComponent class="map-container" @map-clicked="handleMapData"></MapComponent>
        </div>

        <CButton class="create-btn" v-on:click.prevent="createPost">
          <font-awesome-icon :icon="['fas', 'carrot']" /> Share Bunny Post
        </CButton>
      </div>
    </div>
  </div>
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
@import url('https://fonts.googleapis.com/css2?family=Delius+Swash+Caps&display=swap');

.page-wrapper {
  background-image: url('@/assets/bunnyTile.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
  width: 100%;
  padding: 2rem;
  display: flex;
  justify-content: center;
}

.create-post-container {
  max-width: 800px;
  width: 90%;
  margin: 0 auto;
  padding: 2rem;
  border-radius: 20px;
  background-color: #e6ece5;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

h2 {
  font-family: 'Delius Swash Caps', cursive;
  color: #ec5d43;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

label {
  font-family: 'Delius Swash Caps', cursive;
  color: #e53717;
  font-size: 1.2rem;
  margin-left: 0.5rem;
}

.textbox {
  background-color: #e6ece5;
  border: 2px solid #c9d6c8;
  border-radius: 15px;
  padding: 1rem;
  font-family: 'Delius Swash Caps', cursive;
}

.textbox:focus {
  border-color: #ec5d43;
  outline: none;
  box-shadow: 0 0 0 3px rgba(236, 93, 67, 0.2);
}

.map-container {
  border-radius: 15px;
  overflow: hidden;
  border: 2px solid #c9d6c8;
  height: 300px;
  width: 100%;
  max-width: 100%;
}

.upload-btn {
  background-color: #c9d6c8;
  border: none;
  color: #4A4A4A;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  font-family: 'Delius Swash Caps', cursive;
  transition: all 0.3s ease;
}

.upload-btn:hover {
  background-color: #b8c5b7;
  transform: translateY(-2px);
}

.create-btn {
  background-color: #f18571; 
  border: none;
  color: white;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-family: 'Delius Swash Caps', cursive;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  margin-top: 1rem;
  width: 100%;
}

.create-btn:hover {
  background-color: #ec5d43;
  transform: translateY(-2px);
}

/* fileField container styling */
:deep(.file-field-container) {
  background-color: #e6ece5;
  border: 2px dashed #c9d6c8;
  border-radius: 15px;
  padding: 1rem;
  text-align: center;
  transition: all 0.3s ease;
}

:deep(.file-field-container:hover) {
  border-color: #ec5d43;
  background-color: #fffddb;
}

/* style for image preview */
:deep(img) {
  max-width: 300px;
  max-height: 300px; 
  width: auto;
  height: auto;
  border-radius: 10px;
  margin: 1rem auto;
  display: block;
  object-fit: contain; 
}
</style>
  
