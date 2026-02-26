'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, User, Loader2, Command, Zap, Bot, ShieldCheck, Star, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const ChatBot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: user ? `Welcome back, ${user.name}! I'm your College 360 AI. How can I assist you in the ${user.role} portal today?` : "Hello! I'm your AI campus assistant. How can I help you navigate College 360 today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (customInput) => {
    const messageToSend = customInput || input;
    if (!messageToSend.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      text: messageToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role === 'bot' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      const response = await axios.post('/api/chat', {
        message: messageToSend,
        history: history,
        userContext: user ? { name: user.name, role: user.role, id: user.id } : null
      });

      const botMessage = {
        role: 'bot',
        text: response.data.message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: 'Connection failed. Please ensure the backend is live.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|\/api\/\w+|\/\w+)/);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: 'white', fontWeight: 900 }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('/')) {
        return <span key={i} style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.2)' }}>{part}</span>;
      }
      return part;
    });
  };

  const QuickAction = ({ icon: Icon, label, query }) => (
    <motion.button
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => handleSend(query)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', cursor: 'pointer', textAlign: 'center', color: 'white', transition: 'all 0.2s' }}
    >
      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
        <Icon size={20} />
      </div>
      <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.7 }}>{label}</span>
    </motion.button>
  );

  return (
    <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 1001 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.8, y: 20, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{ marginBottom: '24px', width: '420px', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(30px)', borderRadius: '32px', boxShadow: '0 32px 80px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '650px' }}
          >
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #6366f1, #4f46e5, #8b5cf6)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, padding: '32px', opacity: 0.1, pointerEvents: 'none' }}>
                <Sparkles size={120} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <Zap style={{ color: 'white', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.8))' }} />
                    <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '16px', height: '16px', background: '#22c55e', borderRadius: '50%', border: '2px solid #141416' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      College 360 AI <ShieldCheck size={16} style={{ opacity: 0.6 }} />
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em' }}>{isLoading ? 'Synthesizing...' : 'Adaptive Intelligence'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', color: 'white', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {messages.map((msg, index) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={index}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)', background: msg.role === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.2)' }}>
                      {msg.role === 'user' ? <User size={12} style={{ color: 'white' }} /> : <Command size={12} style={{ color: '#6366f1' }} />}
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)' }}>
                      {msg.role === 'user' ? (user?.name || 'You') : 'System Core'}
                    </span>
                  </div>
                  <div style={{
                    position: 'relative', padding: '16px 20px', borderRadius: '24px', fontSize: '0.875rem', lineHeight: 1.6, boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    ...(msg.role === 'user'
                      ? { background: '#6366f1', color: 'white', borderTopRightRadius: 0, border: '1px solid rgba(255,255,255,0.1)' }
                      : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.9)', borderTopLeftRadius: 0, border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(4px)' })
                  }}>
                    {renderText(msg.text)}
                    <span style={{ position: 'absolute', bottom: '-20px', fontSize: '9px', fontWeight: 700, opacity: 0.3, ...(msg.role === 'user' ? { right: 0 } : { left: 0 }) }}>{msg.time}</span>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px 24px', borderRadius: '24px', borderTopLeftRadius: 0, display: 'flex', gap: '8px' }}>
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: '8px', height: '8px', background: '#6366f1', borderRadius: '50%' }} />
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} style={{ width: '8px', height: '8px', background: '#6366f1', borderRadius: '50%' }} />
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} style={{ width: '8px', height: '8px', background: '#6366f1', borderRadius: '50%' }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '24px', background: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(30px)' }}>
              {!input && messages.length <= 2 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                  <QuickAction icon={Star} label="Academic" query="What study materials are available?" />
                  <QuickAction icon={Zap} label="Attendance" query="Check my attendance status" />
                  <QuickAction icon={AlertCircle} label="Complaints" query="How do I file a complaint?" />
                </motion.div>
              )}

              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#1A1A1E', padding: '8px', borderRadius: '22px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask College 360 AI..."
                    style={{ flex: 1, background: 'transparent', padding: '12px 16px', fontSize: '0.875rem', fontWeight: 600, color: 'white', border: 'none', outline: 'none' }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSend()}
                    disabled={isLoading || !input.trim()}
                    style={{
                      padding: '12px', borderRadius: '16px', border: 'none', cursor: 'pointer',
                      ...(input.trim() ? { background: '#6366f1', color: 'white', boxShadow: '0 0 20px rgba(99,102,241,0.5)' } : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)' })
                    }}
                  >
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} strokeWidth={2.5} />}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        layout
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '72px', height: '72px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden', border: 'none', cursor: 'pointer',
          ...(isOpen ? { background: 'white', color: 'black' } : { background: '#6366f1', color: 'white' })
        }}
      >
        {isOpen ? <X size={32} strokeWidth={2.5} /> : <Bot size={36} strokeWidth={2.5} />}
      </motion.button>
    </div>
  );
};

export default ChatBot;
