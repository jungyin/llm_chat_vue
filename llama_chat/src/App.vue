<template>
  <LLamaChat msg="Welcome to Your Vue.js App"/>
</template>

<script>
import DevicePixelRatio from './libs/rem'
import LLamaChat from './components/LLamaChat.vue'

export default {
  name: 'App',
  components: {
    LLamaChat,
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




</style>
