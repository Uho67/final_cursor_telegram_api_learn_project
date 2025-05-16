<template>
  <div class="app">
    <nav class="navbar">
      <router-link to="/">Home</router-link>
      <router-link to="/dashboard">Dashboard</router-link>
    </nav>
    
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
// Component logic here
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  padding: 1rem;
  background-color: #2c3e50;
  display: flex;
  gap: 1rem;
}

.navbar a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.navbar a:hover {
  background-color: #34495e;
}

.main-content {
  flex: 1;
  padding: 2rem;
}
</style> 