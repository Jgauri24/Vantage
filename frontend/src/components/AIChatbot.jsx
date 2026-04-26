import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CHATBOT_API_URL = 'https://vantage-awlc.onrender.com/api';
const chatbotApi = axios.create({ baseURL: CHATBOT_API_URL });
chatbotApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('vantage_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: "Hello! I'm your **Vantage AI Assistant** ✨\n\nI can help you navigate the platform, check your jobs, wallet, analytics, and more. What would you like to know?",
  suggestions: ['Show my jobs', 'Wallet balance', 'Help'],
  timestamp: new Date().toISOString()
};

function renderMarkdown(text) {
  if (!text) return '';
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-[var(--color-text-main)]">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic opacity-80">{part.slice(1, -1)}</em>;
    }
    return part.split('\n').map((line, j, arr) => (
      <span key={`${i}-${j}`}>{line}{j < arr.length - 1 && <br />}</span>
    ));
  });
}

export default function AIChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed) return;

    const userMsg = { role: 'user', content: trimmed, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await chatbotApi.post('/chatbot', { message: trimmed });
      const botMsg = {
        role: 'assistant',
        content: res.data.message,
        suggestions: res.data.suggestions || [],
        intent: res.data.intent,
        timestamp: res.data.timestamp
      };
      setTimeout(() => {
        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
      }, 400 + Math.random() * 400);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting. Please try again in a moment.",
        suggestions: ['Help'],
        timestamp: new Date().toISOString()
      }]);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Action Button */}
      <button
        id="ai-chatbot-toggle"
        onClick={() => { setIsOpen(!isOpen); setIsMinimized(false); }}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
          isOpen
            ? 'bg-[var(--color-text-main)] text-[var(--color-primary-bg)]'
            : 'bg-gradient-to-br from-[var(--color-accent-gold)] to-[var(--color-accent-gold-hover)] text-white'
        }`}
        style={{ boxShadow: isOpen ? undefined : '0 4px 24px rgba(184, 144, 101, 0.4)' }}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Notification dot */}
      {!isOpen && (
        <span className="fixed bottom-[72px] right-6 z-50 flex h-3 w-3 pointer-events-none">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent-gold)] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--color-accent-gold)]"></span>
        </span>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          id="ai-chatbot-window"
          className={`fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] rounded-2xl overflow-hidden border border-[var(--color-border)] flex flex-col ${
            isMinimized ? 'h-[56px]' : 'h-[560px] max-h-[calc(100vh-140px)]'
          }`}
          style={{
            boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(184,144,101,0.1)',
            background: 'var(--color-secondary-bg)',
            transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Header */}
          <div
            onClick={() => setIsMinimized(!isMinimized)}
            className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none border-b border-[var(--color-border)]"
            style={{ background: 'linear-gradient(135deg, var(--color-accent-gold-hover) 0%, #5a3f2e 100%)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <div className="text-white text-sm font-semibold tracking-wide" style={{ fontFamily: 'var(--font-family-serif)' }}>Vantage AI</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-white/70 text-[10px] uppercase tracking-widest font-medium">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setMessages([INITIAL_MESSAGE]); }}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                title="Clear chat"
              >
                <svg className="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <svg className={`w-4 h-4 text-white/60 transition-transform ${isMinimized ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
              </svg>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div
                className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
                style={{ background: 'linear-gradient(180deg, var(--color-primary-bg) 0%, var(--color-secondary-bg) 100%)' }}
              >
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[85%]">
                      <div
                        className={`px-4 py-3 text-[13px] leading-relaxed ${
                          msg.role === 'user'
                            ? 'rounded-2xl rounded-br-md bg-[var(--color-accent-gold-hover)] text-white'
                            : 'rounded-2xl rounded-bl-md bg-[var(--color-secondary-bg)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
                        }`}
                        style={msg.role === 'assistant' ? { boxShadow: '0 2px 8px rgba(0,0,0,0.04)' } : {}}
                      >
                        {renderMarkdown(msg.content)}
                      </div>

                      {msg.role === 'assistant' && msg.suggestions?.length > 0 && i === messages.length - 1 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5 pl-1">
                          {msg.suggestions.map((s, j) => (
                            <button
                              key={j}
                              onClick={() => sendMessage(s)}
                              className="px-3 py-1.5 rounded-full text-[11px] font-medium border border-[var(--color-border)] text-[var(--color-accent-gold-hover)] bg-[var(--color-secondary-bg)] hover:bg-[var(--color-accent-gold-hover)] hover:text-white hover:border-[var(--color-accent-gold-hover)] transition-all duration-200"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className={`text-[9px] text-[var(--color-text-muted)] mt-1 opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'} px-1`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[var(--color-secondary-bg)] border border-[var(--color-border)] rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <span className="w-2 h-2 bg-[var(--color-accent-gold)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-[var(--color-accent-gold)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-[var(--color-accent-gold)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-secondary-bg)]">
                <div className="flex items-center gap-2 bg-[var(--color-primary-bg)] border border-[var(--color-border)] rounded-xl px-3 py-1.5 focus-within:border-[var(--color-accent-gold)] focus-within:ring-1 focus-within:ring-[var(--color-accent-gold)]/30 transition-all">
                  <input
                    ref={inputRef}
                    id="ai-chatbot-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything..."
                    className="flex-1 bg-transparent text-[13px] text-[var(--color-text-main)] placeholder-[var(--color-text-muted)]/60 outline-none border-none py-1.5"
                    disabled={isTyping}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isTyping}
                    className="w-8 h-8 rounded-full bg-[var(--color-accent-gold-hover)] text-white flex items-center justify-center hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 transition-all duration-200 shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
                <div className="text-center mt-2">
                  <span className="text-[9px] text-[var(--color-text-muted)]/40 uppercase tracking-widest">Powered by Vantage Intelligence</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
