// API Configuration
export const API_URL = "https://biyaheros.onrender.com/api";

// Error handling helper
export const handleApiError = (error) => {
  if (error.message === 'Network request failed') {
    return 'Unable to connect to the server. Please check your internet connection and make sure the backend server is running.';
  }
  return error.message || 'An unexpected error occurred';
};