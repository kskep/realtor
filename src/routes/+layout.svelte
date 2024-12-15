<script>
  import "../app.css";
  let isSidebarOpen = true;
</script>

<div class="h-screen bg-gray-50">
  <!-- Top Navigation -->
  <nav class="bg-white border-b border-gray-200">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex items-center flex-shrink-0">
            <img class="w-auto h-8" src="/your-logo.svg" alt="Your Logo" />
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <a href="/" class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-primary-500">
              Dashboard
            </a>
            <a href="/properties" class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700">
              Properties
            </a>
            <a href="/clients" class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700">
              Clients
            </a>
          </div>
        </div>
        <div class="flex items-center">
          <!-- Add profile dropdown or other navigation items here -->
        </div>
      </div>
    </div>
  </nav>

  <!-- Main Content -->
  <div class="py-6">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <slot />
    </div>
  </div>
</div>