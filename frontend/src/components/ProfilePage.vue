<template>
  <div class="profile-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <font-awesome-icon :icon="['fas', 'circle-notch']" spin />
      </div>
      <p>กำลังโหลดข้อมูล...</p>
    </div>

    <!-- View Mode -->
    <div v-else-if="!isEditing && profile" class="profile-view">
      <!-- Top Banner with Avatar and Basic Info -->
      <div class="profile-hero">
        <div class="hero-content">
          <div class="avatar-container">
            <div class="avatar">
              <font-awesome-icon :icon="['fas', 'user']" />
            </div>
            <button @click="isEditing = true" class="edit-profile-btn">
              <font-awesome-icon :icon="['fas', 'pen']" />
              <span>แก้ไขโปรไฟล์</span>
            </button>
          </div>
          <div class="basic-info">
            <h1>{{ profile.first_name || 'N/A' }} {{ profile.last_name || 'N/A' }}</h1>
            <div class="student-badge">
              <font-awesome-icon :icon="['fas', 'id-card']" />
              <span>{{ profile.student_id || 'N/A' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Cards -->
      <div class="profile-content">
        <!-- Academic Information Card -->
        <div class="info-card">
          <div class="card-header">
            <font-awesome-icon :icon="['fas', 'graduation-cap']" />
            <h2>ข้อมูลการศึกษา</h2>
          </div>
          <div class="card-body">
            <div class="info-item">
              <label>คณะ</label>
              <p>{{ profile.faculty || 'N/A' }}</p>
            </div>
            <div class="info-item">
              <label>สาขา</label>
              <p>{{ profile.major || 'N/A' }}</p>
            </div>
            <div class="info-item highlight">
              <label>เกรดเฉลี่ย</label>
              <p class="gpa">{{ profile.GPA || 'N/A' }}</p>
            </div>
          </div>
        </div>

        <!-- Contact Information Card -->
        <div class="info-card">
          <div class="card-header">
            <font-awesome-icon :icon="['fas', 'address-book']" />
            <h2>ข้อมูลติดต่อ</h2>
          </div>
          <div class="card-body">
            <div class="info-item">
              <font-awesome-icon :icon="['fas', 'phone']" />
              <div class="contact-detail">
                <label>เบอร์โทรศัพท์</label>
                <p>{{ profile.phone || 'N/A' }}</p>
              </div>
            </div>
            <div class="info-item">
              <font-awesome-icon :icon="['fas', 'envelope']" />
              <div class="contact-detail">
                <label>อีเมล</label>
                <p>{{ profile.email || 'N/A' }}</p>
              </div>
            </div>
            <div class="info-item">
              <font-awesome-icon :icon="['fas', 'location-dot']" />
              <div class="contact-detail">
                <label>ที่อยู่</label>
                <p>{{ profile.address || 'N/A' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      <div v-else class="edit-profile-container">
        <div class="edit-header">
          <h2><font-awesome-icon :icon="['fas', 'user-edit']" /> แก้ไขโปรไฟล์</h2>
          <button type="button" @click="discardChanges" class="icon-button">
            <font-awesome-icon :icon="['fas', 'xmark']" />
          </button>
        </div>

        <FormKit
          type="form"
          @submit="updateProfile"
          :actions="false"
          class="edit-form">
          <div class="form-grid">
            <!-- Section 1: Personal Information -->
            <div class="section-box">
              <div class="section-header">
                <font-awesome-icon :icon="['fas', 'user']" />
                <h3>ข้อมูลส่วนตัว</h3>
              </div>

              <div class="form-group">
                <div class="input-with-icon">
                  <font-awesome-icon :icon="['fas', 'id-card']" />
                  <FormKit
                    type="text"
                    label="รหัสประจำตัว"
                    :disabled="true"
                    v-model="form.student_id"
                  />
                </div>

                <div class="name-container">
                  <div class="input-with-icon">
                    <font-awesome-icon :icon="['fas', 'user']" />
                    <FormKit
                      type="text"
                      label="ชื่อ"
                      placeholder="ชื่อ (ระบุคำนำหน้าชื่อ)"
                      v-model="form.first_name"
                    />
                  </div>
                  <div class="input-with-icon">
                    <font-awesome-icon :icon="['fas', 'user']" />
                    <FormKit
                      type="text"
                      label="นามสกุล"
                      v-model="form.last_name"
                    />
                  </div>
                </div>

                <div class="input-with-icon">
                  <font-awesome-icon :icon="['fas', 'location-dot']" />
                  <FormKit
                    type="text"
                    label="ที่อยู่"
                    validation="required|length:3"
                    validation-visibility="dirty"
                    placeholder="บ้านเลขที่ 1 ซอยปัญญาดี ..."
                    :validation-messages="{
                      required: 'กรุณาระบุที่อยู่',
                    }"
                    v-model="form.address"
                  />
                </div>

                <div class="contact-container">
                  <div class="input-with-icon">
                    <font-awesome-icon :icon="['fas', 'phone']" />
                    <FormKit
                      type="tel"
                      label="หมายเลขโทรศัพท์"
                      placeholder="กรอกหมายเลขโทรศัพท์ 10 หลัก"
                      validation="required|matches:/^[0-9]{10}$/"
                      :validation-messages="{
                        required: 'กรุณาระบุหมายเลขโทรศัพท์',
                        matches: 'กรุณาระบุหมายเลขโทรศัพท์ที่ถูกต้อง',
                      }"
                      validation-visibility="dirty"
                      v-model="form.phone"
                    />
                  </div>
                  <div class="input-with-icon">
                    <font-awesome-icon :icon="['fas', 'envelope']" />
                    <FormKit
                      type="email"
                      label="อีเมล์"
                      validation="required|email"
                      validation-visibility="dirty"
                      placeholder="andrew@example.com"
                      :validation-messages="{
                        required: 'กรุณากรอกอีเมล',
                        email: 'กรุณากรอกอีเมลที่ถูกต้อง',
                      }"
                      v-model="form.email"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 2: Academic Details -->
            <div class="section-box">
              <div class="section-header">
                <font-awesome-icon :icon="['fas', 'graduation-cap']" />
                <h3>ข้อมูลการศึกษา</h3>
              </div>

              <div class="form-group">
                <div class="input-with-icon">
                  <font-awesome-icon :icon="['fas', 'building-columns']" />
                  <FormKit
                    type="select"
                    label="คณะ"
                    v-model="form.faculty"
                    :options="facultyOptions"
                    placeholder="เลือกคณะ"
                    :validation="[['required']]"
                    validation-visibility="submit"
                    :validation-messages="{
                      required: 'กรุณาเลือกคณะ',
                    }"
                  />
                </div>

                <div class="input-with-icon">
                  <font-awesome-icon :icon="['fas', 'book']" />
                  <FormKit
                    type="select"
                    label="สาขา"
                    v-model="form.major"
                    :options="majorOptions"
                    placeholder="เลือกสาขา"
                    :validation="[['required']]"
                    validation-visibility="submit"
                    :validation-messages="{
                      required: 'กรุณาเลือกสาขา',
                    }"
                  />
                </div>

                <div class="input-with-icon">
                  <font-awesome-icon :icon="['fas', 'star']" />
                  <FormKit
                    type="number"
                    label="เกรดเฉลี่ยรวม (GPA)"
                    v-model="form.GPA"
                    step="0.01"
                    :validation="[['required'], ['min', 0], ['max', 4]]"
                    validation-visibility="submit"
                    :validation-messages="{
                      required: 'กรุณากรอกเกรดเฉลี่ย',
                      min: 'เกรดเฉลี่ยต้องไม่ต่ำกว่า 0',
                      max: 'เกรดเฉลี่ยต้องไม่เกิน 4',
                    }"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <div class="form-actions">
            <button type="submit" class="btn btn-amber">
              <font-awesome-icon :icon="['fas', 'floppy-disk']" /> บันทึกโปรไฟล์
            </button>
          </div>
        </FormKit>
      </div>
  </div>
</template>

<script>
import axios from "axios";
import { FormKit } from "@formkit/vue";
import UserService from "../UserService";
import { emitter } from '../router/authGuard';

export default {
  components:{
    FormKit
  },
  data() {
      return {
          profile: {
              student_id: '',
              first_name: '',
              last_name: '',
              faculty: '',
              major: '',
              GPA: '',
              resume: null,
              transcript: null,
              address: '',
              phone: '',
              email: ''
          },
          form: {},
          isEditing: false,
          loading: true,
          files: {
              resume: null,
              transcript: null,
          },
          facultyOptions: [
              "คณะวิทยาศาสตร์และเทคโนโลยี"
          ],
          majorOptions: [
              "เทคโนโลยีสารสนเทศและการสื่อสารดิจิทัล",
              "วิทยาการคอมพิวเตอร์",
              "คณิตศาสตร์ประยุกต์",
              "สถิติประยุกต์และวิทยาการวิเคราะห์ข้อมูล",
              "การวิเคราะห์และจัดการข้อมูลขนาดใหญ่",
              "เคมีประยุกต์",
              "ชีววิทยาประยุกต์",
              "ฟิสิกส์ประยุกต์",
              "วิทยาศาสตร์อาหารและการจัดการเทคโนโลยีอาหาร"
              // Add more majors as needed
          ],
      };
  },
  methods: {
      async fetchProfile() {
          try {
              if (!UserService.isAuthenticated()) {
                  throw new Error('No token found');
              }
              const response = await axios.get("http://localhost:5000/user/student");
              const data = response.data[0];
              this.profile = data;
              this.form = { ...data };
          } catch (error) {
              console.error('Error fetching profile:', error);
              this.$router.push('/login');
          } finally {
              this.loading = false;
          }
      },

      async updateProfile() {
          const formData = new FormData();
          for (const key in this.form) {
              formData.append(key, this.form[key]);
          }
          if (this.files.transcript) formData.append("transcript", this.files.transcript);
          try {
              await axios.post("http://localhost:5000/api/profile", formData);
              // อัพเดทข้อมูล profile ให้ตรงกับข้อมูลที่เพิ่งแก้ไข
              this.profile = { ...this.form };
              this.isEditing = false;
              emitter.emit('show-notification', {
                  message: 'อัพเดทโปรไฟล์สำเร็จ',
                  type: 'success',
                  duration: 3000
              });
              
          } catch (error) {
              console.error('Error updating profile:', error);
              emitter.emit('show-notification', {
                  message: 'เกิดข้อผิดพลาดในการอัพเดทโปรไฟล์ กรุณาลองใหม่อีกครั้ง',
                  type: 'error',
                  duration: 3000
              });
          }
      },

      onFileChange(field, event) {
          this.files[field] = event.target.files[0];
      },

      discardChanges() {
          this.isEditing = false;
          this.form = { ...this.profile }; // Reset form to current profile
      }
  },

  mounted() {
      this.fetchProfile();
  },
};
</script>

<style scoped>
/* Base Container */
.profile-container {
  max-width: 100%;
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1rem;
}

.loading-spinner {
  font-size: 3rem;
  color: var(--primary-color);
}

/* Profile View */
.profile-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Hero Section */
.profile-hero {
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  border-radius: 1rem;
  padding: 3rem 2rem;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.hero-content {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 3rem;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 150px;
  height: 150px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: var(--primary-color);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 4px solid rgba(255, 255, 255, 0.3);
}

.edit-profile-btn {
  background-color: rgba(255, 255, 255, 0.2);
  border: 2px solid white;
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.edit-profile-btn:hover {
  background-color: white;
  color: var(--primary-color);
  transform: translateY(-2px);
}

.basic-info {
  flex: 1;
}

.basic-info h1 {
  font-size: 2.5rem;
  margin: 0;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.student-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  margin-top: 1rem;
  font-size: 1.1rem;
}

/* Main Content */
.profile-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  padding: 0 1rem;
}

.info-card {
  background-color: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.card-header {
  background-color: var(--primary-color);
  color: white;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
}

.card-header svg {
  font-size: 1.8rem;
}

.card-body {
  padding: 1.5rem;
}

.info-item {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
  min-width: 100px;
}

.info-item p {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
  flex: 1;
}

.info-item.highlight {
  background-color: #f8f9fa;
}

.info-item.highlight .gpa {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--primary-color);
}

.contact-detail {
  flex: 1;
}

  /* Edit Profile Container */
  .edit-profile-container {
    min-height: calc(100vh - 4rem);
    background-color: #f8f9fa;
    padding: 2rem;
    position: relative;
  }

  .edit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    background: white;
    padding: 1rem 2rem;
    border-radius: 1rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }

  .edit-header h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--primary-color);
    margin: 0;
  }

  .icon-button {
    background-color: #f8f9fa;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #666;
  }

  .icon-button:hover {
    background-color: #e9ecef;
    color: var(--primary-color);
    transform: scale(1.1);
  }

  .edit-form {
    height: calc(100vh - 12rem);
    overflow-y: auto;
    padding-right: 1rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .section-box {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    height: fit-content;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: var(--primary-color);
    border-bottom: 2px solid var(--primary-color);
    padding-bottom: 1rem;
    margin-bottom: 2rem;
  }

  .section-header h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .input-with-icon {
    position: relative;
  }

  .input-with-icon .formkit-outer {
    margin-bottom: 0;
  }

  .input-with-icon > .fa-icon {
    position: absolute;
    left: 1rem;
    top: 2.5rem;
    color: #666;
    z-index: 1;
  }

  .input-with-icon .formkit-input {
    padding-left: 2.5rem;
  }

  .name-container,
  .contact-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  /* FormKit Custom Styles */
  :deep(.formkit-outer) {
    margin-bottom: 1.5rem;
  }

  :deep(.formkit-label) {
    font-weight: 500;
    color: #333;
    margin-bottom: 0.5rem;
  }

  :deep(.formkit-input) {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #ddd;
    border-radius: 0.5rem;
    transition: all 0.3s ease;
  }

  :deep(.formkit-input:focus) {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
    outline: none;
  }

  :deep(.formkit-message) {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }

  /* Form Actions */
  .form-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    padding: 1rem 2rem;
    box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.05);
    display: flex;
    justify-content: center;
  }

  .btn-amber {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-width: 200px;
  }

  .btn-amber:hover {
    background-color: var(--accent-color);
    transform: translateY(-2px);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .form-grid {
      grid-template-columns: 1fr;
    }

    .name-container,
    .contact-container {
      grid-template-columns: 1fr;
    }

    .edit-profile-container {
      padding: 1rem;
    }

    .edit-form {
      height: calc(100vh - 10rem);
    }
  }

/* Responsive Design */
@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
  }

  .basic-info {
    text-align: center;
  }

  .profile-content {
    grid-template-columns: 1fr;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }

  .contact-detail {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .profile-container {
    padding: 1rem;
  }

  .profile-hero {
    padding: 2rem 1rem;
  }

  .avatar {
    width: 120px;
    height: 120px;
    font-size: 3rem;
  }

  .basic-info h1 {
    font-size: 2rem;
  }
}

</style>