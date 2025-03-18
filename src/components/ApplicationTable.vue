<template>
  <div class="application-details">
    <h1>ข้อมูลการสมัครออกฝึกสหกิจ</h1>
    
    <div class="company-header">
      <h2>{{ companyDetails.thaiName }}<br>({{ companyDetails.englishName }})</h2>
      <p>{{ companyDetails.address }}</p>
    </div>
    <h3>ข้อมูลนักศึกษา</h3>
    
      <div class="filter-container">
      <div class="filter-con-left">
        <button @click="exportCoverLetter" class="btn export-button">Export Cover Letter</button>
        <button @click="exportDocuments" class="btn export-button">Download Documents</button>
      </div>
      <div class="div-filter-con-right">
        <label for="statusFilter" >สถานะ </label>
        <select id="statusFilter" v-model="selectedStatus" @change="filterApplications">
          <option value="">All</option>
          <option v-for="(label, status) in statusTranslations" :key="status" :value="status">
            {{ label }}
          </option>
        </select>
        <button class="btn status-description-btn" @click="showStatusDetails = true">คำอธิบายสถานะ</button>
      </div>

    </div>


    <!-- Status Details Modal -->
    <div v-if="showStatusDetails" class="modal-overlay" @click="closeStatusDetails">
      <div class="modal-content" @click.stop>
        <div class="status-details">
          <p>สถานะการสมัครมีรายละเอียดดังนี้:</p>
          <ul>
            <li><strong class="status-in-progress">1. กำลังดำเนินการ:</strong> การสมัครของนักศึกษาอยู่ในขั้นตอนการพิจารณา และดำเนินการ</li>
            <li><strong class="status-ready">2. มีสิทธิ์สัมภาษณ์:</strong> นักศึกษามีสิทธิ์เข้าร่วมการสัมภาษณ์</li>
            <li><strong class="status-disqualified">3.หมดสิทธิ์:</strong> นักศึกษาไม่มีสิทธิ์เข้าร่วมการสัมภาษณ์</li>
            <li><strong class="status-passed">4. ผ่านการสัมภาษณ์:</strong> นักศึกษาผ่านการสัมภาษณ์เรียบร้อยแล้ว</li>
            <li><strong class="status-eliminated">5. ไม่ผ่านการสัมภาษณ์:</strong> นักศึกษาไม่ผ่านการสัมภาษณ์</li>
            <li><strong class="status-confirmed">6. ยืนยัน:</strong> นักศึกษาได้ยืนยันเข้ารับการฝึกสหกิจ ณ สถานประกอบการนั้นๆ</li>
            <li><strong class="status-withdrawn">7. สละสิทธิ์:</strong> นักศึกษาสละสิทธิ์เข้ารับการฝึกสหกิจ ณ สถานประกอบการนั้นๆ</li>
          </ul>
        </div>
        <button class="btn" @click="closeStatusDetails">Close</button>
      </div>
    </div>

    
    <div v-if="applications.length === 0" class="no-data-message">
      ไม่มีข้อมูลการสมัครของนักศึกษา
    </div>

    <div v-else class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>รหัสนักศึกษา</th>
            <th>ชื่อ - สกุล</th>
            <th>ที่อยู่ปัจจุบัน</th>
            <th>อีเมล์</th>
            <th>เบอร์โทรศัพท์</th>
            <th>สาขา</th>
            <th>เกรดเฉลี่ยรวม</th>
            <th>เรซูเม่</th>
            <th>ทรานสคิปต์</th>
            <th>สถานะ</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="application in filteredApplications" :key="application.application_id">
            <td>{{ application.student_id }}</td>
            <td>{{ application.first_name }} {{ application.last_name }}</td>
            <td>{{ application.address }}</td>
            <td>{{ application.email }}</td>
            <td>{{ application.phone }}</td>
            <td>{{ application.major }}</td>
            <td>{{ application.GPA }}</td>
            <td>
              <a v-if="application.resume" :href="`http://localhost:5000/files/${application.resume}`" target="_blank" download>Download</a>
            </td>
            <td>
              <a v-if="application.transcript" :href="`http://localhost:5000/files/${application.transcript}`" target="_blank" download>Download</a>
            </td>
            <td>{{ statusTranslations[application.status] || application.status }}</td>
            <td>
              <div v-if="application.status === 'in progress'">
                <button @click="updateStatus(application.application_id, 'ready')">มีสิทธิ์สัมภาษณ์</button>
                <button @click="updateStatus(application.application_id, 'disqualified')">หมดสิทธิ์</button>
              </div>
              <div v-else-if="application.status === 'ready'">
                <button @click="updateStatus(application.application_id, 'passed')">ผ่านการสัมภาษณ์</button>
                <button @click="updateStatus(application.application_id, 'eliminated')">ไม่ผ่านการสัมภาษณ์</button>
              </div>
              <div v-else>
                <p>No Action Needed</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';


export default {
  data() {
    return {
      applications: [],
      filteredApplications: [],
      selectedStatus: '',
      companyDetails: {
        compId: '',
        thaiName: '',
        englishName: '',
        address: ''
      },
      universityInfo: {
        name: 'มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี',
        address: '39 หมู่ที่ 1 ตำบลคลองหก อำเภอคลองหลวง จังหวัดปทุมธานี 12120',
        department: 'ฝ่ายสหกิจศึกษาคณะวิทยาศาสตร์และเทคโนโลยี',
        contact: 'อีเมล: scitech@rmutt.ac.th / โทร: 02-549-4150',
        coordinator: {
          name: 'ชื่อ - นามสกุล',
          position: 'หัวหน้าฝ่ายสหกิจศึกษา'
        }
      },
      statusTranslations: {
        'in progress': 'กำลังดำเนินการ',
        'ready': 'มีสิทธิ์สัมภาษณ์',
        'disqualified': 'หมดสิทธิ์',
        'passed': 'ผ่านการสัมภาษณ์',
        'eliminated': 'ไม่ผ่านการสัมภาษณ์',
        'confirmed': 'ยืนยัน',
        'withdrawn': 'สละสิทธิ์'
      },
      showStatusDetails: false,
    };
  },
  methods: {
    closeStatusDetails() {
      this.showStatusDetails = false;
    },
    async fetchApplications(compId) {
      try {
        const response = await axios.get(`http://localhost:5000/applications/company/${compId}`, {
          withCredentials: true
        });
        this.applications = response.data;
        this.filterApplications();
        console.log('Fetched applications:', response.data);
      } catch (error) {
        console.error('Error fetching applications:', error);
        alert('เกิดข้อผิดพลาดในการดึงข้อมูลการสมัคร');
      }
    },
    updateStatus(applicationId, status) {
      axios.put(`http://localhost:5000/applications/${applicationId}`, { status }, {
        withCredentials: true
      })
      .then(() => {
        const application = this.applications.find(app => app.application_id === applicationId);
        if (application) {
          application.status = status;
        }
      })
      .catch(error => {
        console.error('Error updating application status:', error);
      });
    },




    async fetchFileBytes(filePath) {
      try {
        const response = await axios.get(`http://localhost:5000/files/${filePath}`, {
          responseType: 'arraybuffer',  // สำคัญ! ต้องระบุ responseType เป็น arraybuffer
          withCredentials: true
        });
        return response.data;  // ส่งคืน binary data
      } catch (error) {
        console.error(`Error fetching file:`, error);
        return null;
      }
    },


    async exportCoverLetter() {
      try {
        // Initialize PDF with A4 size (portrait)
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        // Add Thai font
        doc.addFont('Sarabun-Regular-normal.ttf', 'Sarabun', 'normal');
        doc.setFont('Sarabun');
        doc.setLineHeightFactor(1.5); // Adjust line spacing

        // Set margins
        const margin = 20; // 20mm margins

        // Calculate center of page
        const pageWidth = 210; // A4 width in mm
        const pageCenter = pageWidth / 2;

        // Header section
        doc.setFontSize(16);
        doc.text(this.universityInfo.department, pageCenter, margin + 10, { align: 'center' });
        doc.text(this.universityInfo.name, pageCenter, margin + 20, { align: 'center' });
        doc.text(this.universityInfo.address, pageCenter, margin + 30, { align: 'center' });
        doc.text(this.universityInfo.contact, pageCenter, margin + 40, { align: 'center' });

        // Date
        const currentDate = new Date().toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        doc.text(`วันที่ ${currentDate}`, pageWidth - margin, margin + 60, { align: 'right' });

        // Subject and recipient
        doc.setFontSize(14);
        doc.text('เรื่อง: การส่งรายชื่อนักศึกษาสมัครงานเพื่อพิจารณาเข้าฝึกงาน', margin, margin + 75);
        doc.text(`เรียน ${this.companyDetails.thaiName}`, margin, margin + 85);

        // Letter body
        const letterBody = `ตามที่ทาง ${this.universityInfo.name} ได้ดำเนินโครงการสหกิจศึกษาเพื่อส่งเสริมให้\nนักศึกษาได้รับประสบการณ์จริงในการทำงานทางเราขอส่งรายชื่อนักศึกษาที่มีความประสงค์\nเข้ารับการฝึกงานในองค์กรของท่าน เพื่อพิจารณาตามความเหมาะสม\nเอกสารแนบนี้ประกอบไปด้วยรายชื่อของนักศึกษาพร้อมข้อมูลติดต่อและรายละเอียดเบื้องต้นเกี่ยวกับสาขาวิชาและทักษะของนักศึกษา\n\nทั้งนี้หากต้องการข้อมูลเพิ่มเติม กรุณาติดต่อกลับมาที่ ${this.universityInfo.contact}\n\nขอขอบพระคุณในความอนุเคราะห์ของท่าน และหวังเป็นอย่างยิ่งว่าจะได้รับความร่วมมือจากองค์กร ของท่านในการให้โอกาสแก่นักศึกษาในการพัฒนาตนเอง`;

        doc.setFontSize(12);
        // Split text to fit within margins
        const maxWidth = pageWidth - (2 * margin); // Available width for text
        doc.text(doc.splitTextToSize(letterBody, maxWidth), margin, margin + 100);

        // Signature - positioned from bottom of page
        const pageHeight = 297; // A4 height in mm
        doc.text('ขอแสดงความนับถือ', margin, pageHeight - (margin + 80));
        doc.text(`${this.universityInfo.coordinator.name}`, margin, pageHeight - (margin + 65));
        doc.text(`${this.universityInfo.coordinator.position}`, margin, pageHeight - (margin + 55));
        doc.text(this.universityInfo.name, margin, pageHeight - (margin + 45));

        // New page for student list
        doc.addPage();
        doc.setFontSize(16);
        doc.text('รายชื่อนักศึกษาที่สมัครเข้าฝึกงาน', pageCenter, margin + 10, { align: 'center' });

        // Student table
        const tableHeaders = [['รหัส', 'ชื่อ-นามสกุล', 'สาขา', 'เกรดเฉลี่ย', 'เบอร์ติดต่อ', 'อีเมล']];
        const tableData = this.filteredApplications.map(app => [
          app.student_id,
          `${app.first_name} ${app.last_name}`,
          app.major,
          app.GPA.toString(),
          app.phone,
          app.email
        ]);

        doc.autoTable({
          startY: margin + 20,
          margin: margin,
          head: tableHeaders,
          body: tableData,
          theme: 'striped',
          styles: {
            font: 'Sarabun',
            fontSize: 10,
            cellPadding: 3,
            overflow: 'linebreak'
          },
          headStyles: {
            fillColor: [22, 160, 133],
            textColor: [255, 255, 255],
            fontSize: 12,
            halign: 'center'
          },
          columnStyles: {
            0: { cellWidth: 25 }, // รหัสนักศึกษา
            1: { cellWidth: 35 }, // ชื่อ-นามสกุล
            2: { cellWidth: 35 }, // สาขา
            3: { cellWidth: 20 }, // เกรดเฉลี่ย
            4: { cellWidth: 25 }, // เบอร์โทร
            5: { cellWidth: 40 }  // อีเมล
          }
        });

        // Footer note
        doc.setFontSize(12);
        doc.text(`หมายเหตุ: นักศึกษาสามารถส่งเอกสารเพิ่มเติมตามที่องค์กรต้องการได้`, 20, doc.autoTable.previous.finalY + 15);

        // Save the cover letter PDF
        doc.save(`${this.companyDetails.englishName}_cover_letter.pdf`);
      } catch (error) {
        console.error('Error generating cover letter:', error);
        alert('เกิดข้อผิดพลาดในการสร้างจดหมายนำส่ง กรุณาลองใหม่อีกครั้ง');
      }
    },

    async exportDocuments() {
      try {
        const zip = new JSZip();

        // Create folders in zip
        const resumeFolder = zip.folder("resumes");
        const transcriptFolder = zip.folder("transcripts");

        // Download and add files to zip
        for (const app of this.filteredApplications) {
          const studentName = `${app.student_id}_${app.first_name}_${app.last_name}`;

          if (app.resume) {
            try {
              const resumeData = await this.fetchFileBytes(app.resume);
              if (resumeData) {
                resumeFolder.file(`${studentName}_resume.pdf`, resumeData);
              }
            } catch (error) {
              console.error(`Error adding resume for ${studentName}:`, error);
            }
          }

          if (app.transcript) {
            try {
              const transcriptData = await this.fetchFileBytes(app.transcript);
              if (transcriptData) {
                transcriptFolder.file(`${studentName}_transcript.pdf`, transcriptData);
              }
            } catch (error) {
              console.error(`Error adding transcript for ${studentName}:`, error);
            }
          }
        }

        // Generate and download zip file
        const content = await zip.generateAsync({type: "blob"});
        saveAs(content, `${this.companyDetails.englishName}_documents.zip`);
      } catch (error) {
        console.error('Error exporting documents:', error);
        alert('เกิดข้อผิดพลาดในการส่งออกเอกสาร กรุณาลองใหม่อีกครั้ง');
      }
    },

    filterApplications() {
      if (this.selectedStatus) {
        this.filteredApplications = this.applications.filter(application => application.status === this.selectedStatus);
      } else {
        this.filteredApplications = this.applications;
      }
    },
  },


  mounted() {
    const { compId, thaiName, englishName, description, address } = this.$route.query;
    console.log('Received query params:', this.$route.query);

    if (!compId) {
      console.error('No compId received');
      return;
    }

    this.companyDetails = {
      compId,
      thaiName,
      englishName,
      description,
      address
    };

    this.fetchApplications(compId);
  }
};
</script>

<style scoped>
.application-details {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
  margin-top: 20px;
}

.company-header {
  margin-bottom: 20px;
}

.no-data-message {
  color: #ff0000;
  font-size: 18px;
  margin: 20px 0;
  text-align: center;
}

.table-responsive {
  overflow-x: auto;
}

table {
  width: 200%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

button {
  margin-right: 5px;
  padding: 5px 10px;
  cursor: pointer;
}

.export-button {
  margin-bottom: 20px;
  background-color: var(--success-color);
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
}

.export-button:hover {
  background-color: #5dce61;
}

a {
  color: #007bff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

h1 {
  color: var(--secondary-color);
}

.filter-container {
  margin-bottom: 20px;
  display: flex;
  align-items: baseline;
  justify-content: space-around;
}


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
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 850px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.status-details ul {
  list-style-type: none;
  padding: 0;
}

.status-details li {
  margin-bottom: 10px;
  text-align: left;
}
.status-description-btn {
  margin-left: 10px;
  background-color: var(--accent-color);
}

.status-description-btn:hover {
  margin-left: 10px;
  background-color: var(--highlight-accent-color);
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  font-size: 16px;
  color: #fff;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition-duration);
}


/* 
.btn:hover {
  background-color: var(--highlight-accent-color);
} */

.status-in-progress {
  color: var(--accent-color);
  font-weight: bold;
}

.status-ready {
  color: var(--warning-color);
  font-weight: bold;
}

.status-disqualified {
  color: var(--error-color);
  font-weight: bold;
}

.status-passed {
  color: purple;
  font-weight: bold;
}

.status-confirmed {
  color: var(--success-color);
  font-weight: bold;
}

.status-eliminated {
  color: var(--error-color);
  font-weight: bold;
}

.status-withdrawn {
  color: gray;
  font-weight: bold;
}

.status-unknown {
  color: black;
  font-weight: bold;
}


#statusFilter {
  padding: 5px;
  margin-left: 10px;
  width: 150px; /* Adjust the width as needed */
}

@media (max-width: 768px) {
  .application-details {
    padding: 10px;
  }

  th, td {
    padding: 6px;
    font-size: 14px;
  }

  button {
    padding: 4px 8px;
    font-size: 14px;
  }
}
</style>
