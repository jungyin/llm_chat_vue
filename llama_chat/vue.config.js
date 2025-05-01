const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,

  devServer: {
    proxy: {
      '/speek': {
        target: 'http://localhost:5090', // 假设你的本地后端运行在3000端口
        changeOrigin: true
      },
      '/getMessageList': {
        target: 'http://localhost:5090', // 假设你的本地后端运行在3000端口
        changeOrigin: true
      },
      '/getLastStr': {
        target: 'http://localhost:5090', // 假设你的本地后端运行在3000端口
        changeOrigin: true
      },
    }
  }
})
