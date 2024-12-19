const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' // Production URL
  : 'http://localhost:3000/api'; // Development URL (Next.js default port)

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return response;
} 