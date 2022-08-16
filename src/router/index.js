import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'

Vue.use(VueRouter)

const routes = [
  // 重定向
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home
  },
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // 如果直接访问的是登录页面
  if (to.path === '/login') {
    next();
  } else {
    // 如果直接访问的不是登录页面
    // 获取token
    const tokenStr = window.sessionStorage.getItem('token');
    if (!tokenStr) {
      next('./login');
    } else {
      next();
    }
  }
});

export default router
