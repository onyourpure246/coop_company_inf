<template>
  <div class="stat-card" :class="{ 'trend-up': trend > 0, 'trend-down': trend < 0 }">
    <div class="stat-card-body">
      <div class="stat-header">
        <div class="icon-wrapper" :style="{ backgroundColor: `var(--${bgColor}-color)` }">
          <component :is="icon" class="stat-icon"></component>
        </div>
        <div class="stat-info">
          <p class="stat-title">{{ title }}</p>
          <p class="stat-value">{{ value }}</p>
        </div>
      </div>
      <div class="stat-trend">
        <div class="trend-indicator">
          <span class="trend-arrow" :class="{ 'up': trend > 0, 'down': trend < 0 }">
            {{ trend > 0 ? '↑' : '↓' }}
          </span>
          <span class="trend-value" :class="{ 'positive': trend > 0, 'negative': trend < 0 }">
            {{ Math.abs(trend) }}%
          </span>
          <span class="trend-period">vs last month</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    value: {
      type: [Number, String],
      required: true
    },
    trend: {
      type: Number,
      default: 0
    },
    bgColor: {
      type: String,
      default: 'primary'
    },
    icon: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.stat-card {
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 4px rgba(7, 42, 64, 0.1);
  transition: all var(--transition-duration);
  padding: var(--padding);
  height: 100%;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(7, 42, 64, 0.15);
}

.stat-card-body {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: var(--gap);
}

.icon-wrapper {
  padding: 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-duration);
}

.stat-icon {
  width: 32px;
  height: 32px;
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 0.875rem;
  text-transform: uppercase;
  color: var(--text-color);
  opacity: 0.7;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.stat-trend {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(7, 42, 64, 0.1);
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.trend-arrow {
  font-size: 1.2rem;
  line-height: 1;
}

.trend-arrow.up {
  color: var(--success-color);
}

.trend-arrow.down {
  color: var(--error-color);
}

.trend-value {
  font-weight: 600;
}

.trend-value.positive {
  color: var(--success-color);
}

.trend-value.negative {
  color: var(--error-color);
}

.trend-period {
  color: var(--text-color);
  opacity: 0.7;
  font-size: 0.875rem;
}

/* Hover effects for trend indicators */
.trend-up:hover .icon-wrapper {
  background-color: var(--highlight-success-color) !important;
}

.trend-down:hover .icon-wrapper {
  background-color: var(--highlight-error-color) !important;
}
</style>