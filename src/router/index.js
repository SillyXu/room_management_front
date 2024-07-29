import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '@/layouts/MainLayout';
import Login from '@/views/Login.vue'; // 直接导入登录视图

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue')
      },
      {
        path: 'residents',
        name: 'Residents',
        component: () => import('@/views/Residents/List.vue')
      },
      // 更多子路由...
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: Login // 直接使用 Login 组件，不使用 MainLayout
  },
  // 其他路由...
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 添加全局前置守卫
router.beforeEach((to, from, next) => {
  const user = localStorage.getItem('user');
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!user) {
      // 用户未登录，重定向到登录页面
      next({ name: 'Login' });
    } else {
      // 用户已登录，允许访问
      next();
    }
  } else {
    // 不需要认证的页面，直接访问
    next();
  }
});

export default router;