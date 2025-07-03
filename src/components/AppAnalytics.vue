<template>
  <div class="analytics-container">
    <h1 class="page-title">Application Analytics</h1>
    
    <!-- Posts and Comments Analytics -->
    <div class="analytics-section">
      <h2 class="section-title">Posts and Comments Statistics</h2>
      
      <!-- Range Selection -->
      <div class="range-selector">
        <CButtonGroup role="group">
          <CButton 
            :class="selectedRange === 'weekly' ? 'btn-active' : 'btn-inactive'"
            @click="changeRange('weekly')"
          >
            Weekly
          </CButton>
          <CButton 
            :class="selectedRange === 'monthly' ? 'btn-active' : 'btn-inactive'"
            @click="changeRange('monthly')"
          >
            Monthly
          </CButton>
          <CButton 
            :class="selectedRange === 'yearly' ? 'btn-active' : 'btn-inactive'"
            @click="changeRange('yearly')"
          >
            Yearly
          </CButton>
        </CButtonGroup>
      </div>

      <!-- Charts Container -->
      <div class="charts-container">
        <!-- Posts Chart -->
        <div class="chart-wrapper">
          <h3>Number of Posts</h3>
          <div class="chart-container">
            <canvas ref="postsChart"></canvas>
          </div>
        </div>

        <!-- Comments Chart -->
        <div class="chart-wrapper">
          <h3>Number of Comments</h3>
          <div class="chart-container">
            <canvas ref="commentsChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- User Activity Analytics -->
    <div class="analytics-section">
      <h2 class="section-title">User Activity</h2>
      <div class="user-activity-container">
        <div class="chart-wrapper">
          <h3>User Activity Distribution</h3>
          <div class="chart-container">
            <canvas ref="userActivityChart"></canvas>
          </div>
        </div>
        <div class="stats-summary">
          <div class="stat-card">
            <h4>Users with Posts</h4>
            <p class="stat-value">{{ userStats.posted?.toFixed(1) }}%</p>
          </div>
          <div class="stat-card">
            <h4>Comments Only</h4>
            <p class="stat-value">{{ userStats.commentedOnly?.toFixed(1) }}%</p>
          </div>
          <div class="stat-card">
            <h4>Inactive Users</h4>
            <p class="stat-value">{{ userStats.inactive?.toFixed(1) }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="loading-overlay">
      <CSpinner color="primary" />
      <p>Loading analytics...</p>
    </div>
  </div>
</template>

<script setup>
import { CButton, CButtonGroup, CSpinner } from '@coreui/vue';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
import { nextTick, onMounted, ref } from 'vue';

// Register Chart.js components
Chart.register(...registerables);

// Reactive data
const selectedRange = ref('monthly');
const loading = ref(false);
const postsData = ref({});
const commentsData = ref({});
const userStats = ref({});

// Chart references
const postsChart = ref(null);
const commentsChart = ref(null);
const userActivityChart = ref(null);

// Chart instances
let postsChartInstance = null;
let commentsChartInstance = null;
let userActivityChartInstance = null;

// API calls
const fetchPostsData = async (range) => {
  try {
    const response = await axios.get(`http://localhost:8080/analytics/posts?range=${range}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching posts data:', error);
    return {};
  }
};

const fetchCommentsData = async (range) => {
  try {
    const response = await axios.get(`http://localhost:8080/analytics/comments?range=${range}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments data:', error);
    return {};
  }
};

const fetchUserActivityData = async () => {
  try {
    const response = await axios.get('http://localhost:8080/analytics/user-activity');
    return response.data;
  } catch (error) {
    console.error('Error fetching user activity data:', error);
    return {};
  }
};

// Chart creation functions
const createLineChart = (canvas, data, label, color) => {
  const ctx = canvas.getContext('2d');
  
  const labels = Object.keys(data);
  const values = Object.values(data);

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: values,
        borderColor: color,
        backgroundColor: color + '20',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
};

const createDoughnutChart = (canvas, data) => {
  const ctx = canvas.getContext('2d');

  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Users with Posts', 'Comments Only', 'Inactive Users'],
      datasets: [{
        data: [data.posted || 0, data.commentedOnly || 0, data.inactive || 0],
        backgroundColor: [
          '#ec5d43',
          '#f18571',
          '#ffc107'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.label + ': ' + context.parsed.toFixed(1) + '%';
            }
          }
        }
      }
    }
  });
};

// Update charts
const updateCharts = async () => {
  loading.value = true;
  
  try {
    // Fetch data
    const [posts, comments, userActivity] = await Promise.all([
      fetchPostsData(selectedRange.value),
      fetchCommentsData(selectedRange.value),
      fetchUserActivityData()
    ]);

    postsData.value = posts;
    commentsData.value = comments;
    userStats.value = userActivity;

    await nextTick();

    // Destroy existing charts
    if (postsChartInstance) postsChartInstance.destroy();
    if (commentsChartInstance) commentsChartInstance.destroy();
    if (userActivityChartInstance) userActivityChartInstance.destroy();

    // Create new charts
    postsChartInstance = createLineChart(
      postsChart.value,
      postsData.value,
      'Posts',
      '#ec5d43'
    );

    commentsChartInstance = createLineChart(
      commentsChart.value,
      commentsData.value,
      'Comments',
      '#f18571'
    );

    userActivityChartInstance = createDoughnutChart(
      userActivityChart.value,
      userStats.value
    );

  } catch (error) {
    console.error('Error updating charts:', error);
  } finally {
    loading.value = false;
  }
};

// Range change handler
const changeRange = async (range) => {
  selectedRange.value = range;
  await updateCharts();
};

// Lifecycle
onMounted(async () => {
  await updateCharts();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Delius+Swash+Caps&display=swap');

.analytics-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Delius Swash Caps', cursive;
}

.page-title {
  font-size: 2.5rem;
  color: #ec5d43;
  text-align: center;
  margin-bottom: 2rem;
  font-weight: 700;
}

.analytics-section {
  background-color: #F5F5F0;
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.8rem;
  color: #4A4A4A;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.range-selector {
  margin-bottom: 2rem;
  text-align: center;
}

.range-selector :deep(.btn-group) .btn {
  font-family: 'Delius Swash Caps', cursive;
  font-weight: 500;
  border: 2px solid #ec5d43;
  transition: all 0.3s ease;
}

.btn-active {
  background-color: #ec5d43 !important;
  border-color: #ec5d43 !important;
  color: white !important;
}

.btn-inactive {
  background-color: transparent !important;
  border-color: #ec5d43 !important;
  color: #ec5d43 !important;
}

.btn-inactive:hover {
  background-color: #f18571 !important;
  border-color: #f18571 !important;
  color: white !important;
}

.charts-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.chart-wrapper {
  background-color: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.chart-wrapper h3 {
  font-size: 1.3rem;
  color: #4A4A4A;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 600;
}

.chart-container {
  height: 300px;
  position: relative;
}

.user-activity-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  align-items: start;
}

.stats-summary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-card {
  background-color: white;
  border-radius: 10px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-card h4 {
  font-size: 1rem;
  color: #4A4A4A;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.stat-value {
  font-size: 2rem;
  color: #ec5d43;
  font-weight: 700;
  margin: 0;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  color: white;
  font-size: 1.2rem;
}

.loading-overlay p {
  margin-top: 1rem;
  font-weight: 600;
}

/* Responsive design */
@media (max-width: 768px) {
  .analytics-container {
    padding: 1rem;
  }

  .charts-container {
    grid-template-columns: 1fr;
  }

  .user-activity-container {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 2rem;
  }

  .section-title {
    font-size: 1.5rem;
  }
}
</style>