// Global API interceptor for handling 401 errors
(function () {
  if (typeof window === "undefined") return;

  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);

    // Check if it's a 401 on an API call
    if (response.status === 401) {
      const url = args[0];
      const isApiCall = typeof url === "string" && url.startsWith("/api/");

      if (isApiCall) {
        const currentPath = window.location.pathname;
        const isProtectedRoute = currentPath.startsWith("/dashboard");

        // Only redirect if we're on a protected route
        if (isProtectedRoute) {
          console.log("Session expired. Redirecting to login...");

          // Use replace to prevent back button issues
          setTimeout(() => {
            window.location.replace("/login?session=expired");
          }, 100);
        }
      }
    }

    return response;
  };
})();
