<template>
  <div class="application-history container-fluid py-4">
    <div class="row mb-4">
      <div class="col-12">
        <div class="header-section text-center">
          <h1 class="page-title display-4 mb-4">
            <font-awesome-icon :icon="['fas', 'history']" class="me-3 text-primary" />
            ประวัติและสถานะการสมัคร
          </h1>
          <div class="d-flex justify-content-end">
            <button class="btn btn-info status-description-btn shadow-sm" @click="showStatusDetails = true">
              <font-awesome-icon :icon="['fas', 'circle-info']" class="me-2" />
              <span class="d-none d-sm-inline">คำอธิบายสถานะ</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-12 col-md-6 col-lg-4 mb-4"
        v-for="(application, index) in applicationsWithDetails"
        :key="index"
      >
        <div
          class="application-card h-100 shadow-sm"
          :class="{ 'clickable': application.status === 'passed' }"
          @click="openModal(application)"
        >
          <div class="ribbon" :class="application.statusClass"></div>
          <div class="card-body p-4">
            <div class="company-info mb-4">
              <div class="company-logo bg-light rounded-circle">
                <font-awesome-icon :icon="['fas', 'building']" size="2x" class="text-primary" />
              </div>
              <div class="company-details ms-3">
                <h3 class="company-name h4 mb-1">{{ application.company_name }}</h3>
                <p class="company-eng-name text-muted small mb-0">{{ application.company_eng_name }}</p>
              </div>
            </div>

            <div class="status-section">
              <div class="d-flex align-items-center mb-3">
                <font-awesome-icon :icon="['fas', 'flag']" class="me-2 text-secondary" />
                <span class="status-label fw-bold">สถานะ</span>
              </div>
              <div class="status-badge-wrapper">
                <span :class="['status-badge d-inline-block w-100 text-center py-2 rounded-pill', application.statusClass]">
                  {{ application.statusText }}
                </span>
              </div>

              <div v-if="application.status === 'success'" class="actions mt-3 d-flex justify-content-between">
                <button class="btn btn-success btn-sm flex-grow-1 me-2" @click.stop="acceptApplication(index)">
                  <font-awesome-icon :icon="['fas', 'check']" class="me-1" />
                  ยอมรับ
                </button>
                <button class="btn btn-danger btn-sm flex-grow-1" @click.stop="rejectApplication(index)">
                  <font-awesome-icon :icon="['fas', 'times']" class="me-1" />
                  ปฏิเสธ
                </button>
              </div>
            </div>

            <div v-if="application.status === 'passed'"
                 class="passed-info-text mt-3 p-2 rounded-3 d-flex align-items-center justify-content-center">
              <font-awesome-icon :icon="['fas', 'hand-pointer']" class="me-2 animate-pointer" />
              <span>คลิกเพื่อดำเนินการต่อ</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Details Modal -->
    <div v-if="showStatusDetails" class="modal-overlay d-flex align-items-center justify-content-center" @click="closeStatusDetails">
      <div class="modal-content modal-lg bg-white rounded-4 shadow mx-3" @click.stop style="max-height: 90vh; overflow-y: auto;">
        <div class="modal-header border-bottom p-4 position-sticky top-0 bg-white">
          <h3 class="modal-title h4 mb-0">
            <font-awesome-icon :icon="['fas', 'circle-info']" class="me-2 text-primary" />
            คำอธิบายสถานะการสมัคร
          </h3>
          <button type="button" class="btn-close shadow-none" @click="closeStatusDetails" aria-label="Close"></button>
        </div>
        <div class="modal-body p-4">
          <div class="status-details">
            <div class="status-grid">
              <div v-for="(status, index) in [
                { class: 'status-in-progress', number: '1', title: 'กำลังดำเนินการ', desc: 'การสมัครของนักศึกษาอยู่ในขั้นตอนการพิจารณา และดำเนินการ' },
                { class: 'status-ready', number: '2', title: 'มีสิทธิ์สัมภาษณ์', desc: 'นักศึกษามีสิทธิ์เข้าร่วมการสัมภาษณ์' },
                { class: 'status-disqualified', number: '3', title: 'หมดสิทธิ์', desc: 'นักศึกษาไม่มีสิทธิ์เข้าร่วมการสัมภาษณ์' },
                { class: 'status-passed', number: '4', title: 'ผ่านการสัมภาษณ์', desc: 'นักศึกษาผ่านการสัมภาษณ์เรียบร้อยแล้ว' },
                { class: 'status-eliminated', number: '5', title: 'ไม่ผ่านการสัมภาษณ์', desc: 'นักศึกษาไม่ผ่านการสัมภาษณ์' },
                { class: 'status-confirmed', number: '6', title: 'ยืนยัน', desc: 'นักศึกษาได้ยืนยันเข้ารับการฝึกสหกิจ ณ สถานประกอบการนั้นๆ' },
                { class: 'status-withdrawn', number: '7', title: 'สละสิทธิ์', desc: 'นักศึกษาสละสิทธิ์เข้ารับการฝึกสหกิจ ณ สถานประกอบการนั้นๆ' }
              ]" :key="index" class="status-item p-3 rounded-3 mb-3 hover-effect">
                <div class="d-flex align-items-start">
                  <div :class="['status-badge rounded-circle me-3 flex-shrink-0', status.class]">{{ status.number }}</div>
                  <div class="flex-grow-1">
                    <h4 class="h5 mb-2">{{ status.title }}</h4>
                    <p class="mb-0 text-muted small">{{ status.desc }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Application Details Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content modal-lg bg-white rounded-4 shadow" @click.stop>
        <div class="modal-header border-bottom p-4">
          <div>
            <h2 class="modal-title h3 mb-1">{{ selectedApplication.company_name }}</h2>
            <p class="text-muted mb-0">{{ selectedApplication.company_eng_name }}</p>
          </div>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>

        <div class="modal-body p-4">
          <div class="company-details mb-4">
            <div class="row">
              <div class="col-md-6">
                <div class="detail-item mb-3">
                  <h5 class="text-primary mb-2">
                    <font-awesome-icon :icon="['fas', 'location-dot']" class="me-2" />
                    สถานที่ตั้ง
                  </h5>
                  <p class="mb-0">{{ selectedApplication.location }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="detail-item mb-3">
                  <h5 class="text-primary mb-2">
                    <font-awesome-icon :icon="['fas', 'flag']" class="me-2" />
                    สถานะ
                  </h5>
                  <span :class="['status-badge px-3 py-2 rounded-pill', selectedApplication.statusClass]">
                    {{ selectedApplication.statusText }}
                  </span>
                </div>
              </div>
            </div>

            <div class="detail-item mb-3">
              <h5 class="text-primary mb-2">
                <font-awesome-icon :icon="['fas', 'circle-info']" class="me-2" />
                รายละเอียดบริษัท
              </h5>
              <p class="mb-0">{{ selectedApplication.details }}</p>
            </div>

            <div class="detail-item mb-3">
              <h5 class="text-primary mb-2">
                <font-awesome-icon :icon="['fas', 'briefcase']" class="me-2" />
                ลักษณะงาน
              </h5>
              <p class="mb-0">{{ selectedApplication.job_description }}</p>
            </div>

            <div class="detail-item mb-3">
              <h5 class="text-primary mb-2">
                <font-awesome-icon :icon="['fas', 'graduation-cap']" class="me-2" />
                สาขาที่รับ
              </h5>
              <p class="mb-0">{{
                typeof selectedApplication.job_fields === 'string'
                  ? JSON.parse(selectedApplication.job_fields).map(field => translateJobField(field)).join(', ')
                  : Array.isArray(selectedApplication.job_fields)
                    ? selectedApplication.job_fields.map(field => translateJobField(field)).join(', ')
                    : translateJobField(selectedApplication.job_fields)
              }}</p>
            </div>

            <div class="detail-item">
              <h5 class="text-primary mb-2">
                <font-awesome-icon :icon="['fas', 'gift']" class="me-2" />
                สวัสดิการ
              </h5>
              <p class="mb-0">{{ selectedApplication.benefits }}</p>
            </div>
          </div>

          <div v-if="selectedApplication.status === 'passed'" class="action-section">
            <hr class="my-4">
            <div class="d-flex flex-column flex-md-row gap-3 justify-content-center">
              <button class="btn btn-lg btn-success flex-grow-1"
                      @click="updateApplicationStatus(selectedApplication.application_id, 'confirmed')">
                <font-awesome-icon :icon="['fas', 'circle-check']" class="me-2" />
                ยืนยันการฝึกสหกิจ
              </button>
              <button class="btn btn-lg btn-danger flex-grow-1"
                      @click="updateApplicationStatus(selectedApplication.application_id, 'withdrawn')">
                <font-awesome-icon :icon="['fas', 'ban']" class="me-2" />
                สละสิทธิ์
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faBuilding,
  faHistory,
  faCircleInfo,
  faFlag,
  faHandPointer,
  faBriefcase,
  faGraduationCap,
  faGift
} from '@fortawesome/free-solid-svg-icons';
import UserService from '../UserService';

export default {
  data() {
    return {
      applications: [],
      showModal: false,
      selectedApplication: null,
      showStatusDetails: false,
    };
  },
  created() {
    library.add(
      faBuilding,
      faHistory,
      faCircleInfo,
      faFlag,
      faHandPointer,
      faBriefcase,
      faGraduationCap,
      faGift
    );
  },
  computed: {
    applicationsWithDetails() {
      return this.applications.map((app) => {
        let statusText = '';
        let statusClass = '';

        switch (app.status) {
          case 'in progress':
            statusText = 'กำลังดำเนินการ';
            statusClass = 'status-in-progress';
            break;
          case 'ready':
            statusText = 'มีสิทธิ์สัมภาษณ์';
            statusClass = 'status-ready';
            break;
          case 'disqualified':
            statusText = 'หมดสิทธิ์';
            statusClass = 'status-disqualified';
            break;
          case 'passed':
            statusText = 'ผ่านการสัมภาษณ์';
            statusClass = 'status-passed';
            break;
          case 'eliminated':
            statusText = 'ไม่ผ่านการสัมภาษณ์';
            statusClass = 'status-eliminated';
            break;  
          case 'confirmed':
            statusText = 'ยืนยัน';
            statusClass = 'status-confirmed';
            break;
          case 'withdrawn':
            statusText = 'สละสิทธิ์';
            statusClass = 'status-withdrawn';
            break;
          default:
            statusText = 'Unknown';
            statusClass = 'status-unknown';
        }
        return {
          ...app,
          statusText,
          statusClass,
        };
      });
    },
  },
  methods: {
    closeStatusDetails() {
      this.showStatusDetails = false;
    },
    async fetchApplications() {
      try {
        if (!UserService.isAuthenticated()) {
          this.$router.push('/login');
          return;
        }
        const response = await axios.get('http://localhost:5000/applications/details');
        this.applications = response.data;
        console.log(this.applications);
      } catch (error) {
        console.error('Error fetching applications:', error);
        if (!UserService.isAuthenticated()) {
          this.$router.push('/login');
        }
      }
    },

    async updateApplicationStatus(applicationId, status) {
      try {
        if (!UserService.isAuthenticated()) {
          this.$router.push('/login');
          return;
        }
        await axios.put(`http://localhost:5000/applications/${applicationId}`, { status });
        // Update the local application status
        const application = this.applications.find(app => app.application_id === applicationId);
        if (application) {
          application.status = status;
        }
        this.closeModal(); // Close the modal after updating
      } catch (error) {
        console.error('Error updating application status:', error);
        if (!UserService.isAuthenticated()) {
          this.$router.push('/login');
        }
      }
    },



    acceptApplication(index) {
      this.$set(this.applications, index, { ...this.applications[index], status: "accepted" });
    },
    rejectApplication(index) {
      this.$set(this.applications, index, { ...this.applications[index], status: "rejected" });
    },
    async openModal(application) {
  console.log('Opening modal for application:', application); // Debugging
  const companyDetails = await this.fetchCompanyDetails(application.compId); // Use compId here
  if (companyDetails) {
    this.selectedApplication = {
      ...application,
      location: companyDetails.address, // Use address for location
      details: companyDetails.description, // Use description for details
    };
  } else {
    this.selectedApplication = application;
  }
  this.showModal = true;
},

    closeModal() {
      this.showModal = false;
      this.selectedApplication = null;
    },
    translateJobField(field) {
      const jobFieldsMap = {
        'IT': 'เทคโนโลยีสารสนเทศและการสื่อสารดิจิทัล',
        'Comsci': 'วิทยาการคอมพิวเตอร์',
        'AppliedMath': 'คณิตศาสตร์ประยุกต์',
        'AppliedStat': 'สถิติประยุกต์และวิทยาการวิเคราะห์ข้อมูล',
        'BigData': 'การวิเคราะห์และจัดการข้อมูลขนาดใหญ่',
        'AppliedChem': 'เคมีประยุกต์',
        'AppliedBio': 'ชีววิทยาประยุกต์',
        'AppliedPhys': 'ฟิสิกส์ประยุกต์',
        'FoodSci': 'วิทยาศาสตร์อาหารและการจัดการเทคโนโลยีอาหาร'
      };
      return jobFieldsMap[field] || field;
    },

    async fetchCompanyDetails(compId) {
  try {
    if (!UserService.isAuthenticated()) {
      this.$router.push('/login');
      return null;
    }
    const response = await axios.get(`http://localhost:5000/companies/${compId}`);
    console.log('Company Details:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching company details:', error);
    if (!UserService.isAuthenticated()) {
      this.$router.push('/login');
    }
    return null;
  }
}

  },
  mounted() {
    if (!UserService.isAuthenticated()) {
      this.$router.push('/login');
      return;
    }
    this.fetchApplications();
  },
};
</script>

<style scoped>
/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1050;
  padding: 1rem;
}

.modal-content {
  width: 100%;
  max-width: 800px;
  border: none;
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.status-item {
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
}

.status-item:hover {
  transform: translateX(5px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-badge {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  color: white;
}

.status-in-progress { background-color: #17a2b8; }
.status-ready { background-color: #28a745; }
.status-disqualified { background-color: #dc3545; }
.status-passed { background-color: #007bff; }
.status-eliminated { background-color: #6c757d; }
.status-confirmed { background-color: #28a745; }
.status-withdrawn { background-color: #dc3545; }

@media (max-width: 576px) {
  .modal-content {
    margin: 0;
  }

  .status-item {
    padding: 0.75rem !important;
  }

  .modal-header {
    padding: 1rem !important;
  }

  .modal-body {
    padding: 1rem !important;
  }

  .status-badge {
    width: 28px;
    height: 28px;
    font-size: 0.8rem;
  }

  h4.h5 {
    font-size: 1rem;
  }

  .text-muted.small {
    font-size: 0.85rem;
  }
}

/* General Styles */
.application-history {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.page-title {
  color: var(--secondary-color);
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 700;
  margin-top: 28px;
}

/* Status Description Button */
.status-description-btn {
  background-color: var(--info-color, #17a2b8);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.status-description-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.15);
  background-color: var(--info-hover-color, #138496);
}

/* Application Card */
.application-card {
  border: 1px solid #e9ecef;
  padding: 1.5rem;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  height: 100%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  position: relative;
  overflow: hidden;
}

.application-card.clickable {
  border-left: 4px solid var(--primary-color);
}

.application-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.12);
}

.ribbon {
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 100%;
  opacity: 0.8;
}

/* Company Info */
.company-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.company-logo {
  width: 64px;
  height: 64px;
  background-color: var(--light-bg-color, #f8f9fa);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.company-name {
  color: var(--secondary-color);
  margin-bottom: 0.25rem;
  font-weight: 600;
  line-height: 1.3;
}

.company-eng-name {
  color: var(--text-muted);
  font-size: 0.875rem;
}

/* Status Badges */
.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-block;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.status-in-progress {
  background-color: #e3f2fd;
  color: #0d47a1;
}

.status-ready {
  background-color: #fff3cd;
  color: #856404;
}

.status-disqualified {
  background-color: #ffebee;
  color: #c62828;
}

.status-passed {
  background-color: #f3e5f5;
  color: #6a1b9a;
}

.status-confirmed {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-eliminated {
  background-color: #ffebee;
  color: #c62828;
}

.status-withdrawn {
  background-color: #f5f5f5;
  color: #616161;
}

.status-unknown {
  background-color: #eeeeee;
  color: #424242;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background-color: white;
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  margin-top: 80px; /* เพิ่มระยะห่างจาก navbar */
}

.modal-header {
  border-bottom: 1px solid #e9ecef;
  position: relative;
  justify-content: center;
}

.btn-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #343a40;
}

/* Status Details Modal */
.status-item {
  background-color: white;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.status-item:hover {
  transform: translateX(4px);
  border-color: var(--primary-color);
}

.status-badge.rounded-circle {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-weight: bold;
}

/* Buttons */
.btn {
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.15);
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.btn-success {
  background-color: var(--success-color, #28a745);
}

.btn-success:hover {
  background-color: var(--success-hover-color, #218838);
}

.btn-danger {
  background-color: var(--error-color, #dc3545);
}

.btn-danger:hover {
  background-color: var(--error-hover-color, #c82333);
}

/* Passed Info Text */
.passed-info-text {
  background-color: #fff3cd;
  color: #856404;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Animation */
@keyframes pointer-animation {
  0% { transform: translateX(0); }
  50% { transform: translateX(4px); }
  100% { transform: translateX(0); }
}

.animate-pointer {
  animation: pointer-animation 1s infinite;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .application-history {
    padding: 1rem;
  }

  .modal-content {
    margin: 0.5rem;
    max-height: 95vh;
  }

  .company-logo {
    width: 48px;
    height: 48px;
  }

  .company-name {
    font-size: 1rem;
  }

  .status-badge {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }

  .btn-lg {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .application-history {
    background-color: var(--dark-bg-color, #1a1a1a);
  }

  .application-card,
  .modal-content,
  .status-item {
    background-color: var(--dark-card-bg, #2d2d2d);
    border-color: var(--dark-border-color, #404040);
  }

  .company-name,
  .modal-title {
    color: var(--dark-text-color, #ffffff);
  }

  .text-muted {
    color: var(--dark-text-muted, #a0a0a0) !important;
  }
}
</style>
