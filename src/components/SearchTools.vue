<template>
  <div class="app">
    <!-- Search Tools -->
    <header class="search-tools fixed-search-bar">
      <div class="contain-all">
        <!-- Header Text -->
        <h1 class="search-header">ค้นหาสถานประกอบการ</h1>
        <FormKit 
          type="form" 
          @submit="emitSearch" 
          class="formkit-container"
        >
          <div class="form-group-inline">
            <div class="form-group">
              <FormKit
                label="คีย์เวิร์ด"
                type="text"
                placeholder="ระบุคีย์เวิร์ด"
                class="text-field"
                v-model="searchTerm1"
                input-class="bg-white text-black"
                label-class="text-white"
              />
            </div>

            <!-- จังหวัด dropdown with multiple selection -->
            <div class="form-group">
              <label for="province" class="formkit-label text-white">จังหวัด</label>
              <div class="multi-select">
                <div class="select-box" @click="toggleProvinceDropdown">
                  <div class="selected-tags">
                    <span v-for="province in selectedProvinces" :key="province" class="tag">
                      {{ province }}
                      <button @click.stop="removeProvinceTag(province)" class="clear-button">×</button>
                    </span>
                    <div v-if="selectedProvinces.length === 0" class="placeholder formkit-input bg-white text-black">เลือกจังหวัด...</div>
                  </div>
                  <span class="arrow">▼</span>
                </div>

                <!-- Dropdown -->
                <div v-if="showProvinceDropdown" class="dropdown">
                  <FormKit
                    type="checkbox"
                    :options="provinceOptions"
                    v-model="selectedProvinces"
                  />
                </div>
              </div>
            </div>

            <!-- เขต dropdown with multiple selection -->
            <div class="form-group">
              <label for="district" class="formkit-label text-white">อำเภอ/เขต</label>
              <div class="multi-select">
                <div class="select-box"
                     @click="handleDistrictClick"
                     :class="{ 'disabled': selectedProvinces.length === 0 }">
                  <div class="selected-tags">
                    <span v-for="district in selectedDistricts" :key="district" class="tag">
                      {{ district }}
                      <button @click.stop="removeDistrictTag(district)">×</button>
                    </span>
                    <div v-if="selectedDistricts.length === 0" class="placeholder formkit-input bg-white text-black">
                      {{ selectedProvinces.length === 0 ? 'กรุณาเลือกจังหวัดก่อน' : 'เลือกอำเภอ/เขต' }}
                    </div>
                  </div>
                  <span class="arrow" :class="{ 'disabled': selectedProvinces.length === 0 }">▼</span>
                </div>

                <!-- Dropdown -->
                <div v-if="showDistrictDropdown && selectedProvinces.length > 0" class="dropdown">
                  <FormKit
                    type="checkbox"
                    :options="districtOptions"
                    v-model="selectedDistricts"
                  />
                </div>
              </div>
            </div>


            <!-- สาขา dropdown -->
            <div class="form-group">
              <FormKit
                type="select"
                label="สาขาวิชา"
                v-model="selectedMajor"
                :options="Object.entries(jobFieldsMapping).map(([code, name]) => ({
                  label: name,
                  value: code
                }))"
                placeholder="เลือกสาขาวิชา"
                input-class="formkit-input bg-white"
                label-class="text-white"
              />
            </div>

            <div class="form-group last-form-group">
              <div class="search-action-btn">
                <button type="submit" class="btn btn-amber btn-block mt-3 btn-search">
                  <font-awesome-icon :icon="['fas', 'magnifying-glass']" /> ค้นหา
                </button>
              </div>
              <div class="search-action-btn">
                <button type="button" class="btn btn-amber btn-block mt-3 btn-clear" @click="clearFilters">
                  <font-awesome-icon :icon="['fas', 'times-circle']" /> ล้าง
                </button>
              </div>
            </div>
          </div>
          <template #submit></template>
        </FormKit>
      </div>
    </header>
  </div>
</template>

<script>
import UserService from '@/UserService';
import axios from 'axios';
export default {
  data() {
    return {
      searchTerm1: '',
      selectedProvinces: [],
      selectedDistricts: [],
      selectedMajor: '',
      provinceOptions: [],
      districtOptions: [],
      showProvinceDropdown: false,
      showDistrictDropdown: false,
      allCompanies: [], // เก็บข้อมูลบริษัททั้งหมด
      filteredCompanies: [], // เก็บข้อมูลบริษัทที่ผ่านการกรอง
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
      }
    };
  },
  methods: {
    async fetchProvinces() {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5000/api/thailand/provinces', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.provinceOptions = response.data.map(province => ({
          label: province.name_th,
          value: province.name_th
        }));
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    },

    async loadDistricts(provinces) {
      if (!provinces || provinces.length === 0) {
        this.districtOptions = [];
        return;
      }
      try {
        const token = localStorage.getItem('authToken');
        // ดึงข้อมูลจังหวัดทั้งหมด
        const provinceResponse = await axios.get('http://localhost:5000/api/thailand/provinces', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // สร้าง array เพื่อเก็บ Promise ของการดึงข้อมูลเขต/อำเภอ
        const districtPromises = [];

        // วนลูปผ่านแต่ละจังหวัดที่เลือก
        for (const province of provinces) {
          const provinceData = provinceResponse.data.find(p => p.name_th === province);
          if (provinceData) {
            // เพิ่ม Promise การดึงข้อมูลเขต/อำเภอลงใน array
            districtPromises.push(
              axios.get(`http://localhost:5000/api/thailand/districts/${provinceData.id}`, {
                headers: { Authorization: `Bearer ${token}` }
              })
            );
          }
        }

        // รอให้ทุก Promise เสร็จสิ้น
        const responses = await Promise.all(districtPromises);

        // รวมข้อมูลเขต/อำเภอจากทุกจังหวัด
        let allDistricts = [];
        responses.forEach(response => {
          const districts = response.data.map(district => {
            // ลบคำว่า "เขต" และ "อำเภอ" ออกจากชื่อ
            const districtName = district.name_th
              .replace(/^เขต/, '')  // ลบคำว่า "เขต" ที่อยู่ข้างหน้า
              .replace(/^อำเภอ/, '') // ลบคำว่า "อำเภอ" ที่อยู่ข้างหน้า
              .trim();  // ลบช่องว่างที่อาจเหลืออยู่

            return {
              label: districtName,
              value: districtName
            };
          });
          allDistricts = [...allDistricts, ...districts];
        });

        // กำจัดข้อมูลซ้ำ (ถ้ามี)
        this.districtOptions = Array.from(new Map(allDistricts.map(item =>
          [item.value, item])).values());

      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    },

    selectCompany(index) {
      this.selectedIndex = index;
    },
    async fetchCompany() {
      try {
        const response = await UserService.getCompany();
        this.allCompanies = response.data;
        this.filteredCompanies = [...this.allCompanies]; // Initialize with all companies
        // ไม่ต้อง filter ตอนโหลดข้อมูล รอให้ผู้ใช้กดปุ่มค้นหาเอง
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    },

    filterCompanies() {
      // ถ้าไม่มีข้อมูลบริษัท ให้ return ออกไปเลย
      if (!this.allCompanies || this.allCompanies.length === 0) return;

      this.filteredCompanies = this.allCompanies.filter(company => {
        // กรองตามคีย์เวิร์ด (ชื่อบริษัท, รายละเอียด, ที่อยู่)
        const searchTerm = this.searchTerm1.toLowerCase();
        const matchesKeyword = !this.searchTerm1 || [
          company.thai_name,
          company.english_name,
          company.description,
          company.address,
          company.business_type
        ].some(field => field && field.toLowerCase().includes(searchTerm));

        // กรองตามจังหวัด
        const matchesProvince = this.selectedProvinces.length === 0 ||
          (company.province && this.selectedProvinces.includes(company.province));

        // กรองตามเขต/อำเภอ
        const matchesDistrict = this.selectedDistricts.length === 0 ||
          (company.district && this.selectedDistricts.includes(company.district));

        // กรองตามสาขา
        let matchesMajor = true;
        if (this.selectedMajor) {
          try {
            const companyFields = typeof company.job_fields === 'string'
              ? JSON.parse(company.job_fields)
              : (Array.isArray(company.job_fields) ? company.job_fields : []);
            matchesMajor = companyFields.includes(this.selectedMajor);
          } catch (error) {
            console.error('Error parsing job_fields:', error);
            matchesMajor = false;
          }
        }

        return matchesKeyword && matchesProvince && matchesDistrict && matchesMajor;
      });

      // ส่งผลลัพธ์ที่กรองแล้วไปให้ parent component
      this.$emit('filtered-results', this.filteredCompanies);
    },
    clearFilters() {
      this.searchTerm1 = '';
      this.selectedProvinces = [];
      this.selectedDistricts = [];
      this.selectedMajor = '';
      // ล้างค่าและกรองข้อมูลใหม่
      this.emitSearch();
    },




    toggleProvinceDropdown() {
      this.showProvinceDropdown = !this.showProvinceDropdown;
    },
    toggleDistrictDropdown() {
      this.showDistrictDropdown = !this.showDistrictDropdown;
    },
    handleDistrictClick() {
      if (this.selectedProvinces.length > 0) {
        this.toggleDistrictDropdown();
      }
    },
    removeProvinceTag(province) {
      this.selectedProvinces = this.selectedProvinces.filter(p => p !== province);
      // เมื่อลบจังหวัดออก ให้โหลดข้อมูลเขตใหม่
      if (this.selectedProvinces.length > 0) {
        this.loadDistricts(this.selectedProvinces);
      } else {
        this.districtOptions = [];
        this.selectedDistricts = [];
      }
    },
    removeDistrictTag(district) {
      this.selectedDistricts = this.selectedDistricts.filter(d => d !== district);
    },
    handleProvinceChange() {
      // เมื่อเลือกจังหวัด ให้โหลดข้อมูลเขตของทุกจังหวัดที่เลือก
      if (this.selectedProvinces.length > 0) {
        this.loadDistricts(this.selectedProvinces);
      } else {
        this.districtOptions = [];
        this.selectedDistricts = [];
      }
    },
    emitSearch() {
      this.filterCompanies(); // กรองข้อมูลเมื่อกดปุ่มค้นหา
      this.$emit('search-submitted'); // ส่ง event แจ้งว่ามีการค้นหา
      return false; // ป้องกันการ submit form
    },
  },
  mounted() {
    this.fetchProvinces();
    this.fetchCompany(); // ดึงข้อมูลบริษัทเมื่อ component ถูกโหลด
  },
  watch: {
    selectedProvinces: {
      handler() {
        this.handleProvinceChange();
      },
      deep: true
    }
  }
};
</script>

<style scoped>
/* Styles for multi-select component */
.multi-select {
  position: relative;
  width: 100%;
  max-width: 100%;
}

.clear-button {
  color: white;
  padding: 4px 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.select-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  background-color: white;
  transition: all 0.3s ease;
  min-height: 42px;
  gap: 8px;
}

.select-box.disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
  border-color: #ddd;
}

.arrow.disabled {
  opacity: 0.5;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.btn-search{
  background-color: var(--accent-color);
}

.btn-search:hover{
  background-color: var(--highlight-accent-color);
  color: black;
}

.btn-clear {
  background-color: var(--error-color);
}
.btn-clear:hover {
  background-color: var(--highlight-error-color);
  color: black;
}


.tag {
  background: var(--secondary-color);
  padding: 5px 10px;
  border-radius: 15px;
  display: flex;
  align-items: center;
}

.tag button {
  background: none;
  border: none;
  margin-left: 5px;
  cursor: pointer;
}

.placeholder {
  color: #666666;
  background: none;
  padding: 0;
  border: none;
  width: 100%;
}

.placeholder:hover {
  cursor: pointer;
}

.select-box.disabled .placeholder {
  color: #999999;
  cursor: not-allowed;
}
.arrow {
  margin-left: auto;
  color: var(--primary-color);
}

.dropdown {
  position: absolute;
  width: 100%;
  background: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-top: 5px;
  z-index: 2002;
  max-height: 150px;
  overflow-y: auto;
}

.dropdown-item {
  padding: 8px;
  cursor: pointer;
}

.dropdown-item label {
  display: flex;
  align-items: center;
}

.dropdown-item input {
  margin-right: 8px;
}
.last-form-group{
  display: flex;
  gap: 10px;
}

/* Styles for the search form */
.fixed-search-bar {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(135deg, var(--secondary-color) 0%, var(--primary-color) 100%);
  z-index: 2000;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: -webkit-fill-available;
}

.contain-all {
  width: 100%;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.justify-center {
  width: 100%;
}


.form-group-inline {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: white;
  font-weight: bold;
  width: 100%;
  padding: 0 20px;
}

.form-group-inline .form-group:first-child {
  flex: 3;
}

.form-group-inline .form-group:nth-child(2), .form-group:nth-child(3){
  flex: 2;
}

.form-group-inline .form-group:last-child {
  
  place-self: flex-end;
  margin-bottom: 16px;
}

.input-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: flex-start;
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin: -5px 0 0 -5px;
}

.col {
  flex: 1;
  padding: 5px;
  box-sizing: border-box;
  min-width: 0;
}

.text-field {
  flex: 1;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: border-color 0.3s;
}

.text-field:focus {
  border-color: var(--highlight-color);
  outline: none;
}

.center-inputs {
  display: flex;
  justify-content: center;
  align-items: center;
}


.search-header {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
}

h1 {
  color: white;
}

.formkit-container {
  background-color: white;
  padding: 20px;
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Style for select dropdown arrow */
.formkit-input[type="select"] {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.7rem center;
  background-size: 1em;
  padding-right: 2.5em;
}

/* Responsive styles for smaller screens */
@media (max-width: 768px) {
  .fixed-search-bar {
    max-width: 100%;
    padding: 10px 5px;
  }

  .contain-all {
    padding: 5px;
  }

  .form-group-inline {
    flex-direction: column;
    gap: 15px;
    padding: 10px 5px;
  }

  .form-group-inline .form-group {
    width: 100%;
    flex: none !important;
  }

  .form-group-inline .form-group:last-child {
    margin-bottom: 0;
  }

  .multi-select {
    width: 100%;
  }

  .select-box {
    min-height: 44px; /* ขนาดที่เหมาะสมสำหรับการแตะบนมือถือ */
  }

  .dropdown {
    max-height: 200px;
  }

  .search-header {
    font-size: 20px;
    margin-bottom: 15px;
  }

  .last-form-group {
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    gap: 10px;
  }

  .search-action-btn {
    flex: 1;
  }



  .tag {
    padding: 8px 12px;
    margin: 2px;
  }

  .tag button {
    padding: 4px 8px;
  }

  .formkit-container {
    padding: 15px 10px;
  }
}
</style>
