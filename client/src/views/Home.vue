<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <nav class="bg-gray-800 border-b border-gray-700 py-4 px-6">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <h1 class="text-2xl font-bold">File Manager</h1>
        <div class="space-x-4">
          <router-link to="/login" class="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700">
            Login
          </router-link>
          <router-link to="/signup" class="px-4 py-2 rounded border border-blue-600 hover:bg-blue-600">
            Sign Up
          </router-link>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-6 py-16">
      <div class="text-center mb-16">
        <h2 class="text-5xl font-bold mb-4">Welcome to File Manager</h2>
        <p class="text-xl text-gray-400 mb-8">
          Securely store, organize, and manage your files in one place
        </p>
        <div class="space-x-4">
          <router-link to="/dashboard" class="inline-block px-8 py-3 rounded bg-blue-600 hover:bg-blue-700 font-semibold">
            Get Started
          </router-link>
          <router-link to="/login" class="inline-block px-8 py-3 rounded border border-gray-600 hover:bg-gray-700 font-semibold">
            Sign In
          </router-link>
        </div>
      </div>

      <div class="grid md:grid-cols-3 gap-8 mt-12">
        <div class="bg-gray-700 rounded-lg p-8">
          <div class="text-3xl mb-4">📁</div>
          <h3 class="text-xl font-semibold mb-2">Organize Files</h3>
          <p class="text-gray-300">Keep all your important files organized and easily accessible.</p>
        </div>
        <div class="bg-gray-700 rounded-lg p-8">
          <div class="text-3xl mb-4">🔍</div>
          <h3 class="text-xl font-semibold mb-2">Fast Search</h3>
          <p class="text-gray-300">Quickly find files with our powerful search functionality.</p>
        </div>
        <div class="bg-gray-700 rounded-lg p-8">
          <div class="text-3xl mb-4">🔒</div>
          <h3 class="text-xl font-semibold mb-2">Secure Storage</h3>
          <p class="text-gray-300">Your files are protected with secure authentication and storage.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
// Home page component
</script>
