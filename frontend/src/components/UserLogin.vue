<template>
  <div class="login-wrapper">
    <div class="login-container">
      <div class="login-box">
        <div class="login-header">
          <h1>เข้าสู่ระบบ</h1>
          <p class="welcome-text">ยินดีต้อนรับสู่ระบบ</p>
        </div>

        <FormKit type="form" @submit="handleLogin" class="login-form">
          <div class="form-group">
            <FormKit
              type="text"
              name="username"
              label="รหัสประจำตัวนักศึกษา"
              v-model="username"
              placeholder="กรอกรหัสประจำตัว"
              validation="required"
              validation-visibility="blur"
              :classes="{
                input: 'custom-input',
                label: 'custom-label'
              }"
            />
          </div>

          <div class="form-group">
            <FormKit
              type="password"
              name="password"
              label="รหัสผ่าน"
              v-model="password"
              placeholder="กรอกรหัสผ่าน"
              validation="required"
              validation-visibility="blur"
              :classes="{
                input: 'custom-input',
                label: 'custom-label'
              }"
            />
          </div>

          <div class="policy-check">
            <label class="custom-checkbox">
              <input type="checkbox" v-model="rememberMe" />
              <span class="checkmark"></span>
              <span class="checkbox-text">
                จดจำการเข้าสู่ระบบ
              </span>
            </label>
          </div>

          <div class="policy-check">
            <label class="custom-checkbox">
              <input type="checkbox" v-model="acceptedPolicy" />
              <span class="checkmark"></span>
              <span class="checkbox-text">
                ฉันยอมรับ <a href="/privacy-policy" target="_blank" class="policy-link">นโยบายความเป็นส่วนตัว</a>
              </span>
            </label>
          </div>

          <template #submit>
            <button type="submit" class="login-button" :disabled="isCooldownActive">
              <font-awesome-icon :icon="['fas', 'right-to-bracket']" /> เข้าสู่ระบบ
            </button>
          </template>

          <div class="message-container">
            <p v-if="errorMessageLogin" class="error-message">
              <font-awesome-icon :icon="['fas', 'exclamation-circle']" /> {{ errorMessageLogin }}
            </p>
            <p v-if="isCooldownActive" class="cooldown-message">
              <font-awesome-icon :icon="['fas', 'clock']" /> กรุณารอ {{ cooldownTime }} วินาที ก่อนเข้าสู่ระบบอีกครั้ง
            </p>
          </div>
        </FormKit>

        <button
          type="button"
          class="text-link mt-3"
          @click="$router.push('/contact')"
        >
          ลืมรหัสผ่าน คลิกเพื่อกรุณาติดต่อเจ้าหน้าที่
        </button>
         
      </div>
    </div>

    <!-- Password Change Modal -->
    <div v-if="showChangePasswordModal" class="modal fade show" style="display: block;" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ changePasswordMessage || 'เปลี่ยนรหัสผ่าน' }}</h5>
            <button type="button" class="close" @click="showChangePasswordModal = false" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <FormKit type="form" @submit="handleChangePassword">
              <FormKit
                type="text"
                name="confirm-username"
                label="ยืนยันรหัสประจำตัวนักศึกษา"
                v-model="username"
                placeholder="กรอกรหัสประจำตัว"
                validation="required"
                validation-visibility="blur"
              />
              <FormKit
                type="password"
                name="new-password"
                label="รหัสผ่านใหม่"
                v-model="newPassword"
                placeholder="กรอกรหัสผ่านใหม่"
                validation="required"
                validation-visibility="blur"
              />
              <FormKit
                type="password"
                name="confirm-new-password"
                label="ยืนยันรหัสผ่านใหม่"
                v-model="confirmNewPassword"
                placeholder="ยืนยันรหัสผ่านใหม่"
                validation="required|same:new-password"
                validation-visibility="blur"
                :validation-messages="{same: 'Passwords do not match' }"
              />
              <p v-if="errorMessageChangePassword" class="text-danger mt-2">{{ errorMessageChangePassword }}</p>
              <template #submit>
                <button type="submit" class="btn btn-amber btn-block mt-3">
                  <font-awesome-icon :icon="['fas', 'right-to-bracket']" /> อัปเดตรหัสผ่าน
                </button>
              </template>
            </FormKit>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import UserService from '../UserService'; // Import UserService
import { useRouter } from 'vue-router';
import { emitter } from '../router/authGuard';

const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const acceptedPolicy = ref(false); // Add this line
const errorMessageLogin = ref(''); // สำหรับฟอร์มเข้าสู่ระบบ
const errorMessageChangePassword = ref(''); // สำหรับฟอร์มเปลี่ยนรหัสผ่าน
const router = useRouter();

const showChangePasswordModal = ref(false);
const changePasswordMessage = ref('');
// const confirmUsername = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');

const failedAttempts = ref(0); // Counter for failed login attempts
const maxAttempts = 3; // Maximum allowed attempts
const cooldownTime = ref(0); // Cooldown time in seconds
const cooldownDuration = 30; // Cooldown duration in seconds
const isCooldownActive = ref(false);

onMounted(() => {
  const storedCooldownStart = localStorage.getItem('cooldownStart');
  const storedCooldownDuration = localStorage.getItem('cooldownDuration');

  if (storedCooldownStart && storedCooldownDuration) {
    const elapsed = Math.floor((Date.now() - parseInt(storedCooldownStart)) / 1000);
    const remaining = parseInt(storedCooldownDuration) - elapsed;
    if (remaining > 0) {
      cooldownTime.value = remaining;
      isCooldownActive.value = true;
    } else {
      localStorage.removeItem('cooldownStart');
      localStorage.removeItem('cooldownDuration');
    }
  }
});

watch(cooldownTime, (newValue) => {
  if (newValue > 0) {
    setTimeout(() => {
      cooldownTime.value -= 1;
    }, 1000);
  } else {
    isCooldownActive.value = false;
  }
});

    async function handleLogin() {
      if (!acceptedPolicy.value) {
        errorMessageLogin.value = 'คุณต้องยอมรับนโยบายความเป็นส่วนตัวก่อนเข้าสู่ระบบ';
        return;
      }

      if (isCooldownActive.value) {
        errorMessageLogin.value = 'กรุณารอสักครู่ก่อนลองใหม่อีกครั้ง';
        return;
      }

      if (failedAttempts.value >= maxAttempts) {
        errorMessageLogin.value = 'คุณพยายามเข้าสู่ระบบไม่สำเร็จหลายครั้ง กรุณาติดต่อแอดมิน';
        showChangePasswordModal.value = true;
        return;
      }

      try {
        const response = await UserService.login(username.value, password.value, rememberMe.value);
        if (response.success) {
          errorMessageLogin.value = '';
          failedAttempts.value = 0; // Reset counter on successful login

          // Wait a bit for the session to be properly set
          await new Promise(resolve => setTimeout(resolve, 100));

        if (response.forcePasswordChange) {
          showChangePasswordModal.value = true;
          // Set message based on whether it's default or temporary password
          if (password.value === '111111') {
            changePasswordMessage.value = 'กรุณาเปลี่ยนรหัสผ่านเริ่มต้นของคุณ';
          } else {
            changePasswordMessage.value = 'กรุณาเปลี่ยนรหัสผ่านชั่วคราวของคุณ';
          }
        } else {
          // Redirect based on role
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
      } else {
        failedAttempts.value += 1;
        errorMessageLogin.value = response.message || 'Invalid credentials';
        if (failedAttempts.value >= maxAttempts) {
          startCooldown();
        }
      }
    } catch (error) {
      failedAttempts.value += 1;
      errorMessageLogin.value = error.response?.data?.message || 'An error occurred';
      if (failedAttempts.value >= maxAttempts) {
        startCooldown();
      }
    }

}

function startCooldown() {
  isCooldownActive.value = true;
  cooldownTime.value = cooldownDuration;
  localStorage.setItem('cooldownStart', Date.now().toString());
  localStorage.setItem('cooldownDuration', cooldownDuration.toString());
}

async function handleChangePassword() {
  if (newPassword.value !== confirmNewPassword.value) {
    errorMessageChangePassword.value = 'รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบและลองใหม่อีกครั้ง';
    return;
  }

  try {
    const response = await UserService.changePassword(username.value, newPassword.value);
    if (response.success) {
      showChangePasswordModal.value = false;
      errorMessageChangePassword.value = '';
      // Show success notification
      emitter.emit('show-notification', {
        message: 'อัปเดตรหัสผ่านเรียบร้อยแล้ว',
        type: 'success',
        duration: 3000
      });
      // Disable further password changes
      showChangePasswordModal.value = false;
    } else {
      errorMessageChangePassword.value = response.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง';
    }
  } catch (error) {
    errorMessageChangePassword.value = error.response?.data?.message || 'พบข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
  }
}

</script>

<style scoped>
.login-wrapper {
  min-height: 70vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--background-color);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 480px;
}

.login-box {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: 0 8px 24px rgba(7, 42, 64, 0.12);
  padding: 2.5rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  color: var(--primary-color);
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
}

.welcome-text {
  color: var(--text-color);
  opacity: 0.8;
  font-size: 1.1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.custom-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e1e1;
  border-radius: var(--border-radius);
  font-size: 1rem;
  transition: all var(--transition-duration);
}

.custom-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(24, 183, 190, 0.15);
  outline: none;
}

.custom-label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-color);
  font-weight: 500;
}

.policy-check {
  margin: 1.5rem 0;
}

.custom-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.custom-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  height: 20px;
  width: 20px;
  background-color: #fff;
  border: 2px solid #e1e1e1;
  border-radius: 4px;
  margin-right: 10px;
  position: relative;
  transition: all var(--transition-duration);
}

.custom-checkbox input:checked ~ .checkmark {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.custom-checkbox input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-text {
  font-size: 0.95rem;
  color: var(--text-color);
}

.policy-link {
  color: var(--link-color);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--transition-duration);
}

.policy-link:hover {
  color: var(--link-hover-color);
  text-decoration: underline;
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-duration);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-button:hover:not(:disabled) {
  background-color: var(--highlight-info-color);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 183, 190, 0.2);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.message-container {
  margin-top: 1rem;
}

.error-message {
  color: var(--error-color);
  background-color: rgba(214, 64, 69, 0.1);
  padding: 12px;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
}

.cooldown-message {
  color: var(--warning-color);
  background-color: rgba(204, 139, 53, 0.1);
  padding: 12px;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
}

/* Modal Styles */
.modal[data-v-3a5d5944] {
  position: fixed;
  z-index: 1000;
  top: 60px; /* Add space for navbar */
  left: 0;
  width: 100%;
  height: calc(100vh - 60px); /* Subtract navbar height */
  background-color: rgba(7, 42, 64, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: var(--border-radius);
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 12px 32px rgba(7, 42, 64, 0.15);
  position: relative;
  margin: 2rem auto;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h5 {
  color: var(--primary-color);
  font-size: 1.5rem;
  margin: 0;
}

.close {
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: color var(--transition-duration);
}

.close:hover {
  color: var(--error-color);
}

.text-link {
  background: none;
  border: none;
  color: var(--text-color);
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  font-size: 0.95rem;
  opacity: 0.8;
  transition: opacity var(--transition-duration);
}

.text-link:hover {
  opacity: 1;
}

/* Responsive Design */
@media (max-width: 480px) {
  .login-box {
    padding: 1.5rem;
  }

  .login-header h1 {
    font-size: 1.8rem;
  }

  .welcome-text {
    font-size: 1rem;
  }
}
</style>
