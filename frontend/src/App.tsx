import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Nav from './components/Nav';
import Home from './components/Home';
import ChatRoom from './components/Rooms';
import { useParams } from 'react-router-dom';
import axiosInstance from './api/axiosInstance';
import { useEffect, useState } from 'react';
import './App.css';
// Helper to check if user is authenticated
const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};

// Protected route wrapper
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
};

// Wrapper component to extract roomId param and pass username
const ChatRoomWrapper = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const res = await axiosInstance.get('/auth/users/me/');
        setUsername(res.data.username);
      } catch (err) {
        setError('Failed to fetch user profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsername();
  }, []);

  if (!roomId) {
    return <div>Room ID not found</div>;
  }

  if (loading) {
    return <div>Loading user info...</div>;
  }

  if (error || !username) {
    // If error or no username, redirect to login or show error
    return <Navigate to="/login" replace />;
  }

  return <ChatRoom roomId={roomId} username={username} />;
};

function App() {
  return (
    <>
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat/:roomId"
            element={
              <PrivateRoute>
                <ChatRoomWrapper />
              </PrivateRoute>
            }
          />

          {/* Redirect root to home or login */}
          <Route
            path="/"
            element={isAuthenticated() ? <Navigate to="/home" /> : <Navigate to="/login" />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
