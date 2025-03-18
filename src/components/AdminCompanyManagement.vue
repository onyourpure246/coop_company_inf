<template>
  <div class="container">
    <div class="header">
      <h1>ข้อมูลสถานประกอบการ</h1>
    </div>
    <div class="user-actions">
      <div class="action-section">
        <button class="btn btn-success" @click="showAddCompanyForm">
          <font-awesome-icon :icon="['fas', 'plus']" /> เพิ่มบริษัทใหม่
        </button>
      </div>
      <div class="import-section">
        <div class="input-group">
          <input type="file" class="form-control" @change="handleFileUpload" accept=".xlsx, .xls" />
          <button class="btn btn-primary" @click="importCompanies" :disabled="!file">
            <font-awesome-icon :icon="['fas', 'file-import']" /> นำเข้าข้อมูล
          </button>
        </div>
        <small class="text-muted">รองรับไฟล์ Excel (.xlsx, .xls)</small>
      </div>
    </div>
   
    <table class="table table-striped">
      <thead class="thead-dark">
        <tr>
          <th>เลขทะเบียน</th>
          <th>ชื่อบริษัท (ภาษาไทย)</th>
          <th>ชื่อบริษัท (ภาษาอังกฤษ)</th>
          <th>ประเภทธุรกิจ</th>
          <th class="text-center" style="width: 150px;">จัดการ</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="company in filteredCompanies" :key="company.comp_id">
          <td>{{ company.comp_id }}</td>
          <td>{{ company.thai_name }}</td>
          <td>{{ company.english_name }}</td>
          <td>{{ company.business_type }}</td>
          <td class="text-center">
            <div class="btn-group">
              <button class="btn btn-info btn-sm" @click="editCompany(company)" title="แก้ไข">
                <font-awesome-icon :icon="['fas', 'edit']" /> แก้ไข
              </button>
              <button class="btn btn-danger btn-sm" @click="confirmDelete(company.comp_id)" title="ลบ">
                <font-awesome-icon :icon="['fas', 'trash']" /> ลบ
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Add/Edit Company Modal -->
    <div v-if="showForm" class="modal-fullscreen" @click.self="cancelForm">
      <div class="modal-content-horizontal scrollable">
          <div class="modal-header">
            <h3>{{ isEditing ? 'แก้ไขข้อมูลบริษัท' : 'เพิ่มบริษัทใหม่' }}</h3>
            <span class="close" @click="cancelForm">&times;</span>
          </div>
          <div v-if="showError" class="error-message">
            {{ errorMessage }}
          </div>
        <FormKit
          type="form"
          :config="{
            classes: {
              input: 'formkit-disabled:opacity-50',
              form: 'space-y-4'
            }
          }"
          v-model="form"
          @submit="handleSubmit"
          :disabled="isSubmitting"
          :actions="false"
        >
          <div class="form-grid">
            <div class="form-column">
              <FormKit
                type="text"
                name="comp_id"
                label="รหัสบริษัท"
                v-model="form.comp_id"
                validation="required"
                :validation-messages="{
                  required: 'กรุณากรอกรหัสบริษัท'
                }"
              />

              <div class="form-row">
                <FormKit
                  type="text"
                  name="thai_name"
                  label="ชื่อบริษัท (ภาษาไทย)"
                  v-model="form.thai_name"
                  validation="required"
                  :validation-messages="{
                    required: 'กรุณากรอกชื่อบริษัทภาษาไทย'
                  }"
                  outer-class="flex-1 mr-2"
                />
                <FormKit
                  type="text"
                  name="english_name"
                  label="ชื่อบริษัท (ภาษาอังกฤษ)"
                  v-model="form.english_name"
                  validation="required"
                  :validation-messages="{
                    required: 'กรุณากรอกชื่อบริษัทภาษาอังกฤษ'
                  }"
                  outer-class="flex-1"
                />
              </div>

              <FormKit
                type="textarea"
                name="description"
                label="รายละเอียดบริษัท"
                v-model="form.description"
              />
              <FormKit
                type="text"
                name="address"
                label="ที่อยู่"
                v-model="form.address"
              />

              <div class="form-row">
                <FormKit
                  type="select"
                  name="province"
                  label="จังหวัด"
                  v-model="form.province"
                  :options="provinces"
                  @change="loadDistricts"
                  outer-class="flex-1 mr-2"
                />
              <FormKit
                type="select"
                name="district"
                label="เขต/อำเภอ"
                v-model="form.district"
                :options="districts"
                outer-class="flex-1"
              />
              <FormKit
                type="radio"
                name="business_type"
                label="ประเภทธุรกิจ"
                v-model="form.business_type"
                :options="[
                  { label: 'เอกชน', value: 'เอกชน' },
                  { label: 'หน่วยงานรัฐ', value: 'หน่วยงานรัฐ' },
                  { label: 'รัฐวิสาหกิจ', value: 'รัฐวิสาหกิจ' }
                ]"
                validation="required"
                :validation-messages="{
                  required: 'กรุณาเลือกประเภทธุรกิจ'
                }"
              />
            </div>
          </div>
            <div class="form-column">
              <FormKit
                type="textarea"
                name="job_description"
                label="รายละเอียดงาน"
                v-model="form.job_description"
              />
              <FormKit
                type="checkbox"
                name="job_fields"
                label="สาขาวิชา (เลือกได้หลายสาขา)"
                v-model="form.job_fields"
                multiple="true"
                :options="Object.entries(jobFieldsMapping).map(([eng, thai]) => ({
                  value: eng,
                  label: thai
                }))"
              />
              <FormKit
                type="textarea"
                name="benefits"
                label="สวัสดิการ"
                v-model="form.benefits"
              />
            </div>
          </div>
          <div class="form-actions">
          <button
              type="submit"
              class="btn btn-primary w-24"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'กำลังบันทึก...' : (isEditing ? 'บันทึก' : 'เพิ่ม') }}
            </button>
            <button
              type="button"
              class="btn btn-secondary w-24"
              @click="cancelForm"
            >
              ยกเลิก
            </button>
          </div>
        </FormKit>
      </div>
    </div>

    <!-- Import Modal -->
    <div v-if="showImport" class="modal" @click.self="cancelImport">
      <div class="modal-content">
        <span class="close" @click="cancelImport">&times;</span>
        <h3>Import Companies from Excel</h3>
        <input type="file" @change="handleFileUpload" accept=".xlsx, .xls" />
        <button class="btn-primary" @click="importCompanies">Import</button>
        <button class="btn-secondary" @click="cancelImport">Cancel</button>
      </div>
    </div>
  </div>
</template>

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

.btn-success {
  background-color: var(--success-color);
  color: white;
}

.btn-success:hover {
  background-color: var(--highlight-success-color);
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--highlight-primary-color);
}

.btn-danger {
  background-color: var(--error-color);
  color: white;
}

.btn-danger:hover {
  background-color: var(--highlight-error-color);
}

.btn-info {
  background-color: var(--info-color);
  color: white;
}

.btn-info:hover {
  background-color: var(--highlight-info-color);
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

@media (max-width: 768px) {
  .user-actions {
    flex-direction: column;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .table {
    display: block;
    overflow-x: auto;
  }
}

@media (max-width: 480px) {
  .header h1 {
    font-size: 1.5rem;
  }

  .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .table td, .table th {
    padding: 0.75rem;
    font-size: 0.875rem;
  }
}

/* Modal Styles */
.modal-fullscreen {
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
}

.modal-content-horizontal {
  background: white;
  border-radius: var(--border-radius);
  padding: 2rem;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(7, 42, 64, 0.1);
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
  margin-bottom: 1rem;
}

:deep(.formkit-label) {
  color: var(--text-color);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

:deep(.formkit-input) {
  border: 1px solid rgba(7, 42, 64, 0.2);
  border-radius: var(--border-radius);
  padding: 0.5rem;
  width: 100%;
  transition: border-color var(--transition-duration);
}

:deep(.formkit-input:focus) {
  border-color: var(--primary-color);
  outline: none;
}

:deep(.formkit-message) {
  color: var(--error-color);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.search-section {
  margin-bottom: 2rem;
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  background: white;
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 4px rgba(7, 42, 64, 0.1);
}

.search-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(7, 42, 64, 0.1);
}

.search-box {
  width: 100%;
}

:deep(.search-box .formkit-input),
:deep(.formkit-input) {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 2px solid var(--primary-color);
  border-radius: var(--border-radius);
  transition: all 0.3s ease;
  width: 100%;
}

:deep(.search-box .formkit-input:focus),
:deep(.formkit-input:focus) {
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.2);
  outline: none;
}

:deep(.formkit-label) {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

:deep(.formkit-select) {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--primary-color);
  border-radius: var(--border-radius);
  background-color: white;
  cursor: pointer;
}

/* Responsive Design */
@media (max-width: 768px) {
  .company-actions {
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
}
</style>

<script>
import axios from 'axios';
import * as XLSX from 'xlsx';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faPlus,
  faFileImport,
  faEdit,
  faTrash
} from '@fortawesome/free-solid-svg-icons';

library.add(faPlus, faFileImport, faEdit, faTrash);

export default {
  components: {
    FontAwesomeIcon
  },
  data() {
    return {
      companies: [],
      filteredCompanies: [],
      showForm: false,
      showImport: false,
      isEditing: false,
      searchForm: {
        generalSearch: '',
        businessType: '',
        province: '',
        jobField: ''
      },
      errorMessage: '',
      showError: false,
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
      form: {
        comp_id: '',
        thai_name: '',
        english_name: '',
        description: '',
        job_description: '',
        job_fields: '',
        benefits: '',
        address: '',
        province: '',
        district: '',
        business_type: ''
      },
      provinces: [],
      districts: [],
      file: null,
      isSubmitting: false,

    };
  },
  watch: {
    searchForm: {
      handler() {
        this.handleSearch();
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    handleSearch() {
      let filtered = [...this.companies];

      // กรองด้วยการค้นหาทั่วไป
      if (this.searchForm.generalSearch) {
        const query = this.searchForm.generalSearch.toLowerCase();
        filtered = filtered.filter(company =>
          company.comp_id?.toLowerCase().includes(query) ||
          company.thai_name?.toLowerCase().includes(query) ||
          company.english_name?.toLowerCase().includes(query) ||
          company.description?.toLowerCase().includes(query) ||
          company.job_description?.toLowerCase().includes(query) ||
          company.benefits?.toLowerCase().includes(query) ||
          company.address?.toLowerCase().includes(query)
        );
      }

      // กรองตามประเภทธุรกิจ
      if (this.searchForm.businessType) {
        filtered = filtered.filter(company =>
          company.business_type === this.searchForm.businessType
        );
      }

      // กรองตามจังหวัด
      if (this.searchForm.province) {
        filtered = filtered.filter(company =>
          company.province === this.searchForm.province
        );
      }

      // กรองตามสาขาวิชา
      if (this.searchForm.jobField) {
        filtered = filtered.filter(company =>
          Array.isArray(company.job_fields) &&
          company.job_fields.includes(this.searchForm.jobField)
        );
      }

      this.filteredCompanies = filtered;
    },

    resetSearch() {
      this.searchForm = {
        generalSearch: '',
        businessType: '',
        province: '',
        jobField: ''
      };
      this.filteredCompanies = this.companies;
    },

    async handleSubmit() {
        try {
          this.isSubmitting = true;
          this.showError = false;
          this.errorMessage = '';

          // Validate required fields
          if (!this.form.comp_id || !this.form.thai_name || !this.form.english_name || !this.form.business_type) {
            this.errorMessage = 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน';
            this.showError = true;
            return;
          }

          if (this.isEditing) {
            await this.updateCompany();
          } else {
            await this.addCompany();
          }

          // If successful, close form and refresh data
          this.cancelForm();
          await this.fetchCompanies();
        } catch (error) {
          console.error('Error submitting form:', error);
          this.errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
          this.showError = true;
        } finally {
          this.isSubmitting = false;
        }
      },

      async fetchCompanies() {
        try {
          const response = await axios.get('http://localhost:5000/api/companies');
          this.companies = response.data;
          this.filteredCompanies = this.companies;
        } catch (error) {
          console.error('Error fetching companies:', error);
        }
      },
      showAddCompanyForm() {
        this.resetForm();
        this.showForm = true;
        this.isEditing = false;
        this.fetchProvinces();
      },
      editCompany(company) {
        const formData = { ...company };
        // Parse job_fields from JSON string if needed
        if (typeof formData.job_fields === 'string' && formData.job_fields) {
          try {
            formData.job_fields = JSON.parse(formData.job_fields);
          } catch (e) {
            console.error('Error parsing job_fields:', e);
            formData.job_fields = formData.job_fields.split(',').map(field => field.trim());
          }
        }
        this.form = formData;
        this.showForm = true;
        this.isEditing = true;
        this.fetchProvinces().then(() => {
          if (this.form.province) {
            this.loadDistricts();
          }
        });
      },
      async addCompany() {
        try {
          // Validate required fields
          if (!this.form.comp_id || !this.form.thai_name || !this.form.english_name || !this.form.business_type) {
            this.errorMessage = 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน';
            this.showError = true;
            return;
          }

          const formData = { ...this.form };
          // Handle job_fields as array
          if (formData.job_fields) {
            // If it's already an array, use it as is
            if (Array.isArray(formData.job_fields)) {
              formData.job_fields = JSON.stringify(formData.job_fields);
            } else {
              // If it's a string, convert to array then stringify
              formData.job_fields = JSON.stringify(formData.job_fields.split(',').map(field => field.trim()));
            }
          }
          await axios.post('http://localhost:5000/api/companies', formData);
          this.fetchCompanies();
          this.cancelForm();
          this.showError = false;
          this.errorMessage = '';
        } catch (error) {
          console.error('Error adding company:', error);
          this.errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการเพิ่มบริษัท';
          this.showError = true;
        }
      },
      async updateCompany() {
        try {
          // Validate required fields
          if (!this.form.comp_id || !this.form.thai_name || !this.form.english_name || !this.form.business_type) {
            this.errorMessage = 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน';
            this.showError = true;
            return;
          }

          const formData = { ...this.form };
          // Handle job_fields as array
          if (formData.job_fields) {
            // If it's already an array, use it as is
            if (Array.isArray(formData.job_fields)) {
              formData.job_fields = JSON.stringify(formData.job_fields);
            } else {
              // If it's a string, convert to array then stringify
              formData.job_fields = JSON.stringify(formData.job_fields.split(',').map(field => field.trim()));
            }
          }
          await axios.put(`http://localhost:5000/api/companies/${this.form.comp_id}`, formData);
          this.fetchCompanies();
          this.cancelForm();
          this.showError = false;
          this.errorMessage = '';
        } catch (error) {
          console.error('Error updating company:', error);
          this.errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการแก้ไขบริษัท';
          this.showError = true;
        }
      },
      cancelForm() {
        this.showForm = false;
        this.resetForm();
      },


      resetForm() {
        this.form = {
          comp_id: '',
          thai_name: '',
          english_name: '',
          description: '',
          job_description: '',
          job_fields: '',
          benefits: '',
          address: '',
          province: '',
          district: '',
          business_type: ''
        };
      },
      async fetchProvinces() {
        try {
          const response = await axios.get('http://localhost:5000/api/thailand/provinces');
          this.provinces = response.data.map(province => ({
            label: province.name_th,
            value: province.name_th  // เปลี่ยนจาก id เป็นชื่อจังหวัด
          }));
        } catch (error) {
          console.error('Error fetching provinces:', error);
        }
      },
      async loadDistricts() {
        try {
          if (!this.form.province) {
            // ถ้าไม่มีการเลือกจังหวัด ให้แสดงเขต/อำเภอทั้งหมด
            const response = await axios.get('http://localhost:5000/api/thailand/all-districts');
            this.districts = response.data.map(district => ({
              label: district.name_th,
              value: district.name_th
            }));
            return;
          }

          // หา province ID จากชื่อจังหวัด
          const provinceResponse = await axios.get('http://localhost:5000/api/thailand/provinces');
          const province = provinceResponse.data.find(p => p.name_th === this.form.province);

          if (!province) {
            console.error('Province not found');
            this.districts = [];
            return;
          }

          // ใช้ ID เพื่อดึงข้อมูลเขต/อำเภอของจังหวัดที่เลือก
          const response = await axios.get(`http://localhost:5000/api/thailand/districts/${province.id}`);
          this.districts = response.data.map(district => ({
            label: district.name_th,
            value: district.name_th
          }));
        } catch (error) {
          console.error('Error fetching districts:', error);
          this.districts = [];
        }
      },
      handleFileUpload(event) {
        this.file = event.target.files[0];
      },
      async importCompanies() {
        if (!this.file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          const headers = jsonData[0];
          const companiesData = jsonData.slice(1).map(row => {
            let company = {};
            headers.forEach((header, index) => {
              const value = row[index];
              if (header === 'job_fields' && value) {
                // แปลงค่า job_fields เป็น array
                company[header] = value.toString().split(',').map(field => field.trim());
              } else {
                company[header] = value || '';
              }
            });
            return company;
          });

          if (confirm('Are you sure you want to import these companies?')) {
            this.sendCompaniesToServer(companiesData);
          }
        };
        reader.readAsArrayBuffer(this.file);
      },

    async sendCompaniesToServer(companiesData) {
      try {
        // Format the data before sending
        const formattedData = companiesData.map(company => ({
          ...company,
          job_fields: Array.isArray(company.job_fields)
            ? JSON.stringify(company.job_fields)
            : JSON.stringify(company.job_fields ? company.job_fields.split(',').map(field => field.trim()) : []),
          job_description: company.job_description || '',
          benefits: company.benefits || '',
          business_type: company.business_type || ''
        }));

        await axios.post('http://localhost:5000/api/companies/import', { companies: formattedData });
        this.fetchCompanies();
        alert('Companies imported successfully!');
      } catch (error) {
        console.error('Error importing companies:', error);
      }
    },

    async confirmDelete(compId) {
      if (confirm('คุณต้องการลบสถานประกอบการนี้ใช่หรือไม่?')) {
        try {
          await axios.delete(`http://localhost:5000/api/companies/${compId}`);
          // Remove company from local state
          this.companies = this.companies.filter(company => company.comp_id !== compId);
          this.filteredCompanies = this.filteredCompanies.filter(company => company.comp_id !== compId);
          alert('ลบสถานประกอบการสำเร็จ');
        } catch (error) {
          console.error('Error deleting company:', error);
          alert('เกิดข้อผิดพลาดในการลบสถานประกอบการ');
        }
      }
    },
      filterCompanies() {
        const query = this.searchQuery.toLowerCase();
        this.filteredCompanies = this.companies.filter(company => {
          const jobFields = Array.isArray(company.job_fields)
            ? company.job_fields.join(', ').toLowerCase()
            : (company.job_fields || '').toLowerCase();

          return (
            company.comp_id.toLowerCase().includes(query) ||
            company.thai_name.toLowerCase().includes(query) ||
            company.english_name.toLowerCase().includes(query) ||
            company.description.toLowerCase().includes(query) ||
            (company.job_description || '').toLowerCase().includes(query) ||
            jobFields.includes(query) ||
            (company.benefits || '').toLowerCase().includes(query) ||
            company.address.toLowerCase().includes(query) ||
            company.province.toLowerCase().includes(query) ||
            company.district.toLowerCase().includes(query) ||
            company.business_type.toLowerCase().includes(query) ||
            company.position.toLowerCase().includes(query)
          );
        });
      },
      showImportModal() {
        this.showImport = true; 
      },
      cancelImport() {
        this.showImport = false;
        this.file = null;
      }
  },
  mounted() {
    this.fetchCompanies();
  }
};
</script>
  
<style scoped>
h1{
  color: var(--primary-color);
}
.header {
  margin-bottom: var(--gap);
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 10px;
  margin: 10px 0;
  border-radius: 4px;
  border: 1px solid #ef9a9a;
}

.container {
  padding: var(--padding);
  background-color: var(--background-color);
  margin-top: 20px;
}

.company-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: var(--gap);
}

.company-table th, .company-table td {
  border: 1px solid #ccc;
  padding: var(--padding);
  text-align: left;
}

.company-table th {
  background-color: var(--primary-color);
  color: #fff;
}

.company-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.company-table tr:hover {
  background-color: var(--highlight-accent-color);
}

.modal-fullscreen {
  display: flex;
  position: fixed;
  z-index: 1000;
  left: 0;
  /* เปลี่ยนจาก top: 0 เป็น top: 64px (หรือความสูงของ NavBar) */
  top: 64px; /* ปรับตามความสูงจริงของ NavBar */
  width: 100%;
  /* ปรับความสูงให้เหลือพื้นที่สำหรับ NavBar */
  height: calc(100vh - 64px);
  background-color: rgba(0,0,0,0.4);
  justify-content: center;
  align-items: center;
}

.modal-content-horizontal {
  background-color: #fefefe;
  width: 95%;
  max-height: calc(90vh - 64px);
  padding: 20px;
  border-radius: var(--border-radius);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}


.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    overflow-y: auto;
    padding: 20px;
    flex: 1;
  }

.form-column {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.form-row :deep(.formkit-outer) {
  flex: 1;
}

.form-row :deep(.formkit-input) {
  width: 100%;
}

/* Add margin between form rows */
.form-row + .form-row {
  margin-top: 15px;
}

/* Ensure labels align properly */
.form-row :deep(.formkit-label) {
  margin-bottom: 8px;
  display: block;
}

/* Style the select dropdowns */
.form-row :deep(select.formkit-input) {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

/* Add hover effect to inputs */
.form-row :deep(.formkit-input:hover) {
  border-color: var(--primary-color);
}

/* Add focus effect to inputs */
.form-row :deep(.formkit-input:focus) {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #eee;
}

/* FormKit custom styles */
:deep(.formkit-outer) {
  margin-bottom: 15px;
}

:deep(.formkit-label) {
  font-weight: 500;
  margin-bottom: 5px;
  color: var(--primary-color);
}

:deep(.formkit-input) {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  font-size: 14px;
}

:deep(.formkit-input:focus) {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
}

:deep(.formkit-messages) {
  color: var(--error-color);
  font-size: 12px;
  margin-top: 4px;
}

:deep(.formkit-input[type="submit"]) {
  background-color: var(--primary-color);
  color: white;
  cursor: pointer;
  border: none;
  padding: 10px 20px;
  border-radius: var(--border-radius);
}

:deep(.formkit-input[type="button"]) {
  background-color: var(--secondary-color);
  color: white;
  cursor: pointer;
  border: none;
  padding: 10px 20px;
  border-radius: var(--border-radius);
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover, .close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

.action-btn {
  padding: 8px 16px;
  font-size: 14px;
  margin-right: 5px;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
}

.action-btn-edit {
  background-color: var(--secondary-color);
  color: white;
}

.action-btn-edit:hover {
  background-color: #64b5f6;
}

.action-btn-delete {
  background-color: var(--error-color);
  color: white;
}

.action-btn-delete:hover {
  background-color: #ff7272;
}

input[type="text"],
input[type="password"],
select {
  width: 100%;
  padding: 10px;
  margin-bottom: var(--gap);
  border: 1px solid #ccc;
  border-radius: var(--border-radius);
  box-sizing: border-box;
}

input:focus,
select:focus {
  border-color: var(--primary-color);
  outline: none;
}

.import-input {
  width: 300px;
}

.import {
  display: flex;
  align-items: center;
}

.company-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--gap);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--highlight-primary-color);
  transform: translateY(-1px);
}

.import-action {
  margin-left: 1rem;
}

.import-action:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
  transform: none;
}

.import-input {
  margin-right: var(--gap);
  padding: 10px;
  border: 1px solid #dee2e6;
  border-radius: var(--border-radius);
  box-sizing: border-box;
  flex-grow: 1;
  transition: all 0.2s ease;
}

@media (max-width: 768px) {
  .company-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .single-company-create,
  .import-section {
    flex-direction: column;
    align-items: stretch;
  }

  .modal-content {
    width: 95%;
  }
}

@media (max-width: 480px) {
  .container {
    margin-top: 50px;
    padding: 10px;
  }

  .company-table th,
  .company-table td {
    padding: 8px;
    font-size: 14px;
  }

  .btn,
  .action-btn {
    padding: 8px 16px;
    font-size: 14px;
  }
}
</style>