<template>
  <div class="app">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">กำลังโหลดข้อมูล...</p>
    </div>

    <div v-else>
      <!-- Search Tools -->
      <SearchTools @filtered-results="handleFilteredResults" />

      <!-- Main Content -->
      <main class="container mt-3">
        <div class="row">
        <!-- Left List Section -->
        <aside class="col-12 col-md-4">
          <!-- Display the number of companies -->
          <div class="search-result-counter">
            <div class="search-result-icon">
              <font-awesome-icon icon="fa-solid fa-search" />
            </div>
            <div class="search-result-text">
              <span class="result-label">ผลลัพธ์ค้นหา</span>
              <span class="result-number">{{ filteredCompanies.length }}</span>
              <span class="result-unit">สถานประกอบการ</span>
            </div>
          </div>

          <div
            v-for="(company, index) in filteredCompanies"
            :key="index"
            class="company-card mb-3"
            :class="{ 'selected': selectedIndex === index }"
            @click="selectCompany(index)"
          >
            <div class="card-body p-3">
              <div class="company-names">
                <h5 class="thai-name mb-1">{{ company.thai_name }}</h5>
                <h6 class="english-name text-muted">{{ company.english_name }}</h6>
              </div>

              <div class="company-location">
                <font-awesome-icon icon="fa-solid fa-map-marker-alt" class="text-primary" />
                <span>{{ company.province }}</span>
              </div>

              <div class="job-fields" v-if="company.job_fields">
                <div class="field-tags">
                  <span v-for="field in JSON.parse(company.job_fields)"
                        :key="field"
                        class="field-tag">
                    {{ getThaiJobField(field) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Right Detail Section -->
        <section class="col-12 col-md-8 details-section">
          <div v-if="selectedCompany" class="card company-detail-card">
            <div class="card-body">
              <div class="company-header">
                <h2 class="company-name">{{ selectedCompany.thai_name }}</h2>
                <h3 class="company-name-en">{{ selectedCompany.english_name }}</h3>
              </div>

              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label"><font-awesome-icon icon="fa-solid fa-map-marker-alt" /> จังหวัด</div>
                  <div class="info-value">{{ selectedCompany.province }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label"><font-awesome-icon icon="fa-solid fa-building" /> ประเภท</div>
                  <div class="info-value">{{ selectedCompany.business_type }}</div>
                </div>
              </div>

              <div class="section">
                  <h4><font-awesome-icon icon="fa-solid fa-info-circle" /> รายละเอียด</h4>
                  <p>{{ selectedCompany.description }}</p>
                </div>

                <div class="section">
                  <h4><font-awesome-icon icon="fa-solid fa-map-marked-alt" /> สถานที่ตั้ง</h4>
                  <p>{{ selectedCompany.address }}</p>
                </div>

              <div class="action-buttons mt-4">
                <button v-if="(!isAdmin && isStudent) || !isLoggedIn" class="btn btn-primary btn-lg" @click="applyForJob">
                  <font-awesome-icon icon="fa-solid fa-paper-plane" /> สมัครออกฝึกสหกิจศึกษา
                </button>
                <button v-if="isAdmin" class="btn btn-info btn-lg" @click="viewApplicationDetails">
                  <font-awesome-icon icon="fa-solid fa-list-alt" /> ดูข้อมูลการสมัครออกฝึกสหกิจศึกษา
                </button>
              </div>

              <div class="company-sections mt-4">
                

                <div class="section" v-if="selectedCompany.job_fields">
                  <h4><font-awesome-icon icon="fa-solid fa-graduation-cap" /> สาขาที่เปิดรับ</h4>
                  <div class="tags">
                    <span v-for="field in JSON.parse(selectedCompany.job_fields)" :key="field" class="tag">
                      {{ getThaiJobField(field) }}
                    </span>
                  </div>
                </div>

                <div class="section" v-if="selectedCompany.job_description">
                  <h4><font-awesome-icon icon="fa-solid fa-briefcase" /> ลักษณะงานที่นักศึกษาต้องปฏิบัติ</h4>
                  <ul class="position-list">
                    <li v-for="(job_description, index) in selectedCompany.job_description.split('\n')" :key="index">
                      {{ job_description }}
                    </li>
                  </ul>
                </div>

                <div class="section" v-if="selectedCompany.benefits">
                  <h4><font-awesome-icon icon="fa-solid fa-gift" /> สวัสดิการ</h4>
                  <p>{{ selectedCompany.benefits }}</p> 
                </div>
              </div>
            </div>
          </div>
          <div v-else class="card">
            <div class="card-body text-center">กรุณาเลือกบริษัทก่อน</div>
          </div>
        </section>
      </div>
    </main>
    </div>
  </div>
</template>


<script>
import UserService from '../UserService';
import SearchTools from './SearchTools.vue';
import axios from 'axios';
import { emitter } from '../router/authGuard';

export default {
  components: {
    SearchTools,
  },
  data() {
    return {
      company: [],
      filteredCompanies: [],
      selectedIndex: null,
      username: UserService.getUsername() || '',
      isLoading: true,
      jobFieldsMapping: {
        'IT': 'เทคโนโลยีสารสนเทศและการสื่อสารดิจิทัล',
        'Comsci': 'วิทยาการคอมพิวเตอร์',
        'AppliedMath': 'คณิตศาสตร์ประยุกต์',
        'AppliedStat': 'สถิติประยุกต์และวิทยาการวิเคราะห์ข้อมูล',
        'BigData': 'การวิเคราะห์และจัดการข้อมูลขนาดใหญ่',
        'AppliedChem': 'เคมีประยุกต์',
        'AppliedBio': 'ชีววิทยาประยุกต์',
        'AppliedPhys': 'ฟิสิกส์ประยุกต์',
        'FoodSci': 'วิทยาศาสตร์อาหารและการจัดการเทคโนโลยีอาหาร'
      }
    };
  },
  async created() {
    try {
      this.isLoading = true;
      await UserService.checkSession();
      console.log('Session checked in CompanyInfo');
      console.log('Current role:', UserService.getRole());
      await this.fetchCompany();
    } catch (error) {
      console.error('Error checking session:', error);
      emitter.emit('show-notification', {
        message: 'เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง',
        type: 'error',
        duration: 3000
      });
    } finally {
      this.isLoading = false;
    }
  },



  computed: {
    selectedCompany() {
      return this.selectedIndex !== null ? this.filteredCompanies[this.selectedIndex] : null;
    },
    isLoggedIn() {
      return UserService.isAuthenticated();
    },
    isAdmin() {
      return !this.isLoading && UserService.getRole() === 'officer';
     },
     isStudent() {
      return !this.isLoading && UserService.getRole() === 'student';
     }
  },
  methods: {
    getThaiJobField(field) {
      return this.jobFieldsMapping[field] || field;
    },
    selectCompany(index) {
      this.selectedIndex = index;
    },
    async fetchCompany() {
      try {
        const response = await UserService.getCompany();
        this.company = response.data;
        this.filteredCompanies = response.data;
      } catch (error) {
        console.error('Error fetching companies:', error);
        throw error; // Re-throw to be caught by the caller
      }
    },
    applyForJob() {
      if (!UserService.isAuthenticated()) {
        emitter.emit('show-notification', {
          message: 'กรุณาเข้าสู่ระบบก่อน',
          type: 'warning',
          duration: 3000
        });
        this.$router.push('/user-login');
        return;
      }

      if (this.selectedCompany) {
        const userState = UserService.getUserState();
        this.$router.push({
          path: '/applicationpage',
          query: {
            name: this.selectedCompany.thai_name,
            eng_name: this.selectedCompany.english_name,
            location: this.selectedCompany.province,
            email: userState.email,
            userId: userState.userId,
            compId: this.selectedCompany.comp_id
          }
        });
      } else {
        emitter.emit('show-notification', {
          message: 'กรุณาเลือกบริษัทก่อนสมัครงาน',
          type: 'warning',
          duration: 3000
        });
      }
    },

    handleFilteredResults(filteredResults) {
      // รับผลลัพธ์ที่กรองแล้วจาก SearchTools
      this.filteredCompanies = filteredResults;
    },
    async viewApplicationDetails() {
      if (!UserService.isAuthenticated()) {
        emitter.emit('show-notification', {
          message: 'กรุณาเข้าสู่ระบบก่อน',
          type: 'warning',
          duration: 3000
        });
        this.$router.push('/user-login');
        return;
      }

      if (!this.isAdmin) {
        emitter.emit('show-notification', {
          message: 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้',
          type: 'error',
          duration: 3000
        });
        return;
      }

      if (this.selectedCompany) {
        try {
          // เช็คว่าสามารถเข้าถึง API ได้หรือไม่
          await axios.get(`http://localhost:5000/applications/company/${this.selectedCompany.comp_id}`, {
            withCredentials: true
          });

          // ถ้าเข้าถึงได้ จะ redirect ไปหน้า applicationdetails
          this.$router.push({
            path: '/applicationdetails',
            query: {
              compId: this.selectedCompany.comp_id,
              thaiName: this.selectedCompany.thai_name,
              englishName: this.selectedCompany.english_name,
              description: this.selectedCompany.description,
              address: this.selectedCompany.address
            }
          });
        } catch (error) {
          console.error('Error checking application access:', error);
          emitter.emit('show-notification', {
            message: 'เกิดข้อผิดพลาดในการเข้าถึงข้อมูล กรุณาลองใหม่อีกครั้ง',
            type: 'error',
            duration: 3000
          });
        }
      } else {
        emitter.emit('show-notification', {
          message: 'กรุณาเลือกบริษัทก่อนดูรายละเอียดการสมัคร',
          type: 'warning',
          duration: 3000
        });
      }
    },
  },
};
</script>

<style scoped>
@import '@/assets/css/CompanyInfo.css';

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 2rem;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}
</style>
