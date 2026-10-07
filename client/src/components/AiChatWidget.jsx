import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Trash2, 
  ArrowUpRight, 
  Globe, 
  TrendingUp,
  HelpCircle,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { fetchAiChat } from '../services/api';

export default function AiChatWidget({
  selectedCurrency = 'USD',
  currencies = []
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 **Welcome to FXPulse AI Intelligence!**\n\nI can analyze real-time macroeconomic news, central bank actions (Fed & RBI), inflation reports, and live currency trends to explain **why** currencies are moving.\n\nAsk me anything or click a suggestion below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: []
    }
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const suggestedPrompts = [
    `Why is ${selectedCurrency} moving against INR today?`,
    `What Fed & RBI actions are impacting the Rupee?`,
    `How do crude oil & FII flows affect USD/INR?`,
    `Is this a favorable rate to convert ${selectedCurrency} to INR?`
  ];

  const handleSend = async (textToSend = inputMessage) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetchAiChat({
        message: trimmed,
        history,
        currency: selectedCurrency
      });

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.reply || 'Analysis complete.',
        sources: res.sources || [],
        metrics: res.metrics || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('AI chat failed:', err);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ **Unable to fetch AI response.**\n\nPlease ensure your server is active or try asking again in a moment.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Chat cleared. Ready for your next market query on **${selectedCurrency}/INR**!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: []
      }
    ]);
  };

  // Helper to render simple markdown formatting (bold, lists, headers)
  const formatMarkdown = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    return (
      <div className="space-y-2 text-xs leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1.5" />;

          // Headers
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="text-sm font-bold text-zinc-900 mt-2 pb-1 border-b border-zinc-100">
                {line.replace('### ', '')}
              </h4>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h3 key={idx} className="text-base font-bold text-zinc-900 mt-3">
                {line.replace('## ', '')}
              </h3>
            );
          }

          // Bullet points
          if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
            const content = line.trim().substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-amber-500 font-bold">•</span>
                <div>{renderFormattedInline(content)}</div>
              </div>
            );
          }

          // Numbered lists
          const numMatch = line.match(/^(\d+)\.\s(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1 font-normal">
                <span className="font-bold text-amber-600 min-w-[14px]">{numMatch[1]}.</span>
                <div>{renderFormattedInline(numMatch[2])}</div>
              </div>
            );
          }

          return <p key={idx}>{renderFormattedInline(line)}</p>;
        })}
      </div>
    );
  };

  // Helper to parse **bold** and `code`
  const renderFormattedInline = (str) => {
    const parts = str.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-zinc-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-zinc-700">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="bg-zinc-100 px-1 py-0.5 rounded text-[11px] font-mono text-zinc-800">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full shadow-2xl hover:shadow-zinc-900/40 border border-zinc-700 transition-all hover:scale-105 group active:scale-95"
          aria-label="Open FXPulse AI Assistant"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-tight">
            Ask AI Analyst
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-amber-300 border border-zinc-700">
            {selectedCurrency}/INR
          </span>
        </button>
      )}

      {/* Floating Chat Modal Window */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white border border-zinc-200 shadow-2xl rounded-2xl flex flex-col transition-all duration-200 overflow-hidden ${
            isExpanded
              ? 'inset-4 sm:inset-10 max-w-4xl mx-auto'
              : 'bottom-6 right-4 sm:right-6 w-full max-w-[420px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-zinc-900 text-white flex items-center justify-between border-b border-zinc-800 select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-white">
                    FXPulse AI Analyst
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                    Live News & Macro
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-normal">
                  Context: <span className="text-amber-300 font-medium">{selectedCurrency}/INR</span> reference telemetry
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-zinc-400">
              <button
                type="button"
                onClick={clearChat}
                className="p-1.5 rounded-lg hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg hover:text-zinc-200 hover:bg-zinc-800 transition-colors hidden sm:block"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:text-white hover:bg-zinc-800 transition-colors"
                title="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/40">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm ${
                    m.role === 'user'
                      ? 'bg-zinc-900 text-white rounded-br-none'
                      : 'bg-white border border-zinc-200 text-zinc-800 rounded-bl-none'
                  }`}
                >
                  {m.role === 'user' ? (
                    <p className="text-xs whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  ) : (
                    <div>{formatMarkdown(m.content)}</div>
                  )}

                  {/* Grounding Sources */}
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-zinc-100 text-[11px] text-zinc-500 space-y-1">
                      <div className="flex items-center gap-1 font-semibold text-zinc-700">
                        <Globe className="w-3 h-3 text-amber-600" />
                        <span>Referenced Sources & Bulletins:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {m.sources.map((s, idx) => (
                          <a
                            key={idx}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 hover:bg-amber-50 hover:text-amber-700 text-[10px] font-medium text-zinc-600 border border-zinc-200 transition-colors"
                          >
                            <span>{s.title}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-1 text-[10px] text-right opacity-60">
                    {m.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 shrink-0 shadow-sm animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-zinc-200 rounded-2xl rounded-bl-none p-3.5 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                    <span>Analyzing live FX metrics, Fed policy & market news...</span>
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="p-2.5 bg-white border-t border-zinc-100 overflow-x-auto flex gap-1.5 no-scrollbar">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-100 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 border border-zinc-200/80 text-zinc-700 transition-colors disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-zinc-200 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder={`Ask AI about ${selectedCurrency}/INR news, Fed/RBI actions...`}
              className="flex-1 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!inputMessage.trim() || loading}
              className="p-2.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-900 transition-all shrink-0 shadow-sm"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
