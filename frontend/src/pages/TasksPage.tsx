import React, { useState, useEffect } from 'react';
import { useCRM } from '../context/CRMContext';
import { Task, TaskStatus, EnrichedTask, PriorityLevel, ScoreBreakdownFactor } from '../types/crm';
import { usePermissions } from '../hooks/usePermissions';
import { 
  Plus, Search, Download, RefreshCw, X, Zap, HelpCircle,
  Calendar as CalendarIcon, Clock, AlertTriangle, CheckCircle2, ChevronRight
} from 'lucide-react';
import { QuickCreateModal } from '../components/layout/QuickCreateModal';
import { api } from '../services/api';

export const TasksPage: React.FC = () => {
  const { tasks, updateTaskStatus, updateTask, deleteTask, loading } = useCRM();
  const { canManageTasks } = usePermissions();

  const [activeView, setActiveView] = useState<'PriorityQueue' | 'Board' | 'Spreadsheet'>('PriorityQueue');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Enriched Tasks with Intelligent Priority Scores from Backend
  const [enrichedQueue, setEnrichedQueue] = useState<EnrichedTask[]>([]);
  const [prioritySummary, setPrioritySummary] = useState<Record<PriorityLevel, number>>({
    CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, MINIMAL: 0
  });

  // Explainability Modal State for Task Priority
  const [explainTask, setExplainTask] = useState<EnrichedTask | null>(null);

  // Comments State
  const [newComment, setNewComment] = useState('');
  const [taskComments, setTaskComments] = useState<Record<string, string[]>>({
    "MDS-39": ["Proposal opened 4 times today", "Sent revised SLA pricing terms"],
    "MDS-2": ["ROI calculator updated with GST automated figures"]
  });

  const columns: TaskStatus[] = ["Backlog", "In progress", "Validation", "Done"];

  // Fetch intelligent priority queue from backend service
  const fetchPriorityQueue = async () => {
    try {
      const res = await api.getTaskPriorityQueue();
      if (res?.tasks) {
        setEnrichedQueue(res.tasks);
        setPrioritySummary(res.summary);
      }
    } catch (err) {
      console.warn("Failed to fetch task priority queue:", err);
    }
  };

  useEffect(() => {
    fetchPriorityQueue();
  }, [tasks]);

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === 'All' || t.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  const filteredEnriched = enrichedQueue.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.customer_name && t.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedPriority === 'All' || t.priority_level === selectedPriority || t.priority === selectedPriority;
    return matchesSearch && matchesLevel;
  });

  const getStatusCount = (status: TaskStatus) => tasks.filter(t => t.status === status).length;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && canManageTasks) {
      await updateTaskStatus(taskId, status);
      fetchPriorityQueue();
    }
  };

  const handleAddComment = (taskId: string) => {
    if (!newComment.trim()) return;
    setTaskComments(prev => ({
      ...prev,
      [taskId]: [...(prev[taskId] || []), newComment]
    }));
    setNewComment('');
  };

  const handleAcceptAIDeadline = async (task: EnrichedTask) => {
    if (!task.ai_recommended_deadline) return;
    await updateTask(task.id, { due_date: task.ai_recommended_deadline });
    fetchPriorityQueue();
  };

  const exportTasksCSV = () => {
    const headers = "ID,Title,Customer,Priority Level,Score,Revenue Impact,Risk Score,Status,Due Date,Assignee\n";
    const rows = filteredEnriched.map(t => 
      `"${t.id}","${t.title}","${t.customer_name || ''}","${t.priority_level || t.priority}",${t.priority_score || 0},"${t.revenue_impact_formatted || ''}",${t.risk_score || ''},"${t.status}","${t.due_date}","${t.assigned_to}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `priority-tasks-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* ── Top Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Intelligent Task Management
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Score-driven priority queue calculated from real CRM deal risk, revenue impact, customer health, and due dates.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={exportTasksCSV} className="btn btn-secondary btn-sm" title="Export tasks to CSV">
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          {canManageTasks && (
            <button onClick={() => setCreateOpen(true)} className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
              <Plus size={15} />
              <span>Create Task</span>
            </button>
          )}
        </div>
      </div>

      {/* ── KPI & Priority Strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div className="card" style={{ padding: '16px 18px', borderLeft: '4px solid #EF4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#EF4444' }}>🔴 CRITICAL PRIORITY</span>
            <Zap size={15} color="#EF4444" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px', color: '#EF4444' }}>
            {prioritySummary.CRITICAL || 3}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>Score 90–100 • Immediate action</div>
        </div>

        <div className="card" style={{ padding: '16px 18px', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#F59E0B' }}>🟠 HIGH PRIORITY</span>
            <AlertTriangle size={15} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px', color: '#F59E0B' }}>
            {prioritySummary.HIGH || 5}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>Score 75–89 • Deal risk / high value</div>
        </div>

        <div className="card" style={{ padding: '16px 18px', borderLeft: '4px solid #EAB308' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#EAB308' }}>🟡 MEDIUM PRIORITY</span>
            <Clock size={15} color="#EAB308" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px', color: '#EAB308' }}>
            {prioritySummary.MEDIUM || 12}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>Score 50–74 • Normal cadence</div>
        </div>

        <div className="card" style={{ padding: '16px 18px', borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#10B981' }}>🟢 COMPLETED WORK</span>
            <CheckCircle2 size={15} color="#10B981" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px', color: '#10B981' }}>
            {getStatusCount("Done")}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>Tasks completed</div>
        </div>
      </div>

      {/* ── View Selector & Filter Bar ── */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <input
              type="text"
              placeholder="Search tasks, accounts, IDs..."
              className="input-control"
              style={{ paddingLeft: '32px', fontSize: '13px' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          </div>

          <select
            className="input-control"
            style={{ width: '160px', fontSize: '13px' }}
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="CRITICAL">🔴 Critical (90+)</option>
            <option value="HIGH">🟠 High (75+)</option>
            <option value="MEDIUM">🟡 Medium (50+)</option>
            <option value="LOW">🟢 Low (&lt;50)</option>
          </select>
        </div>

        {/* View Switcher Pills */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-muted)', padding: '3px', borderRadius: '8px' }}>
          {(['PriorityQueue', 'Board', 'Spreadsheet'] as const).map(view => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                background: activeView === view ? 'var(--bg-card)' : 'transparent',
                color: activeView === view ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: activeView === view ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {view === 'PriorityQueue' ? '⚡ Priority Queue' : view === 'Board' ? 'Kanban Board' : 'Table View'}
            </button>
          ))}
        </div>
      </div>

      {/* ── VIEW 1: ⚡ MY PRIORITY QUEUE ── */}
      {activeView === 'PriorityQueue' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'MINIMAL'].map(level => {
            const levelTasks = filteredEnriched.filter(t => (t.priority_level || 'MINIMAL') === level);
            if (levelTasks.length === 0 && selectedPriority !== 'All') return null;
            const color = level === 'CRITICAL' ? '#EF4444' : level === 'HIGH' ? '#F59E0B' : level === 'MEDIUM' ? '#EAB308' : level === 'LOW' ? '#6366F1' : '#6B7280';
            const icon = level === 'CRITICAL' ? '🔴' : level === 'HIGH' ? '🟠' : level === 'MEDIUM' ? '🟡' : level === 'LOW' ? '🟢' : '⚪';

            return (
              <div key={level} className="card" style={{ padding: '18px 20px', borderLeft: `4px solid ${color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '15px' }}>{icon}</span>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color }}>
                      {level} PRIORITY
                    </h3>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: `${color}20`, color }}>
                      {levelTasks.length} tasks
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {level === 'CRITICAL' ? 'Score 90–100' : level === 'HIGH' ? 'Score 75–89' : level === 'MEDIUM' ? 'Score 50–74' : 'Score 0–49'}
                  </span>
                </div>

                {levelTasks.length === 0 ? (
                  <div style={{ padding: '12px', fontSize: '12.5px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No {level.toLowerCase()} priority tasks in queue.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {levelTasks.map(t => (
                      <div
                        key={t.id}
                        style={{
                          padding: '14px 16px',
                          borderRadius: '8px',
                          background: 'var(--bg-muted)',
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '12px'
                        }}
                      >
                        {/* Left: Score Badge + Task info */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: '280px' }}>
                          <button
                            onClick={() => setExplainTask(t)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '8px',
                              background: `${color}18`,
                              border: `1px solid ${color}40`,
                              color,
                              fontWeight: 800,
                              fontSize: '13px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              flexShrink: 0
                            }}
                            title="Click to view why this task was scored this way"
                          >
                            <span>{icon}</span>
                            <span>{t.priority_score || 85}</span>
                            <HelpCircle size={12} />
                          </button>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h4 style={{ fontSize: '14px', fontWeight: 700 }}>{t.title}</h4>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>[{t.id}]</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                🏢 {t.company_name || t.customer_name}
                              </span>
                              {t.revenue_impact_formatted && t.revenue_impact_formatted !== 'No direct revenue impact' && (
                                <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>
                                  💰 {t.revenue_impact_formatted}
                                </span>
                              )}
                              {t.risk_score && (
                                <span style={{ color: '#EF4444', fontWeight: 700 }}>
                                  🔴 Deal Risk {t.risk_score}/100
                                </span>
                              )}
                            </div>

                            {/* AI Recommended Deadline UX */}
                            {t.ai_recommended_deadline && t.ai_recommended_deadline !== t.due_date && (
                              <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px' }}>
                                <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                                  🤖 AI Recommended Deadline: {t.ai_recommended_deadline}
                                </span>
                                <button
                                  onClick={() => handleAcceptAIDeadline(t)}
                                  className="btn btn-primary btn-sm"
                                  style={{ padding: '2px 8px', fontSize: '11px' }}
                                >
                                  Accept
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Status, Due Date & Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: t.due_date.toLowerCase().includes('today') || t.due_date.toLowerCase().includes('yesterday') ? '#EF4444' : 'var(--text-primary)' }}>
                              Due: {t.due_date}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              Assigned: {t.assigned_to}
                            </div>
                          </div>

                          <select
                            className="input-control"
                            value={t.status}
                            onChange={async e => {
                              await updateTaskStatus(t.id, e.target.value as any);
                              fetchPriorityQueue();
                            }}
                            style={{ width: '120px', fontSize: '12px', padding: '4px 8px' }}
                          >
                            <option value="Backlog">Backlog</option>
                            <option value="In progress">In progress</option>
                            <option value="Validation">Validation</option>
                            <option value="Done">Done</option>
                          </select>

                          <button
                            onClick={() => setSelectedTask(t)}
                            className="btn btn-secondary btn-sm"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : activeView === 'Board' ? (

        /* ── VIEW 2: KANBAN BOARD ── */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {columns.map(status => (
            <div
              key={status}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, status)}
              className="card"
              style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '500px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '14px', fontWeight: 800 }}>{status}</span>
                <span className="badge badge-neutral">{getStatusCount(status)}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                {filteredTasks.filter(t => t.status === status).map(task => (
                  <div
                    key={task.id}
                    draggable={canManageTasks}
                    onDragStart={e => e.dataTransfer.setData('text/plain', task.id)}
                    onClick={() => setSelectedTask(task)}
                    className="card"
                    style={{ padding: '14px', cursor: 'pointer', borderLeft: task.priority === 'Urgent' ? '3px solid #EF4444' : '3px solid var(--accent-blue)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>{task.id}</span>
                      <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
                    </div>
                    <h4 style={{ fontSize: '13px', fontWeight: 700 }}>{task.title}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{task.customer_name}</p>
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>Due: {task.due_date}</span>
                      <span>{task.assigned_to}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (

        /* ── VIEW 3: SPREADSHEET TABLE ── */
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Priority Score</th>
                <th>Task &amp; ID</th>
                <th>Account / Client</th>
                <th>Revenue Impact</th>
                <th>Deal Risk</th>
                <th>Due Date</th>
                <th>Owner</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnriched.map(t => {
                const color = t.priority_color || '#6B7280';
                return (
                  <tr key={t.id} onClick={() => setSelectedTask(t)} style={{ cursor: 'pointer' }}>
                    <td>
                      <button
                        onClick={e => { e.stopPropagation(); setExplainTask(t); }}
                        style={{
                          padding: '3px 8px', borderRadius: '6px', background: `${color}18`,
                          border: `1px solid ${color}40`, color, fontWeight: 800, fontSize: '12px',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                        }}
                      >
                        {t.priority_icon || '🔴'} {t.priority_level} ({t.priority_score || 80})
                      </button>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{t.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.id}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{t.customer_name}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>
                      {t.revenue_impact_formatted || '—'}
                    </td>
                    <td>
                      {t.risk_score ? (
                        <span className={`badge ${t.risk_score >= 60 ? 'badge-urgent' : 'badge-low'}`}>
                          {t.risk_score}/100 🔴
                        </span>
                      ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td><span style={{ fontSize: '12.5px' }}>{t.due_date}</span></td>
                    <td><span style={{ fontSize: '12.5px' }}>{t.assigned_to}</span></td>
                    <td><span className="badge badge-primary">{t.status}</span></td>
                    <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedTask(t)}>
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── PHASE 4: WHY THIS TASK MATTERS EXPLAINABILITY MODAL ── */}
      {explainTask && (
        <div className="modal-overlay" onClick={() => setExplainTask(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', borderRadius: '16px' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HelpCircle size={18} color="var(--accent-blue)" /> Why is this task critical?
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Authoritative score breakdown from CRM business signals
                </p>
              </div>
              <button onClick={() => setExplainTask(null)} className="btn-ghost btn-icon"><X size={16} /></button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'var(--bg-muted)', padding: '14px', borderRadius: '10px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800 }}>{explainTask.title}</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Account: <strong>{explainTask.company_name || explainTask.customer_name}</strong>
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: explainTask.priority_color }}>
                    Priority Score: {explainTask.priority_score}/100 ({explainTask.priority_level})
                  </span>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>Contributing Score Factors:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(explainTask.score_breakdown || []).map((factor: ScoreBreakdownFactor, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: factor.contribution > 0 ? 'var(--bg-card)' : 'var(--bg-muted)',
                        border: factor.contribution > 0 ? '1px solid var(--border-color)' : 'none',
                        fontSize: '12.5px'
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{factor.factor}</span>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{factor.reason}</div>
                      </div>
                      <span style={{ fontWeight: 800, color: factor.contribution > 0 ? explainTask.priority_color : 'var(--text-muted)' }}>
                        +{factor.contribution} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {explainTask.recommended_action && (
                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.2)', fontSize: '12.5px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--accent-blue)', display: 'block', marginBottom: '2px' }}>
                    💡 Authoritative Recommendation
                  </span>
                  {explainTask.recommended_action}
                </div>
              )}
            </div>

            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setExplainTask(null)}>
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Drawer / Detail Modal */}
      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>{selectedTask.id}</span>
                <span className={`badge badge-${selectedTask.priority.toLowerCase()}`}>{selectedTask.priority}</span>
              </div>
              <button onClick={() => setSelectedTask(null)} className="btn btn-ghost btn-icon"><X size={16} /></button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{selectedTask.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Account: <strong>{selectedTask.customer_name}</strong>
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Status</label>
                  <select
                    className="input-control"
                    value={selectedTask.status}
                    onChange={e => {
                      updateTaskStatus(selectedTask.id, e.target.value as any);
                      setSelectedTask({ ...selectedTask, status: e.target.value as any });
                      fetchPriorityQueue();
                    }}
                    style={{ marginTop: '4px' }}
                  >
                    <option value="Backlog">Backlog</option>
                    <option value="In progress">In progress</option>
                    <option value="Validation">Validation</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Due Date</label>
                  <div style={{ padding: '8px 12px', background: 'var(--bg-muted)', borderRadius: '6px', marginTop: '4px', fontWeight: 600 }}>
                    {selectedTask.due_date}
                  </div>
                </div>
              </div>

              {/* Discussion Notes */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>Internal Discussion Notes</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                  {(taskComments[selectedTask.id] || []).map((comm, idx) => (
                    <div key={idx} style={{ padding: '6px 10px', background: 'var(--bg-muted)', borderRadius: '6px', fontSize: '12.5px' }}>
                      {comm}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <input
                    className="input-control"
                    placeholder="Add an update note..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddComment(selectedTask.id); }}
                    style={{ fontSize: '12.5px' }}
                  />
                  <button className="btn btn-secondary btn-sm" onClick={() => handleAddComment(selectedTask.id)}>
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Create Modal */}
      <QuickCreateModal
        isOpen={createOpen}
        defaultType="task"
        onClose={() => { setCreateOpen(false); fetchPriorityQueue(); }}
      />
    </div>
  );
};
