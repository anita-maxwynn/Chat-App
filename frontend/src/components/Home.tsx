import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/api';

interface Room {
  id: number;
  name: string;
}

const Home = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRooms = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.chatRooms);
      setRooms(response.data);
    } catch (err: any) {
      setError('Failed to load chat rooms');
      console.error('Home error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const roomName = (e.target as HTMLFormElement).elements.namedItem('roomName') as HTMLInputElement;
    if (!roomName.value) return;

    try {
      await axiosInstance.post(API_ENDPOINTS.chatRooms, { name: roomName.value });
      roomName.value = ''; // Clear input after submission
      fetchRooms(); // Refresh room list
    } catch (err: any) {
      setError('Failed to create chat room');
      console.error('Create room error:', err);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-gold-500">
        <span className="text-xl font-semibold text-yellow-400 animate-pulse">Loading...</span>
      </div>
    );

  return (
  <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 p-6">
    <div className="w-fit border-2 p-6 flex flex-col items-center text-gray-100 bg-blue-900 rounded-lg">
      <h1 className="text-4xl font-extrabold mb-8 border-b-4 border-yellow-400 pb-2 flex justify-center px-auto mx-auto">Chat Rooms</h1>

      {error && (
        <div className="mb-4 text-red-400 font-semibold bg-red-900 px-4 py-2 rounded w-full max-w-md text-center">
          {error}
        </div>
      )}

      {rooms.length === 0 ? (
        <p className="text-yellow-300 italic mb-6">No chat rooms available.</p>
      ) : (
        <ul className="w-full max-w-md space-y-3 mb-8">
          {rooms.map(room => (
            <li
              key={room.id}
              className="bg-blue-800 hover:bg-blue-700 transition-colors rounded-lg shadow-md border-2 border-yellow-400"
            >
              <a
                href={`/chat/${room.id}`}
                className="block px-6 py-3 text-yellow-300 font-semibold text-lg hover:text-yellow-500"
              >
                {room.name}
              </a>
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-2xl font-semibold mb-4 border-b-2 border-yellow-400 pb-1 w-full max-w-md text-center">
        Want to create a room?
      </h2>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md flex space-x-3 items-center"
        autoComplete="off"
      >
        <input
          type="text"
          name="roomName"
          placeholder="Room Name"
          required
          className="flex-grow border-2 rounded-lg px-4 py-2 text-white font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <button
          type="submit"
          className="bg-yellow-400 text-blue-900 font-bold px-5 py-2 rounded-lg hover:bg-yellow-500 transition"
        >
          Create Room
        </button>
      </form>
    </div>
  </div>
);
}

export default Home;
