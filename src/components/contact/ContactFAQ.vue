<template>
  <div class="card faq-card">
    <div class="card-body p-4">
      <div class="faq-header">
        <h4 class="text-gradient mb-4">คำถามที่พบบ่อย</h4>
        <p class="text-muted mb-4">คำถามและคำตอบเกี่ยวกับการฝึกสหกิจศึกษาที่พบบ่อย</p>
      </div>

      <div class="accordion custom-accordion" id="faqAccordion">
        <div
          class="accordion-item custom-accordion-item"
          v-for="(faq, index) in faqs"
          :key="index"
          :class="{ 'is-active': faq.isOpen }"
        >
          <h2 class="accordion-header">
            <button
              class="accordion-button custom-accordion-button"
              :class="{ collapsed: !faq.isOpen }"
              type="button"
              @click="toggleFaq(index)"
            >
              <div class="question-wrapper">
                <div class="question-icon">Q</div>
                <span class="question-text">{{ faq.question }}</span>
              </div>
            </button>
          </h2>
          <div
            class="accordion-collapse collapse"
            :class="{ show: faq.isOpen }"
          >
            <div class="accordion-body custom-accordion-body">
              <div class="answer-wrapper">
                <div class="answer-icon">A</div>
                <div class="answer-text">{{ faq.answer }}</div>
              </div>
            </div>
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

.faq-card {
  border: none;
  border-radius: calc(var(--border-radius) * 2);
  box-shadow: 0 8px 24px rgba(7, 42, 64, 0.1);
  transition: all var(--transition-duration);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.faq-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 32px rgba(7, 42, 64, 0.15);
}

.text-muted {
  color: var(--text-color);
  opacity: 0.7;
}

.custom-accordion-item {
  background: transparent;
  border: 1px solid rgba(7, 42, 64, 0.1);
  border-radius: var(--border-radius) !important;
  margin-bottom: 1rem;
  transition: all var(--transition-duration);
}

.custom-accordion-item:hover {
  border-color: var(--primary-color);
  transform: translateX(5px);
}

.custom-accordion-item.is-active {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(7, 42, 64, 0.1);
}

.custom-accordion-button {
  background: transparent !important;
  border: none;
  padding: 1.25rem;
  width: 100%;
  text-align: left;
  position: relative;
  cursor: pointer;
  transition: all var(--transition-duration);
}

.custom-accordion-button:not(.collapsed) {
  color: var(--primary-color) !important;
  background-color: rgba(24, 183, 190, 0.05) !important;
}

.question-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.question-icon, .answer-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 600;
  font-size: 1rem;
}

.question-icon {
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  color: white;
}

.answer-icon {
  background: linear-gradient(45deg, var(--success-color), var(--highlight-success-color));
  color: white;
}

.question-text {
  flex: 1;
  font-weight: 500;
  color: var(--accent-color);
}

.custom-accordion-button:not(.collapsed) .question-text {
  color: var(--primary-color);
}

.custom-accordion-body {
  padding: 1.25rem;
  background-color: rgba(255, 255, 255, 0.7);
  border-top: 1px solid rgba(7, 42, 64, 0.1);
}

.answer-wrapper {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.answer-text {
  flex: 1;
  color: var(--text-color);
  line-height: 1.6;
}

/* Custom arrow icon */
.custom-accordion-button::after {
  content: '↓';
  font-size: 1.2rem;
  color: var(--primary-color);
  transition: transform var(--transition-duration);
  width: auto;
  height: auto;
  background-image: none !important;
}

.custom-accordion-button:not(.collapsed)::after {
  transform: rotate(-180deg);
}

@media (max-width: 768px) {
  .custom-accordion-button {
    padding: 1rem;
  }

  .question-icon, .answer-icon {
    width: 28px;
    height: 28px;
    font-size: 0.875rem;
  }

  .question-text {
    font-size: 0.9375rem;
  }

  .answer-text {
    font-size: 0.875rem;
  }
}
</style>

<script>
export default {
  name: 'ContactFAQ',
  data() {
    return {
      faqs: [
        {
          question: 'เอกสารที่จำเป็นในการสมัครสหกิจศึกษามีอะไรบ้าง?',
          answer: 'เอกสารที่จำเป็นประกอบด้วย 1) ใบสมัครสหกิจศึกษา 2) ใบรับรองการเป็นนักศึกษา 3) Transcript 4) รูปถ่าย 1 นิ้ว 2 รูป 5) ประวัติส่วนตัว (Resume)',
          isOpen: false
        },
        {
          question: 'ระยะเวลาในการฝึกสหกิจศึกษาคือเท่าไร?',
          answer: 'ระยะเวลาในการฝึกสหกิจศึกษาคือ 16 สัปดาห์ หรือ 4 เดือน ต่อเนื่องกัน',
          isOpen: false
        },
        {
          question: 'นักศึกษาสามารถเลือกสถานประกอบการเองได้หรือไม่?',
          answer: 'นักศึกษาสามารถเลือกสถานประกอบการเองได้ แต่ต้องผ่านการพิจารณาและได้รับความเห็นชอบจากอาจารย์ที่ปรึกษาและคณะกรรมการสหกิจศึกษาก่อน',
          isOpen: false
        },
        {
          question: 'มีค่าใช้จ่ายในการลงทะเบียนสหกิจศึกษาหรือไม่?',
          answer: 'มีค่าลงทะเบียนเช่นเดียวกับรายวิชาปกติ โดยคิดตามจำนวนหน่วยกิตของรายวิชาสหกิจศึกษา',
          isOpen: false
        },
        {
          question: 'นักศึกษาจะได้รับค่าตอบแทนระหว่างการฝึกสหกิจศึกษาหรือไม่?',
          answer: 'การได้รับค่าตอบแทนขึ้นอยู่กับนโยบายของแต่ละสถานประกอบการ บางแห่งอาจมีค่าตอบแทน ค่าที่พัก หรือสวัสดิการอื่นๆ',
          isOpen: false
        }
      ]
    }
  },
  methods: {
    toggleFaq(index) {
      this.faqs[index].isOpen = !this.faqs[index].isOpen
    }
  }
}
</script>

<style scoped>
.faq-card {
  border: none;
  box-shadow: 0 2px 4px rgba(7, 42, 64, 0.1);
  transition: all var(--transition-duration);
}

.faq-card:hover {
  box-shadow: 0 4px 8px rgba(7, 42, 64, 0.15);
}

.custom-accordion {
  --bs-accordion-border-color: rgba(7, 42, 64, 0.1);
  --bs-accordion-border-radius: var(--border-radius);
}

.custom-accordion-item {
  border: 1px solid rgba(7, 42, 64, 0.1);
  border-radius: var(--border-radius) !important;
  margin-bottom: 0.5rem;
  overflow: hidden;
  transition: all var(--transition-duration);
}

.custom-accordion-item:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px 4px rgba(7, 42, 64, 0.1);
}

.custom-accordion-item.is-active {
  border-color: var(--primary-color);
  box-shadow: 0 2px 4px rgba(7, 42, 64, 0.1);
}

.custom-accordion-button {
  background-color: #fff !important;
  color: var(--secondary-color) !important;
  padding: 1rem;
  font-weight: 500;
  transition: all var(--transition-duration);
}

.custom-accordion-button:not(.collapsed) {
  color: var(--primary-color) !important;
  background-color: rgba(var(--primary-color-rgb), 0.05) !important;
}

.custom-accordion-button::after {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23178ca4'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e") !important;
}

.custom-accordion-button:not(.collapsed)::after {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%2318b7be'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e") !important;
}

.question-text {
  color: inherit;
  font-size: 1rem;
}

.custom-accordion-body {
  padding: 1rem;
  color: var(--text-color);
  background-color: #fff;
  border-top: 1px solid rgba(7, 42, 64, 0.1);
}
</style>

<style scoped>
.accordion-button:not(.collapsed) {
  background-color: rgba(var(--bs-primary-rgb), 0.1);
  color: var(--bs-primary);
}
</style>