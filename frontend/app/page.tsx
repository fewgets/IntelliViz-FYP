'use client';

import { useEffect } from 'react';
import Link from 'next/link';

const machineCards = [
  { icon: '⚙️', name: 'CNC Machine', description: 'Precision cutting and shaping • ID: cnc-001', meta: 'Risk: 12%  |  RUL: 1240h  |  Eff: 94%', status: 'Healthy', statusClass: 'healthy' },
  { icon: '💧', name: 'Pump', description: 'Fluid movement control • ID: pump-001', meta: 'Risk: 48%  |  RUL: 320h  |  Eff: 78%', status: 'Warning', statusClass: 'warning' },
  { icon: '🌀', name: 'Compressor', description: 'Air pressurization system • ID: compressor-001', meta: 'Risk: 18%  |  RUL: 980h  |  Eff: 91%', status: 'Healthy', statusClass: 'healthy' },
  { icon: '🦾', name: 'Robotic Arm', description: 'Automated assembly • ID: robotic-arm-001', meta: 'Risk: 82%  |  RUL: 48h  |  Eff: 62%', status: 'Critical', statusClass: 'critical' },
];

const capabilityCards = [
  { icon: '🔧', title: 'Predictive Maintenance', text: 'Detect early signs of equipment degradation weeks before failure. Reduce unplanned downtime by up to 40% with AI-driven health scoring.', chip: 'ML / FORECASTING' },
  { icon: '⚡', title: 'Energy Optimization', text: 'Identify energy consumption anomalies and wasteful load patterns. Achieve measurable cost reductions across your facility.', chip: 'ANALYTICS / AI' },
  { icon: '📡', title: 'Real-Time Monitoring', text: 'Unified live dashboard aggregating thousands of data points per second with custom KPI widgets and APR calendar tracking.', chip: 'LIVE / STREAM' },
];

function AnimatedPanel({ title, subtitle, accent, videoSrc }: { title: string; subtitle: string; accent: string; videoSrc?: string }) {
  if (videoSrc) {
    return (
      <div className="video-frame overflow-hidden rounded-[1.25rem] border border-blue-100 bg-black shadow-sm">
        <div className="relative aspect-video overflow-hidden bg-black">
          <video autoPlay muted loop playsInline className="w-full h-full object-cover">
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="flex items-center justify-between bg-white px-4 py-3">
          <span className="font-['Space_Grotesk'] text-sm font-bold text-slate-900">{title}</span>
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-blue-600">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Live
          </span>
        </div>
        <div className="px-4 pb-4 text-xs leading-6 text-slate-500">{subtitle}</div>
      </div>
    );
  }
  
  return (
    <div className="video-frame overflow-hidden rounded-[1.25rem] border border-blue-100 bg-white shadow-sm">
      <div className="relative aspect-video overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(23,212,245,0.45),_transparent_46%),linear-gradient(135deg,#041e5c,#0962d4)]">
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="absolute left-4 top-4 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_0_8px_rgba(23,212,245,0.18)] animate-pulse" />
        <div className="absolute inset-x-6 top-7 h-2 rounded-full bg-white/60" />
        <div className="absolute inset-x-6 top-12 h-2 rounded-full bg-white/20" />
        <div className="absolute left-6 top-24 h-14 w-14 rounded-2xl bg-white/15 backdrop-blur-sm" />
        <div className="absolute left-24 top-24 h-14 w-40 rounded-2xl bg-white/15 backdrop-blur-sm" />
        <div className="absolute bottom-8 left-6 right-6 h-24 rounded-[1.5rem] border border-white/15 bg-white/10 backdrop-blur-sm">
          <div className="absolute left-5 top-5 h-8 w-[48%] rounded-full bg-white/60" />
          <div className="absolute left-5 top-14 h-2 w-[72%] rounded-full bg-white/20" />
          <div className="absolute bottom-5 right-5 h-10 w-10 rounded-full bg-cyan-300/50 animate-pulse" />
        </div>
        <div className="absolute bottom-4 right-4 rounded-full border border-white/20 bg-black/20 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.25em] text-white/90">
          {accent}
        </div>
      </div>
      <div className="flex items-center justify-between bg-white px-4 py-3">
        <span className="font-['Space_Grotesk'] text-sm font-bold text-slate-900">{title}</span>
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-blue-600">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Live
        </span>
      </div>
      <div className="px-4 pb-4 text-xs leading-6 text-slate-500">{subtitle}</div>
    </div>
  );
}

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 },
    );

    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="landing-shell bg-white text-[var(--text-dark)]">
      <nav className="landing-nav">
        <div className="logo">
          <div className="logo-icon">📡</div>
          <div className="logo-text">Intelli<span>Viz</span></div>
        </div>
        <ul className="nav-links">
          <li><a href="#overview">Overview</a></li>
          <li><a href="#machines">Machines</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#systemstatus">Status</a></li>
          <li><a href="#videos">Showcase</a></li>
        </ul>
        <Link href="/login" className="nav-cta">Login</Link>
      </nav>

      <section id="hero">
        <img id="hero-bg-img" src="/back_img2.jpg" alt="hero background" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">Intelligent Protection<br />for <span className="accent">Smart Industries</span><br />of Tomorrow</h1>
          <p className="hero-sub">IntelliViz monitors, predicts, and secures your industrial devices in real time — from CNC machines to robotic arms, all in one unified platform.</p>
          <div className="hero-btns">
            <Link href="/overview" className="btn-solid">Open Dashboard</Link>
            <Link href="/overview" className="btn-outline">View Live Demo</Link>
          </div>
        </div>
      </section>

      <section id="overview">
        <div className="eyebrow">// Overview</div>
        <h2 className="sec-h reveal">What Is IntelliViz?</h2>
        <div className="ov-grid">
          <div className="ov-prose reveal">
            <p>IntelliViz is a <strong>real-time monitoring platform</strong> purpose-built for industrial environments. It continuously streams sensor data from your machines — CNC mills, pumps, compressors, and robotic arms — and surfaces anomalies before they cause costly failures.</p>
            <p>Powered by <strong>AI-driven anomaly detection</strong>, IntelliViz integrates directly with your existing IoT infrastructure. Predictive maintenance and energy intelligence — all unified under one intelligent dashboard.</p>
            <p>Trusted by industrial operators across manufacturing, energy, and critical infrastructure worldwide.</p>
          </div>
          <div className="hcards">
            <div className="hcard card reveal d1"><div className="hcard-icon">🧠</div><div><h4>AI-Powered Monitoring</h4><p>Deep learning models trained on millions of sensor readings detect subtle failure patterns invisible to humans.</p></div></div>
            <div className="hcard card reveal d2"><div className="hcard-icon">⚡</div><div><h4>Sub-Second Alerts</h4><p>Critical events escalated instantly via dashboard, SMS, and webhooks. Zero delay between anomaly and action.</p></div></div>
            <div className="hcard card reveal d3"><div className="hcard-icon">📊</div><div><h4>Data-Driven Decisions</h4><p>Full historical analytics, trend forecasting, and exportable reports for management and compliance teams.</p></div></div>
          </div>
        </div>
      </section>
      <div className="divider" />

      <section id="machines">
        <div className="eyebrow">// Active Machines</div>
        <h2 className="sec-h reveal">4 Machine Types Online</h2>
        <p className="sec-sub reveal">IntelliViz monitors every unit in real time, providing live health scores, RUL predictions, and efficiency metrics.</p>
        <div className="machines-grid">
          {machineCards.map((machine, index) => (
            <div className={`machine-card reveal ${index > 0 ? `d${index}` : ''}`} key={machine.name}>
              <div className="mc-icon">{machine.icon}</div>
              <div className="mc-name">{machine.name}</div>
              <div className="mc-desc">{machine.description}</div>
              <div className="mc-meta">{machine.meta}</div>
              <span className={`mc-status ${machine.statusClass}`}><span className="mc-dot" />{machine.status}</span>
            </div>
          ))}
        </div>
      </section>
      <div className="divider" />

      <section id="howitworks">
        <div className="eyebrow">// Pipeline</div>
        <h2 className="sec-h reveal">How It Works</h2>
        <p className="sec-sub reveal">Four stages transform raw sensor data into actionable intelligence in real time.</p>
        <div className="pipeline">
          <div className="pstep reveal"><div className="pstep-num">01</div><span className="pstep-icon">📡</span><h4>Data Collection</h4><p>IoT sensors, SCADA logs, PLCs, and energy meters feed live streams continuously.</p></div>
          <div className="pstep reveal d1"><div className="pstep-num">02</div><span className="pstep-icon">⚙️</span><h4>Data Processing</h4><p>Edge preprocessing, noise filtering, normalization, and feature extraction via ML pipelines.</p></div>
          <div className="pstep reveal d2"><div className="pstep-num">03</div><span className="pstep-icon">🔍</span><h4>Anomaly Detection</h4><p>LSTM autoencoders identify deviation patterns across all machine systems instantly.</p></div>
          <div className="pstep reveal d3"><div className="pstep-num">04</div><span className="pstep-icon">📲</span><h4>Alerts &amp; Insights</h4><p>Instant notifications, root cause analysis, and dashboard insights for rapid response.</p></div>
        </div>
      </section>
      <div className="divider" />

      <section id="features">
        <div className="eyebrow">// Capabilities</div>
        <h2 className="sec-h reveal">Platform Features</h2>
        <p className="sec-sub reveal">Three intelligent modules working in concert to protect and optimize your operations.</p>
        <div className="feat-grid">
          {capabilityCards.map((card, index) => (
            <div className={`feat-card card reveal ${index > 0 ? `d${index}` : ''}`} key={card.title}>
              <div className="feat-icon">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <span className="feat-chip">{card.chip}</span>
            </div>
          ))}
        </div>
      </section>
      <div className="divider" />

      <section id="systemstatus">
        <div className="eyebrow">// System Status</div>
        <h2 className="sec-h reveal" style={{ textAlign: 'center' }}>Live System Intelligence</h2>
        <p className="sec-sub reveal" style={{ margin: '0 auto 3rem', textAlign: 'center' }}>A preview of IntelliViz&#39;s live monitoring panel — 12 machines, real alerts, real data.</p>
        <div className="status-wrap reveal">
          <div className="status-bar">
            <span className="dot dot-r" /><span className="dot dot-y" /><span className="dot dot-g" />
            <span className="status-bar-url">intelliviz.app / dashboard</span>
          </div>
          <div className="status-inner">
            <div className="sp">
              <div className="sp-title">System Uptime</div>
              <div className="sp-num ok">99.7%</div>
              <div className="sp-sub">Last 30 days — all machines</div>
              <div className="bar-list">
                <div className="bar-row"><span className="bar-lbl">CNC</span><div className="bar-bg"><div className="bar-fill g" style={{ width: '98%' }} /></div></div>
                <div className="bar-row"><span className="bar-lbl">Pump</span><div className="bar-bg"><div className="bar-fill" style={{ width: '76%' }} /></div></div>
                <div className="bar-row"><span className="bar-lbl">Comp</span><div className="bar-bg"><div className="bar-fill g" style={{ width: '91%' }} /></div></div>
                <div className="bar-row"><span className="bar-lbl">Robot</span><div className="bar-bg"><div className="bar-fill r" style={{ width: '42%' }} /></div></div>
              </div>
            </div>
            <div className="sp">
              <div className="sp-title">Live Alerts</div>
              <div className="al c"><span className="al-dot" />Robotic Arm — bearing failure risk</div>
              <div className="al w"><span className="al-dot" />Pump energy +32% above baseline</div>
              <div className="al o"><span className="al-dot" />Compressor C-001 — nominal</div>
              <div className="al w"><span className="al-dot" />CNC M-07 temperature rising</div>
            </div>
            <div className="sp">
              <div className="sp-title">System Status</div>
              <div className="sp-num ok">5</div>
              <div className="sp-sub">Healthy machines</div>
              <div className="bar-list" style={{ marginTop: '1rem' }}>
                <div className="bar-row"><span className="bar-lbl">Warn</span><div className="bar-bg"><div className="bar-fill" style={{ width: '33%' }} /></div></div>
                <div className="bar-row"><span className="bar-lbl">Crit</span><div className="bar-bg"><div className="bar-fill r" style={{ width: '25%' }} /></div></div>
                <div className="bar-row"><span className="bar-lbl">OK</span><div className="bar-bg"><div className="bar-fill g" style={{ width: '42%' }} /></div></div>
              </div>
            </div>
          </div>
          <div className="status-footer">
            <p>See the <strong>full analytics dashboard</strong> — live charts, anomaly trends, and machine health scores.</p>
            <Link href="/overview" className="btn-open">Open Full Dashboard <span>→</span></Link>
          </div>
        </div>
      </section>
      <div className="divider" />

      <section id="videos">
        <div className="eyebrow">// Showcase</div>
        <h2 className="sec-h reveal">Platform in Action</h2>
        <p className="sec-sub reveal">See IntelliViz operating across smart factories, control rooms, and cyber environments.</p>
        <div className="vid-grid">
          <AnimatedPanel title="Smart Factory Automation" subtitle="Factory telemetry, conveyor flow, and predictive maintenance activity rendered as an animated control-room panel." accent="LIVE" videoSrc="/Smart_Factory_Predictive_Maintenance.mp4" />
          <AnimatedPanel title="AI Monitoring Dashboard" subtitle="An adaptive control interface with streaming tiles, alerts, and operational summaries." accent="LIVE" videoSrc="/Futuristic_AI_Dashboard_Animation.mp4" />
          <AnimatedPanel title="Anomaly Detection Engine" subtitle="A moving risk surface, signal spikes, and detections for production machines in motion." accent="LIVE" videoSrc="/Smart_Factory_Predictive_Maintenance (1).mp4" />
        </div>
      </section>
      <div className="divider" />

      <section id="flashcards">
        <div className="eyebrow">// Modules</div>
        <h2 className="sec-h reveal">Explore Core Modules</h2>
        <p className="sec-sub reveal">Hover each card to discover how each module protects and powers your operations.</p>
        <div className="fc-grid">
          <div className="flip-card reveal"><div className="flip-inner"><div className="flip-front"><div className="flip-icon">🧠</div><h4>AI Brain</h4><p className="flip-hint">hover to reveal</p></div><div className="flip-back"><h4>Deep Learning Core</h4><p>LSTM autoencoders with 97%+ anomaly detection accuracy across all operational domains.</p></div></div></div>
          <div className="flip-card reveal d1"><div className="flip-inner"><div className="flip-front"><div className="flip-icon">🏭</div><h4>Factory Systems</h4><p className="flip-hint">hover to reveal</p></div><div className="flip-back"><h4>Predictive Maintenance</h4><p>Vibration, thermal, and acoustic signatures analyzed in parallel. Failures predicted weeks in advance.</p></div></div></div>
          <div className="flip-card reveal d2"><div className="flip-inner"><div className="flip-front"><div className="flip-icon">⚡</div><h4>Energy Graph</h4><p className="flip-hint">hover to reveal</p></div><div className="flip-back"><h4>Energy Intelligence</h4><p>Real-time energy flow mapping across all facility zones. Reduce energy spend 15–30% within the first quarter.</p></div></div></div>
        </div>
      </section>
      <div className="divider" />

      <section id="benefits">
        <div className="eyebrow">// Results</div>
        <h2 className="sec-h reveal">Proven Impact</h2>
        <p className="sec-sub reveal">Quantified outcomes from real industrial deployments worldwide.</p>
        <div className="ben-grid">
          <div className="ben-card card reveal"><div className="ben-icon">📉</div><div className="ben-num">40%</div><div className="ben-label">Downtime Reduced</div><p className="ben-desc">Average reduction in unplanned downtime within the first 6 months of deployment.</p></div>
          <div className="ben-card card reveal d1"><div className="ben-icon">💰</div><div className="ben-num">28%</div><div className="ben-label">Energy Cost Saved</div><p className="ben-desc">Measurable reduction through AI-driven load optimization and anomaly correction.</p></div>
          <div className="ben-card card reveal d2"><div className="ben-icon">📈</div><div className="ben-num">3.2x</div><div className="ben-label">Operational ROI</div><p className="ben-desc">Average return on investment within the first year of IntelliViz deployment.</p></div>
        </div>
      </section>

      <section id="cta">
        <h2 className="cta-h reveal">Ready to Protect<br />Your Industrial Assets?</h2>
        <p className="cta-sub reveal">Join industrial operators already safeguarding their machines and optimizing operations with IntelliViz.</p>
        <div className="cta-btns reveal">
          <Link href="/login" className="btn-w">Start Free Trial</Link>
          <Link href="/login" className="btn-ow">Schedule a Demo</Link>
        </div>
      </section>

      <footer>
        <div className="footer-logo">Intelli<span>Viz</span></div>
        <div className="footer-copy">© 2026 IntelliViz — Real-Time Industrial Intelligence Platform</div>
        <div className="footer-links"><a href="#">Privacy</a><a href="#">Docs</a><a href="#">Contact</a></div>
      </footer>
    </main>
  );
}
