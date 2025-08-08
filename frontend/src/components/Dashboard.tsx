import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/api';

interface User {
  id: number;
  username: string;
  email: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.userProfile);
        setUser(response.data);
      } catch (err: any) {
        setError('Failed to load user data');
        console.error('Dashboard error:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900">
        <span className="text-yellow-400 text-xl font-semibold animate-pulse">Loading...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900">
        <p className="text-red-500 font-semibold bg-red-900 px-6 py-3 rounded">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 flex flex-col items-center justify-center p-6 text-gray-100">
      <div className="bg-blue-800 border-2 border-yellow-400 rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-extrabold mb-6 border-b-4 border-yellow-400 pb-2 text-yellow-300">
          Dashboard
        </h1>
        {user && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Welcome, <span className="text-yellow-400">{user.username}</span>!</h2>
            <p>
              <span className="font-semibold">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-semibold">User ID:</span> {user.id}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="mt-8 w-full bg-yellow-400 text-blue-900 font-bold py-2 rounded-lg hover:bg-yellow-500 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
