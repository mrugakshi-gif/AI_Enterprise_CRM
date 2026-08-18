import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Task, TaskStatus, Priority } from '../types/crm';
import { 
  Plus, Search, Filter, LayoutGrid, Table, Calendar, Clock, 
  MessageSquare, ChevronRight, CheckCircle2, AlertCircle, Sparkles, SlidersHorizontal, Share2, MoreHorizontal, Edit3
} from 'lucide-react';
import { QuickCreateModal } from '../components/layout/QuickCreateModal';

export const TasksPage: React.FC = () => {
  const { tasks, updateTaskStatus, updateTask, deleteTask } = useCRM();
  const [activeView, setActiveView] = useState<'Board' | 'Spreadsheet' | 'Calendar' | 'Timeline'>('Board');
  const [searchQuery, setSearchQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newComment, setNewComment] = useState('');
  const [taskComments, setTaskComments] = useState<Record<string, string[]>>({
    "MDS-39": ["Proposal opened 4 times today", "Sent revised SLA pricing terms"],
    "MDS-2": ["ROI calculator updated with GST automated figures"]
  });

  const columns: TaskStatus[] = ["Backlog", "In progress", "Validation", "Done"];

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusCount = (status: TaskStatus) => tasks.filter(t => t.status === status).length;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header matching Reference Screenshot 2 */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Tasks report
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Stay on top of your customer tasks, monitor progress, and track status. Streamline your workflow and transform how you deliver results.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
            <SlidersHorizontal size={14} />
            <span>Manage</span>
          </button>
          <button className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
            <Share2 size={14} />
            <span>Share</span>
          </button>
          <button onClick={() => setCreateOpen(true)} className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
            <Plus size={15} />
            <span>Create task</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Widgets Grid (Screenshot 2 exact composition) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {/* Widget 1: Task Status Distribution Card */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Task status</span>
            <div style={{ display: 'flex', gap: '6px', color: 'var(--text-muted)' }}>
              <Edit3 size={13} />
              <MoreHorizontal size={13} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800 }}>{getStatusCount('Backlog') || 24}</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Backlog 📁</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800 }}>{getStatusCount('In progress') || 4}</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>In progress ⚡</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800 }}>{getStatusCount('Validation') || 7}</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Validation 🪄</div>
            </div>
          </div>

          {/* Gradient Distribution Bar (Screenshot 2 Purple/Violet aesthetic) */}
          <div style={{
            height: '24px',
            borderRadius: '6px',
            background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 35%, #A855F7 70%, #EC4899 100%)',
            opacity: 0.85
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span>1d</span>
            <span>7d</span>
          </div>
        </div>

        {/* Widget 2: Comments metric */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>💬 Comments</span>
            <MoreHorizontal size={13} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800 }}>109</div>
          <div style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600, marginTop: '2px' }}>
            ↘ 10.2% (7d)
          </div>
          <div style={{ marginTop: '12px', height: '28px', display: 'flex', alignItems: 'center', gap: '3px' }}>
            {[4, 8, 12, 6, 14, 18, 10, 16, 22, 12, 8].map((h, i) => (
              <div key={i} style={{ width: '6px', height: `${h}px`, backgroundColor: '#F59E0B', borderRadius: '50%', opacity: 0.8 }} />
            ))}
          </div>
        </div>

        {/* Widget 3: Activity / Commits */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>⚡ Activity / Updates</span>
            <MoreHorizontal size={13} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800 }}>27</div>
          <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 600, marginTop: '2px' }}>
            ↗ 2.9% (7d)
          </div>
          <div style={{ marginTop: '12px', height: '28px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
            {[6, 12, 8, 16, 22, 14, 26].map((h, i) => (
              <div key={i} style={{ width: '8px', height: `${h}px`, backgroundColor: '#F97316', borderRadius: '2px' }} />
            ))}
          </div>
        </div>

        {/* Widget 4: Burndown Chart (Line Estimation) */}
        <div className="card" style={{ padding: '18px 20px', gridColumn: 'span 1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>📉 Burndown chart (estimate pts)</span>
            <MoreHorizontal size={13} color="var(--text-muted)" />
          </div>
          <div style={{ height: '70px', position: 'relative', marginTop: '6px' }}>
            <svg width="100%" height="70" viewBox="0 0 200 70" preserveAspectRatio="none">
              <path d="M0,10 L30,12 L60,25 L90,26 L120,45 L150,52 L180,60 L200,65" fill="none" stroke="#6366F1" strokeWidth="2.5" />
              <path d="M0,15 L40,18 L80,30 L120,38 L160,50 L200,68" fill="none" stroke="#F97316" strokeWidth="2" strokeDasharray="3,3" />
            </svg>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs & Filters Bar (Screenshot 2 matching) */}
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
          {(['Spreadsheet', 'Board', 'Calendar', 'Timeline'] as const).map(tab => {
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

          <button className="btn btn-secondary btn-sm" style={{ height: '34px' }}>
            <Filter size={14} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* View Content: Board View (Default) */}
      {activeView === 'Board' ? (
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
                  <MoreHorizontal size={15} color="var(--text-muted)" />
                </div>

                {/* Cards */}
                <div className="kanban-cards-container">
                  {colTasks.map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={e => e.dataTransfer.setData('text/plain', task.id)}
                      onClick={() => setSelectedTask(task)}
                      className="deal-card"
                    >
                      {/* Top ID & Priority Tag (Screenshot 2 exact style) */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
                          🔗 {task.id}
                        </span>
                        <span className={`badge badge-${task.priority.toLowerCase()}`} style={{ fontSize: '11px' }}>
                          {task.priority}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 style={{ fontSize: '14px', fontWeight: 700, lineHeight: 1.3, marginBottom: '6px' }}>
                        {task.title}
                      </h4>

                      {/* Project Branch Indicator (Screenshot 2 tree style) */}
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

                      {/* Due Date & Assignee Avatar (Screenshot 2 exact style) */}
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
        /* Table View */
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Task ID</th>
                <th>Title</th>
                <th>Client / Project</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Assignee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(t => (
                <tr key={t.id} onClick={() => setSelectedTask(t)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontWeight: 700 }}>{t.id}</td>
                  <td style={{ fontWeight: 600 }}>{t.title}</td>
                  <td>{t.customer_name}</td>
                  <td>
                    <span className="badge badge-primary">{t.status}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span>
                  </td>
                  <td>{t.due_date}</td>
                  <td>{t.assigned_to}</td>
                  <td>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        updateTaskStatus(t.id, t.status === 'Done' ? 'In progress' : 'Done');
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      {t.status === 'Done' ? 'Reopen' : 'Complete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Details & Comments Drawer */}
      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span className={`badge badge-${selectedTask.priority.toLowerCase()}`}>{selectedTask.priority}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '8px', fontWeight: 600 }}>{selectedTask.id}</span>
                <h2 style={{ fontSize: '18px', fontWeight: 800, marginTop: '6px' }}>{selectedTask.title}</h2>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Project: {selectedTask.customer_name}</div>
              </div>
              <button onClick={() => setSelectedTask(null)} className="btn-ghost btn-icon">✕</button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Status Switcher */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>UPDATE STATUS</label>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  {columns.map(st => (
                    <button
                      key={st}
                      onClick={async () => {
                        await updateTaskStatus(selectedTask.id, st);
                        setSelectedTask({ ...selectedTask, status: st });
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: selectedTask.status === st ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)',
                        backgroundColor: selectedTask.status === st ? 'var(--primary-light)' : 'var(--bg-muted)',
                        color: selectedTask.status === st ? 'var(--accent-blue)' : 'var(--text-secondary)',
                        fontSize: '12.5px',
                        fontWeight: selectedTask.status === st ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task Details */}
              <div style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                {selectedTask.description || 'Follow up with stakeholders regarding technical evaluation and commercial proposal terms.'}
              </div>

              {/* Comments Stream */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>
                  ACTIVITY & COMMENTS ({(taskComments[selectedTask.id]?.length || 0)})
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                  {(taskComments[selectedTask.id] || []).map((comm, idx) => (
                    <div key={idx} style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--bg-muted)', fontSize: '12.5px' }}>
                      💬 {comm}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <input
                    type="text"
                    placeholder="Add an update or comment..."
                    className="input-control"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddComment(selectedTask.id); }}
                  />
                  <button onClick={() => handleAddComment(selectedTask.id)} className="btn btn-primary btn-sm">
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <QuickCreateModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultType="task"
      />
    </div>
  );
};
