import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/api';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await axiosInstance.post(API_ENDPOINTS.signup, {
        username,
        email,
        password,
        re_password: confirmPassword,
      });
      setSuccess('Registration successful! Please check your email to activate your account.');
    } catch (err: any) {
      console.error('Signup error:', err.response?.data);
      const errorData = err.response?.data;
      if (typeof errorData === 'object') {
        const errorMessages = Object.entries(errorData)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
        setError(errorMessages);
      } else {
        setError('Registration failed');
      }
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 p-6 border-2">
      <form
        onSubmit={handleSignup}
        className="bg-blue-800 rounded-lg shadow-lg p-8 w-full max-w-md text-gray-100 border-2 border-yellow-400"
        noValidate
      >
        <h2 className="text-3xl font-extrabold mb-6 border-b-4 border-yellow-400 pb-2 text-yellow-300 text-center border-2">
          Sign Up
        </h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          className="mb-4 w-full rounded-lg px-4 py-2 text-gray-100 border-2 border-yellow-400 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="mb-4 w-full rounded-lg px-4 py-2 text-gray-100 border-2 border-yellow-400 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="mb-4 w-full rounded-lg px-4 py-2 text-gray-100 border-2 border-yellow-400 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          className="mb-6 w-full rounded-lg px-4 py-2 text-gray-100 border-2 border-yellow-400 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        <button
          type="submit"
          className="w-full bg-yellow-400 text-blue-900 font-bold py-3 rounded-lg hover:bg-yellow-500 transition"
        >
          Sign Up
        </button>

        {error && (
          <p className="mt-4 whitespace-pre-line text-red-400 font-semibold bg-red-900 p-3 rounded">
            {error}
          </p>
        )}
        {success && (
          <p className="mt-4 text-green-400 font-semibold bg-green-900 p-3 rounded">
            {success}
          </p>
        )}
      </form>
    </div>
  );
};

export default Signup;
