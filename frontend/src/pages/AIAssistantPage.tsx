import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCRM } from '../context/CRMContext';
import { AIChatMessage } from '../types/crm';
import { api } from '../services/api';
import { 
  Bot, Send, Sparkles, FileText, CheckCircle2, AlertTriangle, 
  ArrowRight, Plus, RefreshCw, CornerDownLeft, ShieldCheck, ExternalLink
} from 'lucide-react';

interface AIAssistantPageProps {
  onNavigate: (tab: string) => void;
}

export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({ onNavigate }) => {
  const { user, role } = useAuth();
  const { createTask } = useCRM();
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'ai',
      text: `Hello ${user?.name.split(' ')[0] || 'Kabir'}! I am your **Nexora AI Knowledge Assistant**.\n\nI have access to your indexed internal company documents (policies, pricing, SLAs, KYC rules) and live CRM data records. Ask me anything or try one of the quick queries below!`,
      timestamp: 'Just now',
      confidence: 1.0
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "What is our enterprise discount policy?",
    "What is our refund and cancellation policy?",
    "What documents are required for customer onboarding?",
    "Show me all high-value leads in Mumbai.",
    "Which deals are likely to close this month?",
    "Which customers are at high churn risk?",
    "Summarize TechNova Solutions.",
    "Which sales executive has the highest conversion rate?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryToSend?: string) => {
    const q = queryToSend || inputQuery;
    if (!q.trim() || loading) return;

    const userMsg: AIChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryToSend) setInputQuery('');
    setLoading(true);

    try {
      const res = await api.chatAI(q, role);
      const aiMsg: AIChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: res.answer,
        timestamp: 'Just now',
        confidence: res.confidence,
        sources: res.sources,
        crm_records: res.crm_records,
        recommended_action: res.recommended_action
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const fallbackAiMsg: AIChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: "According to company records, please check the indexed policies or live CRM database.",
        timestamp: 'Just now',
        confidence: 0.85
      };
      setMessages(prev => [...prev, fallbackAiMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAction = async (action: any) => {
    if (action.type === 'create_task') {
      await createTask({
        title: action.payload?.title || 'AI Recommended Task',
        customer_name: action.payload?.customer_name || 'Client',
        priority: action.payload?.priority || 'Normal',
        due_date: '20 Aug 2026',
        assigned_to: user?.name || 'Amit Sharma'
      });
      alert(`Task "${action.payload?.title}" created successfully!`);
    } else if (action.type === 'schedule_meeting') {
      onNavigate('calendar');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              backgroundColor: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}>
              <Bot size={18} />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em' }}>
              AI Knowledge Assistant
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Ask questions about your company's products, policies, processes, and real-time CRM database records.
          </p>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="btn btn-secondary btn-sm"
          style={{ gap: '6px' }}
        >
          <RefreshCw size={13} />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Quick Question Chips */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '12.5px',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
            onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border-color)')}
          >
            <Sparkles size={12} color="var(--accent-blue)" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="card" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: '0'
      }}>
        {/* Messages Stream */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {messages.map(msg => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
                flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: msg.sender === 'user' ? '#0F172A' : '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                flexShrink: 0
              }}>
                {msg.sender === 'user' ? user?.name[0] || 'K' : <Bot size={18} />}
              </div>

              {/* Message Bubble */}
              <div style={{
                maxWidth: '75%',
                backgroundColor: msg.sender === 'user' ? 'var(--primary)' : 'var(--bg-muted)',
                color: msg.sender === 'user' ? 'var(--text-inverse)' : 'var(--text-primary)',
                padding: '14px 18px',
                borderRadius: '14px',
                borderTopRightRadius: msg.sender === 'user' ? '2px' : '14px',
                borderTopLeftRadius: msg.sender === 'ai' ? '2px' : '14px',
                fontSize: '13.5px',
                lineHeight: 1.6,
                boxShadow: 'var(--shadow-xs)'
              }}>
                {/* Text Body */}
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.text.split('\n').map((line, lIdx) => {
                    if (line.startsWith('• ') || line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
                      return <div key={lIdx} style={{ margin: '3px 0' }}>{line}</div>;
                    }
                    return <p key={lIdx} style={{ marginBottom: line ? '6px' : '0' }}>{line}</p>;
                  })}
                </div>

                {/* CRM Records Attached */}
                {msg.crm_records && msg.crm_records.length > 0 && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {msg.crm_records.map((rec, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '13px' }}>{rec.title}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{rec.subtitle} • {rec.value}</div>
                        </div>
                        <span className="badge badge-low">{rec.badge}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Grounded Source Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div style={{
                    marginTop: '12px',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      📚 Grounded Citations & Sources:
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {msg.sources.map((src, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            fontSize: '11.5px',
                            color: 'var(--accent-blue)',
                            fontWeight: 600
                          }}
                        >
                          <FileText size={12} />
                          <span>{src.title} (Pg {src.page})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Action Button */}
                {msg.recommended_action && (
                  <div style={{
                    marginTop: '12px',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <button
                      onClick={() => handleExecuteAction(msg.recommended_action)}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '12px', gap: '4px' }}
                    >
                      <Plus size={13} />
                      <span>{msg.recommended_action.label}</span>
                    </button>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Confidence: {Math.round((msg.confidence || 0.95) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <Bot size={18} />
              </div>
              <div style={{
                padding: '12px 18px',
                borderRadius: '14px',
                backgroundColor: 'var(--bg-muted)',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Sparkles size={14} className="animate-spin" />
                <span>Synthesizing answer from company documents & CRM vector store...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-card)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <input
            type="text"
            placeholder="Ask about company pricing, customer SLAs, high-value leads in Mumbai, or deal predictions..."
            className="input-control"
            style={{ flex: 1, padding: '11px 14px' }}
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSend();
            }}
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || loading}
            className="btn btn-primary"
            style={{ padding: '11px 18px' }}
          >
            <span>Ask</span>
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
