<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-900">
    <div class="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
      <!-- Logo and Organization Name -->
      <div class="flex flex-col items-center space-y-4 mb-8">
        <img 
          src="/logo.jpeg" 
          alt="Nagar Nigam Rudrapur Logo" 
          class="w-32 h-32 object-contain"
        />
        <h1 class="text-2xl font-bold text-center text-white">Nagar Nigam Rudrapur</h1>
      </div>

      <h2 class="text-3xl font-bold text-center text-white">Login</h2>
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-300">Email</label>
          <input
            v-model="email"
            id="email"
            type="email"
            required
            class="w-full px-4 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-300">Password</label>
          <input
            v-model="password"
            id="password"
            type="password"
            required
            class="w-full px-4 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          class="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Sign In
        </button>
      </form>
      <div class="text-center text-gray-400">
        Don't have an account?
        <router-link to="/signup" class="text-blue-400 hover:underline">Sign Up</router-link>
      </div>
      <div v-if="error" class="text-red-500 text-center text-sm">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../services/apiClient'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

const handleLogin = async () => {
  try {
    const res = await apiClient.post('/api/auth/login', {
      email: email.value,
      password: password.value
    })
    localStorage.setItem('token', res.data.token)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.msg || 'Login failed'
  }
}
</script>
