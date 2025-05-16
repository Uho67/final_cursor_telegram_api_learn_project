<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <div class="dashboard-content">
      <div class="card">
        <h2>Account Status</h2>
        <p>Connected to Telegram</p>
      </div>
      <div class="card">
        <h2>Recent Activity</h2>
        <p>No recent activity</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Component logic here
</script>

<style scoped>
.dashboard {
  padding: 2rem;
}

.dashboard-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

h2 {
  color: #34495e;
  margin-bottom: 0.5rem;
}

p {
  color: #666;
}
</style> 