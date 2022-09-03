import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import Welcome from '../components/Welcome'
import Users from '../components/user/Users'
import Rights from '../components/authority/Rights'
import Roles from '../components/authority/Roles'
import Cate from '../components/goods/Cate'
import Params from '../components/goods/Params'
import List from '../components/goods/List'
import Add from '../components/goods/Add'
import Order from '../components/order/Order'
import Report from '../components/report/Report'

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
      },
      {
        path: '/categories',
        component: Cate,
        meta: {
          title: '商品分类 | 芝士管理系统'
        }
      },
      {
        path: '/params',
        component: Params,
        meta: {
          title: '分类参数 | 芝士管理系统'
        }
      },
      {
        path: '/goods',
        component: List,
        meta: {
          title: '商品列表 | 芝士管理系统'
        }
      },
      {
        path: '/goods/add',
        component: Add,
        meta: {
          title: '添加商品 | 芝士管理系统'
        }
      },
      {
        path: '/orders',
        component: Order,
        meta: {
          title: '订单列表 | 芝士管理系统'
        }
      },
      {
        path: '/reports',
        component: Report,
        meta: {
          title: '数据报表 | 芝士管理系统'
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
