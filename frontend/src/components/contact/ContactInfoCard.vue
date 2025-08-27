<template>
  <div class="card h-100 contact-info-card">
    <div class="card-body p-4">
      <h4 class="text-gradient mb-4">ข้อมูลการติดต่อ</h4>

      <div class="contact-info">
        <div class="info-item">
          <div class="info-header">
            <div class="icon-wrapper">
              <UserIcon class="icon" />
            </div>
            <h5 class="info-title">ผู้ประสานงาน</h5>
          </div>
          <div class="info-content">
            <p class="mb-1">นางสาวสหกิจ ศึกษาดี</p>
            <p class="text-muted">เจ้าหน้าที่ฝ่ายสหกิจศึกษา</p>
          </div>
        </div>

        <div class="info-item">
          <div class="info-header">
            <div class="icon-wrapper">
              <PhoneIcon class="icon" />
            </div>
            <h5 class="info-title">เบอร์โทรศัพท์</h5>
          </div>
          <div class="info-content">
            <p class="mb-1">02-XXX-XXXX ต่อ XXXX</p>
            <p class="mb-0">088-XXX-XXXX</p>
          </div>
        </div>

        <div class="info-item">
          <div class="info-header">
            <div class="icon-wrapper">
              <EnvelopeIcon class="icon" />
            </div>
            <h5 class="info-title">อีเมล</h5>
          </div>
          <div class="info-content">
            <a href="mailto:coop@university.ac.th" class="email-link">
              coop@university.ac.th
            </a>
          </div>
        </div>

        <div class="info-item">
          <div class="info-header">
            <div class="icon-wrapper">
              <ClockIcon class="icon" />
            </div>
            <h5 class="info-title">เวลาทำการ</h5>
          </div>
          <div class="info-content">
            <p class="mb-1">จันทร์ - ศุกร์</p>
            <p class="mb-0">8:30 - 16:30 น.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-gradient {
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: var(--primary-color);
}

.contact-info-card {
  border: none;
  border-radius: calc(var(--border-radius) * 2);
  box-shadow: 0 8px 24px rgba(7, 42, 64, 0.1);
  transition: all var(--transition-duration);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.contact-info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 32px rgba(7, 42, 64, 0.15);
}

.info-item {
  padding: 1.25rem;
  margin-bottom: 0.5rem;
  border-radius: var(--border-radius);
  transition: all var(--transition-duration);
  background-color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(7, 42, 64, 0.05);
}

.info-item:hover {
  background-color: white;
  border-color: var(--primary-color);
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(7, 42, 64, 0.1);
}

.info-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.icon-wrapper {
  width: 40px;
  height: 40px;
  min-width: 40px; /* เพิ่ม min-width เพื่อป้องกันการหดตัว */
  display: inline-flex; /* เปลี่ยนเป็น inline-flex */
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  border-radius: 50%;
  margin-right: 1rem;
  padding: 0; /* เพิ่ม padding: 0 เพื่อป้องกันการเยื้อง */
  position: relative; /* เพิ่ม position: relative */
}

.icon {
  width: 20px;
  height: 20px;
  min-width: 20px; /* เพิ่ม min-width เพื่อป้องกันการหดตัว */
  min-height: 20px; /* เพิ่ม min-height เพื่อป้องกันการหดตัว */
  color: white;
  position: absolute; /* เพิ่ม position: absolute */
  left: 50%; /* จัดให้อยู่กึ่งกลางแนวนอน */
  top: 50%; /* จัดให้อยู่กึ่งกลางแนวตั้ง */
  transform: translate(-50%, -50%); /* ปรับให้จุดกึ่งกลางของไอคอนตรงกับจุดกึ่งกลางของ wrapper */
}

.info-title {
  margin: 0;
  color: var(--accent-color);
  font-weight: 600;
}

.info-content {
  padding-left: 3.5rem;
}

.text-muted {
  color: var(--text-color);
  opacity: 0.7;
}

.email-link {
  color: var(--link-color);
  text-decoration: none;
  transition: all var(--transition-duration);
  font-weight: 500;
}

.email-link:hover {
  color: var(--link-hover-color);
  text-decoration: underline;
}

p {
  color: var(--text-color);
  line-height: 1.6;
}
</style>

<script>
import { UserIcon, PhoneIcon, EnvelopeIcon, ClockIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'ContactInfoCard',
  components: {
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    ClockIcon
  }
}
</script>

<style scoped>
.contact-card {
  border: none;
  box-shadow: 0 2px 4px rgba(7, 42, 64, 0.1);
  transition: all var(--transition-duration);
}

.contact-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(7, 42, 64, 0.15);
}

.icon {
  height: 1.5rem;
  width: 1.5rem;
  margin-right: 0.75rem;
}

.info-item {
  transition: all var(--transition-duration);
  padding: 0.5rem;
  border-radius: var(--border-radius);
}

.info-item:hover {
  background-color: rgba(var(--primary-color-rgb), 0.05);
}

.ms-7 {
  margin-left: 2.75rem;
}

p {
  color: var(--text-color);
}
</style>