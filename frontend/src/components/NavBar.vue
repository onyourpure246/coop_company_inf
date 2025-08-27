<template>
  <nav v-if="!$route.meta.hideNavbar" class="navbar navbar-expand-lg" :style="{ backgroundColor: 'var(--background-color)' }">
    <div class="container-fluid">
      <div class="navbar-brand logo" @click="goToHome" style="cursor: pointer;">
        <img src="/web-app-logo.png" alt="CoopHelper Logo" class="logo-image" />
        <span class="logo-text">งานสหกิจศึกษาสำหรับประชาสัมพันธ์สถานประกอบการ สาขาเทคโนโลยีสารสนเทศและการสื่อสารดิจิทัล</span>
      </div>
      <button v-if="!$route.meta.showOnlyLogo" class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav" v-if="!$route.meta.showOnlyLogo">
        <ul class="navbar-nav ms-auto nav-links">
          <li class="nav-item">
            <button class="nav-link" @click="goToJobsFinder"><font-awesome-icon :icon="['fas', 'magnifying-glass']" /><span class="button-text"> ค้นหาสถานประกอบการ</span></button>
          </li>
          <template v-if="!isAdmin">
            <li class="nav-item">
              <button class="nav-link" @click="goToProfile"><font-awesome-icon :icon="['fas', 'id-badge']" /><span class="button-text"> โปรไฟล์</span></button>
            </li>
            <li class="nav-item">
              <button class="nav-link" @click="goToHistory"><font-awesome-icon :icon="['fas', 'clock-rotate-left']" /><span class="button-text"> ประวัติและสถานะการสมัคร</span></button>
            </li>
            <li class="nav-item">
              <button class="nav-link" @click="goToContact"><font-awesome-icon :icon="['fas', 'message']" /><span class="button-text"> ติดต่อสอบถาม</span></button>
            </li>
          </template>
          <template v-else>
            <li class="nav-item">
              <button class="nav-link" @click="toggleAdminMenu"><font-awesome-icon :icon="['fas', 'user']" /><span class="button-text"> ระบบแอดมิน</span></button>
            </li>
          </template>
          <li class="nav-item">
            <template v-if="!isLoading">
              <button v-if="isLoggedIn" class="nav-link" @click="logout"><font-awesome-icon :icon="['fas', 'right-from-bracket']" /><span class="button-text"> ออกจากระบบ</span></button>
              <button v-else class="nav-link" @click="goToLogin"><font-awesome-icon :icon="['fas', 'right-to-bracket']" /><span class="button-text"> เข้าสู่ระบบ</span></button>
            </template>
          </li>
        </ul>
      </div>
    </div>
    <!-- Admin Menu Card -->
    <div v-if="showAdminMenu" class="admin-menu-wrapper" @mouseleave="hideAdminMenu">
      <div class="admin-menu-card">
        <ul>
          <li><button @click="goToAdminDashboard"><font-awesome-icon :icon="['fas', 'gauge']" /><span class="button-text"> แดชบอร์ด</span></button></li>
          <li><button @click="manageUsers"><font-awesome-icon :icon="['fas', 'users']" /><span class="button-text"> จัดการบัญชีผู้ใช้</span></button></li>
          <li><button @click="manageStudents"><font-awesome-icon :icon="['fas', 'address-book']" /><span class="button-text"> จัดการข้อมูลนักศึกษา</span></button></li>
          <li><button @click="manageCompanies"><font-awesome-icon :icon="['fas', 'building']" /><span class="button-text"> จัดการข้อมูลสถานประกอบการ</span></button></li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';
import UserService from '../UserService';
import { emitter } from '../router/authGuard';

export default {
  data() {
    return {
      username: UserService.getUsername(),
      showAdminMenu: false,
      isLoading: true,
      sessionChecked: false
    };
  },

  async created() {
    await this.checkAuthStatus();
  },
  computed: {
    isAdmin() {
      if (!this.sessionChecked || this.isLoading) {
        return false;
      }
      const role = UserService.getRole();
      console.log('Role:', role);
      return role === 'officer';
    },
    isLoggedIn() {
      if (!this.sessionChecked || this.isLoading) {
        return false;
      }
      return UserService.isAuthenticated();
    }
  },
  mounted() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    navbarToggler.addEventListener('click', this.toggleMenu);
  },
  beforeUnmount() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    navbarToggler.removeEventListener('click', this.toggleMenu);
  },
  watch: {
    '$route': {
      immediate: true,
      handler() {
        this.checkAuthStatus();
      }
    }
  },
  methods: {
    async checkAuthStatus() {
      try {
        this.isLoading = true;
        await UserService.checkSession();
        this.sessionChecked = true;
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        this.isLoading = false;
      }
    },
    toggleAdminMenu() {
      this.showAdminMenu = !this.showAdminMenu;
    },
    goToHome() {
      this.$router.push('/companyfinding');
    },
    hideAdminMenu() {
      this.showAdminMenu = false;
    },
    toggleMenu() {
      const isOpen = document.querySelector('.navbar-collapse').classList.contains('show');
      if (isOpen) {
        document.body.classList.remove('menu-open');
      } else {
        document.body.classList.add('menu-open');
      }
    },
    goToJobsFinder() {
      this.$router.push('/companyfinding');
    },
    goToProfile() {
      if (!this.isLoggedIn) {
        emitter.emit('show-notification', {
          message: 'กรุณาเข้าสู่ระบบก่อนเข้าใช้งาน',
          type: 'warning',
          duration: 3000
        });
        this.$router.push('/user-login');
        return;
      }
      this.$router.push('/profilepage');
    },
    goToHistory() {
      if (!this.isLoggedIn) {
        emitter.emit('show-notification', {
          message: 'กรุณาเข้าสู่ระบบก่อนเข้าใช้งาน',
          type: 'warning',
          duration: 3000
        });
        this.$router.push('/user-login');
        return;
      }
      this.$router.push('/historyandstatus');
    },
    goToLogin() {
      this.$router.push('/user-login');
    },
    async logout() {
      try {
        await UserService.logout();
        // Clear local state
        this.userRole = null;
        this.isLoading = true;
        // Redirect and reload
        await this.$router.push('/user-login');
        setTimeout(() => {
          window.location.href = '/user-login';
        }, 100);
      } catch (error) {
        console.error('Logout error:', error);
      }
    },
    goToAdminDashboard() {
      this.$router.push('/admin/dashboard');
    },
    manageUsers() {
      this.$router.push('/admin/adminaccountmanagement');
    },
    manageStudents() {
      this.$router.push('/admin/students');
    },
    manageCompanies() {
      this.$router.push('/admin/admincompanymanagement');
    },
    goToContact() {
      this.$router.push('/contact');
    }
  }
};
</script>

<style scoped>

.navbar {
  color: var(--text-color);
  padding: var(--padding);
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 3000;
  box-shadow: 0 2px 8px rgba(7, 42, 64, 0.15);
  height: 70px;
  transition: all var(--transition-duration);
}

.navbar-collapse {
  position: static;
  background-color: var(--background-color);
  transition: all 0.3s ease;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-image {
  height: 40px;
  cursor: pointer;
}

.logo-text {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-color);
  margin-left: 10px;
}

/* Container styles */
.container-fluid {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

/* Desktop styles */
@media (min-width: 769px) {
  .navbar-collapse {
    display: flex !important;
    align-items: center;
    position: static;
    padding: 0;
    background: none;
    box-shadow: none;
  }

  .nav-links {
    display: flex;
    align-items: center;
    margin: 0;
  }

  .nav-item {
    margin: 0 5px;
  }
}

/* Mobile styles */
@media (max-width: 768px) {
  .navbar-collapse {
    position: absolute;
    width: 100%;
    top: 70px;
    left: 0;
    padding: var(--padding);
    z-index: 2999;
    background-color: var(--background-color);
    transform: translateY(-100%);
    opacity: 0;
    transition: all var(--transition-duration);
  }

  .navbar-collapse.show {
    transform: translateY(0);
    opacity: 1;
    box-shadow: 0 4px 12px rgba(7, 42, 64, 0.15);
  }

  body.menu-open {
    padding-top: 200px;
  }

  .logo-text {
    display: none;
  }

  .nav-links {
    flex-direction: column;
    gap: var(--gap);
  }

  .nav-links .nav-link {
    width: 100%;
    text-align: left;
    padding: 12px var(--padding);
  }

  .nav-links .nav-link:hover {
    transform: translateX(5px);
  }
}

.nav-links .nav-link {
  color: var(--text-color);
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-duration);
  padding: 8px 16px;
  border-radius: var(--border-radius);
  font-family: 'Kanit', sans-serif;
  position: relative;
  overflow: hidden;
}

.nav-links .nav-link:hover {
  color: white;
  background-color: var(--primary-color);
  transform: translateY(-1px);
}

.nav-links .nav-link:active {
  transform: translateY(0);
}

.admin-menu-card {
  position: absolute;
  right: 50px;
  top: 60px;
  background-color: var(--background-color);
  color: var(--text-color);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px rgba(7, 42, 64, 0.15);
  z-index: 10000;
  transition: all var(--transition-duration);
  transform-origin: top right;
  animation: menuAppear var(--transition-duration) ease;
}

.admin-menu-card ul {
  list-style: none;
  padding: 10px;
  margin: 0;
}

.admin-menu-card ul li {
  margin: 10px 0;
  border-bottom: 1px solid #ccc;
}

.admin-menu-card ul li:last-child {
  border-bottom: none;
}

.admin-menu-card button {
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-duration);
  width: 100%;
  text-align: left;
  padding: 10px var(--padding);
  border-radius: var(--border-radius);
}

.admin-menu-card button:hover {
  color: var(--primary-color);
  background-color: rgba(24, 183, 190, 0.1);
  transform: translateX(5px);
}

@keyframes menuAppear {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.navbar-toggler {
  border-color: var(--text-color);
}
.navbar-toggler-icon {
  background-image: url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba%287, 42, 64, 1%29' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E");
}
@media (max-width: 768px) {
  .logo-text {
    display: none;
  }
  

}

</style>
