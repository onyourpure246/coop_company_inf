const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  pages: {
    index: {
      entry: 'src/main.js',
      title: 'งานสหกิจศึกษาสำหรับประชาสัมพันธ์สถานประกอบการ สาขาเทคโนโลยีสารสนเทศและการสื่อสารดิจิทัล' // เปลี่ยนเป็นชื่อที่ต้องการ
    }
  }
})
