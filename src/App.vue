<template>
  <NavBar></NavBar>
  <router-view></router-view>
  <MapComponent :center="[51.505, -0.09]" :zoom="13" />
</template>

<script>
import '@coreui/coreui/dist/css/coreui.min.css'
import NavBar from './components/NavBar.vue'
import MapComponent from './components/MapComponent.vue';

export default {
  name: 'App',
  components: {
    NavBar,
    MapComponent
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>