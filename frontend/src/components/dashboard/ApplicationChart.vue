<template>
  <div class="h-100">
    <h3 class="h5 mb-4 text-uppercase text-muted small mb-1">จำนวนนักศึกษาในแต่ละสาขา</h3>
    <div style="height: 300px;">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'
import axios from 'axios'
Chart.register(...registerables)

export default {
  data() {
    return {
      chart: null,
      studentData: []
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.fetchData();
    });
  },
  methods: {
    async fetchData() {
      try {
        const response = await axios.get('http://localhost:5000/api/stats/students-by-major');
        this.studentData = response.data;
        this.createChart();
      } catch (error) {
        console.error('Error fetching student data:', error);
      }
    },
    getMajorDisplayName(dbMajorName) {
      const majorMapping = {
        'เทคโนโลยีสารสนเทศและการสื่อสารดิจิทัล': 'IT',
        'วิทยาการคอมพิวเตอร์': 'ComSci',
        'คณิตศาสตร์': 'Math',
        'สถิติ': 'Stat',
        'วิทยาการข้อมูล': 'BigData',
        'เคมี': 'Chem',
        'ชีววิทยา': 'Bio',
        'ฟิสิกส์': 'Phys',
        'วิทยาศาสตร์และเทคโนโลยีการอาหาร': 'FoodSci'
      };
      return majorMapping[dbMajorName] || dbMajorName;
    },
    createChart() {
      this.$nextTick(() => {
        if (!this.$refs.chartCanvas) {
          console.warn('Canvas element not ready');
          return;
        }

        const ctx = this.$refs.chartCanvas.getContext('2d')
        if (!ctx) {
          console.warn('Could not get 2d context from canvas');
          return;
        }

        // ทำลาย chart เก่าถ้ามีอยู่
        if (this.chart) {
          this.chart.destroy();
        }

        // กำหนดลำดับการแสดงผลที่ต้องการ
        const orderedLabels = ['IT', 'ComSci', 'Math', 'Stat', 'BigData', 'Chem', 'Bio', 'Phys', 'FoodSci'];

        // จัดเรียงข้อมูลตามลำดับที่ต้องการ
        const orderedData = orderedLabels.map(label => {
          const item = this.studentData.find(d => this.getMajorDisplayName(d.major) === label);
          return item ? item.students_count : 0;
        });

        this.chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: orderedLabels,
            datasets: [{
              label: 'จำนวนนักศึกษา',
              data: orderedData,
              backgroundColor: [
                'rgba(59, 130, 246, 0.8)',  // IT
                'rgba(99, 102, 241, 0.8)',   // ComSci
                'rgba(139, 92, 246, 0.8)',   // Math
                'rgba(168, 85, 247, 0.8)',   // Stat
                'rgba(217, 70, 239, 0.8)',   // BigData
                'rgba(236, 72, 153, 0.8)',   // Chem
                'rgba(244, 63, 94, 0.8)',    // Bio
                'rgba(239, 68, 68, 0.8)',    // Phys
                'rgba(234, 88, 12, 0.8)'     // FoodSci
              ],
              borderColor: [
                'rgb(59, 130, 246)',   // IT
                'rgb(99, 102, 241)',   // ComSci
                'rgb(139, 92, 246)',   // Math
                'rgb(168, 85, 247)',   // Stat
                'rgb(217, 70, 239)',   // BigData
                'rgb(236, 72, 153)',   // Chem
                'rgb(244, 63, 94)',    // Bio
                'rgb(239, 68, 68)',    // Phys
                'rgb(234, 88, 12)'     // FoodSci
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'จำนวนนักศึกษา (คน)'
                },
                max: 150,
                ticks: {
                  stepSize: 10,
                  callback: function(value) { return Math.round(value); }
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'สาขาวิชา'
                }
              }
            }
          }
        });
      });
    },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy()
    }
  },

  watch: {
    studentData: {
      handler() {
        if (this.chart) {
          this.chart.destroy()
        }
        this.createChart()
      },
      deep: true
    }
  }
}}
</script>