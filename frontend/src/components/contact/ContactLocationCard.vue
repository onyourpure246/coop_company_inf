<template>
  <div class="card h-100 location-card">
    <div class="card-body p-4">
      <h4 class="text-gradient mb-4">ที่ตั้งสำนักงาน</h4>

      <div class="location-info">
        <div class="address-section">
          <div class="info-header">
            <div class="icon-wrapper">
              <BuildingOfficeIcon class="icon" />
            </div>
            <h5 class="info-title">ที่อยู่</h5>
          </div>
          <div class="address-content">
            <div class="address-line">
              <strong>สำนักงานสหกิจศึกษา</strong>
            </div>
            <div class="address-line">อาคารXXX ชั้น X ห้อง XXX</div>
            <div class="address-line">มหาวิทยาลัย XXXXX</div>
            <div class="address-line">เลขที่ XXX ถ.XXXXX</div>
            <div class="address-line">แขวง/ตำบล XXXXX เขต/อำเภอ XXXXX</div>
            <div class="address-line">จังหวัด XXXXX รหัสไปรษณีย์ XXXXX</div>
          </div>
        </div>

        <div class="map-section">
          <div class="info-header">
            <div class="icon-wrapper">
              <MapPinIcon class="icon" />
            </div>
            <h5 class="info-title">แผนที่</h5>
          </div>
          <div class="map-container">
            <div class="map-placeholder">
              <div class="map-overlay">
                <MapPinIcon class="map-icon" />
                <p class="map-text">แผนที่กำลังอยู่ในระหว่างการปรับปรุง</p>
              </div>
            </div>
            <a href="#" class="direction-link">
              <span class="direction-icon">↗</span>
              นำทาง Google Maps
            </a>
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

.location-card {
  border: none;
  border-radius: calc(var(--border-radius) * 2);
  box-shadow: 0 8px 24px rgba(7, 42, 64, 0.1);
  transition: all var(--transition-duration);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.location-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 32px rgba(7, 42, 64, 0.15);
}

.info-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.icon-wrapper {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  border-radius: 50%;
  margin-right: 1rem;
  flex-shrink: 0;
}

.icon {
  width: 20px;
  height: 20px;
  color: white;
  margin: 0;
}

.info-title {
  margin: 0;
  color: var(--accent-color);
  font-weight: 600;
}

.address-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: var(--border-radius);
  border: 1px solid rgba(7, 42, 64, 0.05);
  transition: all var(--transition-duration);
}

.address-section:hover {
  background-color: white;
  border-color: var(--primary-color);
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(7, 42, 64, 0.1);
}

.address-content {
  padding-left: 3.5rem;
}

.address-line {
  color: var(--text-color);
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.address-line:last-child {
  margin-bottom: 0;
}

.map-section {
  padding: 1.5rem;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: var(--border-radius);
  border: 1px solid rgba(7, 42, 64, 0.05);
  transition: all var(--transition-duration);
}

.map-section:hover {
  background-color: white;
  border-color: var(--primary-color);
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(7, 42, 64, 0.1);
}

.map-container {
  padding-left: 3.5rem;
}

.map-placeholder {
  width: 100%;
  height: 200px;
  background-color: #f8f9fa;
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-overlay {
  text-align: center;
}

.map-icon {
  width: 40px;
  height: 40px;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.map-text {
  color: var(--text-color);
  opacity: 0.7;
  margin: 0;
}

.direction-link {
  display: inline-flex;
  align-items: center;
  color: var(--link-color);
  text-decoration: none;
  font-weight: 500;
  transition: all var(--transition-duration);
}

.direction-link:hover {
  color: var(--link-hover-color);
  text-decoration: underline;
}

.direction-icon {
  font-size: 1.2rem;
  margin-right: 0.5rem;
}
</style>

<script>
import { BuildingOfficeIcon, MapPinIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'ContactLocationCard',
  components: {
    BuildingOfficeIcon,
    MapPinIcon
  }
}
</script>

<style scoped>
.location-card {
  border: none;
  box-shadow: 0 2px 4px rgba(7, 42, 64, 0.1);
  transition: all var(--transition-duration);
}

.location-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(7, 42, 64, 0.15);
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

.map-container {
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(7, 42, 64, 0.1);
  transition: all var(--transition-duration);
}

.map-container:hover {
  box-shadow: 0 4px 8px rgba(7, 42, 64, 0.15);
}

.map-image {
  width: 100%;
  height: auto;
  border-radius: var(--border-radius);
  transition: all var(--transition-duration);
}

.map-image:hover {
  transform: scale(1.02);
}
</style>