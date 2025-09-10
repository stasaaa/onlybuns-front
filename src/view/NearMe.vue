<template>
    <div class="container">
        <div class="map">
            <MapComponent ref="mapRef"
                        :changeUserLocation="true"
                        :userLocation="[currentPosition.latitude, currentPosition.longitude]"
                        :showUserLocation="true"
                        :multipleBunnies="true"
                        :multipleLocations="posts"
                        :showRabbitCareLocations="true"
                        :rabbitCareLocations="rabbitCareLocations"
                        @map-clicked="handleMapData"/>
        </div>
        <div class="posts" v-if="hasPosts">
            <div class="posts-grid">
                <PostComponent
                    v-for="post in posts"
                    :key="post.id"
                    :post="post"
                    :userId="user.id"
                    @post-updated="refreshPosts"
                    @post-edited="updatePost"
                    @post-deleted="removePost"
                  />
            </div>
        </div>
        <div class="no-posts" v-else>
            <h2>There are no bunnies near you <font-awesome-icon :icon="['fas', 'heart-crack']" /></h2>
        </div>
    </div>
</template>

<script setup>
import apiClient from '@/axios/axios';
import MapComponent from '@/components/MapComponent.vue';
import { onMounted, ref, computed, watch, nextTick } from 'vue';
import { useStore } from 'vuex';
import PostComponent from "@/components/Post.vue";

const mapRef = ref(null);

const store = useStore();
const user = computed(() => store.getters.getUser);
const currentPosition = ref({
    country: '',
    postalCode: '',
    city: '',
    streetName: '',
    streetNumber: '',
    latitude: 0,
    longitude: 0
});

watch(() => user.value.address, (newAddress) => {
    currentPosition.value = { ...newAddress };
}, { immediate: true });

watch(
  () => user.value.address,
  (newAddress) => {
    console.log(user.value);
    if (
      newAddress &&
      typeof newAddress.latitude === 'number' &&
      typeof newAddress.longitude === 'number'
    ) {
      currentPosition.value = {
        latitude: newAddress.latitude,
        longitude: newAddress.longitude
      };
    } else {
      console.warn("Adresa nema validne koordinate:", newAddress);
    }
  },
  { immediate: true }
);

const page = ref(0);
const pageSize = ref(10);

const posts = ref([]);
const hasPosts = computed (() => posts.value.length > 0);

const rabbitCareLocations = ref([]);

onMounted(async () => {
  await nextTick();
  getPosts();
  getRabbitCareLocations()
})

function refreshPosts() {
  getPosts()
}

function getRabbitCareLocations() {
  apiClient.get('/api/rabbit-care')
  .then((response) => {
    console.log("----------RABBIT CARE LOCATION------------")
    console.log(response.data)
    rabbitCareLocations.value = response.data

    if (mapRef.value && mapRef.value.showRabbitCareLocations) {
      mapRef.value.showRabbitCare();
    }
  })
  .catch((error) => {
    console.log(error)
  })
}

function getPosts() {
    apiClient.get(`posts/near-me`, 
    {
        params: {
            address: JSON.stringify(currentPosition.value),
            page: page.value,
            pageSize: pageSize.value
        }
    })
    .then(async (response) => {
        posts.value = response.data;

        console.log("AAAAAAAAAA");
        // console.log(mapRef.value);
        // console.log(mapRef.value.multipleLocations);
        console.log(posts.value)
        if (mapRef.value && mapRef.value.showMultipleBunnies) {
            mapRef.value.showMultipleBunnies();
        }

        for (const post of posts.value) {
          try {
            const userRes = await apiClient.get(`users/findUsername/${post.userId}`);
            post.username = userRes.data;
          } catch {
            post.username = 'Unknown User';
          }

          try {
            const commentsRes = await apiClient.get(`comments/${post.id}`);
            const comments = commentsRes.data;
            for (const comment of comments) {
              try {
                const userRes = await apiClient.get(`users/findUsername/${comment.userId}`);
                comment.username = userRes.data;
              } catch {
                comment.username = 'Unknown User';
              }
            }
            post.comments = comments.sort((a, b) => new Date(b.creationTime) - new Date(a.creationTime));
          } catch {
            post.comments = [];
          }
        }
    })
    .catch((error) => {
        console.log(error);
    });
}

const handleMapData = (data) => {
    const { lat, lng, address } = data;

    currentPosition.value = {
        latitude: lat,
        longitude: lng,
        country: address.country || '',
        city: address.city || '',
        street: address.street || '',
        postalCode: address.postalcode || 0,
        number: address.street_number || 0
    };

    getPosts();
};
</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    margin: 0%;
}

#mapContainer {
    width: 35vw;
}

.map {
    flex: 1;
    position: fixed;
    left: 18%;
    top: 50%;
    transform: translateY(-50%);
}

.no-posts {
    flex: 1;
    margin-left: 45vw;
    margin-top: 50vh;
    transform: translateY(-25%);
}

/* For posts */
.posts-grid {
  margin-left: 45vw;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  overflow-y: visible;
}

.posts {
    margin-top: 10vh;
    overflow-y: auto; /* Makes posts scrollable */
    max-height: 70vh; /* Full height of the container */
    padding: 1rem;
    box-sizing: border-box;
}

.post-card {
  width: 100%;
  max-width: 500px;
  margin: 0;
  padding: 0;
  background-color: #e6ece5;
  border: 2px solid #c9d6c8;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
  overflow: hidden;
}

.post-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  display: block;
  border-bottom: 2px solid #c9d6c8;
}

.interaction-buttons {
  display: flex;
  gap: 1rem;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #c9d6c8;
}

.interaction-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4A4A4A;
  font-family: 'Delius Swash Caps', cursive;
  cursor: pointer;
  transition: all 0.2s ease;
}

.interaction-btn:hover {
  color: #ec5d43;
}

.interaction-btn .carrot-icon {
  transform: rotate(315deg);
}

.post-description {
  padding: 1rem;
  margin: 0;
  font-family: 'Delius Swash Caps', cursive;
  color: #4A4A4A;
}

.post-location {
  padding: 0 1rem 1rem;
  margin: 0;
  font-family: 'Delius Swash Caps', cursive;
  color: #ec5d43;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

#alertUser {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 9999;
  opacity: 1;
  transition: opacity 0.5s ease-in-out;
  -webkit-animation: fadeIn 3s linear forwards;
  animation: fadeIn 3s linear forwards;
}

.post-options {
  position: absolute;
  background-color: #fff;
  border: 1px solid #c9d6c8;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  z-index: 100;
  right: 1rem;
  top: 3rem;
}

.post-option {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Delius Swash Caps', cursive;
  color: #4A4A4A;
}

.post-option:hover {
  background-color: #f5f5f5;
}

@keyframes fadeIn {
  0%, 100% {
    opacity: 0;
  }
  20%, 80% {
    opacity: 1;
  }
}

.link:hover {
  cursor: pointer;
}
</style>