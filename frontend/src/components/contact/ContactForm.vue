<template>
  <div class="contact-form">
    <h4 class="text-gradient mb-4">ส่งข้อความถึงเรา</h4>

    <form @submit.prevent="submitForm" class="needs-validation" novalidate>
      <div class="row g-4">
        <div class="col-md-6">
          <div class="form-floating">
            <input
              type="text"
              class="form-control custom-input"
              id="name"
              v-model="formData.name"
              placeholder="ชื่อ-นามสกุล"
              required
            />
            <label for="name">ชื่อ-นามสกุล *</label>
            <div class="invalid-feedback">
              กรุณากรอกชื่อ-นามสกุล
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="form-floating">
            <input
              type="email"
              class="form-control custom-input"
              id="email"
              v-model="formData.email"
              placeholder="อีเมล"
              required
            />
            <label for="email">อีเมล *</label>
            <div class="invalid-feedback">
              กรุณากรอกอีเมลให้ถูกต้อง
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="form-floating">
            <input
              type="tel"
              class="form-control custom-input"
              id="phone"
              v-model="formData.phone"
              placeholder="เบอร์โทรศัพท์"
            />
            <label for="phone">เบอร์โทรศัพท์</label>
          </div>
        </div>

        <div class="col-md-6">
          <div class="form-floating">
            <input
              type="text"
              class="form-control custom-input"
              id="subject"
              v-model="formData.subject"
              placeholder="เรื่อง"
              required
            />
            <label for="subject">เรื่อง *</label>
            <div class="invalid-feedback">
              กรุณากรอกหัวข้อเรื่อง
            </div>
          </div>
        </div>

        <div class="col-12">
          <div class="form-floating">
            <textarea
              class="form-control custom-input"
              id="message"
              rows="5"
              style="height: 150px"
              v-model="formData.message"
              placeholder="ข้อความ"
              required
            ></textarea>
            <label for="message">ข้อความ *</label>
            <div class="invalid-feedback">
              กรุณากรอกข้อความ
            </div>
          </div>
        </div>

        <div class="col-12 text-end">
          <button
            type="submit"
            class="btn btn-lg custom-button"
            :class="{ 'btn-loading': isSubmitting }"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
            <span class="button-text">{{ isSubmitting ? 'กำลังส่ง...' : 'ส่งข้อความ' }}</span>
          </button>
        </div>
      </div>
    </form>
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

.custom-input {
  border: 2px solid rgba(7, 42, 64, 0.1);
  border-radius: var(--border-radius);
  padding: 1rem;
  transition: all var(--transition-duration);
}

.custom-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(24, 183, 190, 0.25);
}

.form-floating > label {
  padding: 1rem;
  color: var(--text-color);
  opacity: 0.7;
}

.form-floating > .form-control:focus ~ label,
.form-floating > .form-control:not(:placeholder-shown) ~ label {
  opacity: 1;
  transform: scale(0.85) translateY(-1rem) translateX(0.15rem);
}

.custom-button {
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  border: none;
  color: white;
  padding: 1rem 2rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: all var(--transition-duration);
  position: relative;
  overflow: hidden;
}

.custom-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, var(--secondary-color), var(--primary-color));
  opacity: 0;
  transition: opacity var(--transition-duration);
}

.custom-button:hover::before {
  opacity: 1;
}

.custom-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(7, 42, 64, 0.2);
}

.button-text {
  position: relative;
  z-index: 1;
}

.btn-loading {
  background: var(--secondary-color);
}

.btn-loading::before {
  display: none;
}

/* Custom validation styles */
.was-validated .custom-input:invalid,
.custom-input.is-invalid {
  border-color: var(--error-color);
}

.was-validated .custom-input:invalid:focus,
.custom-input.is-invalid:focus {
  border-color: var(--error-color);
  box-shadow: 0 0 0 0.2rem rgba(214, 64, 69, 0.25);
}

.invalid-feedback {
  color: var(--error-color);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>

<script>
export default {
  name: 'ContactForm',
  data() {
    return {
      formData: {
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      },
      isSubmitting: false
    }
  },
  methods: {
    async submitForm() {
      this.isSubmitting = true
      try {
        // TODO: Implement API call to send message
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated API call
        
        // Reset form
        this.formData = {
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        }
        
        // Show success message
        alert('ส่งข้อความเรียบร้อยแล้ว')
      } catch (error) {
        console.error('Error submitting form:', error)
        alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
      } finally {
        this.isSubmitting = false
      }
    }
  }
}
</script>