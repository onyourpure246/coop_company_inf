<template>
  <div class="app">
    <!-- Main Content -->
    <main class="container">
      <div class="row">
        <!-- Left: Company Section -->
        <aside class="col col-12 col-md-4">
          <div class="card company-card">
            <div class="company-info">
              <div class="details">
                <h2 class="company-title">
                  <font-awesome-icon :icon="['fas', 'building']" class="company-icon" />
                  {{ company.name }} <br> ({{ company.eng_name }})
                </h2>
                <div class="info-section">
                  <h3>
                    <font-awesome-icon :icon="['fas', 'info-circle']" class="section-icon" />
                    ข้อมูลทั่วไป
                  </h3>
                  <p><font-awesome-icon :icon="['fas', 'id-card']" /> <strong>เลขทะเบียน:</strong> {{ company.compId }}</p>
                  <p><font-awesome-icon :icon="['fas', 'briefcase']" /> <strong>ประเภทธุรกิจ:</strong> {{ company.business_type }}</p>
                </div>

                <div class="info-section">
                  <h3>
                    <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="section-icon" />
                    ที่ตั้ง
                  </h3>
                  <p><font-awesome-icon :icon="['fas', 'location-dot']" /> {{ company.location }}</p>
                  <p><font-awesome-icon :icon="['fas', 'city']" /> <strong>จังหวัด:</strong> {{ company.province }}</p>
                  <p><font-awesome-icon :icon="['fas', 'map']" /> <strong>เขต/อำเภอ:</strong> {{ company.district }}</p>
                </div>

                <div class="info-section">
                  <h3>
                    <font-awesome-icon :icon="['fas', 'clipboard-list']" class="section-icon" />
                    รายละเอียดงาน
                  </h3>
                  <div class="detail-item">
                    <h4><font-awesome-icon :icon="['fas', 'building-user']" /> รายละเอียดบริษัท</h4>
                    <p>{{ company.description }}</p>
                  </div>
                  <div class="detail-item">
                    <h4><font-awesome-icon :icon="['fas', 'tasks']" /> ลักษณะงาน</h4>
                    <p>{{ company.job_description }}</p>
                  </div>
                  <div class="detail-item">
                    <h4><font-awesome-icon :icon="['fas', 'graduation-cap']" /> สาขาที่เปิดรับ</h4>
                    <p>{{ Array.isArray(company.job_fields) ? company.job_fields.map(field => jobFieldsMapping[field] || field).join(', ') : company.job_fields }}</p>
                  </div>
                  <div class="detail-item">
                    <h4><font-awesome-icon :icon="['fas', 'user-tie']" /> ตำแหน่งงาน</h4>
                    <p>{{ company.position }}</p>
                  </div>
                </div>

                <div class="info-section">
                  <h3>
                    <font-awesome-icon :icon="['fas', 'gift']" class="section-icon" />
                    สวัสดิการ
                  </h3>
                  <p>{{ company.benefits }}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Right: Form Section -->
        <section class="col col-12 col-md-8">
          <div class="card form-card">
            <FormKit 
              type="form" 
              @submit="submitForm">
              <div class="form-header">
                <h1>
                  <font-awesome-icon :icon="['fas', 'user-graduate']" class="header-icon" />
                  ข้อมูลของนักศึกษา
                </h1>
              </div>
              <div class="form-group">
                <FormKit
                  type="text"
                  label="รหัสนักศึกษา"
                  v-model="form.studentid"
                  disabled
                  placeholder="รหัสนักศึกษา"
                  validation="required"
                  :prefix-icon="['fas', 'id-badge']"
                />
              </div>
              <div class="form-group-inline inline-equal">
                <div class="form-group">
                  <FormKit
                    type="text"
                    label="ชื่อ"
                    v-model="form.firstName"
                    placeholder="ชื่อ"
                    validation="required"
                    :prefix-icon="['fas', 'user']"
                  />
                </div>
                <div class="form-group">
                  <FormKit
                    type="text"
                    label="นามสกุล"
                    v-model="form.lastName"
                    placeholder="นามสกุล"
                    validation="required"
                    :prefix-icon="['fas', 'user']"
                  />
                </div>
              </div>
              <div class="form-group">
                <FormKit
                  type="select"
                  label="สาขา"
                  v-model="form.major"
                  :options="majorOptions"
                  placeholder="เลือกสาขา"
                  validation="required"
                  :prefix-icon="['fas', 'graduation-cap']"
                />
              </div>
              <div class="form-group">
                <FormKit
                  type="text"
                  label="ที่อยู่ปัจจุบัน"
                  v-model="form.address"
                  placeholder="ที่อยู่ปัจจุบัน"
                  validation="required"
                  :prefix-icon="['fas', 'home']"
                />
              </div>
              <div class="form-group-inline">
                <div class="form-group">
                  <FormKit
                    type="tel"
                    label="หมายเลขโทรศัพท์"
                    v-model="form.phone"
                    placeholder="หมายเลขโทรศัพท์"
                    validation="required|matches:/^[0-9]{10}$/"
                    :prefix-icon="['fas', 'phone']"
                  />
                </div>
                <div class="form-group">
                  <FormKit
                    type="email"
                    label="อีเมล์"
                    v-model="form.email"
                    placeholder="อีเมล์"
                    validation="required|email"
                    :prefix-icon="['fas', 'envelope']"
                  />
                </div>
              </div>
              <div class="form-group">
                <FormKit
                  type="number"
                  label="เกรดเฉลี่ยรวม (GPA)"
                  v-model="form.gpa"
                  step="0.01"
                  placeholder="GPA"
                  validation="required|min:0|max:4"
                  :prefix-icon="['fas', 'star']"
                />
              </div>
              <div class="form-group-inline inline-equal">
                <div class="form-group">
                  <FormKit
                    type="file"
                    label="เรซูเม่ (Resume) - เป็น .PDF เท่านั้น"
                    @change="onFileChange('resume', $event)"
                    validation="required"
                    accept="application/pdf"
                  />
                </div>
                <div class="form-group">
                  <FormKit
                    type="file"
                    label="ทรานสคริปต์ (Transcript) - เป็น .PDF เท่านั้น"
                    @change="onFileChange('transcript', $event)"
                    validation="required"
                    accept="application/pdf"
                    :prefix-icon="['fas', 'file-pdf']"
                  />
                </div>
              </div>
              
              <template #submit>
                <button type="submit" class="btn btn-primary btn-block mt-3">
                  <font-awesome-icon :icon="['fas', 'right-to-bracket']" /> สมัครออกฝึกสหกิจศึกษา
                </button>
              </template>
            </FormKit>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios';
import UserService from '@/UserService';
import router from '@/router';
import { emitter } from '@/router/authGuard';

export default {
  name: "JobApplicationForm",
  data() {
    return {
      jobFieldsMapping: {
        'IT': 'เทคโนโลยีสารสนเทศและการสื่อสารดิจิทัล',
        'Comsci': 'วิทยาการคอมพิวเตอร์',
        'AppliedMath': 'คณิตศาสตร์ประยุกต์',
        'AppliedStat': 'สถิติประยุกต์และวิทยาการวิเคราะห์ข้อมูล',
        'BigData': 'การวิเคราะห์และจัดการข้อมูลขนาดใหญ่',
        'AppliedChem': 'เคมีประยุกต์',
        'AppliedBio': 'ชีววิทยาประยุกต์',
        'AppliedPhys': 'ฟิสิกส์ประยุกต์',
        'FoodSci': 'วิทยาศาสตร์อาหารและการจัดการเทคโนโลยีอาหาร',
      },
      company: {
        name: "",
        eng_name: "",
        location: "",
        logo: null,
        compId: null,
        business_type: "",
        description: "",
        province: "",
        district: "",
        job_description: "",
        position: "",
        benefits: "",
        job_fields: [],
      },
      form: {
        studentid: "",
        firstName: "",
        lastName: "",
        major: "",
        address: "",
        phone: "",
        email: "",
        gpa: "",
      },
      files: {
        resume: null,
        transcript: null,
      },
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
      ],
    };
  },
    mounted() {
    const companyParams = this.$route.query;
    this.company.compId = companyParams.compId || null;

    if (this.company.compId) {
      this.fetchCompanyDetails();
    }

    // Check if user is authenticated through cookies
    this.fetchStudentDetails();
  },
  methods: {
    async fetchCompanyDetails() {
      try {
        const response = await axios.get(`http://localhost:5000/companies/${this.company.compId}`, {
          withCredentials: true
        });
        const companyDetails = response.data;
        if (companyDetails) {
          this.company.name = companyDetails.thai_name || 'ชื่อบริษัท';
          this.company.eng_name = companyDetails.english_name || 'ชื่อภาษาอังกฤษ';
          this.company.location = companyDetails.address || 'ที่ตั้ง';
          this.company.description = companyDetails.description || 'รายละเอียด';
          this.company.business_type = companyDetails.business_type || 'ประเภทสถานประกอบการ';
          this.company.position = companyDetails.position || 'ตำแหน่งที่เปิดรับ';
          this.company.province = companyDetails.province || '';
          this.company.district = companyDetails.district || '';
          this.company.job_description = companyDetails.job_description || '';
          this.company.benefits = companyDetails.benefits || '';

          // Parse job_fields if it exists
          if (companyDetails.job_fields) {
            try {
              // If it's a string, parse it as JSON
              this.company.job_fields = typeof companyDetails.job_fields === 'string'
                ? JSON.parse(companyDetails.job_fields)
                : companyDetails.job_fields;
            } catch (e) {
              console.error('Error parsing job_fields:', e);
              this.company.job_fields = [];
            }
          } else {
            this.company.job_fields = [];
          }
        } else {
          console.error('Company details not found');
        }
      } catch (error) {
        console.error('Error fetching company details:', error);
      }
    },
    async fetchStudentDetails() {
      try {
        const response = await UserService.getUserDetails();
        const studentDetails = response.details;
        if (studentDetails) {
          this.form.studentid = studentDetails.student_id || '';
          this.form.firstName = studentDetails.first_name || '';
          this.form.lastName = studentDetails.last_name || '';
          this.form.major = studentDetails.major || '';
          this.form.address = studentDetails.address || '';
          this.form.phone = studentDetails.phone || '';
          this.form.email = studentDetails.email || '';
          this.form.gpa = studentDetails.GPA || '';
        } else {
          console.error('Student details not found');
        }
      } catch (error) {
        console.error('Error fetching student details:', error);
        if (error.response && error.response.status === 401) {
          this.$router.push('/login');
        }
      }
    },
    onFileChange(field, event) {
      this.files[field] = event.target.files[0];
    },

    async submitForm() {
      const applicationData = {
        studentId: this.form.studentid,
        compId: this.company.compId,
        firstName: this.form.firstName,
        lastName: this.form.lastName,
        major: this.form.major,
        address: this.form.address,
        phone: this.form.phone,
        email: this.form.email,
        gpa: this.form.gpa,
      };

      const formData = new FormData();
      formData.append('studentId', this.form.studentid);
      formData.append('compId', this.company.compId);
      if (this.files.resume) formData.append("resume", this.files.resume);
      if (this.files.transcript) formData.append("transcript", this.files.transcript);

      console.log("Submitting application data:", applicationData);

      try {
        // Update student details
        await UserService.updateStudentDetails(applicationData);

        // Submit application with files
        const response = await UserService.submitApplication(formData);
        console.log("Application submitted successfully:", response.data);
        emitter.emit('show-notification', {
          message: 'สมัครสำเร็จ!',
          type: 'success',
          duration: 3000
        });
        router.push('/historyandstatus');
      } catch (error) {
        console.error("Error submitting application:", error);
        if (error.response && error.response.status === 401) {
          emitter.emit('show-notification', {
            message: 'กรุณาเข้าสู่ระบบใหม่',
            type: 'error',
            duration: 3000
          });
          router.push('/login');
        } else {
          emitter.emit('show-notification', {
            message: error.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
            type: 'error',
            duration: 3000
          });
        }
      }
    },
  },
};
</script>

<style scoped>
.container {
  padding: var(--padding);
  background-color: var(--background-color);
  min-height: 100vh;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap);
  max-width: 1440px;
  margin: 0 auto;
}

.col {
  flex: 1;
  padding: var(--padding);
  box-sizing: border-box;
}

/* Card Styles */
.company-card, .form-card {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: var(--border-radius);
  background-color: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: var(--padding);
  transition: transform var(--transition-duration), box-shadow var(--transition-duration);
}

.company-card:hover, .form-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

/* Company Info Styles */
.company-info {
  text-align: center;
}

.company-title {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.company-icon {
  color: var(--accent-color);
  font-size: 1.5em;
}

.section-icon {
  margin-right: 0.5rem;
  color: var(--accent-color);
}

.info-section {
  margin: 1.5rem 0;
  text-align: left;
  padding: 1rem;
  background-color: rgba(24, 183, 190, 0.05);
  border-radius: var(--border-radius);
  transition: background-color var(--transition-duration);
}

.info-section:hover {
  background-color: rgba(24, 183, 190, 0.1);
}

.info-section h3 {
  color: var(--accent-color);
  font-size: 1.25rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 0.5rem;
  display: flex;
  align-items: center;
}

.detail-item {
  margin: 1rem 0;
  padding: 0.5rem;
  border-left: 3px solid var(--primary-color);
  background-color: rgba(255, 255, 255, 0.5);
}

.detail-item h4 {
  color: var(--accent-color);
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-section p {
  font-size: 1rem;
  color: var(--text-color);
  margin: 0.5rem 0;
  line-height: 1.6;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-section p strong {
  color: var(--accent-color);
  font-weight: 600;
}

/* Form Styles */
.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-header h1 {
  color: var(--accent-color);
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.header-icon {
  color: var(--primary-color);
}

.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.form-group-inline {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group-inline .form-group {
  flex: 1;
  margin-bottom: 0;
}

.inline-equal .form-group {
  flex: 1;
}


/* Submit Button */
button[type="submit"] {
  width: 100%;
  padding: 1rem;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 1.125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-duration);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

button[type="submit"]:hover {
  background-color: var(--highlight-accent-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .row {
    padding: 1rem;
  }

  .company-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 768px) {
  .row {
    flex-direction: column;
  }

  .col {
    width: 100%;
    max-width: 100%;
  }

  .form-group-inline {
    flex-direction: column;
    gap: 1rem;
  }

  .form-group-inline .form-group {
    width: 100%;
  }

  .company-card, .form-card {
    margin-bottom: 1rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0.5rem;
  }

  .company-title {
    font-size: 1.5rem;
  }

  .info-section {
    padding: 0.75rem;
  }

  .info-section h3 {
    font-size: 1.125rem;
  }

  .detail-item h4 {
    font-size: 1rem;
  }

  :deep(.formkit-label) {
    font-size: 0.875rem;
  }

  :deep(.formkit-input) {
    padding: 0.625rem 1rem 0.625rem 2rem;
    font-size: 0.875rem;
  }

  button[type="submit"] {
    font-size: 1rem;
    padding: 0.875rem;
  }
}

</style>