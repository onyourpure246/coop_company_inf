<template>
  <div class="container">
    <div class="header">
      <h1>ข้อมูลบัญชีผู้ใช้</h1>
    </div>
    <div class="user-actions">
      <div class="action-section">
        <button class="btn btn-success" @click="openCreateUserModal">
          <font-awesome-icon :icon="['fas', 'plus']" /> เพิ่มผู้ใช้งานใหม่
        </button>
      </div>
      <div class="import-section">
        <div class="input-group">
          <input type="file" class="form-control" @change="storeFile" accept=".xlsx, .xls" />
          <button class="btn btn-primary" @click="processFile" :disabled="!selectedFile">
            <font-awesome-icon :icon="['fas', 'file-import']" /> นำเข้าข้อมูล
          </button>
        </div>
        <small class="text-muted">รองรับไฟล์ Excel (.xlsx, .xls)</small>
      </div>
    </div>
    <table class="table table-striped">
      <thead class="thead-dark">
        <tr>
          <th class="text-center" style="width: 80px;">ID</th>
          <th>ชื่อผู้ใช้</th>
          <th>บทบาท</th>
          <th>วันที่สร้าง</th>
          <th>อัพเดทล่าสุด</th>
          <th class="text-center" style="width: 280px;">จัดการ</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.user_id">
          <td class="text-center">{{ user.user_id }}</td>
          <td>{{ user.username }}</td>
          <td>
            <span :class="getRoleBadgeClass(user.role)">
              {{ getRoleDisplay(user.role) }}
            </span>
          </td>
          <td>{{ formatDateTime(user.created_at) }}</td>
          <td>{{ formatDateTime(user.updated_at) }}</td>
          <td class="text-center">
            <div class="btn-group">
              <button class="btn btn-info btn-sm" @click="openEditUserModal(user)" title="แก้ไข">
                <font-awesome-icon :icon="['fas', 'edit']" /> แก้ไข
              </button>
              <button class="btn btn-warning btn-sm" @click="resetPassword(user)" title="รีเซ็ตรหัสผ่าน">
                <font-awesome-icon :icon="['fas', 'key']" /> รีเซ็ต
              </button>
              <button class="btn btn-danger btn-sm" @click="confirmDelete(user.user_id)" title="ลบ">
                <font-awesome-icon :icon="['fas', 'trash']" /> ลบ
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="showCreateUserModal || showEditUserModal" class="modal" @click.self="closeModal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <h2>{{ showEditUserModal ? 'แก้ไขข้อมูลผู้ใช้' : 'เพิ่มผู้ใช้ใหม่' }}</h2>
        <FormKit 
          type="form" 
          @submit="showEditUserModal ? updateUser() : createUser()"
          :actions="false">
          <FormKit
            type="text"
            name="username"
            label="ชื่อผู้ใช้"
            v-model="currentUser.username"
            validation="required" />
          <template v-if="!showEditUserModal">
            <FormKit
              type="password"
              name="password"
              label="รหัสผ่าน"
              v-model="currentUser.password"
              validation="required" />
            <FormKit
              type="select"
              name="role"
              label="บทบาท"
              v-model="currentUser.role" :options="[
                { value: 'student', label: 'นักศึกษา' },
                { value: 'officer', label: 'เจ้าหน้าที่' },
                { value: 'teacher', label: 'อาจารย์' },
                { value: 'admin', label: 'ผู้ดูแลระบบ' }
              ]"
              validation="required" />
          </template>
          <template v-else>
            <div class="form-info">
              <label>บทบาท</label>
              <div class="role-display">
                <span :class="getRoleBadgeClass(currentUser.role)">
                  {{ getRoleDisplay(currentUser.role) }}
                </span>
              </div>
            </div>
          </template>
          <button type="submit" class="btn btn-success">
            <font-awesome-icon :icon="['fas', 'save']" />
            {{ showEditUserModal ? 'บันทึกการแก้ไข' : 'สร้างผู้ใช้' }}
          </button>
        </FormKit>
      </div>
    </div>

    <!-- Reset Password Result Modal -->
    <div v-if="showResetPasswordModal" class="modal" @click.self="closeModal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <div v-if="resetPasswordResult">
          <div v-if="resetPasswordResult.success" class="success-message">
            <h3>รหัสผ่านถูกรีเซ็ตแล้ว</h3>
            <p>รหัสผ่านชั่วคราวสำหรับผู้ใช้ <strong>{{ resetPasswordResult.username }}</strong> คือ:</p>
            <div class="temp-password">{{ resetPasswordResult.temporaryPassword }}</div>
            <p class="warning">กรุณาแจ้งรหัสผ่านชั่วคราวให้กับผู้ใช้ และแนะนำให้เปลี่ยนรหัสผ่านทันทีที่เข้าสู่ระบบ</p>
          </div>
          <div v-else class="error-message">
            <h3>เกิดข้อผิดพลาด</h3>
            <p>{{ resetPasswordResult.error }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import * as XLSX from 'xlsx';
import CryptoJS from 'crypto-js';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faPlus,
  faFileImport,
  faEdit,
  faKey,
  faTrash,
  faSave
} from '@fortawesome/free-solid-svg-icons';

library.add(faPlus, faFileImport, faEdit, faKey, faTrash, faSave);

// Function to hash password
const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString();
};

export default {
  components: {
    FontAwesomeIcon
  },
  data() {
    return {
      users: [],
      showCreateUserModal: false,
      showEditUserModal: false,
      currentUser: {
        user_id: null,
        username: '',
        password: '',
        role: 'officer',
      },
      selectedFile: null,
      showResetPasswordModal: false,
      resetPasswordResult: null,
      selectedUser: null,
    };
  },
  methods: {
    getRoleDisplay(role) {
      const roleMap = {
        'student': 'นักศึกษา',
        'officer': 'เจ้าหน้าที่',
        'teacher': 'อาจารย์',
        'admin': 'ผู้ดูแลระบบ'
      };
      return roleMap[role] || role;
    },
    getRoleBadgeClass(role) {
      const badgeClasses = {
        'student': 'badge bg-primary',
        'officer': 'badge bg-success',
        'teacher': 'badge bg-info',
        'admin': 'badge bg-danger'
      };
      return badgeClasses[role] || 'badge bg-secondary';
    },
    formatDateTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString('th-TH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    },
    openCreateUserModal() {
      this.currentUser = { user_id: null, username: '', password: '', role: 'officer' };
      this.showCreateUserModal = true;
    },
    openEditUserModal(user) {
      // เก็บเฉพาะข้อมูลที่จำเป็น
      this.currentUser = {
        user_id: user.user_id,
        username: user.username,
        role: user.role
      };
      this.showEditUserModal = true;
    },
    closeModal() {
      this.showCreateUserModal = false;
      this.showEditUserModal = false;
      this.showResetPasswordModal = false;
      this.resetPasswordResult = null;
    },

    async resetPassword(user) {
      this.selectedUser = user;
      try {
        const response = await axios.post(`http://localhost:5000/api/users/${user.user_id}/reset-password`, {}, {
          withCredentials: true
        });

        if (response.data.success) {
          this.resetPasswordResult = {
            success: true,
            temporaryPassword: response.data.temporaryPassword,
            username: user.username
          };
          this.showResetPasswordModal = true;
        }
      } catch (error) {
        console.error('Error resetting password:', error);
        this.resetPasswordResult = {
          success: false,
          error: error.response?.data?.error || 'Error resetting password'
        };
        this.showResetPasswordModal = true;
      }
    },
    async fetchUsers() {
      try {
        const response = await axios.get('http://localhost:5000/api/users', {
          withCredentials: true // This enables sending cookies with the request
        });
        this.users = response.data;
      } catch (error) {
        console.error('Error fetching users:', error);
        if (error.response && error.response.status === 401) {
          // Handle unauthorized access
          this.$router.push('/login');
        }
      }
    },
    async createUser() {
      try {
        // Always hash password for new users
        const userData = {
          ...this.currentUser,
          password: hashPassword(this.currentUser.password)
        };
        await axios.post('http://localhost:5000/api/users', userData, {
          withCredentials: true
        });
        this.fetchUsers();
        this.closeModal();
      } catch (error) {
        console.error('Error creating user:', error);
        if (error.response && error.response.status === 401) {
          this.$router.push('/login');
        }
      }
    },
    async updateUser() {
      try {
        // ส่งเฉพาะข้อมูลที่อนุญาตให้แก้ไข
        const userData = {
          username: this.currentUser.username
        };
        await axios.put(`http://localhost:5000/api/users/${this.currentUser.user_id}`, userData, {
          withCredentials: true
        });
        this.fetchUsers();
        this.closeModal();
      } catch (error) {
        console.error('Error updating user:', error);
        if (error.response && error.response.status === 401) {
          this.$router.push('/login');
        }
      }
    },
    async deleteUser(userId) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${userId}`, {
          withCredentials: true
        });
        this.fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        if (error.response && error.response.status === 401) {
          this.$router.push('/login');
        }
      }
    },
    confirmDelete(userId) {
      if (confirm('Are you sure you want to delete this user?')) {
        this.deleteUser(userId);
      }
    },
    storeFile(event) {
      this.selectedFile = event.target.files[0];
    },
    processFile() {
      if (!this.selectedFile) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const headers = jsonData[0];
        const usersData = jsonData.slice(1).map(row => {
          let user = {};
          headers.forEach((header, index) => {
            user[header] = row[index];
          });
          return user;
        });

        if (confirm('Are you sure you want to import these users?')) {
          this.importUsers(usersData);
        }
      };
      reader.readAsArrayBuffer(this.selectedFile);
    },
    async importUsers(usersData) {
      try {
        const token = localStorage.getItem('authToken');
        // Hash passwords for all imported users
        const hashedUsersData = usersData.map(user => ({
          ...user,
          password: hashPassword(user.password)
        }));
        await axios.post('http://localhost:5000/api/users/import', { users: hashedUsersData }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.fetchUsers();
        alert('Users imported successfully!');
      } catch (error) {
        console.error('Error importing users:', error);
      }
    }
  },
  
  mounted() {
    this.fetchUsers();
  },
};
</script>

<style scoped>
.container {
  background-color: var(--background-color);
  padding: var(--padding);
  border-radius: var(--border-radius);
}

.header {
  margin-bottom: 2rem;
}

.header h1 {
  color: var(--accent-color);
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.user-actions {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  background-color: white;
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 4px rgba(7, 42, 64, 0.1);
}

.action-section {
  flex: 1;
}

.import-section {
  flex: 2;
}

.input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.form-control {
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: var(--border-radius);
  flex: 1;
}

.text-muted {
  color: #6c757d;
  font-size: 0.875rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-weight: 500;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn i {
  font-size: 1rem;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(7, 42, 64, 0.1);
  margin-bottom: 2rem;
}

.thead-dark {
  background-color: var(--accent-color);
  color: white;
}

.thead-dark th {
  padding: 1rem;
  font-weight: 500;
  border-bottom: 2px solid var(--secondary-color);
  white-space: nowrap;
}

tbody tr {
  transition: background-color var(--transition-duration);
}

tbody tr:hover {
  background-color: rgba(24, 183, 190, 0.05);
}

tbody td {
  padding: 1rem;
  border-bottom: 1px solid rgba(7, 42, 64, 0.1);
  vertical-align: middle;
}

.badge {
  padding: 0.5em 0.75em;
  font-size: 0.85em;
  font-weight: 500;
  border-radius: 30px;
}

.btn-group {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn-group {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn-group .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  min-width: 90px;
}

.btn-group .btn .svg-inline--fa {
  font-size: 1rem;
  margin-right: 0.25rem;
  vertical-align: -0.125em;
}

.action-btn {
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  font-size: 0.9rem;
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Edit button - ใช้สีฟ้า */
.action-btn {
  background-color: var(--primary-color);
}

.action-btn:hover {
  background-color: var(--highlight-primary-color);
  transform: translateY(-1px);
}

/* Delete button - ใช้สีแดง */
.action-btn-delete {
  background-color: var(--error-color);
}

.action-btn-delete:hover {
  background-color: var(--highlight-error-color);
  transform: translateY(-1px);
}

.action-btn-reset {
  background-color: var(--warning-color);
}

.action-btn-reset:hover {
  background-color: var(--highlight-warning-color);
  transform: translateY(-1px);
}

.success-message {
  text-align: center;
  padding: 1rem;
  background-color: rgba(40, 167, 69, 0.1);
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
}

.temp-password {
  font-size: 1.5rem;
  font-weight: bold;
  padding: 1rem;
  margin: 1rem 0;
  background-color: #f8f9fa;
  border-radius: var(--border-radius);
  border: 2px dashed var(--primary-color);
}

.warning {
  color: var(--warning-color);
  font-weight: 500;
  margin-top: 1rem;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(7, 42, 64, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: var(--border-radius);
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 4px 6px rgba(7, 42, 64, 0.1);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.modal-header h3 {
  color: var(--accent-color);
  font-size: 1.5rem;
  margin: 0;
}

.close {
  font-size: 1.5rem;
  color: var(--text-color);
  cursor: pointer;
  transition: color var(--transition-duration);
}

.close:hover {
  color: var(--error-color);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(7, 42, 64, 0.1);
}

.error-message {
  background-color: var(--error-color);
  color: white;
  padding: 1rem;
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
}

/* FormKit Customization */
:deep(.formkit-outer) {
  margin-bottom: 1.5rem;
}

:deep(.formkit-label) {
  color: var(--text-color);
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

:deep(.formkit-input) {
  border: 2px solid #e1e1e1;
  border-radius: var(--border-radius);
  padding: 0.75rem 1rem;
  width: 100%;
  font-size: 1rem;
  transition: all var(--transition-duration);
  background-color: #f8f9fa;
}

:deep(.formkit-input:focus) {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(24, 183, 190, 0.15);
  background-color: white;
}

:deep(.formkit-message) {
  color: var(--error-color);
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

:deep(.formkit-message::before) {
  content: "⚠️";
}

/* Form Info Display */
.form-info {
  margin-bottom: 1.5rem;
}

.form-info label {
  display: block;
  color: var(--text-color);
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.role-display {
  padding: 0.75rem 1rem;
  background-color: #f8f9fa;
  border: 2px solid #e1e1e1;
  border-radius: var(--border-radius);
}

/* Modal Customization */
.modal-content {
  max-width: 450px;
}

.modal-content h2 {
  color: var(--primary-color);
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.modal .btn-success {
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem;
  font-size: 1rem;
}

:deep(.formkit-select) {
  background-color: #f8f9fa;
  border: 2px solid #e1e1e1;
  border-radius: var(--border-radius);
  padding: 0.75rem 1rem;
  width: 100%;
  font-size: 1rem;
  transition: all var(--transition-duration);
  cursor: pointer;
}

:deep(.formkit-select:focus) {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(24, 183, 190, 0.15);
  background-color: white;
}

/* Button Styles */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background-color: var(--success-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--highlight-success-color);
  transform: translateY(-1px);
}


.btn-secondary {
  background-color: var(--secondary-color);
  color: white;
}

.btn-secondary:hover {
  background-color: var(--highlight-secondary-color);
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .user-actions {
    flex-direction: column;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    flex-direction: column;
  }

  .table {
    display: block;
    overflow-x: auto;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .header h1 {
    font-size: 1.5rem;
  }

  .btn, .action-btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .table td, .table th {
    padding: 0.75rem;
    font-size: 0.875rem;
  }
}
</style>
