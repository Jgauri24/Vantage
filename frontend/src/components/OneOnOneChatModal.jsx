import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const OneOnOneChatModal = ({ isOpen, onClose, jobId, jobTitle, otherUser, currentUserId }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);

   
    const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace('/api', '');

    useEffect(() => {
        if (!isOpen || !otherUser || !jobId) return;

      
        const newSocket = io(socketUrl);
        setSocket(newSocket);

        const participants = [currentUserId, otherUser._id || otherUser.id].sort();
        const conversationId = `${jobId}_${participants.join('_')}`;

        
        newSocket.emit('joinConversation', conversationId);

 
        newSocket.on('receiveMessage', (message) => {
            setMessages((prev) => [...prev, message]);
        });

       
        const fetchHistory = async () => {
            try {
                const res = await api.get(`/messages/${jobId}/${otherUser._id || otherUser.id}`);
                setMessages(res.data);
            } catch (err) {
                console.error("Failed to load chat history", err);
                if (err.response && err.response.status === 403) {
                    setError('You are not authorized to view this chat.');
                }
            }
        };
        fetchHistory();

        return () => {
            newSocket.close();
        };
    }, [isOpen, jobId, otherUser, currentUserId, socketUrl]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !otherUser) return;

        const messageData = {
            jobId,
            senderId: currentUserId,
            recipientId: otherUser._id || otherUser.id,
            content: newMessage
        };

        socket.emit('sendMessage', messageData);
        setNewMessage('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-secondary-bg border border-border rounded-xl shadow-2xl w-full max-w-2xl flex flex-col h-[600px]">
                {/* Header */}
                <div className="p-4 border-b border-border bg-primary-bg rounded-t-xl flex justify-between items-center">
                    <div>
                        <h3 className="font-serif text-lg text-text-main">Chat with {otherUser?.name}</h3>
                        <p className="text-xs text-text-muted">{jobTitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-text-muted hover:text-text-main transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary-bg">
                    {error ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-red-500 text-sm">{error}</p>
                        </div>
                    ) : (
                        <>
                            {messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-text-muted text-sm">
                                    No messages yet. Start the conversation!
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = (msg.sender._id || msg.sender) === currentUserId;
                                    return (
                                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-lg p-3 ${
                                                isMe
                                                    ? 'bg-accent-gold text-primary-bg rounded-br-none'
                                                    : 'bg-primary-bg border border-border text-text-main rounded-bl-none'
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
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input */}
                {!error && (
                    <form onSubmit={handleSend} className="p-4 border-t border-border bg-primary-bg rounded-b-xl flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
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
        </div>
    );
};

export default OneOnOneChatModal;
