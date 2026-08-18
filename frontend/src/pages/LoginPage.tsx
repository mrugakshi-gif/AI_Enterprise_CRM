import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/crm';
import { ShieldCheck, Sparkles, Building2, Lock, Mail, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('kabir.mehta@nexoracrm.in');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password, selectedRole);
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: UserRole, demoEmail: string) => {
    setEmail(demoEmail);
    setSelectedRole(role);
    setLoading(true);
    try {
      await login(demoEmail, 'password', role);
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: 'var(--bg-app)'
    }}>
      {/* Left Column: Branding & AI Highlights */}
      <div style={{
        flex: 1,
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
        padding: '48px 56px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Abstract background gradient orb */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, rgba(124, 58, 237, 0.1) 70%, transparent 100%)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }} />

        <div>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '20px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
            }}>
              N
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                NEXORA CRM
              </div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>
                AI-Powered Enterprise Platform for Indian Businesses
              </div>
            </div>
          </div>

          {/* Value Prop */}
          <div style={{ marginTop: '72px', maxWidth: '520px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#60A5FA',
              fontSize: '12.5px',
              fontWeight: 600,
              marginBottom: '20px'
            }}>
              <Sparkles size={14} />
              <span>CRM + Grounded RAG + Predictive AI</span>
            </div>

            <h1 style={{ fontSize: '36px', fontWeight: 800, lineHeight: 1.2, color: '#F8FAFC', letterSpacing: '-0.03em' }}>
              Intelligent Business Decision Support for Modern Indian Enterprises.
            </h1>

            <p style={{ marginTop: '18px', fontSize: '15px', color: '#94A3B8', lineHeight: 1.6 }}>
              Complete customer lifecycle management from Lead to Retention, paired with an internal company knowledge RAG assistant and predictive AI scoring models tailored for ₹ INR, GST, and Indian compliance.
            </p>

            {/* Feature List */}
            <div style={{ marginTop: '36px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                "Unified Sales Pipeline & Kanban Deal tracking with AI Win Probability",
                "Grounded RAG Assistant with source document citations & verified policies",
                "Automated Lead Scoring, Churn Risk alerts, and Next-Best-Action triggers",
                "India-first GSTIN, PAN, ₹ Lakhs/Crores formatting & IST timezones"
              ].map((text, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#CBD5E1' }}>
                  <ShieldCheck size={16} color="#34D399" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ fontSize: '12px', color: '#64748B' }}>
          © 2026 Nexora Technologies India Pvt Ltd • ISO 27001 & SOC2 Certified
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div style={{
        width: '540px',
        padding: '48px 56px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-card)'
      }}>
        <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '28px' }}>
            Sign in to your Nexora Enterprise workspace
          </p>

          {/* Quick Demo Role Selector */}
          <div style={{
            marginBottom: '24px',
            padding: '12px',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-muted)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
              ⚡ 1-Click Demo Login (Select Role)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <button
                type="button"
                onClick={() => handleDemoLogin('ADMIN', 'kabir.mehta@nexoracrm.in')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11.5px', justifyContent: 'flex-start', padding: '6px 8px' }}
              >
                👑 <strong>Admin</strong> (Kabir)
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('SALES_MANAGER', 'priya.patil@nexoracrm.in')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11.5px', justifyContent: 'flex-start', padding: '6px 8px' }}
              >
                📊 <strong>Manager</strong> (Priya)
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('SALES_EXECUTIVE', 'amit.sharma@nexoracrm.in')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11.5px', justifyContent: 'flex-start', padding: '6px 8px' }}
              >
                💼 <strong>Sales Rep</strong> (Amit)
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('SUPPORT_AGENT', 'sneha.k@nexoracrm.in')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11.5px', justifyContent: 'flex-start', padding: '6px 8px' }}
              >
                🎧 <strong>Support</strong> (Sneha)
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Work Email
              </label>
              <div style={{ position: 'relative', marginTop: '6px' }}>
                <input
                  type="email"
                  required
                  className="input-control"
                  style={{ paddingLeft: '36px' }}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.in"
                />
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <a href="#forgot" onClick={e => { e.preventDefault(); alert("Password reset link sent to registered email."); }} style={{ fontSize: '12px', color: 'var(--accent-blue)', fontWeight: 500 }}>
                  Forgot password?
                </a>
              </div>
              <div style={{ position: 'relative', marginTop: '6px' }}>
                <input
                  type="password"
                  required
                  className="input-control"
                  style={{ paddingLeft: '36px' }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
                <span>Remember this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '10px', marginTop: '6px' }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
              <ArrowRight size={16} />
            </button>

            <div style={{ textAlign: 'center', margin: '8px 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              or
            </div>

            <button
              type="button"
              onClick={() => handleDemoLogin('ADMIN', 'kabir.mehta@nexoracrm.in')}
              className="btn btn-secondary"
              style={{ width: '100%', gap: '8px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google Workspace</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
