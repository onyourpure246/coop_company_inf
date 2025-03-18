<template>
  <div class="min-vh-100 bg-light">
    <div class="container py-4">
      <!-- Stats Cards -->
      <div class="row g-4 mb-4">
        <div class="col-12 col-sm-6 col-lg-3 h-100">
          <div class="card h-100">
            <StatCard
              title="จำนวนนักศึกษา"
              :value="stats.total_students"
              :change="0"
              :icon="UsersIcon"
            />
          </div>
        </div>
        <div class="col-12 col-sm-6 col-lg-3 h-100">
          <div class="card h-100">
            <StatCard
              title="จำนวนสถานประกอบการ"
              :value="stats.active_companies"
              :change="0"
              :icon="BuildingOfficeIcon"
            />
          </div>
        </div>
        <div class="col-12 col-sm-6 col-lg-3 h-100">
          <div class="card h-100">
            <StatCard
              title="นักศึกษามีสถานประกอบการแล้ว"
              :value="`${calculateSuccessRate()}% (${stats.student_ready} คน)`"
              :change="0"
              :icon="CheckCircleIcon"
            />
          </div>
        </div>
        <div class="col-12 col-sm-6 col-lg-3 h-100">
          <div class="card h-100">
            <StatCard
              title="นักศึกษาที่ใช้งานระบบวันนี้"
              :value="dailyLogins.student_logins"
              :change="0"
              :icon="UserCircleIcon"
            />
          </div>
        </div>
        
      </div>

      <!-- Charts -->
      <div class="row g-4 mb-4">
        <div class="col-12 col-lg-6">
          <div class="card h-100">
            <div class="card-body">
              <ApplicationChart />
            </div>
          </div>
        </div>
        <div class="col-12 col-lg-6">
          <div class="card h-100">
            <div class="card-body">
              <StatusPieChart />
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Applications -->
      <div class="card p-3 mb-4">
        <RecentApplications />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { UsersIcon, BuildingOfficeIcon, UserCircleIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import StatCard from '../dashboard/StatCard.vue'
import ApplicationChart from '../dashboard/ApplicationChart.vue'
import StatusPieChart from '../dashboard/StatusPieChart.vue'
import RecentApplications from '../dashboard/RecentApplications.vue'

export default {
  components: {
    StatCard,
    ApplicationChart,
    StatusPieChart,
    RecentApplications
  },
  data() {
    return {
      stats: {
        total_applications: 0,
        total_students: 0,
        active_companies: 0,
        success_rate: 0,
        student_ready: 0
      },
      dailyLogins: {
        total_logins: 0,
        student_logins: 0,
        last_updated: null
      },
      UsersIcon,
      BuildingOfficeIcon,
      UserCircleIcon,
      CheckCircleIcon
    }
  },
  async created() {
    await this.fetchStats();
    this.setupAutoUpdate();
  },
  beforeUnmount() {
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
    }
  },
  methods: {
    async fetchStats() {
      try {
        // ดึงข้อมูล stats ทั่วไป
        const response = await axios.get('http://localhost:5000/api/dashboard/stats');
        this.stats = response.data;

        // ดึงข้อมูล daily logins
        const loginResponse = await axios.get('http://localhost:5000/api/stats/daily-logins');
        this.dailyLogins = loginResponse.data;

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    },
    setupAutoUpdate() {
      const now = new Date();
      const targetTime = new Date(now);
      targetTime.setHours(3, 0, 0, 0);

      // If it's past 3 AM, set for next day
      if (now > targetTime) {
        targetTime.setDate(targetTime.getDate() + 1);
      }

      const timeUntilUpdate = targetTime - now;

      this.updateTimer = setTimeout(() => {
        this.fetchStats();
        // Setup next update after this one
        this.setupAutoUpdate();
      }, timeUntilUpdate);
    },
    calculateSuccessRate() {
      if (this.stats.total_students === 0) return 0;
      return Math.round((this.stats.student_ready / this.stats.total_students) * 100);
    }
  }
}
</script>