import React, { useState, useEffect } from 'react';
import { useCRM } from '../context/CRMContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Building2, Sparkles, Shield, Bell, Save, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<any>({
    company_name: 'Nexora Technologies India Pvt Ltd',
    tagline: 'AI-Powered Enterprise CRM for Indian Businesses',
    gstin: '27AAACN8899K1Z4',
    pan: 'AAACN8899K',
    address: 'Floor 9, Tower B, Prestige Tech Park, Marathahalli',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560103',
    currency: 'INR (₹)',
    fiscal_year_start: 'April',
    timezone: 'Asia/Kolkata (IST)',
    ai_model: 'Nexora Enterprise RAG Engine v2.4',
    vector_search_top_k: 4,
    enable_whatsapp_crm: true,
    enable_razorpay: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings(settings);
      showToast('Settings saved successfully!', 'success');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
          System & Enterprise Settings
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
          Configure company profile, GSTIN tax details, AI model parameters, and Indian localization defaults.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Company Profile Card */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Building2 size={18} color="var(--accent-blue)" />
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Indian Enterprise Profile</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Registered Company Name</label>
              <input className="input-control" style={{ marginTop: '4px' }} value={settings.company_name} onChange={e => setSettings({ ...settings, company_name: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Company Tagline / Brand</label>
              <input className="input-control" style={{ marginTop: '4px' }} value={settings.tagline} onChange={e => setSettings({ ...settings, tagline: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>GSTIN (Goods & Services Tax ID)</label>
              <input className="input-control" style={{ marginTop: '4px', fontFamily: 'monospace' }} value={settings.gstin} onChange={e => setSettings({ ...settings, gstin: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Permanent Account Number (PAN)</label>
              <input className="input-control" style={{ marginTop: '4px', fontFamily: 'monospace' }} value={settings.pan} onChange={e => setSettings({ ...settings, pan: e.target.value })} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Registered Office Address</label>
              <input className="input-control" style={{ marginTop: '4px' }} value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>City & State</label>
              <input className="input-control" style={{ marginTop: '4px' }} value={`${settings.city}, ${settings.state}`} onChange={e => {
                const parts = e.target.value.split(',');
                setSettings({ ...settings, city: parts[0]?.trim() || '', state: parts[1]?.trim() || '' });
              }} />
            </div>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Pincode</label>
              <input className="input-control" style={{ marginTop: '4px' }} value={settings.pincode} onChange={e => setSettings({ ...settings, pincode: e.target.value })} />
            </div>
          </div>
        </div>

        {/* AI & RAG Configuration */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Sparkles size={18} color="#7C3AED" />
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>AI Model & RAG Vector Engine Configuration</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Intelligence LLM</label>
              <input className="input-control" style={{ marginTop: '4px' }} value={settings.ai_model} onChange={e => setSettings({ ...settings, ai_model: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>RAG Vector Top-K Results</label>
              <input type="number" className="input-control" style={{ marginTop: '4px' }} value={settings.vector_search_top_k} onChange={e => setSettings({ ...settings, vector_search_top_k: Number(e.target.value) })} />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '10px 24px' }}>
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
