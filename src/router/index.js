import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import Welcome from '../components/Welcome'

Vue.use(VueRouter)

const routes = [
  // 重定向
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login,
    meta: {
      title: '芝士 | 登录'
    }
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome,
        meta: {
          title: '芝士 | Welcome'
        }
      }
    ],
    meta: {
      title: '芝士管理系统'
    }
  },
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // 网页标题为对应路由的title值
  window.document.title = to.meta.title;
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
