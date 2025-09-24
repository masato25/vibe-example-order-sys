<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <NavBar />
    
    <!-- Main Content -->
    <main class="flex-1">
      <RouterView />
    </main>
    
    <!-- Footer -->
    <AppFooter />
    
    <!-- Loading Overlay -->
    <LoadingOverlay v-if="isLoading" />
    
    <!-- Toast Notifications -->
    <Transition name="toast">
      <div v-if="notification" class="toast-container">
        {{ notification }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { RouterView } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import NavBar from '@/components/layout/NavBar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'

const userStore = useUserStore()
const cartStore = useCartStore()

const isLoading = computed(() => userStore.isLoading || cartStore.isLoading)
const notification = computed(() => userStore.error || cartStore.error)

onMounted(() => {
  // Initialize user session from localStorage
  userStore.initializeFromStorage()
  
  // Initialize cart from localStorage
  cartStore.initializeFromStorage()
})
</script>

<style>
#app {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background: #ef4444;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
</style>