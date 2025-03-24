import { createWebHistory, createRouter } from "vue-router";
import UserService from "../UserService";
import { requireAuth, redirectIfAuthenticated } from './authGuard';
import UserLogin from "@/components/UserLogin.vue";
import CompanyInfo from "@/components/CompanyInfo.vue";
import TestingPage from "@/components/TestingPage.vue";
import Application from "@/components/Application.vue";
import ProfilePage from "@/components/ProfilePage.vue";
import HIstoryAndStatus from "@/components/HIstoryAndStatus.vue";
import ApplicationTable from "@/components/ApplicationTable.vue";
import AdminStudent from "@/components/AdminStudent.vue";
import AdminAccountManagement from "@/components/AdminAccountManagement.vue";
import AdminCompanyManagement from "@/components/AdminCompanyManagement.vue";
import Dashboard from '@/components/pages/DashboardPage.vue'
import PrivacyPolicy from '@/components/PrivacyPolicy.vue'
import ContactPage from "@/components/pages/ContactPage.vue";
const routes = [
  {
    path: "/",
    name: "Home",
    component: CompanyInfo,
    meta: { public: true,
             title: 'ค้นหาสถานประกอบการ - งานสหกิจศึกษาสำหรับประชาสัมพันธ์สถานประกอบการ'
     }
  },
  {
    path: "/user-login",
    name: "UserLogin",
    component: UserLogin,
    meta: { showOnlyLogo: true, public: true, title: 'เข้าสู่ระบบ - งานสหกิจศึกษาสำหรับประชาสัมพันธ์สถานประกอบการ' },
    beforeEnter: redirectIfAuthenticated
  },
  {
    path: "/companyfinding",
    name: "Company",
    component: CompanyInfo,
    meta: { public: true, title: 'ค้นหาสถานประกอบการ - งานสหกิจศึกษาสำหรับประชาสัมพันธ์สถานประกอบการ' }
  },
  {
    path: "/testing-page",
    name: "Testing Page",
    component: TestingPage,
    beforeEnter: requireAuth
  },
  {
    path: "/applicationpage",
    name: "Application Page",
    component: Application,
    beforeEnter: requireAuth,
    meta: { requiredRole: 'student', title: 'ยื่นใบสมัครออกฝึกสหกิจ - งานสหกิจศึกษาสำหรับประชาสัมพันธ์สถานประกอบการ' }
  },
  {
    path: '/profilepage',
    name: 'Profile Page',
    component: ProfilePage,
    beforeEnter: requireAuth,
    meta: { title: 'ประวัตินักศึกษา - งานสหกิจศึกษาสำหรับประชาสัมพันธ์สถานประกอบการ' }
  },

  {
    path: '/historyandstatus',
    name: 'HIstoryAndStatus',
    component: HIstoryAndStatus,
    beforeEnter: requireAuth,
    meta: { requiredRole: 'student', title: 'ประวัติและสถานะการสมัคร - งานสหกิจศึกษาสำหรับประชาสัมพันธ์สถานประกอบการ' }
  },
  {
    path: '/applicationdetails',
    name: 'ApplicationDetails',
    component: ApplicationTable,
    beforeEnter: requireAuth,
    meta: { requiredRole: 'officer', title: 'รายละเอียดการสมัคร - งานสหกิจศึกษาสำหรับประชาสัมพันธ์สถานประกอบการ' }
  },
  {
    path: '/admin/students',
    name: 'AdminStudent',
    component: AdminStudent,
    beforeEnter: requireAuth,
    meta: { requiredRole: 'officer', title: 'จัดการข้อมูลนักศึกษา - งานสหกิจศึกษาสำหรับประชาสัมพันธ์สถานประกอบการ' }
  },
  {
    path: '/admin/adminaccountmanagement',
    name: 'AdminAccountManagement',
    component: AdminAccountManagement,
    beforeEnter: requireAuth,
    meta: { requiredRole: 'officer', title: 'จัดการบัญชีผู้ใช้ - งานสหกิจศึกษาสำหรับประชาสัมพันธ์สถานประกอบการ' }
  },
  {
    path: '/admin/admincompanymanagement',
    name: 'AdminCompanyManagement',
    component: AdminCompanyManagement,
    beforeEnter: requireAuth,
    meta: { requiredRole: 'officer', title: 'จัดการข้อมูลสถานประกอบการ - งานสหกิจศึกษาสำหรับประชาสัมพันธ์สถานประกอบการ' }
  },
  {
    path: '/admin/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    beforeEnter: requireAuth,
    meta: { requiredRole: 'officer', title: 'แดชบอร์ด - งานสหกิจศึกษาสำหรับประชาสัมพันธ์สถานประกอบการ' }
  },
  {
    path: '/privacy-policy',
    name: 'PrivacyPolicy',
    component: PrivacyPolicy,
    meta: { hideNavbar: true, public: true, title: 'นโยบายความเป็นส่วนตัว - งานสหกิจศึกษาสำหรับประชาสัมพันธ์สถานประกอบการ' }
  },
  {
    path: '/contact',
    name: 'Contact Us',
    component: ContactPage,
    meta: { public: true, title: 'ติดต่อเรา - งานสหกิจศึกษาสำหรับประชาสัมพันธ์สถานประกอบการ' }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  // Set page title
  document.title = to.meta.title || 'งานสหกิจศึกษาสำหรับประชาสัมพันธ์สถานประกอบการ สาขาเทคโนโลยีสารสนเทศและการสื่อสารดิจิทัล';

  // Check if route requires auth
  if (!to.meta.public) {
    const isAuthenticated = await UserService.checkSession();
    if (!isAuthenticated) {
      next('/user-login');
      return;
    }
  }
  next();
});

export default router;
