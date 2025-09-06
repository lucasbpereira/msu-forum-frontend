// Check if backend server is running
async function checkServerStatus() {
  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('http://localhost:3000/health', {
      method: 'GET',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log('✅ Backend server is running on http://localhost:3000');
      return true;
    } else {
      console.log('❌ Backend server responded with error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Backend server is not running on http://localhost:3000');
    console.log('Please start your backend server first.');

    if (error instanceof Error) {
      console.log('Error:', error.message);
    } else {
      console.log('Unknown error occurred');
    }

    return false;
  }
}

// Usage in component or service
checkServerStatus().then(isRunning => {
  if (!isRunning) {
    console.log('🔧 To start a development server, run:');
    console.log('   cd your-backend-folder');
    console.log('   npm start');
  }
});

export { checkServerStatus };
