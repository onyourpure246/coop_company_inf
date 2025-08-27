<template>
  <div class="contact-page min-vh-100">
    <div class="container py-5">
      <!-- Header Section -->
      <div class="row mb-5 fade-in">
        <div class="col-12 text-center">
          <h2 class="display-4 fw-bold mb-3 text-gradient">ติดต่อฝ่ายสหกิจศึกษา</h2>
          <p class="lead">ท่านสามารถติดต่อเจ้าหน้าที่ฝ่ายสหกิจศึกษาได้ตามช่องทางด้านล่าง</p>
          <div class="header-underline"></div>
        </div>
      </div>

      <!-- Contact Information Cards -->
      <div class="row g-4 mb-5">
        <div class="col-12 col-lg-6 slide-in-left">
          <ContactInfoCard />
        </div>
        <div class="col-12 col-lg-6 slide-in-right">
          <ContactLocationCard />
        </div>
      </div>

      <!-- Contact Form Section -->
      <div class="row mb-5">
        <div class="col-12 fade-in-up">
          <div class="card contact-form-card">
            <div class="card-body p-4 p-lg-5">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="row">
        <div class="col-12 fade-in-up">
          <ContactFAQ />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact-page {
  background-color: var(--background-color);
  background-image: linear-gradient(135deg, rgba(24, 183, 190, 0.05) 0%, rgba(7, 42, 64, 0.05) 100%);
}

.text-gradient {
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: var(--primary-color);
}

.header-underline {
  width: 80px;
  height: 4px;
  background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
  margin: 1.5rem auto;
  border-radius: var(--border-radius);
}

.contact-form-card {
  border: none;
  border-radius: calc(var(--border-radius) * 2);
  box-shadow: 0 8px 24px rgba(7, 42, 64, 0.1);
  transition: all var(--transition-duration);
}

.contact-form-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 32px rgba(7, 42, 64, 0.15);
}

/* Animations */
.fade-in {
  animation: fadeIn 1s ease-out;
}

.fade-in-up {
  animation: fadeInUp 1s ease-out;
}

.slide-in-left {
  animation: slideInLeft 1s ease-out;
}

.slide-in-right {
  animation: slideInRight 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>

<script>
import ContactInfoCard from '../contact/ContactInfoCard.vue'
import ContactLocationCard from '../contact/ContactLocationCard.vue'
import ContactForm from '../contact/ContactForm.vue'
import ContactFAQ from '../contact/ContactFAQ.vue'

export default {
  name: 'ContactPage',
  components: {
    ContactInfoCard,
    ContactLocationCard,
    ContactForm,
    ContactFAQ
  }
}
</script>