<template>
    <div id="mapContainer"></div>
</template>
  
  <script>
  import "leaflet/dist/leaflet.css";
  import L from "leaflet";
  import axios from "axios";
  import bunnyImage from "@/assets/bunny-hide.gif";
  
  // Fix for missing default marker icon in Leaflet
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: bunnyImage,
    iconRetinaUrl: bunnyImage.increaseSizex2,
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
    iconSize: [50, 50],
    iconAnchor: [25, 50],
  });
  
  export default {
    name: "MapComponent",
    data() {
      return {
        map: null,
        latlng: [45.2502, 19.8335], // Default coordinates for Novi Sad
        marker: null, // To keep track of the marker
        address: {
          city: "",
          country: "",
          street: "",
          postalcode: "",
          street_number: "",
        },
      };
    },
    methods: {
      initMap() {
        // Initialize the map
        this.map = L.map("mapContainer", {
          center: this.latlng,
          zoom: 13,
          zoomControl: true,
          dragging: true,
          scrollWheelZoom: true,
          boxZoom: true,
        });
  
        // Add tile layer to map
        L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.map);
  
        // Map click event listener (only one marker at a time)
        this.map.on("click", this.handleMapClick);
      },
      handleMapClick(event) {
        const { lat, lng } = event.latlng;
  
        // Update latlng for the map and fetch address info
        this.latlng = [lat, lng];
        this.updateMap();
  
        // Remove the existing marker if any
        if (this.marker) {
          this.marker.remove();
        }
  
        // Create and add a new marker
        this.marker = L.marker([lat, lng]).addTo(this.map);
  
        // Reverse geocode to get the address info
        this.reverseGeocode(lat, lng);

        this.$emit('map-clicked', { lat, lng, address: this.address });
      },
      reverseGeocode(lat, lng) {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
        axios
          .get(url)
          .then((response) => {
            const addressData = response.data.address || {};
            this.address = {
              city: addressData.city || "",
              country: addressData.country || "",
              street: addressData.road || "",
              postalcode: addressData.postcode || "",
              street_number: addressData.house_number || "",
            };
  

            this.$emit('map-clicked', {
              lat: lat,
              lng: lng,
              address: this.address
            });
            // Now that we have the address, update the popup
            this.updatePopup(lat, lng);
          })
          .catch((error) => {
            console.error("Error in reverse geocoding:", error);
          });
      },
      updatePopup(lat, lng) {
        // Display the lat, lng, and address info in the popup
        const popupContent = `
          <b>Latitude:</b> ${lat}<br>
          <b>Longitude:</b> ${lng}<br>
          <b>City:</b> ${this.address.city}<br>
          <b>Country:</b> ${this.address.country}<br>
          <b>Street:</b> ${this.address.street}<br>
          <b>Postal Code:</b> ${this.address.postalcode}<br>
          <b>Street Number:</b> ${this.address.street_number}
        `;
  
        // Open the popup at the clicked location
        this.marker.bindPopup(popupContent).openPopup();
      },
      updateMap() {
        // Ensure the map is fully initialized before calling setView
        if (this.map) {
          this.map.setView(this.latlng, 12); // Adjust zoom level as needed
        }
      },
    },
    mounted() {
      this.initMap(); // Initialize the map after the component has been mounted
    },
    beforeUnmount() {
      if (this.map) {
        this.map.remove();
      }
    },
  };
  </script>
  
  <style>
  #mapContainer {
    width: 60vw;
    height: 50vh;
  }
  </style>
  