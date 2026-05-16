import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../../utils/api';
import { Bot, Send, Trash2, Sparkles, TrendingUp, AlertTriangle, Lightbulb, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';

const SESSION_ID = `session-${Date.now()}`;

const SUGGESTION_PROMPTS = [
  "Which route causes me the most delays?",
  "What's the best time for me to travel?",
  "What are my most common complaints?",
  "Am I experiencing more delays recently?",
  "Which stop should I avoid?",
  "How has my commute changed over time?",
];

const INSIGHT_ICONS = {
  pattern: TrendingUp,
  warning: AlertTriangle,
  tip: Lightbulb,
  positive: CheckCircle2,
};

const INSIGHT_COLORS = {
  pattern: 'bg-blue-50 border-blue-100 text-blue-700',
  warning: 'bg-amber-50 border-amber-100 text-amber-700',
  tip: 'bg-purple-50 border-purple-100 text-purple-700',
  positive: 'bg-green-50 border-green-100 text-green-700',
};

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm whitespace-pre-wrap'
            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm overflow-hidden'
        }`}
      >
        {isUser ? (
          msg.content
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
              li: ({node, ...props}) => <li className="pl-1" {...props} />,
              strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
              em: ({node, ...props}) => <em className="italic" {...props} />,
              h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2 mt-4 text-gray-900" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2 mt-3 text-gray-900" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-2 mt-2 text-gray-900" {...props} />,
              code: ({node, inline, className, children, ...props}) => {
                const match = /language-(\w+)/.exec(className || '')
                return !inline ? (
                  <div className="bg-gray-800 rounded-lg my-3 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-gray-900 text-gray-400 text-xs">
                      <span>{match?.[1] || 'code'}</span>
                    </div>
                    <pre className="p-3 overflow-x-auto">
                      <code className="text-gray-100 text-sm font-mono" {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                ) : (
                  <code className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md text-xs font-mono font-medium" {...props}>
                    {children}
                  </code>
                )
              },
              a: ({node, ...props}) => <a className="text-blue-600 hover:text-blue-700 hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-200 pl-4 py-1 italic my-3 text-gray-600 bg-gray-50 rounded-r-lg" {...props} />,
              table: ({node, ...props}) => <div className="overflow-x-auto my-4"><table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg" {...props} /></div>,
              thead: ({node, ...props}) => <thead className="bg-gray-50" {...props} />,
              tbody: ({node, ...props}) => <tbody className="divide-y divide-gray-200 bg-white" {...props} />,
              tr: ({node, ...props}) => <tr className="transition-colors hover:bg-gray-50/50" {...props} />,
              th: ({node, ...props}) => <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider" {...props} />,
              td: ({node, ...props}) => <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap" {...props} />,
              hr: ({node, ...props}) => <hr className="my-4 border-gray-200" {...props} />,
            }}
          >
            {msg.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

export default function AICompanion() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [tab, setTab] = useState('chat'); // 'chat' | 'insights'
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Greeting message
    setMessages([
      {
        role: 'assistant',
        content: "👋 Hi! I'm your AI Commute Companion. I've analyzed your travel history and I'm ready to give you personalized insights about your commute.\n\nAsk me anything — like which routes delay you most, or when you should travel to avoid crowds!",
      },
    ]);
    // Load insights
    loadInsights();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadInsights = async () => {
    setInsightsLoading(true);
    try {
      const data = await api.get('/ai-companion/insights');
      setInsights(data.insights || []);
    } catch {
      setInsights([]);
    } finally {
      setInsightsLoading(false);
    }
  };

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    setMessages(prev => [...prev, { role: 'user', content }]);
    setInput('');
    setLoading(true);

    try {
      const data = await api.post('/ai-companion/chat', { message: content, sessionId: SESSION_ID });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Sorry, I couldn't process that. ${err.message || 'Please try again.'}`,
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = async () => {
    try {
      await api.post('/ai-companion/clear', { sessionId: SESSION_ID });
    } catch {}
    setMessages([
      {
        role: 'assistant',
        content: "Chat cleared! I'm ready for fresh questions about your commute 🚌",
      },
    ]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="page-header flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="page-title mb-0">AI Commute Companion</h1>
          </div>
          <p className="page-sub">Personalized transit intelligence powered by your travel history</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {['chat', 'insights'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'chat' ? '💬 Chat' : '📊 Insights'}
          </button>
        ))}
      </div>

      {tab === 'chat' && (
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
          {/* Chat Panel */}
          <div className="flex-1 flex flex-col card p-0 overflow-hidden min-h-[500px]">
            {/* Chat toolbar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-gray-500 font-medium">AI Companion · Online</span>
              </div>
              <button
                onClick={clearChat}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.map((msg, i) => (
                <Message key={i} msg={msg} />
              ))}
              {loading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your commute patterns..."
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
                  style={{ maxHeight: '120px', overflowY: 'auto' }}
                  disabled={loading}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 rounded-xl flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
                >
                  {loading
                    ? <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    : <Send className="w-4 h-4 text-white" />
                  }
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5 px-1">Press Enter to send · Shift+Enter for new line</p>
            </div>
          </div>

          {/* Suggestions Panel */}
          <div className="lg:w-64 space-y-4 flex-shrink-0">
            <div className="card">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Try asking...</h3>
              <div className="space-y-2">
                {SUGGESTION_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt)}
                    disabled={loading}
                    className="w-full text-left text-sm text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 px-3 py-2 rounded-xl transition-all border border-transparent hover:border-blue-100 disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700">How it works</span>
              </div>
              <p className="text-xs text-blue-600 leading-relaxed">
                Your AI Companion analyzes your personal feedback and delay reports to give insights no generic transit app can match.
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === 'insights' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">AI-generated insights from your commute history</p>
            <button
              onClick={loadInsights}
              disabled={insightsLoading}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${insightsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {insightsLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-500">Analyzing your commute patterns...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {insights.map((insight, i) => {
                const Icon = INSIGHT_ICONS[insight.type] || Lightbulb;
                const colorClass = INSIGHT_COLORS[insight.type] || INSIGHT_COLORS.tip;
                return (
                  <div key={i} className={`border rounded-2xl p-5 ${colorClass}`}>
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-sm mb-1">{insight.title}</div>
                        <div className="text-sm opacity-90 leading-relaxed">{insight.body}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="card mt-6 bg-gradient-to-br from-gray-50 to-blue-50/30 border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Want to dig deeper?</div>
                <div className="text-xs text-gray-500">Switch to the Chat tab to ask specific questions about your commute</div>
              </div>
              <button onClick={() => setTab('chat')} className="ml-auto btn-primary text-xs px-4 py-2 whitespace-nowrap">
                Open Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
