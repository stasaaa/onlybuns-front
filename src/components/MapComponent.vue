<template>
    <div id="mapContainer"></div>
</template>
  
<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import bunnyImage from "@/assets/bunny-hide.gif";
import userPin from "@/assets/user-pin.png";
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';
import vet from '@/assets/rabbit.png'
import { toRaw } from 'vue';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: bunnyImage,
  iconRetinaUrl: bunnyImage.increaseSizex2,
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  iconSize: [50, 50],
  iconAnchor: [25, 50],
});

const specialIcon = L.icon({
  iconUrl: userPin,
  iconSize: [50, 50],
  iconAnchor: [25, 50],
});

const vetIcon = L.icon({
  iconUrl: vet,
  iconSize: [50, 50],
  iconAnchor: [25, 50], 
})


export default {
  name: "MapComponent",
  props: {
    disableClick: {
      type: Boolean,
      default: false
    },
    showUserLocation: {
      type: Boolean,
      default: false
    },
    userLocation: {
      type: Array,
      required() {
        return this.showUserLocation;
      },
      validator(value) {
        return value && value.length === 2;
      },
    },
    changeUserLocation: {
      type: Boolean,
      default: false
    },
    multipleBunnies: {
      type: Boolean,
      default: false
    },
    multipleLocations: {
      type: Array
    },
    showRabbitCareLocations: {
      type: Boolean,
      default: false
    },
    rabbitCareLocations: {
      type: Array
    }
  },
  data() {
    return {
      map: null,
      latlng: [45.2502, 19.8335],
      marker: null,
      userMarker: null,
      bunniesMarker: null,
      vetMarkers: [],
      address: {
        city: "",
        country: "",
        street: "",
        postalcode: "",
        street_number: "",
      }
    };
  },
  methods: {
    initMap() {
      if(this.showUserLocation) {
        this.latlng = this.userLocation;
      }

      this.map = L.map("mapContainer", {
        center: this.latlng,
        zoom: 13,
        zoomControl: true,
        dragging: true,
        scrollWheelZoom: true,
        boxZoom: true,
      });

      L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);

      if (L.Control.Geocoder) {
        const geocoder = L.Control.geocoder({
          defaultMarkGeocode: false,
        }).addTo(this.map);

        if(!this.showUserLocation) {
          geocoder.on("markgeocode", (e) => {
            const { center } = e.geocode;
            this.setMarker(center.lat, center.lng);
          });
        } else {
          geocoder.on("markgeocode", (e) => {
            const { center } = e.geocode;
            this.setMarkerUserLocation(center.lat, center.lng);
          });
        }
        
      }

      if(this.showUserLocation) {
        this.userMarker = L.marker(this.latlng, {icon: specialIcon}).addTo(this.map);
      }

      if (this.changeUserLocation) {
        this.map.on("click", (event) => {
          this.handleMapClickUserLocation(event);
        });
      } else {
        this.map.on("click", (event) => {
          if(!this.disableClick) {
            this.handleMapClick(event);
          }
        });
      }
    },
    showRabbitCare() {
      if (!this.rabbitCareLocations || this.rabbitCareLocations.length === 0) return;
      
      toRaw(this.vetMarkers)?.forEach(marker => marker.remove());
      this.vetMarkers = [];

      for (const location of this.rabbitCareLocations) {
        const popup = L.popup().setContent(`<b>${location.name}</b>`);

        const vetMarker = L.marker([location.latitude, location.longitude], {icon: vetIcon})
          .addTo(toRaw(this.map));

        vetMarker.on('click', () => {
          popup.setLatLng(vetMarker.getLatLng()).openOn(toRaw(this.map));
        });

        this.vetMarkers.push(vetMarker);
      }
    },
    showMultipleBunnies() {
      // Remove any existing bunnies markers (if any) before adding new ones
      if (this.bunniesMarker) {
        this.bunniesMarker.forEach(marker => marker.remove());
      }

      this.bunniesMarker = []; // Reset the array of markers

      // Loop through the array of bunny locations and add a marker for
      for (const location of this.multipleLocations) {

        // Create a marker for each bunny location
        const bunnyMarker = L.marker([location.address.latitude, location.address.longitude])
          .addTo(this.map);

        // Push the marker into the bunniesMarker array for later reference
        this.bunniesMarker.push(bunnyMarker);
      }
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
    handleMapClickUserLocation(event) {
      const { lat, lng } = event.latlng;

      // Update latlng for the map and fetch address info
      this.latlng = [lat, lng];
      this.updateMap();

      // Remove the existing marker if any
      if (this.userMarker) {
        this.userMarker.remove();
      }

      // Create and add a new marker
      this.userMarker = L.marker([lat, lng], {icon: specialIcon}).addTo(this.map);

      // Reverse geocode to get the address info
      this.reverseGeocode(lat, lng);

      this.$emit('map-clicked', { lat, lng, address: this.address });
    },
    setMarker(lat, lng) {
      // Remove the existing marker if any
      if (this.marker) {
        this.marker.remove();
      }

      // Create a new marker
      this.marker = L.marker([lat, lng]).addTo(this.map);

      // Update map view and reverse geocode the address
      this.map.setView([lat, lng], 13); // Adjust zoom if needed
      this.reverseGeocode(lat, lng);
      this.$emit('map-clicked', { lat, lng, address: this.address });
    },
    setMarkerUserLocation(lat, lng) {
      // Remove the existing marker if any
      if (this.userMarker) {
        this.userMarker.remove();
      }

      // Create a new marker
      this.userMarker = L.marker([lat, lng], {icon: specialIcon}).addTo(this.map);

      // Update map view and reverse geocode the address
      this.map.setView([lat, lng], 13); // Adjust zoom if needed
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
  watch: {
    rabbitCareLocations: {
      handler(newVal) {
        if (newVal?.length && this.map) {
          this.showRabbitCare();
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>

<style>
#mapContainer {
  width: 60vw;
  height: 50vh;
  -webkit-border-radius: 10px;
  -moz-border-radius: 10px;
  border-radius: 10px;
}
</style>
  