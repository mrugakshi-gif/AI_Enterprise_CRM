import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Task, TaskStatus, Priority } from '../types/crm';
import { usePermissions } from '../hooks/usePermissions';
import { 
  Plus, Search, Filter, LayoutGrid, Table, Calendar, Clock, 
  MessageSquare, ChevronRight, CheckCircle2, AlertCircle, Sparkles, 
  SlidersHorizontal, Share2, MoreHorizontal, Edit3, Download, RefreshCw, X, Bot
} from 'lucide-react';
import { QuickCreateModal } from '../components/layout/QuickCreateModal';

export const TasksPage: React.FC = () => {
  const { tasks, updateTaskStatus, updateTask, deleteTask, loading } = useCRM();
  const { canManageTasks, canDeleteRecords } = usePermissions();
  const [activeView, setActiveView] = useState<'Board' | 'Spreadsheet' | 'Calendar' | 'Timeline'>('Board');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newComment, setNewComment] = useState('');
  const [taskComments, setTaskComments] = useState<Record<string, string[]>>({
    "MDS-39": ["Proposal opened 4 times today", "Sent revised SLA pricing terms"],
    "MDS-2": ["ROI calculator updated with GST automated figures"]
  });

  const columns: TaskStatus[] = ["Backlog", "In progress", "Validation", "Done"];

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === 'All' || t.priority === selectedPriority;
    return matchesSearch && matchesPriority;
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

  const exportTasksCSV = () => {
    const headers = "ID,Title,Customer,Status,Priority,Due Date,Assignee,AI Generated\n";
    const rows = filteredTasks.map(t => 
      `"${t.id}","${t.title}","${t.customer_name}","${t.status}","${t.priority}","${t.due_date}","${t.assigned_to}",${t.is_ai_generated || false}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Tasks & Milestones
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Stay on top of enterprise sales actions, team follow-ups, and AI-generated recommended tasks.
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

      {/* Analytics Summary Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Tasks</span>
            <span className="badge badge-neutral">{tasks.length} Total</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800 }}>{tasks.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {getStatusCount("Done")} completed • {getStatusCount("In progress")} in flight
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>In Progress</span>
            <span className="badge badge-normal">Active</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-blue)' }}>
            {getStatusCount("In progress")}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Next due: Today (Amit Sharma)
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Validation Stage</span>
            <span className="badge badge-neutral">Review</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-purple)' }}>
            {getStatusCount("Validation")}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Awaiting stakeholder confirmation
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Completed</span>
            <span className="badge badge-low">Done</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-emerald)' }}>
            {getStatusCount("Done")}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--accent-emerald)', marginTop: '4px' }}>
            +18% velocity vs last week
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '12px'
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-muted)', padding: '3px', borderRadius: '8px' }}>
          {(['Board', 'Spreadsheet'] as const).map(tab => {
            const active = activeView === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveView(tab)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: active ? 'var(--bg-card)' : 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: active ? 600 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: active ? 'var(--shadow-xs)' : 'none'
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Right Search & Filter Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search tasks (MDS-39)..."
              className="input-control"
              style={{ width: '220px', paddingLeft: '32px', fontSize: '13px', height: '34px' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          </div>

          <select
            className="input-control"
            style={{ width: '130px', fontSize: '13px', height: '34px' }}
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value)}
          >
            <option value="All">All Priority</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Normal">Normal</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Main View Content */}
      {loading ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
          <p>Loading task workflow...</p>
        </div>
      ) : activeView === 'Board' ? (
        <div className="kanban-board">
          {columns.map(status => {
            const colTasks = filteredTasks.filter(t => t.status === status);
            const statusIcons: Record<string, string> = {
              "Backlog": "📁",
              "In progress": "⚡",
              "Validation": "🪄",
              "Done": "✅"
            };

            return (
              <div
                key={status}
                className="kanban-column"
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, status)}
              >
                {/* Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                  padding: '0 4px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{statusIcons[status]}</span>
                    <h3 style={{ fontSize: '14px', fontWeight: 700 }}>{status}</h3>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-secondary)'
                    }}>
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="kanban-cards-container">
                  {colTasks.map(task => (
                    <div
                      key={task.id}
                      draggable={canManageTasks}
                      onDragStart={e => e.dataTransfer.setData('text/plain', task.id)}
                      onClick={() => setSelectedTask(task)}
                      className="deal-card"
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Top ID & Priority Tag */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
                          🔗 {task.id}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {task.is_ai_generated && (
                            <span className="badge badge-accent" style={{ fontSize: '10px', padding: '1px 5px' }}>
                              🤖 AI
                            </span>
                          )}
                          <span className={`badge badge-${task.priority.toLowerCase()}`} style={{ fontSize: '11px' }}>
                            {task.priority}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 style={{ fontSize: '13.5px', fontWeight: 700, lineHeight: 1.3, marginBottom: '6px' }}>
                        {task.title}
                      </h4>

                      {/* Customer / Project */}
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginBottom: '10px'
                      }}>
                        <span>└ 🪶</span>
                        <span>{task.customer_name}</span>
                      </div>

                      {/* Due Date & Assignee Avatar */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '8px',
                        borderTop: '1px solid var(--border-subtle)',
                        fontSize: '11.5px',
                        color: 'var(--text-muted)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <img
                            src={task.assigned_avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"}
                            alt={task.assigned_to}
                            style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <span>Due: {task.due_date}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <MessageSquare size={12} />
                            {(taskComments[task.id]?.length || task.comments_count || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* SPREADSHEET TABLE VIEW */
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Task ID</th>
                <th>Title</th>
                <th>Client / Account</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Assignee</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(t => (
                <tr key={t.id} onClick={() => setSelectedTask(t)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontWeight: 700 }}>{t.id}</td>
                  <td style={{ fontWeight: 600 }}>{t.title}</td>
                  <td>{t.customer_name}</td>
                  <td><span className="badge badge-primary">{t.status}</span></td>
                  <td><span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span></td>
                  <td>{t.due_date}</td>
                  <td>{t.assigned_to}</td>
                  <td>
                    {t.is_ai_generated ? (
                      <span className="badge badge-accent">🤖 AI Generated</span>
                    ) : (
                      <span className="badge badge-neutral">User Created</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                {selectedTask.is_ai_generated && <span className="badge badge-accent">🤖 AI</span>}
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

              {selectedTask.description && (
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Description</label>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                    {selectedTask.description}
                  </p>
                </div>
              )}

              {/* Comments Section */}
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
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
};
