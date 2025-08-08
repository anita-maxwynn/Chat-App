import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axiosInstance.post(API_ENDPOINTS.login, {
        username,
        password,
      });

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err.response?.data);
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 p-6">
      <form
        onSubmit={handleLogin}
        className="bg-blue-800 rounded-lg shadow-lg p-8 w-full max-w-md text-gray-100 border-2 border-yellow-400"
        noValidate
      >
        <h2 className="text-3xl font-extrabold mb-6 border-b-4 border-yellow-400 pb-2 text-yellow-300 text-center">
          Login
        </h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          className="mb-4 w-full rounded-lg px-4 py-2 font-medium focus:outline-none focus:ring-2 text-gray-100 border-2 border-yellow-400 focus:ring-yellow-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="mb-6 w-full rounded-lg px-4 py-2 text-gray-100 border-2 border-yellow-400 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        <button
          type="submit"
          className="w-full bg-yellow-400 border-2 text-blue-900 border-yellow-400 font-bold py-3 rounded-lg hover:bg-yellow-500 transition"
        >
          Login
        </button>

        {error && (
          <p className="mt-4 text-red-400 font-semibold bg-red-900 p-3 rounded text-center">
            {error}
          </p>
        )}
      </form>
    </div>
  );
};

export default Login;
