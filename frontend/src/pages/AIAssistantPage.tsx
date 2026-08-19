import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCRM } from '../context/CRMContext';
import { AIChatMessage } from '../types/crm';
import { api } from '../services/api';
import { 
  Bot, Send, Sparkles, FileText, CheckCircle2, AlertTriangle, 
  ArrowRight, Plus, RefreshCw, CornerDownLeft, ShieldCheck, ExternalLink,
  Check, User, Building2, TrendingUp, Calendar, Clock
} from 'lucide-react';

interface AIAssistantPageProps {
  onNavigate: (tab: string) => void;
}

export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({ onNavigate }) => {
  const { user, role } = useAuth();
  const { createTask, createEvent } = useCRM();
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'ai',
      text: `Hello **${user?.name?.split(' ')[0] || 'Kabir'}**! I am your **Nexora AI Knowledge Assistant**.\n\nI have real-time access to your indexed company documents (policies, SLAs, pricing, KYC) and live CRM database records. Ask any question or select a prompt below!`,
      timestamp: 'Just now',
      confidence: 1.0
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmedActionIds, setConfirmedActionIds] = useState<Record<string, boolean>>({});
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
        text: "I was unable to retrieve a verified answer from the knowledge base. Please ensure the relevant policies and records are indexed.",
        timestamp: 'Just now',
        confidence: 0.20
      };
      setMessages(prev => [...prev, fallbackAiMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async (msgId: string, action: any) => {
    if (action.type === 'create_task') {
      await createTask({
        title: action.payload?.title || 'AI Recommended Task',
        customer_name: action.payload?.customer_name || 'Internal Operations',
        priority: action.payload?.priority || 'Normal',
        due_date: action.payload?.due_date || '22 Aug 2026',
        assigned_to: action.payload?.assigned_to || user?.name || 'Amit Sharma',
        description: action.payload?.description || 'Task created via AI Assistant confirmation.',
        is_ai_generated: true
      });
      setConfirmedActionIds(prev => ({ ...prev, [msgId]: true }));
    } else if (action.type === 'schedule_meeting') {
      await createEvent({
        title: action.payload?.title || 'Meeting with Customer',
        customer_name: action.payload?.customer_name || 'Client',
        event_type: action.payload?.event_type || 'Meeting',
        date: action.payload?.date || '2026-08-20',
        time: action.payload?.time || '11:00 AM',
        duration: action.payload?.duration || '30 mins',
        location: action.payload?.location || 'Google Meet',
        description: 'Scheduled via AI Assistant confirmation.'
      });
      setConfirmedActionIds(prev => ({ ...prev, [msgId]: true }));
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
              AI Knowledge & CRM Assistant
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Multi-source grounding over internal company policy documents (RAG) and live CRM database records.
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

      {/* Chat Messages Container */}
      <div className="card" style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        backgroundColor: 'var(--bg-app)'
      }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            {/* Sender tag */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '6px',
              fontSize: '12px',
              color: 'var(--text-muted)'
            }}>
              {msg.sender === 'ai' ? (
                <>
                  <Bot size={14} color="var(--accent-blue)" />
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Nexora AI Assistant</span>
                  {msg.confidence !== undefined && (
                    <span 
                      style={{
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: msg.confidence >= 0.8 ? 'rgba(5, 150, 105, 0.12)' : 'rgba(217, 119, 6, 0.12)',
                        color: msg.confidence >= 0.8 ? 'var(--accent-emerald)' : 'var(--accent-amber)'
                      }}
                      title="Computed grounding match quality against knowledge base chunks or structured CRM tables"
                    >
                      Grounding Score: {Math.round(msg.confidence * 100)}%
                    </span>
                  )}
                </>
              ) : (
                <span style={{ fontWeight: 600 }}>You</span>
              )}
            </div>

            {/* Message Bubble */}
            <div style={{
              padding: '14px 18px',
              borderRadius: '14px',
              backgroundColor: msg.sender === 'user' ? 'var(--primary)' : 'var(--bg-card)',
              color: msg.sender === 'user' ? 'var(--text-inverse)' : 'var(--text-primary)',
              border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-xs)',
              fontSize: '14px',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap'
            }}>
              {msg.text}
            </div>

            {/* CRM Record Cards Preview */}
            {msg.crm_records && msg.crm_records.length > 0 && (
              <div style={{
                marginTop: '12px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '10px',
                width: '100%'
              }}>
                {msg.crm_records.map((rec, i) => (
                  <div
                    key={i}
                    className="card"
                    style={{
                      padding: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'var(--bg-card)'
                    }}
                  >
                    <div>
                      <span className="badge badge-accent" style={{ fontSize: '10px' }}>{rec.type}</span>
                      <h5 style={{ fontSize: '13px', fontWeight: 700, marginTop: '4px' }}>{rec.title}</h5>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{rec.subtitle}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: '12.5px' }}>{rec.value}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ACTION CONFIRMATION CARD */}
            {msg.recommended_action && (
              <div style={{
                marginTop: '12px',
                padding: '14px 16px',
                borderRadius: '10px',
                background: confirmedActionIds[msg.id] ? 'rgba(5, 150, 105, 0.08)' : 'linear-gradient(135deg, rgba(37, 99, 235, 0.06) 0%, rgba(124, 58, 237, 0.06) 100%)',
                border: confirmedActionIds[msg.id] ? '1px solid rgba(5, 150, 105, 0.3)' : '1px solid rgba(37, 99, 235, 0.25)',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} color={confirmedActionIds[msg.id] ? 'var(--accent-emerald)' : 'var(--accent-blue)'} />
                    <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: confirmedActionIds[msg.id] ? 'var(--accent-emerald)' : 'var(--accent-blue)' }}>
                      {confirmedActionIds[msg.id] ? 'Action Executed' : 'Suggested Action'}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px', color: 'var(--text-primary)' }}>
                    {msg.recommended_action.payload?.title || msg.recommended_action.label}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Target: {msg.recommended_action.payload?.customer_name || 'CRM'} • Priority: {msg.recommended_action.payload?.priority || 'Normal'}
                  </p>
                </div>

                <div>
                  {confirmedActionIds[msg.id] ? (
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={14} /> Added to Tasks
                    </span>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleConfirmAction(msg.id, msg.recommended_action)}
                    >
                      <Plus size={13} /> {msg.recommended_action.label || 'Confirm & Create'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Grounding Source Citations */}
            {msg.sources && msg.sources.length > 0 && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Grounding Sources & Citations
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {msg.sources.map((src, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      title={src.snippet}
                    >
                      <FileText size={12} color="var(--accent-blue)" />
                      <strong>{src.title}</strong>
                      {src.page && <span style={{ color: 'var(--text-muted)' }}>(Page {src.page})</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
            <Sparkles size={16} color="var(--accent-blue)" style={{ animation: 'spin 1.5s linear infinite' }} />
            <span>Consulting internal knowledge base and active CRM data...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Queries Chips */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {quickQuestions.map((qq, i) => (
          <button
            key={i}
            onClick={() => handleSend(qq)}
            className="btn btn-secondary btn-sm"
            style={{ whiteSpace: 'nowrap', fontSize: '12px', padding: '4px 10px' }}
          >
            {qq}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            className="input-control"
            placeholder="Ask anything about enterprise discounts, SLA terms, high-value leads, deals closing..."
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSend();
            }}
            disabled={loading}
            style={{ paddingRight: '40px', fontSize: '13.5px' }}
          />
        </div>

        <button
          onClick={() => handleSend()}
          className="btn btn-primary"
          disabled={loading || !inputQuery.trim()}
          style={{ height: '42px', padding: '0 18px' }}
        >
          <Send size={16} />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
};
