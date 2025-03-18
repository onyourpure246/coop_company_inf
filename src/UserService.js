import axios from 'axios';
import CryptoJS from 'crypto-js';

const API_URL = 'http://localhost:5000';

// Configure axios defaults
axios.defaults.withCredentials = true;

// Function to hash password
const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString();
};

const userState = {
  userId: null,
  username: null,
  role: null,
  isAuthenticated: false
};

export default {
  getCompany() {
    return axios.get(`${API_URL}/company`);
  },

  async login(username, password, rememberMe = false) {
    try {
      // Send unhashed password first for backward compatibility
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password,
        rememberMe
      });
      if (response.data.success) {
        // Update user state
        userState.userId = response.data.user_id;
        userState.username = response.data.username;
        userState.role = response.data.role;
        userState.isAuthenticated = true;
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async checkSession() {
    try {
      const response = await axios.get(`${API_URL}/check-session`);
      if (response.data.authenticated || response.data.success) {
        // Update user state
        userState.userId = response.data.user_id;
        userState.username = response.data.username;
        userState.role = response.data.role;
        userState.isAuthenticated = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Session check error:', error.response?.data || error.message);
      userState.isAuthenticated = false;
      return false;
    }
  },

  async getUserDetails() {
    try {
      const response = await axios.get(`${API_URL}/user/details`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  },

  async submitApplication(applicationData) {
    try {
      const response = await axios.post(`${API_URL}/applications`, applicationData);
      return response.data;
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  },

  async updateStudentDetails(studentData) {
    try {
      const response = await axios.put(`${API_URL}/students/${studentData.studentId}`, studentData);
      return response.data;
    } catch (error) {
      console.error('Error updating student details:', error);
      throw error;
    }
  },

  async changePassword(studentId, newPassword) {
    try {
      // Hash the new password before sending
      const hashedPassword = hashPassword(newPassword);
      const response = await axios.put(`${API_URL}/students/${studentId}/change-password`, {
        newPassword: hashedPassword
      });
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  async logout() {
    try {
      await axios.post(`${API_URL}/logout`);
      // Clear user state
      userState.userId = null;
      userState.username = null;
      userState.role = null;
      userState.isAuthenticated = false;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Helper methods to access user state
  getUserState() {
    return { ...userState };
  },

  isAuthenticated() {
    return userState.isAuthenticated;
  },

  getUserId() {
    return userState.userId;
  },

  getUsername() {
    return userState.username;
  },

  getRole() {
    return userState.role;
  }
}
;
