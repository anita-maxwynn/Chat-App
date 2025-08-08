const BASE_URL = "http://localhost:8000/";

export const API_ENDPOINTS = {
  // User registration
  signup: `${BASE_URL}auth/users/`,              // POST to create/register user

  // Login - get JWT tokens
  login: `${BASE_URL}auth/token/jwt/create/`,   // POST with credentials, returns access & refresh tokens

  // Token refresh
  refreshToken: `${BASE_URL}auth/token/jwt/refresh/`, // POST with refresh token to get new access token

  // Verify token (optional)
  verifyToken: `${BASE_URL}auth/token/jwt/verify/`,  // POST with token to verify

  // Get/update logged-in user info
  userProfile: `${BASE_URL}auth/users/me/`,       // GET, PUT, PATCH user profile

  // Fetch and create chat rooms
  chatRooms: `${BASE_URL}chat/rooms/`,           // GET to list rooms

  messages: (roomId: string) => `${BASE_URL}chat/rooms/${roomId}/messages/`, // GET to list messages in a room, POST to send message
};