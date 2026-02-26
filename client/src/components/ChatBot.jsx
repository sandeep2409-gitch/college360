import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, User, Loader2, Command, Zap, Bot, ShieldCheck, Star, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

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

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/chat`, {
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
      console.error('Chat error:', error);
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
        return <strong key={i} className="text-white font-black drop-shadow-sm">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('/')) {
        return <span key={i} className="px-2 py-0.5 bg-white/20 rounded font-mono text-[10px] tracking-wider uppercase border border-white/20 select-all">{part}</span>;
      }
      return part;
    });
  };

  const QuickAction = ({ icon: Icon, label, query }) => (
    <motion.button
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => handleSend(query)}
      className="flex flex-col items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all text-center"
    >
      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:text-white transition-colors">
        <Icon size={20} />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">{label}</span>
    </motion.button>
  );

  return (
    <div className="fixed bottom-8 right-8 z-[1001]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.8, y: 20, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="mb-6 w-[400px] sm:w-[450px] bg-black/80 backdrop-blur-3xl rounded-[32px] shadow-[0_32px_80px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden flex flex-col h-[650px]"
          >
            {}
            <div className="p-6 bg-gradient-to-br from-primary via-[#4f46e5] to-[#8b5cf6] relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Sparkles size={120} />
              </div>
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center relative border border-white/20 shadow-inner group">
                    <Zap className="text-white drop-shadow-[0_0_8px_rgba(255,b55,255,0.8)]" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#141416] animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                      College 360 AI <ShieldCheck size={16} className="text-white/60" />
                    </h3>
                    <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">{isLoading ? 'Synthesizing...' : 'Adaptive Intelligence'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-black/20 hover:bg-black/40 p-2 rounded-xl transition-all border border-white/5"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>

            {}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth" id="chat-messages">
              {messages.map((msg, index) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={index}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`flex items-center gap-2 mb-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${msg.role === 'user' ? 'bg-white/10 border-white/10' : 'bg-primary/20 border-primary/20'}`}>
                      {msg.role === 'user' ? <User size={12} className="text-white" /> : <Command size={12} className="text-primary" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                      {msg.role === 'user' ? (user?.name || 'You') : 'System Core'}
                    </span>
                  </div>

                  <div className={`relative px-5 py-4 rounded-[24px] text-sm leading-relaxed shadow-lg ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-tr-none border border-white/10'
                      : 'bg-white/5 text-white/90 rounded-tl-none border border-white/5 backdrop-blur-sm'
                  }`}>
                    {renderText(msg.text)}
                    <span className={`absolute -bottom-5 text-[9px] font-bold opacity-30 ${msg.role === 'user' ? 'right-0' : 'left-0'}`}>
                      {msg.time}
                    </span>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-start">
                  <div className="bg-white/5 border border-white/5 px-6 py-4 rounded-[24px] rounded-tl-none flex gap-2">
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-2 h-2 bg-primary rounded-full" />
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-2 h-2 bg-primary rounded-full" />
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-2 h-2 bg-primary rounded-full" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {}
            <div className="p-6 bg-black/40 border-t border-white/10 backdrop-blur-3xl">
              {!input && messages.length <= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-3 gap-3 mb-6"
                >
                  <QuickAction icon={Star} label="Academic" query="What study materials are available?" />
                  <QuickAction icon={Zap} label="Attendance" query="Check my attendance status" />
                  <QuickAction icon={AlertCircle} label="Complaints" query="How do I file a complaint?" />
                </motion.div>
              )}

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-[#8b5cf6] rounded-[24px] blur opacity-20 group-focus-within:opacity-40 transition-all" />
                <div className="relative flex items-center gap-3 bg-[#1A1A1E] p-2 rounded-[22px] border border-white/10 transition-all focus-within:border-primary/50">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask College 360 AI..."
                    className="flex-1 bg-transparent py-3 px-4 text-sm font-semibold text-white placeholder:text-white/20 focus:outline-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05, x: 2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSend()}
                    disabled={isLoading || !input.trim()}
                    className={`p-3 rounded-2xl transition-all ${
                      input.trim() ? 'bg-primary text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'bg-white/5 text-white/20'
                    }`}
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
        autoFocus
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-18 h-18 rounded-[24px] flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative group overflow-hidden transition-all duration-500 ${
          isOpen ? 'bg-white text-black' : 'bg-primary text-white'
        }`}
        style={{ width: '72px', height: '72px' }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? (
          <X size={32} strokeWidth={2.5} />
        ) : (
          <div className="relative">
            <Bot size={36} strokeWidth={2.5} />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -inset-2 bg-white rounded-full blur-md -z-1"
            />
          </div>
        )}
      </motion.button>
    </div>
  );
};

export default ChatBot;
