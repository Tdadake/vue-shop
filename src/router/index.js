import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import Welcome from '../components/Welcome'
import Users from '../components/user/Users'
import Rights from '../components/authority/Rights'
import Roles from '../components/authority/Roles'

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
      title: '登录 | 芝士管理系统',
    }
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    meta: {
      title: '主页 | 芝士管理系统',
    },
    children: [
      {
        path: '/welcome',
        component: Welcome,
        meta: {
          title: '主页 | 芝士管理系统',
        }
      },
      {
        path: '/users',
        component: Users,
        meta: {
          title: '用户列表 | 芝士管理系统',
        }
      },
      {
        path: '/rights',
        component: Rights,
        meta: {
          title: '权限列表 | 芝士管理系统'
        }
      },
      {
        path: '/roles',
        component: Roles,
        meta: {
          title: '角色列表 | 芝士管理系统'
        }
      }
    ],
  },
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // 各个路由显示的title
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
