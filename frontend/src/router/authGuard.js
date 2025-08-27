import UserService from '../UserService';
import mitt from 'mitt';

// Create event emitter
export const emitter = mitt();

export function requireAuth(to, from, next) {
  if (!UserService.isAuthenticated()) {
    // Emit notification event
    emitter.emit('show-notification', {
      message: 'กรุณาเข้าสู่ระบบก่อนเข้าใช้งาน',
      type: 'warning',
      duration: 3000
    });

    // Redirect to login page with return URL
    next({
      path: '/user-login',
      query: { redirect: to.fullPath }
    });
  } else {
    // Check role-based access if needed
    const requiredRole = to.meta.requiredRole;
    if (requiredRole && UserService.getRole() !== requiredRole) {
      // Redirect to appropriate dashboard based on role
      switch(UserService.getRole()) {
        case 'student':
          next('/companyfinding');
          break;
        case 'teacher':
          next('/teacher-dashboard');
          break;
        case 'admin':
          next('/admin-dashboard');
          break;
        default:
          next('/login');
      }
    } else {
      next();
    }
  }
}

export function redirectIfAuthenticated(to, from, next) {
  if (UserService.isAuthenticated()) {
    // Redirect to appropriate dashboard based on role
    switch(UserService.getRole()) {
      case 'student':
        next('/companyfinding');
        break;
      case 'teacher':
        next('/teacher-dashboard');
        break;
      case 'admin':
        next('/admin-dashboard');
        break;
      default:
        next('/companyfinding');
    }
  } else {
    next();
  }
}