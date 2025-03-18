<template>
    <div class="container">
      <div class="header">
        <h1>ข้อมูลนักศึกษาสหกิจศึกษา</h1>
      </div>
      <div class="user-actions">
        <div class="action-section">
          <div class="search-section">
            <input type="text" v-model="searchQuery" placeholder="ค้นหานักศึกษา..." class="form-control" />
            <button class="btn btn-primary" @click="filterStudents">
              <font-awesome-icon :icon="['fas', 'search']" /> ค้นหา
            </button>
            <button class="btn btn-danger" @click="clearFilter">
              <font-awesome-icon :icon="['fas', 'times']" /> ล้าง
            </button>
          </div>
        </div>
        <div class="action-section">
          <div class="search-result">
            <p class="student-count">ผลการค้นหาจำนวน {{ filteredStudents.length }} คน</p>
          </div>
          <button class="btn btn-success" @click="exportToExcel">
            <font-awesome-icon :icon="['fas', 'file-export']" /> Export as Excel
          </button>
        </div>
      </div>
      <table class="table table-striped">
        <thead class="thead-dark">
          <tr>
            <th>รหัสประจำตัวนักศึกษา</th>
            <th>ชื่อ - สกุล</th>
            <th>สาขา</th>
            <th>ความพร้อม</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in filteredStudents" :key="student.student_id">
            <td>{{ student.student_id }}</td>
            <td>{{ student.first_name }} {{ student.last_name }}</td>
            <td>{{ student.major }}</td>
            <td :class="coopReadyClass(student.coop_ready)">
              {{ coopReadyText(student.coop_ready) }}
            </td>
          </tr>
        </tbody>
      </table>
  

    </div> 
</template>
  
<script>
  import axios from 'axios';
  import * as XLSX from 'xlsx';
  import { library } from '@fortawesome/fontawesome-svg-core';
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
  import {
    faSearch,
    faTimes,
    faFileExport
  } from '@fortawesome/free-solid-svg-icons';

  library.add(faSearch, faTimes, faFileExport);

  export default {
    components: {
      FontAwesomeIcon
    },
    data() {
      return {
        students: [],
        searchQuery: '',
        filteredStudents: []
      };
    },
    computed: {
      coopReadyText() {
        return (status) => {
          if (status === 'in progress') {
            return 'อยู่ในกระบวนการเลือกสถานประกอบการ';
          } else if (status === 'completed') {
            return 'สถานประกอบการและนักศึกษาตอบรับการเข้าฝึกสหกิจแล้ว';
          }
          return '';
        };
      }
    },
    methods: {
      async fetchStudents() {
        try {
          const response = await axios.get('http://localhost:5000/api/students', {
            withCredentials: true
          });
          this.students = response.data;
          this.filteredStudents = this.students;
        } catch (error) {
          console.error('Error fetching students:', error);
          if (error.response && error.response.status === 401) {
            this.$router.push('/login');
          }
        }
      },
      coopReadyClass(status) {
        if (status === 'in progress') {
          return 'coop-not-ready';
        } else if (status === 'completed') {
          return 'coop-ready';
        }
        return '';
      },
      filterStudents() {
        const query = this.searchQuery.toLowerCase();
        this.filteredStudents = this.students.filter(student => {
          const studentId = student.student_id ? student.student_id.toString().toLowerCase() : '';
          const firstName = student.first_name ? student.first_name.toLowerCase() : '';
          const lastName = student.last_name ? student.last_name.toLowerCase() : '';
          const major = student.major ? student.major.toLowerCase() : '';
          const fullName = `${firstName} ${lastName}`;

          return (
            studentId.includes(query) ||
            fullName.includes(query) ||
            major.includes(query)
          );
        });
      },
      clearFilter() {
        this.searchQuery = ''; // Clear the search query
        this.filteredStudents = this.students; // Reset to show all students
      },

      
      exportToCSV() {
        const headers = ['Student_ID', 'Student Name', 'Major', 'Coop Ready'];
        const rows = this.filteredStudents.map(student => [
          student.student_id,
          `${student.first_name} ${student.last_name}`,
          student.major,
          student.coop_ready
        ]);

        const csvContent = [
          '\uFEFF', // Add BOM for UTF-8 encoding
          headers.join(','), // Add headers
          ...rows.map(row => row.join(',')) // Add data rows
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'students.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      exportToExcel() {
        const headers = ['รหัสนักศึกษา', 'ชื่อ - สกุล', 'สาขา', 'ความพร้อม'];
        const data = this.filteredStudents.map(student => [
          student.student_id,
          `${student.first_name} ${student.last_name}`,
          student.major,
          this.coopReadyText(student.coop_ready)
        ]);

        // Create a new workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

         // Define styles
        const redFill = { fill: { fgColor: { rgb: "FF0000" } } }; // Red
        const greenFill = { fill: { fgColor: { rgb: "00FF00" } } }; // Green

        // Apply styles to the "Coop Ready" column
        data.forEach((row, index) => {
          const cellAddress = `D${index + 2}`; // Assuming "Coop Ready" is in column D
          const cell = ws[cellAddress];
          if (cell) {
            if (row[3] === 'ยังไม่มีสถานประกอบการ') {
              cell.s = redFill;
            } else if (row[3] === 'มีสถานประกอบการแล้ว') {
              cell.s = greenFill;
            }
          }
        });

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Students');

        // Get current date and time
        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
        const formattedTime = `${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;
        const fileName = `student_${formattedDate}_${formattedTime}.xlsx`;

        // Generate Excel file and trigger download
        XLSX.writeFile(wb, fileName);
      }      
    },
    mounted() {
      this.fetchStudents();
    }
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
  display: flex;
  align-items: center;
  gap: 1rem;
}

.action-section:first-child {
  flex: 2;
}

.action-section:last-child {
  flex: 1;
  justify-content: flex-end;
}

.search-section {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  width: 100%;
}

.search-section .form-control {
  flex: 1;
  min-width: 200px;
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: var(--border-radius);
}

.search-result {
  display: flex;
  align-items: center;
  margin-right: 1rem;
}

.student-count {
  font-size: 0.875rem;
  color: #6c757d;
  margin: 0;
  white-space: nowrap;
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

.coop-not-ready {
  color: var(--error-color);
}

.coop-ready {
  color: var(--success-color);
}

.btn-danger{
  background-color: var(--error-color);
}

.btn-danger:hover{
  background-color: var(--highlight-error-color);
}


/* Responsive Design */
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

  .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .table td, .table th {
    padding: 0.75rem;
    font-size: 0.875rem;
  }
}
</style>
  