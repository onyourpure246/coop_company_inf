<template>
  <div :class="['notification', type]" v-show="show">
    <div class="notification-content">
      <span class="message">{{ message }}</span>
      <button class="close-button" @click="close">&times;</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppNotification',
  props: {
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'info',
      validator: function(value) {
        return ['success', 'warning', 'error', 'info'].indexOf(value) !== -1
      }
    },
    duration: {
      type: Number,
      default: 3000
    }
  },
  data() {
    return {
      show: true
    }
  },
  mounted() {
    if (this.duration > 0) {
      setTimeout(() => {
        this.close()
      }, this.duration)
    }
  },
  methods: {
    close() {
      this.show = false
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 4px;
  color: white;
  max-width: 350px;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

.notification-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0 0 0 10px;
  opacity: 0.7;
}

.close-button:hover {
  opacity: 1;
}

.warning {
  background-color: #f0ad4e;
}

.error {
  background-color: #d9534f;
}

.success {
  background-color: #5cb85c;
}

.info {
  background-color: #5bc0de;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>