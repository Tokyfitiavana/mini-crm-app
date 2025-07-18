export const authFetch = (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("authToken");
    console.log("Token from localStorage:", token);
  
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  };
  