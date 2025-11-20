// API fetch wrapper with automatic 401 handling
export const apiFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);

    // If 401 Unauthorized, clear session and redirect to login
    if (response.status === 401) {
      // Clear any auth state
      if (typeof window !== "undefined") {
        // Redirect to login
        window.location.href = "/login";
      }
      throw new Error("Unauthorized");
    }

    return response;
  } catch (error) {
    throw error;
  }
};

// Setup global fetch interceptor
if (typeof window !== "undefined") {
  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    const response = await originalFetch(...args);

    // Auto-redirect on 401 for API calls
    if (response.status === 401 && args[0].toString().startsWith("/api/")) {
      const pathname = window.location.pathname;

      // Only redirect if we're on a protected route
      if (pathname.startsWith("/dashboard")) {
        // Small delay to allow any pending state updates
        setTimeout(() => {
          window.location.href = "/login?session=expired";
        }, 100);
      }
    }

    return response;
  };
}
