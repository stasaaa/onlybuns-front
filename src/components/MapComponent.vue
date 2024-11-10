<template>
    <div ref="map" class="map-container" style="width: 100%; height: 100%;">
      <!-- Leaflet map will be rendered here -->
    </div>
    <div v-if="selectedLocation" class="selected-location">
      <p>Selected Location:</p>
      <p>Latitude: {{ selectedLocation.lat }}</p>
      <p>Longitude: {{ selectedLocation.lon }}</p>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch, defineProps} from 'vue';
  import L from 'leaflet';

  
  // Props
  const props = defineProps({
    center: {
      type: Array,
      required: true,
    },
    zoom: {
      type: Number,
      default: 13,
    },
    markers: {
      type: Array,
      default: () => [],
    },
  });
  
  // Refs
  const map = ref(null);
  const selectedLocation = ref(null); // To store selected location coordinates
  
  // Map Initialization and Event Handling
  onMounted(() => {
    // Create the map
    map.value = L.map(map.value).setView(props.center, props.zoom);
  
    // Add the tile layer (using OpenStreetMap as an example)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map.value);
  
    // Add markers if provided
    props.markers.forEach((marker) => {
      L.marker(marker.position)
        .bindPopup(marker.popup)
        .addTo(map.value);
    });
  
    // Event listener for click event on the map
    map.value.on('click', (e) => {
      const { lat, lng } = e.latlng;
      selectedLocation.value = { lat, lon: lng }; // Update the selected location
      updateMarker(lat, lng); // Add a marker at the clicked location
    });
  });
  
  // Function to update the marker at the clicked location
  const updateMarker = (lat, lng) => {
    // Remove existing marker if there's one already
    if (map.value._selectedMarker) {
      map.value.removeLayer(map.value._selectedMarker);
    }
  
    // Add a new marker at the selected location
    const marker = L.marker([lat, lng]).addTo(map.value);
    map.value._selectedMarker = marker; // Store the reference to the marker
  };
  
  // Watch for changes in the center prop to update the map view
  watch(
    () => props.center,
    (newCenter) => {
      if (map.value) {
        map.value.setView(newCenter, props.zoom);
      }
    }
  );
  </script>
  
  <style scoped>
  .map-container {
    height: 100%;
    width: 100%;
  }
  
  .selected-location {
    margin-top: 20px;
    padding: 10px;
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  .selected-location p {
    margin: 5px 0;
  }
  </style>