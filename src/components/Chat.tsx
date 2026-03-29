import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Send, User, Bot, Loader2, Calendar, Image as ImageIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Message, GeminiResponse } from "../types";
import { getChatResponse } from "../services/gemini";
import { cn } from "../lib/utils";
import Booking from "./Booking";

const STORAGE_KEY = "smile_crafters_chat_history";

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingComplete, setBookingComplete] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    } else {
      // Initial greeting
      const initialMessage: Message = {
        id: "initial",
        role: "model",
        content: JSON.stringify({
          text: "Hello! I'm your Smile Crafters assistant. How can I help you achieve your perfect smile today? We offer everything from porcelain veneers to AI clear aligners."
        }),
        timestamp: Date.now()
      };
      setMessages([initialMessage]);
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));
      history.push({ role: "user", parts: [{ text: input }] });

      const response = await getChatResponse(history);
      
      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: JSON.stringify(response),
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, modelMessage]);
      if (response.showBooking) {
        setShowBooking(true);
      }
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingComplete = (data: any) => {
    setBookingComplete(data);
    setShowBooking(false);
    
    const confirmationMessage: Message = {
      id: Date.now().toString(),
      role: "model",
      content: JSON.stringify({
        text: `Great! Your ${data.type} consultation is booked for **${data.date}** at **${data.time}**. We've sent a confirmation to **${data.email}**. We look forward to seeing you, ${data.name}!`
      }),
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, confirmationMessage]);
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your chat history?")) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-2xl overflow-hidden relative">
      {/* Header */}
      <header className="bg-blue-600 p-4 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
            SC
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Smile Crafters</h1>
            <p className="text-blue-100 text-xs">AI Dental Assistant</p>
          </div>
        </div>
        <button 
          onClick={clearHistory}
          className="p-2 hover:bg-blue-500 rounded-lg transition-colors text-blue-100"
          title="Clear History"
        >
          <X size={20} />
        </button>
      </header>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => {
            let data: GeminiResponse;
            try {
              data = m.role === "model" ? JSON.parse(m.content) : { text: m.content };
            } catch (e) {
              data = { text: m.content };
            }

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm",
                  m.role === "user" ? "bg-blue-600 text-white" : "bg-white text-blue-600 border border-blue-100"
                )}>
                  {m.role === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>
                
                <div className="space-y-2">
                  <div className={cn(
                    "p-4 rounded-2xl shadow-sm",
                    m.role === "user" 
                      ? "bg-blue-600 text-white rounded-tr-none" 
                      : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                  )}>
                    <div className="prose prose-sm max-w-none prose-p:leading-relaxed">
                      <ReactMarkdown>{data.text}</ReactMarkdown>
                    </div>
                  </div>

                  {data.imageUrl && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="rounded-xl overflow-hidden border border-gray-200 shadow-md bg-gray-50 p-1 flex justify-center"
                    >
                      <img 
                        src={data.imageUrl} 
                        alt="Dental Service" 
                        className="max-w-full max-h-[min(70vh,640px)] w-auto h-auto object-contain rounded-lg"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${data.imageUrl}/800/600`;
                        }}
                      />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {isLoading && (
          <div className="flex gap-3 mr-auto max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-white border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-2">
              <Loader2 className="animate-spin text-blue-600" size={16} />
              <span className="text-sm text-gray-500 font-medium">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Booking Overlay */}
      <AnimatePresence>
        {showBooking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md relative"
            >
              <button 
                onClick={() => setShowBooking(false)}
                className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-red-500 z-10"
              >
                <X size={18} />
              </button>
              <Booking 
                onComplete={handleBookingComplete}
                onCancel={() => setShowBooking(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about veneers, implants, or booking..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
          >
            <Send size={20} />
          </button>
        </form>
        <p className="text-[10px] text-center text-gray-400 mt-2">
          Smile Crafters Assistant can make mistakes. Please verify important information.
        </p>
      </div>
    </div>
  );
}
