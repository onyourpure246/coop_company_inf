<template>
  <div id="app">
    <app-notification v-if="notification.show" v-bind="notification" @close="closeNotification" />
    <!-- Conditionally render the NavBar -->
    <NavBar class="navbar" v-if="!$route.meta.hideNavbar" />
    <router-view />
    <CookieConsent />
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue';
import CookieConsent from './components/CookieConsent.vue';
import UserService from './UserService';
import { ref, onMounted, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { emitter } from './router/authGuard';

export default {
  name: 'app',
  components: {
    NavBar,
    CookieConsent,
  },

  setup() {
    const router = useRouter();
    const notification = ref({
      show: false,
      message: '',
      type: 'info',
      duration: 3000
    });

    const closeNotification = () => {
      notification.value.show = false;
    };

    const checkAuthStatus = async () => {
      try {
        // Check if session is valid
        const isAuthenticated = await UserService.checkSession();
        const currentRoute = router.currentRoute.value;

        if (!isAuthenticated && !currentRoute.meta.public) {
          // Redirect to login if not authenticated and route is not public
          router.push('/');
        } else if (isAuthenticated && currentRoute.path === '/user-login') {
          // If authenticated and on login page, redirect to appropriate dashboard
          switch(UserService.getRole()) {
            case 'student':
              router.push('/companyfinding');
              break;
            case 'teacher':
              router.push('/teacher-dashboard');
              break;
            case 'admin':
              router.push('/admin-dashboard');
              break;
            default:
              router.push('/companyfinding');
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
        // Only redirect to login if not on a public route
        if (!router.currentRoute.value.meta.public) {
          router.push('/user-login');
        }
      }
    };

    onBeforeMount(async () => {
      await checkAuthStatus();
    });

    onMounted(async () => {
      // Additional check on mount
      if (!UserService.isAuthenticated()) {
        await checkAuthStatus();
      }

      // Listen for notification events
      emitter.on('show-notification', (data) => {
        notification.value = { ...data, show: true };
        setTimeout(closeNotification, data.duration || 3000);
      });
    });

    return {
      notification,
      closeNotification
    };
  },

}
</script>

<style>
@import 'bootstrap/dist/css/bootstrap.min.css';

#app {
  font-family: 'Kanit', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
  max-width: -webkit-fill-available;
}
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.navbar {
  flex-shrink: 0;
  position: relative; /* ป้องกันทับซ้อน */
  z-index: 1000;
}

.router-view-container {
  flex-grow: 1;
  padding-top: 70px; /* ให้เว้นพื้นที่เผื่อ Navbar */
}



</style>
