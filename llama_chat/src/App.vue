<template>
  <kk123 msg="Welcome to Your Vue.js App"/>
</template>

<script>
import DevicePixelRatio from './js/rem'
// import LLamaChat from './components/LLamaChat.vue'
import kk123 from './components/kk.vue'

export default {
  name: 'App',
  components: {
    kk123,
  },
  created(){
    new DevicePixelRatio().init()
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

body{
  margin: 0;
}


</style>
