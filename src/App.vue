<template>
  <NavBar></NavBar>
  <router-view class="main-part"></router-view>
</template>

<script>
import '@coreui/coreui/dist/css/coreui.min.css'
import NavBar from './components/NavBar.vue'
//import MapComponent from './components/MapComponent.vue';
// <MapComponent :center="[51.505, -0.09]" :zoom="13" />

export default {
  name: 'App',
  components: {
    NavBar
    //,MapComponent
  }
}
</script>

<style>
html, body {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  height: 100%; /* Ensure full height of the viewport */
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  min-height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.main-part {
  flex: 1;
}
</style>