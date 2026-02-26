import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    meta: { title: '关于' }
  },
  {
    path: '/center',
    name: 'Center',
    component: () => import('../views/Center.vue'),
    meta: { title: '资源分类中心' }
  },
  {
    path: '/classin',
    name: 'ClassIn',
    component: () => import('../views/ClassIn.vue'),
    meta: { title: 'ClassIn群聊' }
  },
  {
    path: '/weblinks',
    name: 'WebLinks',
    component: () => import('../views/WebLinks.vue'),
    meta: { title: '网页跳转' }
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('../views/Terms.vue'),
    meta: { title: '服务协议' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || 'Cottie'} | Cottie`
  next()
})

export default router
