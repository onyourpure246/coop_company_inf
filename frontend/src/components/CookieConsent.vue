<template>
  <div v-if="show" class="cookie-consent">
    <div class="cookie-content">
      <div class="cookie-main-content">
        <h2>ประกาศมหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี</h2>
        <div class="content-wrapper">
          <div class="text-content">
            <p class="text-justify">โดยที่เป็นการสมควรให้มีประกาศกำหนดนโยบายคุ้มครองข้อมูลส่วนบุคคล เพื่อให้บุคลากรนักศึกษา นักเรียนในสังกัดมหาวิทยาลัยเทคโนโลยีราชมงคลธัญรี ในฐานะเจ้าของข้อมูลส่วนบุคคลและสาธารณชนรับทราบและเข้าใจถึงแนวทางการจัดการและการคุ้มครองข้อมูลส่วนบุคคล รวมถึงมาตรการรักษาความปลอดภัยของข้อมูลส่วนบุคคลที่ดำเนินการโดยมหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี ให้เป็นไปตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. ๒๕๖๖ เพื่อให้การบริหารราชการและการดำเนินงานของมหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรีดำเนินไปด้วยความเรียบร้อย เป็นไปตามนโยบายและวัตถุประสงค์ที่กำหนดไว้ เพื่อประสิทธิภาพในการปฏิบัติราชการและเพื่อคุ้มครองข้อมูลส่วนบุคคล</p>
            <p class="text-justify">อาศัยอำนาจตามความในมาตรา ๑๗(๒) แห่งพระราชบัญญัติมหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี พ.ศ. ๒๕๔๘ จึงประกาศนโยบายคุ้มครองข้อมูลส่วนบุคคล มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี พ.ศ. ๒๕๖๖ แนบท้ายประกาศนี้ ทั้งนี้ ตั้งแต่บัดนี้เป็นต้นไป <router-link to="/privacy-policy" class="privacy-link">นโยบายความเป็นส่วนตัว</router-link></p>
          </div>
          <div class="cookie-actions">
            <button class="btn-customize" @click="toggleCustomize">
              {{ isCustomizing ? 'Hide Options' : 'Customize' }}
            </button>
            <button class="btn-accept" @click="acceptAll">
              Accept All
            </button>
          </div>
        </div>
      </div>

      <!-- Customize Section -->
      <div v-show="isCustomizing" class="cookie-customize-section">
        <h2 class="text-justify">ตั้งค่าความเป็นส่วนตัว</h2>
        <p class="privacy-description text-justify">เมื่อคุณเข้าชมเว็บเว็บไซต์ใดก็ตาม เว็บไซต์นั้นอาจจัดเก็บหรือดึงข้อมูลจากเบราว์เซอร์ของคุณ ส่วนใหญ่แล้วอยู่ในรูปแบบของคุกกี้ ข้อมูลนี้อาจเกี่ยวกับคุณ การตั้งค่าของคุณ อุปกรณ์ของคุณ หรือเพื่อช่วยให้เว็บไซต์ทำงานอย่างที่คุณต้องการ ซึ่งมักเป็นข้อมูลที่ไม่สามารถระบุตัวตนของคุณได้โดยตรง แต่ช่วยให้คุณใช้งานเว็บตามความต้องการส่วนบุคคลได้มากยิ่งขึ้น คุณสามารถปฏิเสธไม่ให้คุกกี้บางประเภททำงานได้ คลิกที่หัวข้อประเภทอื่นๆ เพื่อดูข้อมูลเพิ่มเติมและเปลี่ยนการตั้งค่าเริ่มต้นของเรา อย่างไรก็ตาม คุณควรทราบว่าการบล็อกคุกกี้บางประเภทอาจส่งผลต่อการใช้งานเว็บไซต์และบริการที่เรามีให้ใช้งาน</p>
        <div class="cookie-settings">
          <div class="cookie-accordion">
            <!-- Necessary Cookies -->
            <div class="cookie-accordion-item">
              <div class="cookie-accordion-header" @click="toggleAccordion(0)">
                <div class="cookie-accordion-title">
                  <h3>คุกกี้ที่จำเป็น</h3>
                  <span class="badge">Always Active</span>
                </div>
              </div>
              <div class="cookie-accordion-content" :class="{ active: activeAccordions.has(0) }">
                <p>คุกกี้เหล่านี้จำเป็นสำหรับการทำงานกับเว็บไซต์ และไม่สามารถปิดการใช้งานในระบบของเราได้</p>
              </div>
            </div>

            <!-- Performance Cookies -->
            <div class="cookie-accordion-item">
              <div class="cookie-accordion-header" @click="toggleAccordion(1)">
                <div class="cookie-accordion-title">
                  <h3>คุกกี้ประสิทธิภาพ</h3>
                  <label class="switch" @click.stop>
                    <input type="checkbox" v-model="preferences.performance">
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
              <div class="cookie-accordion-content" :class="{ active: activeAccordions.has(1) }">
                <p>คุกกี้เหล่านี้ช่วยให้เราสามารถนับการเข้าชมและแหล่งที่มาของการเข้าชม</p>
              </div>
            </div>

            <!-- Functional Cookies -->
            <div class="cookie-accordion-item">
              <div class="cookie-accordion-header" @click="toggleAccordion(2)">
                <div class="cookie-accordion-title">
                  <h3>คุกกี้การใช้งาน</h3>
                  <label class="switch" @click.stop>
                    <input type="checkbox" v-model="preferences.functional">
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
              <div class="cookie-accordion-content" :class="{ active: activeAccordions.has(2) }">
                <p>คุกกี้เหล่านี้ช่วยในการทำงานของเว็บไซต์และการปรับแต่งเว็บไซต์ให้เหมาะกับผู้ใช้</p>
              </div>
            </div>
          </div>
        </div>
        <div class="customize-actions">
          <button class="btn-save" @click="savePreferences">
            Save My Preferences
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const COOKIE_EXPIRATION_DAYS = 7; // You can change this number to set how many days before showing again

const show = ref(true);
const isCustomizing = ref(false);
const preferences = ref({
  necessary: true, // Always true
  performance: false,
  functional: false
});

// Track active accordion sections
const activeAccordions = ref(new Set());

// Toggle accordion section
const toggleAccordion = (index) => {
  if (activeAccordions.value.has(index)) {
    activeAccordions.value.delete(index);
  } else {
    activeAccordions.value.add(index);
  }
};



// Check if user has already set preferences and if they haven't expired
onMounted(() => {
  const savedData = localStorage.getItem('cookiePreferences');
  if (savedData) {
    const data = JSON.parse(savedData);
    const savedTimestamp = data.timestamp;
    const currentTime = new Date().getTime();
    const daysSinceLastConsent = (currentTime - savedTimestamp) / (1000 * 60 * 60 * 24);

    if (daysSinceLastConsent < COOKIE_EXPIRATION_DAYS) {
      show.value = false;
      preferences.value = data.preferences;
    } else {
      // If expired, show the consent again
      show.value = true;
    }
  }
});

const acceptAll = () => {
  preferences.value = {
    necessary: true,
    performance: true,
    functional: true
  };
  savePreferences();
};



const toggleCustomize = () => {
  isCustomizing.value = !isCustomizing.value;
};

const savePreferences = () => {
  const dataToSave = {
    preferences: preferences.value,
    timestamp: new Date().getTime()
  };
  localStorage.setItem('cookiePreferences', JSON.stringify(dataToSave));
  show.value = false;
  isCustomizing.value = false;
};
</script>

<style scoped>
.cookie-consent {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  padding: 6px;
  font-family: 'Kanit', sans-serif;
}

.cookie-content {
  width: 100%;
  margin: 0 auto;
}

.cookie-main-content {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 6px;
  flex-direction: column;
}

.text-justify{
  text-align: justify;
  font-size: 14px;
  margin-bottom: 6px;
}

.text-content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.privacy-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.privacy-link:hover {
  text-decoration: underline;
}

.content-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  gap: 1rem;
}

.text-content {
  flex: 4; /* ให้กินพื้นที่ 3 ส่วน */
  min-width: 0;
}

.cookie-actions {
  flex: 1; /* ให้กินพื้นที่ 1 ส่วน */
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 100px;
}




.cookie-customize-section {
  background: #f8f9fa;
  padding: 6px;
  border-top: 1px solid #e9ecef;
  transition: all 0.3s ease-in-out;
  width: 100%;
  max-width: 100%;
}

.cookie-type p {
  margin: 0.5rem 0 0;
  color: #4a5568;
  font-size: 14px;
}

.cookie-content h2 {
  color: var(--primary-color);
  font-size: 16px;
  margin-bottom: 0px;
}

.cookie-settings {
  margin: 1.5rem 0;
}

.cookie-accordion {
  width: 100%;
}

.cookie-accordion-item {
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 0.75rem;
  border: 1px solid #e9ecef;
}

.cookie-accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.cookie-accordion-header:hover {
  background-color: #f1f3f5;
}

.cookie-accordion-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
}

.cookie-accordion-title h3 {
  font-size: 16px;
  margin: 0;
  color: #2c3e50;
}

.cookie-accordion-chevron {
  margin-left: 1rem;
  transition: transform 0.3s ease;
}

.cookie-accordion-chevron.active {
  transform: rotate(90deg);
}

.cookie-accordion-content {
  padding: 0 0.75rem 0.75rem;
  display: none;
}

.cookie-accordion-content.active {
  display: block;
}

.badge {
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-left: 0.5rem;
}

.cookie-actions {
  display: flex;
  gap: 1rem;
  width: 100%;
  justify-content: flex-end;
  margin-top: 1rem;
  flex-direction: row;
}

.btn-customize,
.btn-accept,
.btn-save {
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 120px;
  font-size: 0.9rem;
}

.btn-customize {
  background: #f8f9fa;
  color: #2c3e50;
}

.btn-reject {
  background: #dc3545;
  color: white;
}

.btn-accept {
  background: var(--primary-color);
  color: white;
}

.btn-save {
  background: var(--primary-color);
  color: white;
  width: 100%;
}

/* Switch styles */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

/* Modal styles */
.cookie-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-actions {
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .cookie-consent {
    padding: 0.5rem;
    max-height: 85vh;
    overflow-y: auto;
  }

  .cookie-content {
    flex-direction: column;
    text-align: left;
  }

  .content-wrapper {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .cookie-main-content {
    padding: 0.5rem;
  }

  .text-justify {
    font-size: 14px;
    line-height: 1.4;
  }

  .cookie-actions {
    flex-direction: row;
    justify-content: flex-end;
    width: 100%;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .btn-customize,
  .btn-accept {
    padding: 0.5rem 1rem;
    font-size: 14px;
    min-width: auto;
    flex: 1;
  }

  .cookie-customize-section {
    padding: 6px !important;
  }

  .cookie-type {
    padding: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .cookie-type h3 {
    font-size: 14px;
  }

  .cookie-type p {
    font-size: 12px;
  }

  .privacy-description {
    font-size: 12px;
    margin: 0.5rem 0;
  }

  /* ปรับขนาด switch ให้เล็กลงบน mobile */
  .switch {
    width: 46px;
    height: 24px;
  }

  .slider:before {
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
  }

  input:checked + .slider:before {
    transform: translateX(22px);
  }
}
</style>