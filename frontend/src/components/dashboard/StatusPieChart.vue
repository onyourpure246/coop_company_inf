<template>
  <div class="h-100">
    <h3 class="h5 mb-4 text-uppercase text-muted small mb-1">Application Status Distribution</h3>
    <div class="h-64">
      <canvas ref="pieCanvas"></canvas>
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
      statusData: [],
      statusColors: {
        'in progress': getComputedStyle(document.documentElement).getPropertyValue('--info-color').trim(),
        'ready': getComputedStyle(document.documentElement).getPropertyValue('--warning-color').trim(),
        'disqualified': getComputedStyle(document.documentElement).getPropertyValue('--error-color').trim(),
        'passed': getComputedStyle(document.documentElement).getPropertyValue('--success-color').trim(),
        'eliminated': getComputedStyle(document.documentElement).getPropertyValue('--highlight-error-color').trim(),
        'confirmed': getComputedStyle(document.documentElement).getPropertyValue('--highlight-success-color').trim(),
        'withdrawn': getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
      }
    }
  },
  async mounted() {
    await this.fetchStatusData()
    this.createChart()
  },
  methods: {
    async fetchStatusData() {
      try {
        const response = await axios.get('http://localhost:5000/api/application-status')
        this.statusData = response.data
      } catch (error) {
        console.error('Error fetching status data:', error)
      }
    },
    createChart() {
      const ctx = this.$refs.pieCanvas.getContext('2d')
      const labels = this.statusData.map(item => item.status)
      const data = this.statusData.map(item => item.students_count)
      const backgroundColor = this.statusData.map(item => this.statusColors[item.status])

      this.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: backgroundColor
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      })
    }
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy()
    }
  }
}
</script>