import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, Search, 
  Lock, User, LogOut, Activity, BarChart3, Clock, 
  FileSearch, Users, ChevronRight, Zap, RefreshCw 
} from 'lucide-react';
import './App.css';

const API_URL = 'https://email-spoof-backend.onrender.com'; 

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authMsg, setAuthMsg] = useState({ text: '', color: '' });

  // Navigation State
  const [activeTab, setActiveTab] = useState('overview');

  // Inspection Form State
  const [fromHeader, setFromHeader] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [returnPath, setReturnPath] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Scan History
  const [scanHistory, setScanHistory] = useState([
    { id: 1, date: '10/07/2026, 09:40:12 PM', email: 'Security Alert <security@facebookmail.com>', score: 25, verdict: 'FLAG' },
    { id: 2, date: '10/07/2026, 08:32:05 PM', email: 'PayPal Notice <service@paypal-verify.net>', score: 95, verdict: 'BLOCK' }
  ]);

  useEffect(() => {
    const savedUser = localStorage.getItem('aegis_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('aegis_user');
      }
    }
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthMsg({ text: 'Authenticating Gateway Access...', color: '#60a5fa' });

    const endpoint = authMode === 'login' ? '/login' : '/register';

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: authForm.name,
          email: authForm.email,
          password: authForm.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthMsg({ text: data.detail || 'Authentication failed.', color: '#f87171' });
        return;
      }

      if (authMode === 'register') {
        setAuthMsg({ text: 'Access Granted! Switch to login tab to proceed.', color: '#4ade80' });
        setTimeout(() => {
          setAuthMode('login');
          setAuthMsg({ text: '', color: '' });
          setAuthForm({ name: '', email: '', password: '' });
        }, 1200);
      } else {
        const userData = { name: data.name, email: data.email, role: data.role || 'Security Analyst' };
        localStorage.setItem('aegis_user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        setAuthMsg({ text: '', color: '' });
      }
    } catch (error) {
      setAuthMsg({ text: 'Backend engine unreachable on Port 8000.', color: '#f87171' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aegis_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!fromHeader) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_header: fromHeader,
          reply_to: replyTo,
          return_path: returnPath
        })
      });

      const data = await response.json();
      setAnalysisResult(data);

      // Append to local history list
      const newEntry = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        email: fromHeader,
        score: data.risk_score,
        verdict: data.action
      };
      setScanHistory([newEntry, ...scanHistory]);
    } catch (error) {
      alert('Unable to reach analysis core.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // =====================================================================
  // VIEW 1: AUTHENTICATION SCREEN WITH CIRCUIT BG
  // =====================================================================
  if (!isAuthenticated) {
    return (
      <div className="spoof-detection-auth-bg">
        <div className="auth-overlay-card">
          <div className="brand-logo-glow">
            <ShieldCheck size={54} className="shield-icon-glow" />
            <h1>EMAIL SPOOF DETECTION SYSTEM</h1>
            <p className="brand-tagline">DETECTION & THREAT INTELLIGENCE</p>
          </div>

          <div className="auth-mode-switch">
            <button 
              className={authMode === 'login' ? 'active' : ''} 
              onClick={() => { setAuthMode('login'); setAuthMsg({ text: '', color: '' }); }}
            >
              Sign In
            </button>
            <button 
              className={authMode === 'register' ? 'active' : ''} 
              onClick={() => { setAuthMode('register'); setAuthMsg({ text: '', color: '' }); }}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="cyber-form">
            {authMode === 'register' && (
              <div className="field-group">
                <label>OPERATOR NAME</label>
                <input 
                  type="text" 
                  placeholder="Patience Nthani"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="field-group">
              <label>AUTHORIZED EMAIL ADDRESS</label>
              <input 
                type="email" 
                placeholder="analyst@gmail.com"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                required
              />
            </div>

            <div className="field-group">
              <label>SECURITY PASSCODE</label>
              <input 
                type="password" 
                placeholder="••••••••••••"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                required
              />
            </div>

            {authMsg.text && (
              <div className="status-banner-msg" style={{ color: authMsg.color }}>
                {authMsg.text}
              </div>
            )}

            <button type="submit" className="cyber-btn-primary">
              {authMode === 'login' ? 'ACCESS SYSTEM' : 'CREATE CREDENTIALS'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =====================================================================
  // VIEW 2: EXECUTIVE SECURITY DASHBOARD
  // =====================================================================
  return (
    <div className="spoof-detection-dashboard">
      {/* Navigation Sidebar */}
      <aside className="glass-sidebar">
        <div className="sidebar-brand">
          <ShieldCheck size={36} className="brand-crest" />
          <div>
            <h2>EMAIL SPOOF DETECTION</h2>
            <span>SYSTEM</span>
          </div>
        </div>

        <nav className="nav-menu">
          <button 
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 size={18} /> System Overview
          </button>

          <button 
            className={`nav-link ${activeTab === 'analyze' ? 'active' : ''}`}
            onClick={() => setActiveTab('analyze')}
          >
            <Zap size={18} /> Analyze Email
          </button>

          <button 
            className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <Clock size={18} /> Scan History
          </button>
        </nav>

        <div className="operator-profile">
          <div className="profile-details">
            <User size={18} className="profile-icon" />
            <div>
              <p className="op-name">{user?.name || 'Security Operator'}</p>
              <p className="op-role">{user?.email || 'analyst@system'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn" title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Primary Content View */}
      <main className="dashboard-body">
        {/* Header Bar */}
        <header className="glass-header">
          <div>
            <span className="section-category">SECURITY CENTER</span>
            <h1>{activeTab === 'overview' ? 'System Overview' : activeTab === 'analyze' ? 'Header Inspection Engine' : 'Historical Analysis Logs'}</h1>
          </div>
          <div className="engine-status-badge">
            <span className="pulse-dot"></span>
            ENGINE ONLINE (FastAPI :8000)
          </div>
        </header>

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            {/* Metric Cards Row */}
            <div className="metrics-grid">
              <div className="metric-card">
                <span className="metric-title">THREATS PREVENTED (24H)</span>
                <div className="metric-value text-red">1</div>
                <span className="metric-sub">Blocked High Risk Spoofs</span>
              </div>

              <div className="metric-card">
                <span className="metric-title">TOTAL SCANS</span>
                <div className="metric-value">{scanHistory.length}</div>
                <span className="metric-sub">Inspection Queries</span>
              </div>

              <div className="metric-card">
                <span className="metric-title">ACTIVE OPERATORS</span>
                <div className="metric-value">1</div>
                <span className="metric-sub">Current Local Session</span>
              </div>

              <div className="metric-card">
                <span className="metric-title">ENGINE LATENCY</span>
                <div className="metric-value text-green">14ms</div>
                <span className="metric-sub">SQLite + HMAC Core</span>
              </div>
            </div>

            {/* Scans Table Card */}
            <div className="glass-panel">
              <div className="panel-header">
                <h3>Recent Inspection Logs</h3>
                <button className="btn-secondary" onClick={() => setActiveTab('analyze')}>
                  + New Analysis
                </button>
              </div>

              <table className="cyber-table">
                <thead>
                  <tr>
                    <th>TIMESTAMP</th>
                    <th>EMAIL HEADER</th>
                    <th>RISK SCORE</th>
                    <th>VERDICT</th>
                  </tr>
                </thead>
                <tbody>
                  {scanHistory.map((item) => (
                    <tr key={item.id}>
                      <td className="time-cell">{item.date}</td>
                      <td className="header-cell">{item.email}</td>
                      <td>
                        <span className={`score-tag ${item.score >= 70 ? 'danger' : item.score >= 20 ? 'warning' : 'safe'}`}>
                          {item.score}/100
                        </span>
                      </td>
                      <td>
                        <span className={`verdict-pill ${item.verdict.toLowerCase()}`}>
                          {item.verdict}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analyze Tab Content */}
        {activeTab === 'analyze' && (
          <div className="tab-content grid-split">
            {/* Input Form Panel */}
            <div className="glass-panel">
              <div className="panel-header">
                <h3>Header Inspection Input</h3>
              </div>
              <form onSubmit={handleAnalyze} className="cyber-form">
                <div className="field-group">
                  <label>FROM HEADER</label>
                  <input 
                    type="text" 
                    placeholder="Facebook <security@facebookmail.com>"
                    value={fromHeader}
                    onChange={(e) => setFromHeader(e.target.value)}
                    required
                  />
                </div>

                <div className="field-group">
                  <label>REPLY-TO HEADER</label>
                  <input 
                    type="text" 
                    placeholder="noreply@facebookmail.com"
                    value={replyTo}
                    onChange={(e) => setReplyTo(e.target.value)}
                  />
                </div>

                <div className="field-group">
                  <label>RETURN-PATH HEADER</label>
                  <input 
                    type="text" 
                    placeholder="security@facebookmail.com"
                    value={returnPath}
                    onChange={(e) => setReturnPath(e.target.value)}
                  />
                </div>

                <button type="submit" className="cyber-btn-primary" disabled={isAnalyzing}>
                  {isAnalyzing ? 'RUNNING INSPECTION...' : 'RUN SPOOF DETECTION'}
                </button>
              </form>
            </div>

            {/* Results Output Panel */}
            <div className="glass-panel">
              <div className="panel-header">
                <h3>Threat Intelligence Results</h3>
              </div>
              {analysisResult ? (
                <div className="result-display">
                  <div className={`score-card-banner ${analysisResult.risk_score >= 70 ? 'banner-red' : analysisResult.risk_score >= 20 ? 'banner-amber' : 'banner-green'}`}>
                    <div className="score-number">{analysisResult.risk_score}<span>/100</span></div>
                    <div className="verdict-status">RECOMMENDED ACTION: <strong>{analysisResult.action}</strong></div>
                  </div>

                  <h4>Detected Anomaly Indicators:</h4>
                  {analysisResult.detected_flags.length === 0 ? (
                    <div className="safe-notice">
                      <CheckCircle2 size={20} color="#4ade80" /> Headers match expected cryptographic policy.
                    </div>
                  ) : (
                    <ul className="threat-flag-list">
                      {analysisResult.detected_flags.map((flag, idx) => (
                        <li key={idx} className="threat-item">
                          <AlertTriangle size={18} className="threat-icon" />
                          <div>
                            <strong>{flag.category}</strong>: {flag.description}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div className="empty-state">
                  <FileSearch size={48} className="empty-icon" />
                  <p>Input raw email headers on the left and trigger the detection engine to generate risk assessment.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab Content */}
        {activeTab === 'history' && (
          <div className="tab-content">
            <div className="glass-panel">
              <div className="panel-header">
                <h3>Complete System Scan Logs</h3>
              </div>
              <table className="cyber-table">
                <thead>
                  <tr>
                    <th>TIMESTAMP</th>
                    <th>INSPECTED HEADER</th>
                    <th>RISK SCORE</th>
                    <th>ACTION TAKEN</th>
                  </tr>
                </thead>
                <tbody>
                  {scanHistory.map((item) => (
                    <tr key={item.id}>
                      <td className="time-cell">{item.date}</td>
                      <td className="header-cell">{item.email}</td>
                      <td>
                        <span className={`score-tag ${item.score >= 70 ? 'danger' : item.score >= 20 ? 'warning' : 'safe'}`}>
                          {item.score}/100
                        </span>
                      </td>
                      <td>
                        <span className={`verdict-pill ${item.verdict.toLowerCase()}`}>
                          {item.verdict}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}