import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCRM } from '../context/CRMContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { 
  Bot, Send, Sparkles, FileText, CheckCircle2, AlertTriangle, 
  ArrowRight, Plus, RefreshCw, CornerDownLeft, ShieldCheck, ExternalLink,
  Check, User, Building2, TrendingUp, Calendar, Clock, CheckSquare
} from 'lucide-react';

interface AIChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  confidence?: number;
  sources?: any[];
  crm_records?: any[];
  recommended_action?: any;
}

interface AIAssistantPageProps {
  onNavigate: (tab: string) => void;
}

export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({ onNavigate }) => {
  const { user, role } = useAuth();
  const { createTask, createEvent } = useCRM();
  const { addToast } = useToast();
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'ai',
      text: `Hello **${user?.name?.split(' ')[0] || 'User'}**! I am your **Nexora Enterprise AI Knowledge Assistant**.\n\nI have real-time access to indexed company documents (*Enterprise Pricing & Discount Policy*, *SLA Guidelines*, *SOC 2 Compliance*, *GST Invoicing*) and live CRM records. Ask any question below!`,
      timestamp: 'Just now',
      confidence: 1.0
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmedActionIds, setConfirmedActionIds] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "What is the maximum enterprise discount allowed?",
    "What is the guaranteed uptime SLA and resolution timeline?",
    "Summarize TechNova Solutions.",
    "What security and data compliance standards do we follow?",
    "Show me all high-value leads.",
    "Which deals are currently in Negotiation stage?"
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
        text: "I couldn't find this information in the company knowledge base. Please ensure the relevant policy document or CRM record is uploaded and indexed.",
        timestamp: 'Just now',
        confidence: 0.15
      };
      setMessages(prev => [...prev, fallbackAiMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async (msgId: string, action: any) => {
    try {
      if (action.type === 'create_task') {
        await createTask({
          title: action.payload?.title || 'AI Recommended Task',
          customer_name: action.payload?.customer_name || 'Internal Operations',
          company_id: action.payload?.company_id,
          priority: action.payload?.priority || 'Normal',
          due_date: action.payload?.due_date || '22 Aug 2026',
          assigned_to: action.payload?.assigned_to || user?.name || 'Amit Sharma',
          description: action.payload?.description || 'Task created via AI Knowledge Assistant',
          is_ai_generated: true
        });
        addToast('Action task created successfully in database!', 'success');
      } else if (action.type === 'create_event') {
        await createEvent({
          title: action.payload?.title || 'AI Booked Meeting',
          customer_name: action.payload?.customer_name || 'TechNova Solutions',
          company_id: action.payload?.company_id,
          event_type: action.payload?.event_type || 'Meeting',
          date: action.payload?.date || '2026-08-22',
          time: action.payload?.time || '11:00',
          duration: action.payload?.duration || '30 mins',
          attendees: action.payload?.attendees || [user?.name || 'Amit Sharma'],
          location: action.payload?.location || 'Google Meet',
          description: action.payload?.description || 'Meeting booked via AI Assistant'
        });
        addToast('Meeting scheduled on calendar successfully!', 'success');
      }
      setConfirmedActionIds(prev => ({ ...prev, [msgId]: true }));
    } catch (err: any) {
      addToast(err?.message || 'Failed to execute action', 'error');
    }
  };

  return (
    <div className="page-container" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 70px)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bot size={22} color="var(--accent-blue)" /> Intelligent Company Knowledge Assistant
          </h1>
          <p className="page-subtitle">
            RAG knowledge retrieval with source citations, document permissions, and 1-click CRM action execution.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-low" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={13} /> Active Role: {role}
          </span>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('knowledge')}>
            Knowledge Docs
          </button>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="card" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: 0
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
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                gap: '12px'
              }}
            >
              {msg.sender === 'ai' && (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Sparkles size={18} />
                </div>
              )}

              <div style={{
                maxWidth: '750px',
                background: msg.sender === 'user' ? 'var(--accent-blue)' : 'var(--bg-muted)',
                color: msg.sender === 'user' ? '#fff' : 'var(--text-primary)',
                padding: '16px 20px',
                borderRadius: 'var(--radius-lg)',
                fontSize: '13.5px',
                lineHeight: 1.6,
                boxShadow: msg.sender === 'user' ? '0 2px 8px rgba(37, 99, 235, 0.2)' : 'none',
                border: msg.sender === 'ai' ? '1px solid var(--border-color)' : 'none'
              }}>
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.text}
                </div>

                {/* Sources / Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div style={{
                    marginTop: '16px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={12} /> Verified Citations & Policy Sources:
                    </div>
                    {msg.sources.map((src, idx) => (
                      <div key={idx} style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px 12px',
                        fontSize: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{src.title}</span>
                          <span style={{ color: 'var(--text-secondary)' }}> • Page {src.page} ({src.category})</span>
                        </div>
                        <span className="badge badge-low" style={{ fontSize: '10.5px' }}>
                          Grounding: {Math.round((src.score || 0.85) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Runnable Recommended Action */}
                {msg.recommended_action && (
                  <div style={{
                    marginTop: '14px',
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(37, 99, 235, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={16} color="var(--accent-blue)" />
                      <span style={{ fontSize: '12.5px', fontWeight: 600 }}>
                        {msg.recommended_action.payload?.title || msg.recommended_action.label}
                      </span>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleConfirmAction(msg.id, msg.recommended_action)}
                      disabled={confirmedActionIds[msg.id]}
                      style={{ fontSize: '12px' }}
                    >
                      {confirmedActionIds[msg.id] ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={13} /> Executed
                        </span>
                      ) : (
                        msg.recommended_action.label || 'Execute Action'
                      )}
                    </button>
                  </div>
                )}

                <div style={{
                  fontSize: '10.5px',
                  color: msg.sender === 'user' ? 'rgba(255, 255, 255, 0.7)' : 'var(--text-secondary)',
                  marginTop: '8px',
                  textAlign: 'right'
                }}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-muted)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '13px',
                  flexShrink: 0
                }}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={18} />
              </div>
              <div style={{
                background: 'var(--bg-muted)',
                padding: '14px 18px',
                borderRadius: 'var(--radius-lg)',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <RefreshCw size={14} className="animate-spin" /> Querying knowledge base & verifying policy citations...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div style={{
          padding: '10px 20px',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              className="btn btn-ghost btn-sm"
              onClick={() => handleSend(q)}
              style={{
                fontSize: '12px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-muted)',
                border: '1px solid var(--border-color)',
                padding: '4px 12px'
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <input
            type="text"
            className="form-control"
            placeholder="Ask about company pricing, SLAs, security standards, or CRM accounts..."
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={loading}
            style={{ flex: 1, height: '42px', fontSize: '13.5px' }}
          />
          <button
            className="btn btn-primary"
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || loading}
            style={{ height: '42px', padding: '0 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Send size={15} /> Send
          </button>
        </div>
      </div>
    </div>
  );
};
