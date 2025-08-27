<template>
  <div class="container mt-5">
    <div class="card">
      <div class="card-body">
        <h1 class="card-title text-center mb-4">นโยบายความเป็นส่วนตัว</h1>
        
        <div class="privacy-content">
          <section class="mb-4">
            <h2>1. การเก็บรวบรวมข้อมูล</h2>
            <p>เราเก็บรวบรวมข้อมูลต่อไปนี้จากผู้ใช้งาน:</p>
            <ul>
              <li>ข้อมูลส่วนบุคคล เช่น ชื่อ-นามสกุล, รหัสนักศึกษา</li>
              <li>ข้อมูลการติดต่อ เช่น อีเมล, เบอร์โทรศัพท์</li>
              <li>ข้อมูลการศึกษาและประวัติการฝึกงาน</li>
            </ul>
          </section>

          <section class="mb-4">
            <h2>2. การใช้ข้อมูล</h2>
            <p>ข้อมูลที่เก็บรวบรวมจะถูกนำไปใช้เพื่อ:</p>
            <ul>
              <li>การจัดการบัญชีผู้ใช้งาน</li>
              <li>การประมวลผลการสมัครฝึกงาน</li>
              <li>การติดต่อสื่อสารกับผู้ใช้งาน</li>
              <li>การปรับปรุงการให้บริการของระบบ</li>
            </ul>
          </section>

          <section class="mb-4">
            <h2>3. การรักษาความปลอดภัย</h2>
            <p>เรามีมาตรการในการรักษาความปลอดภัยของข้อมูล ดังนี้:</p>
            <ul>
              <li>การเข้ารหัสข้อมูลที่สำคัญ</li>
              <li>การจำกัดการเข้าถึงข้อมูล</li>
              <li>การสำรองข้อมูลอย่างสม่ำเสมอ</li>
            </ul>
          </section>

          <section class="mb-4">
            <h2>4. สิทธิของผู้ใช้งาน</h2>
            <p>ผู้ใช้งานมีสิทธิดังต่อไปนี้:</p>
            <ul>
              <li>สิทธิในการเข้าถึงข้อมูลส่วนบุคคล</li>
              <li>สิทธิในการแก้ไขข้อมูลให้ถูกต้อง</li>
              <li>สิทธิในการลบข้อมูล</li>
            </ul>
          </section>

          <section class="mb-4">
            <h2>5. การติดต่อ</h2>
            <p>หากมีข้อสงสัยเกี่ยวกับนโยบายความเป็นส่วนตัว สามารถติดต่อได้ที่:</p>
            <ul>
              <li>อีเมล: admin@example.com</li>
              <li>โทรศัพท์: 02-XXX-XXXX</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No additional script needed for this static page
</script>

<style scoped>
.privacy-content {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  color: var(--primary-color);
  font-size: 2rem;
}

h2 {
  color: #2c3e50;
  font-size: 1.5rem;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}

section {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

ul {
  padding-left: 1.5rem;
}

li {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

p {
  line-height: 1.6;
  color: #4a4a4a;
}
</style>