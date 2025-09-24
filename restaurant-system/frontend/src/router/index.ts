import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: 'Delicious Bites Restaurant'
    }
  },
  {
    path: '/menu',
    name: 'Menu',
    component: () => import('@/views/MenuView.vue'),
    meta: {
      title: 'Our Menu'
    }
  },
  {
    path: '/menu/:category?',
    name: 'MenuCategory',
    component: () => import('@/views/MenuView.vue'),
    props: true,
    meta: {
      title: 'Menu Category'
    }
  },
  {
    path: '/item/:id',
    name: 'MenuItem',
    component: () => import('@/views/MenuItemView.vue'),
    props: true,
    meta: {
      title: 'Menu Item'
    }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/CartView.vue'),
    meta: {
      title: 'Your Cart'
    }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('@/views/CheckoutView.vue'),
    meta: {
      title: 'Checkout',
      requiresCart: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: {
      title: 'Login',
      guest: true
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: {
      title: 'Create Account',
      guest: true
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: {
      title: 'My Profile',
      requiresAuth: true
    }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/OrdersView.vue'),
    meta: {
      title: 'My Orders',
      requiresAuth: true
    }
  },
  {
    path: '/order/:id',
    name: 'OrderDetail',
    component: () => import('@/views/OrderDetailView.vue'),
    props: true,
    meta: {
      title: 'Order Details',
      requiresAuth: true
    }
  },
  {
    path: '/order-confirmation/:orderNumber',
    name: 'OrderConfirmation',
    component: () => import('@/views/OrderConfirmationView.vue'),
    props: true,
    meta: {
      title: 'Order Confirmed'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/AboutView.vue'),
    meta: {
      title: 'About Us'
    }
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('@/views/ContactView.vue'),
    meta: {
      title: 'Contact Us'
    }
  },
  {
    path: '/help',
    name: 'Help',
    component: () => import('@/views/HelpView.vue'),
    meta: {
      title: 'Help & FAQ'
    }
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('@/views/PrivacyView.vue'),
    meta: {
      title: 'Privacy Policy'
    }
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('@/views/TermsView.vue'),
    meta: {
      title: 'Terms of Service'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: 'Page Not Found'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    return { top: 0 }
  }
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  // Set document title
  document.title = to.meta.title 
    ? `${to.meta.title} - Delicious Bites Restaurant`
    : 'Delicious Bites Restaurant'

  // Authentication guard
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // Guest only routes (redirect if authenticated)
  if (to.meta.guest && userStore.isAuthenticated) {
    next({ name: 'Profile' })
    return
  }

  // Cart requirement guard
  if (to.meta.requiresCart) {
    const { useCartStore } = await import('@/stores/cart')
    const cartStore = useCartStore()
    
    if (cartStore.items.length === 0) {
      next({ name: 'Menu' })
      return
    }
  }

  next()
})

export default router