<template>
  <div class="h-100">
    <h3 class="text-lg font-semibold mb-4 text-uppercase text-muted mb-1">จำนวนการเข้าชมสถานประกอบการการ (3 วันล่าสุด)</h3>
    <div class="table-container">
      <table class="min-w-full table-fixed">
        <thead class="bg-white sticky top-0">
          <tr class="bg-gray-50">
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เลขทะเบียน</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อบริษัท (ไทย)</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อบริษัท (อังกฤษ)</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนการเข้าชม</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="company in companyViews" :key="company.comp_id">
            <td class="px-6 py-4 whitespace-nowrap">{{ company.comp_id }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ company.thai_name }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ company.english_name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                {{ company.company_views }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      companyViews: []
    }
  },
  async created() {
    await this.fetchCompanyViews();
  },
  methods: {
    async fetchCompanyViews() {
      try {
        const response = await axios.get('http://localhost:5000/api/company-views', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          params: {
            days: 3 // จำนวนวันย้อนหลัง
          }
        });
        this.companyViews = response.data;
      } catch (error) {
        console.error('Error fetching company views:', error);
      }
    }
  }
}
</script>

<style scoped>
.table-container {
  max-height: 500px;
  overflow-y: auto;
  overflow-x: auto;
  position: relative;
}

thead {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: white;
}
</style>