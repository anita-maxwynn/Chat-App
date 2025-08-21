import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/api';

interface ChatRoomProps {
  roomId: string;
  username: string;
}

interface Message {
  username: string;
  message: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId, username }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [inCall, setInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [remoteAudioEnabled, setRemoteAudioEnabled] = useState(true);

  const ws = useRef<WebSocket | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const iceServers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
  const iceCandidateQueue = useRef<RTCIceCandidateInit[]>([]);

  // Fetch previous chat messages
  useEffect(() => {
    axiosInstance
      .get(API_ENDPOINTS.messages(roomId))
      .then(res => {
        setMessages(
          res.data.map((msg: any) => ({ username: msg.username, message: msg.value }))
        );
      })
      .catch(err => console.error('Failed to fetch messages:', err));
  }, [roomId]);

  // Setup WebSocket
  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8000/ws/chat/${roomId}/`);

    ws.current.onopen = () => console.log('✅ WebSocket connected');

    ws.current.onmessage = async event => {
      const data = JSON.parse(event.data);

      // Chat messages
      if (data.message && data.username) {
        setMessages(prev => [...prev, { username: data.username, message: data.message }]);
        return;
      }

      // WebRTC signaling
      const action = data.action;
      const payload = data.data;

      if (!action || !payload || data.username === username) return;

      switch (action) {
        case 'offer':
          await handleOffer(payload);
          break;
        case 'answer':
          await handleAnswer(payload);
          break;
        case 'ice-candidate':
          await handleIceCandidate(payload);
          break;
      }
    };

    ws.current.onclose = () => console.log('❌ WebSocket disconnected');

    return () => {
      ws.current?.close();
      peerConnection.current?.close();
      localStream.current?.getTracks().forEach(track => track.stop());
      remoteStream.current?.getTracks().forEach(track => track.stop());
    };
  }, [roomId]);

  // --- WebRTC setup ---
  const createPeerConnection = async () => {
    if (peerConnection.current) return;

    peerConnection.current = new RTCPeerConnection(iceServers);

    // Add local tracks
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => {
        peerConnection.current?.addTrack(track, localStream.current!);
      });
    }

    // Remote tracks
    remoteStream.current = new MediaStream();
    peerConnection.current.ontrack = event => {
      console.log('Remote track received:', event.track.kind, event.track);
      event.streams[0].getTracks().forEach(track => {
        remoteStream.current?.addTrack(track);
        console.log('Added track to remote stream:', track.kind);
      });
      
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream.current;
        // Ensure audio plays
        remoteVideoRef.current.volume = 1.0;
        remoteVideoRef.current.play().catch(e => console.log('Auto-play prevented:', e));
      }
      
      // Process any queued ICE candidates
      while (iceCandidateQueue.current.length > 0) {
        const candidate = iceCandidateQueue.current.shift();
        if (candidate) {
          peerConnection.current?.addIceCandidate(new RTCIceCandidate(candidate))
            .catch(e => console.error('Error adding queued ICE candidate:', e));
        }
      }
    };

    // ICE candidates
    peerConnection.current.onicecandidate = event => {
      if (event.candidate && ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          action: 'ice-candidate',
          data: event.candidate,
          username,
        }));
      }
    };

    peerConnection.current.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.current?.connectionState);
    };

    peerConnection.current.oniceconnectionstatechange = () => {
      console.log('ICE state:', peerConnection.current?.iceConnectionState);
    };
  };

  const startCall = async () => {
    // Get local stream
    localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream.current;

    await createPeerConnection();

    // Create offer
    const offer = await peerConnection.current!.createOffer();
    await peerConnection.current!.setLocalDescription(offer);

    // Send to backend
    ws.current?.send(JSON.stringify({ action: 'offer', data: offer, username }));
    setInCall(true);
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    // Get local stream if not exists
    if (!localStream.current) {
      localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = localStream.current;
    }

    await createPeerConnection();

    await peerConnection.current!.setRemoteDescription(new RTCSessionDescription(offer));
    
    // Process any queued ICE candidates after setting remote description
    while (iceCandidateQueue.current.length > 0) {
      const candidate = iceCandidateQueue.current.shift();
      if (candidate) {
        await peerConnection.current!.addIceCandidate(new RTCIceCandidate(candidate))
          .catch(e => console.error('Error adding queued ICE candidate:', e));
      }
    }
    
    const answer = await peerConnection.current!.createAnswer();
    await peerConnection.current!.setLocalDescription(answer);

    ws.current?.send(JSON.stringify({ action: 'answer', data: answer, username }));
    setInCall(true);
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnection.current) return;

    if (peerConnection.current.signalingState === 'have-local-offer') {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      
      // Process any queued ICE candidates after setting remote description
      while (iceCandidateQueue.current.length > 0) {
        const candidate = iceCandidateQueue.current.shift();
        if (candidate) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate))
            .catch(e => console.error('Error adding queued ICE candidate:', e));
        }
      }
      
      setInCall(true);
    } else {
      console.warn('Received answer in wrong state:', peerConnection.current.signalingState);
    }
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (peerConnection.current?.remoteDescription) {
      await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    } else {
      iceCandidateQueue.current.push(candidate);
    }
  };

  const endCall = () => {
    localStream.current?.getTracks().forEach(track => track.stop());
    remoteStream.current?.getTracks().forEach(track => track.stop());
    peerConnection.current?.close();
    peerConnection.current = null;
    localStream.current = null;
    remoteStream.current = null;
    setInCall(false);
    setIsMuted(false);
    setIsVideoOff(false);
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  // --- Audio/Video controls ---
  const toggleMute = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // --- Chat functions ---
  const sendMessage = () => {
    if (!ws.current || !input.trim()) return;

    ws.current.send(JSON.stringify({
      action: 'chat',
      message: input,
      username,
    }));

    setInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="bg-blue-800 h-screen w-full flex flex-col items-center justify-center p-6">
      <div className="max-w-6xl w-full grid grid-cols-2 gap-6">

        {/* Chat */}
        <div className="p-6 bg-blue-900 rounded-lg shadow-lg text-gray-100 flex flex-col">
          <h2 className="text-2xl font-bold mb-4 border-b-4 border-yellow-400 pb-2">
            Room ID: <span className="text-yellow-400">{roomId}</span>
          </h2>
          <div className="flex-grow overflow-y-auto mb-4 border-2 border-yellow-400 rounded-md p-4 bg-blue-800" style={{ height: '350px' }}>
            {messages.length === 0 && <p className="text-yellow-300 italic">No messages yet. Say hi!</p>}
            {messages.map((msg, idx) => (
              <p key={idx} className={`${msg.username === username ? 'text-yellow-400 font-semibold' : 'text-gray-300'} mb-2`}>
                <strong>{msg.username}:</strong> {msg.message}
              </p>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              required
              className="flex-grow rounded-lg px-4 py-2 text-white bg-blue-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button type="submit" className="bg-yellow-400 text-blue-900 font-bold px-5 py-2 rounded-lg hover:bg-yellow-500 transition">Send</button>
          </form>
        </div>

        {/* Video Call */}
        <div className="p-6 bg-blue-900 rounded-lg shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Video Call</h2>
          
          {/* Video displays */}
          <div className="mb-4">
            <video 
              ref={localVideoRef} 
              autoPlay 
              muted 
              playsInline 
              className={`w-64 rounded-lg border-2 border-yellow-400 mb-2 ${isVideoOff ? 'bg-gray-800' : ''}`}
            />
            <p className="text-sm text-yellow-300 text-center">You {isMuted ? '🔇' : '🔊'}</p>
          </div>
          
          <div className="mb-4">
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline 
              controls={false}
              className="w-64 rounded-lg border-2 border-gray-300 mb-2" 
            />
            <p className="text-sm text-gray-300 text-center">Remote User</p>
          </div>
          
          {/* Call controls */}
          {!inCall && (
            <button 
              onClick={startCall} 
              className="mt-4 bg-yellow-400 text-blue-900 font-bold px-5 py-2 rounded-lg hover:bg-yellow-500 transition"
            >
              Start Call
            </button>
          )}
          
          {inCall && (
            <div className="flex space-x-3 mt-4">
              <button 
                onClick={toggleMute} 
                className={`px-4 py-2 rounded-lg font-bold transition ${
                  isMuted 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {isMuted ? '🔇 Unmute' : '🔊 Mute'}
              </button>
              
              <button 
                onClick={toggleVideo} 
                className={`px-4 py-2 rounded-lg font-bold transition ${
                  isVideoOff 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {isVideoOff ? '📹 Video On' : '📸 Video Off'}
              </button>
              
              <button 
                onClick={endCall} 
                className="bg-red-500 text-white font-bold px-5 py-2 rounded-lg hover:bg-red-600 transition"
              >
                End Call
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ChatRoom;
