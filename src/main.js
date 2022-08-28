import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'

import TreeTable from 'vue-table-with-tree-grid'

// 导入axios
import axios from 'axios'
// 配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:9000/api/private/v1/'
// 请求拦截器
axios.interceptors.request.use(config => {
  // 给请求头对象添加token验证的authorization字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 把axios组件挂载到Vue原型对象上
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
