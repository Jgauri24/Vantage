import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ChatBox = ({ jobId, jobTitle }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [socket, setSocket] = useState(null);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);

    // Calculate Socket URL (remove /api from the end of the API_URL if present)
    const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace('/api', '');

    useEffect(() => {
        // Initialize Socket
        const newSocket = io(socketUrl);
        setSocket(newSocket);

        // Join Room
        newSocket.emit('joinRoom', jobId);

        // Listen for messages
        newSocket.on('receiveMessage', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        // Fetch initial history
        const fetchHistory = async () => {
            try {
                const res = await api.get(`/messages/${jobId}`);
                setMessages(res.data);
            } catch (err) {
                console.error("Failed to load chat history", err);
                if (err.response && err.response.status === 403) {
                    setError('You are not authorized to view this chat.');
                }
            }
        };
        fetchHistory();

        return () => newSocket.close();
    }, [jobId, socketUrl]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newItem.trim() || !socket) return;

        const messageData = {
            jobId,
            senderId: user.id || user._id,
            content: newItem
        };

        socket.emit('sendMessage', messageData);
        setNewItem('');
    };

    return (
        <div className="bg-secondary-bg border border-border rounded-xl shadow-xl flex flex-col h-[500px]">
            <div className="p-4 border-b border-border bg-primary-bg rounded-t-xl">
                <h3 className="font-serif text-lg text-text-main">Chat: {jobTitle}</h3>
                <p className="text-xs text-text-muted">Discuss project details securely.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary-bg">
                {error ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-red-500 text-sm">{error}</p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, idx) => {
                            const isMe = (msg.sender._id || msg.sender) === (user.id || user._id);
                            return (
                                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-lg p-3 ${isMe
                                            ? 'bg-accent-gold text-primary-bg rounded-br-none'
                                            : 'bg-card-bg border border-border text-text-main rounded-bl-none'
                                        }`}>
                                        <div className="text-xs font-bold mb-1 opacity-70">
                                            {isMe ? 'You' : msg.sender.name}
                                        </div>
                                        <p className="text-sm">{msg.content}</p>
                                        <span className="text-[10px] opacity-50 block text-right mt-1">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {!error && (
                <form onSubmit={handleSend} className="p-4 border-t border-border bg-primary-bg rounded-b-xl flex gap-2">
                    <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-secondary-bg border border-border rounded p-2 text-text-main focus:outline-none focus:border-accent-gold"
                    />
                    <button
                        type="submit"
                        className="bg-accent-gold text-primary-bg px-4 py-2 rounded font-bold uppercase tracking-wider text-xs hover:bg-opacity-90 transition"
                    >
                        Send
                    </button>
                </form>
            )}
        </div>
    );
};

export default ChatBox;
