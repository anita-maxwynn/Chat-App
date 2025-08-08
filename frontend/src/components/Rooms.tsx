import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/api';

interface ChatRoomProps {
  roomId: string;
  username: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId, username }) => {
  const [messages, setMessages] = useState<{ username: string; message: string }[]>([]);
  const [input, setInput] = useState('');
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    axiosInstance
      .get(API_ENDPOINTS.messages(roomId))
      .then(response => {
        setMessages(
          response.data.map((msg: any) => ({
            username: msg.username,
            message: msg.value,
          }))
        );
      })
      .catch(err => {
        console.error('Failed to fetch messages:', err);
      });

    ws.current = new WebSocket(`ws://localhost:8000/ws/chat/${roomId}/`);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = event => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, { username: data.username, message: data.message }]);
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      ws.current?.close();
    };
  }, [roomId]);

  const sendMessage = () => {
    if (ws.current && input.trim()) {
      ws.current.send(
        JSON.stringify({
          message: input,
          username,
        })
      );
      setInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className='bg-blue-800 h-screen w-full flex flex-col items-center justify-center p-6'>
    <div className="max-w-3xl mx-auto my-8 p-6 bg-blue-900 rounded-lg shadow-lg text-gray-100 flex flex-col">
      <h2 className="text-2xl font-bold mb-4 border-b-4 border-yellow-400 pb-2">
        Room ID: <span className="text-yellow-400">{roomId}</span>
      </h2>

      <div
        className="flex-grow overflow-y-auto mb-4 border-2 border-yellow-400 rounded-md p-4 bg-blue-800"
        style={{ height: '350px' }}
      >
        {messages.length === 0 && (
          <p className="text-yellow-300 italic">No messages yet. Say hi!</p>
        )}
        {messages.map((msg, idx) => (
          <p
            key={idx}
            className={`mb-2 ${
              msg.username === username ? 'text-yellow-400 font-semibold' : 'text-gray-300'
            }`}
          >
            <strong>{msg.username}:</strong> {msg.message}
          </p>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-3 border-amber-50">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          required
          className="flex-grow rounded-lg px-4 py-2 border-amber-50 text-white font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <button
          type="submit"
          className="bg-yellow-400 text-blue-900 font-bold px-5 py-2 rounded-lg hover:bg-yellow-500 transition"
        >
          Send
        </button>
      </form>
    </div>
    </div>
  );
};

export default ChatRoom;
