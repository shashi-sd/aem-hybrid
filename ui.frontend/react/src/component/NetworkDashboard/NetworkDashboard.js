import React from 'react';

const DEFAULT_KPIS = [
  { key: 'uptime',      label: 'Network Uptime',    unit: '%',  icon: '📶' },
  { key: 'subscribers', label: 'Active Subscribers', unit: '',   icon: '👥' },
  { key: 'bandwidth',   label: 'Bandwidth Used',    unit: '%',  icon: '📊' },
  { key: 'alerts',      label: 'Open Alerts',       unit: '',   icon: '🔔' },
];

const DEFAULT_FEATURES = [
  { title: 'Zero-touch provisioning', description: 'Every new subscriber onboarded in under a minute.', icon: '⚡' },
  { title: 'Predictive alerting',    description: 'ML flags degradation before customers notice.',    icon: '🧠' },
  { title: 'Multi-POP visibility',   description: 'One dashboard across every point of presence.',    icon: '🌐' },
];

const Sparkline = ({ points, accent }) => {
  if (!points || points.length < 2) return null;
  const w = 240, h = 56, pad = 4;
  const min = Math.min(...points), max = Math.max(...points);
  const range = max - min || 1;
  const step = (w - pad * 2) / (points.length - 1);
  const path = points
    .map((p, i) => {
      const x = pad + i * step;
      const y = pad + (1 - (p - min) / range) * (h - pad * 2);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
  const areaPath = `${path} L ${(pad + (points.length - 1) * step).toFixed(1)} ${h - pad} L ${pad} ${h - pad} Z`;
  return (
    <svg className="cmp-network-dashboard__sparkline" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <path d={areaPath} fill={`var(--nd-accent-${accent}-soft)`} opacity="0.35" />
      <path d={path} fill="none" stroke={`var(--nd-accent-${accent})`} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

const NetworkDashboard = ({ pageData, dynamicData, serviceData }) => {
  const authored = pageData || {};
  const live     = dynamicData || serviceData || {};

  const title       = authored.title       || 'Network Operations';
  const subtitle    = authored.subtitle    || 'Real-time view across every POP you operate';
  const badgeLabel  = authored.badgeLabel  || 'LIVE';
  const accent      = authored.accentColor || 'blue';
  const ctaLabel    = authored.ctaLabel    || 'Open Full Console';
  const ctaLink     = authored.ctaLink     || '#';
  const footerNote  = authored.footerNote  || 'Metrics refresh every 30 seconds';

  const kpisAuthored = (authored.kpiList && authored.kpiList.length ? authored.kpiList : DEFAULT_KPIS);
  const features     = (authored.featureList && authored.featureList.length ? authored.featureList : DEFAULT_FEATURES);
  const liveKpis     = live?.kpis || {};
  const alerts       = live?.alerts || [];
  const trend        = live?.trend || [];
  const health       = live?.health || 'healthy';
  const healthLabel  = live?.healthLabel || (live?.kpis ? 'All systems operational' : 'Waiting for live data…');

  const formatValue = (v, unit) => {
    if (v === undefined || v === null) return '—';
    const num = typeof v === 'number' ? v : Number(v);
    if (!Number.isNaN(num)) {
      if (num >= 1000) return `${num.toLocaleString()}${unit || ''}`;
      return `${num}${unit || ''}`;
    }
    return `${v}${unit || ''}`;
  };

  return (
    <section className={`cmp-network-dashboard cmp-network-dashboard--${accent}`}>

      <header className="cmp-network-dashboard__header">
        <div className="cmp-network-dashboard__titles">
          <div className="cmp-network-dashboard__eyebrow">
            <span className={`cmp-network-dashboard__pulse cmp-network-dashboard__pulse--${health}`} />
            {badgeLabel}
          </div>
          <h2 className="cmp-network-dashboard__title">{title}</h2>
          <p className="cmp-network-dashboard__subtitle">{subtitle}</p>
        </div>
        <div className="cmp-network-dashboard__health">
          <div className={`cmp-network-dashboard__health-chip cmp-network-dashboard__health-chip--${health}`}>
            {health === 'healthy' ? '✓' : health === 'degraded' ? '!' : '✕'} {healthLabel}
          </div>
          {live?.lastUpdated && (
            <span className="cmp-network-dashboard__updated">
              Updated {new Date(live.lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>
      </header>

      <div className="cmp-network-dashboard__kpis">
        {kpisAuthored.map((k) => {
          const l = liveKpis[k.key];
          return (
            <div key={k.key} className={`cmp-network-dashboard__kpi cmp-network-dashboard__kpi--${l?.status || 'idle'}`}>
              <div className="cmp-network-dashboard__kpi-icon">{k.icon || '•'}</div>
              <div className="cmp-network-dashboard__kpi-body">
                <div className="cmp-network-dashboard__kpi-label">{k.label || k.key}</div>
                <div className="cmp-network-dashboard__kpi-value">
                  {formatValue(l?.value, k.unit)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="cmp-network-dashboard__main">
        <div className="cmp-network-dashboard__panel cmp-network-dashboard__panel--trend">
          <div className="cmp-network-dashboard__panel-head">
            <h3>Traffic — last 12 intervals</h3>
            <span className="cmp-network-dashboard__panel-sub">Aggregated across all POPs</span>
          </div>
          <Sparkline points={trend} accent={accent} />
          <div className="cmp-network-dashboard__legend">
            <span><i className={`cmp-network-dashboard__dot cmp-network-dashboard__dot--${accent}`} /> Throughput</span>
            <span>Peak {trend.length ? Math.max(...trend) : '—'} • Avg {trend.length ? Math.round(trend.reduce((a, b) => a + b, 0) / trend.length) : '—'}</span>
          </div>
        </div>

        <div className="cmp-network-dashboard__panel cmp-network-dashboard__panel--alerts">
          <div className="cmp-network-dashboard__panel-head">
            <h3>Recent alerts</h3>
            <span className="cmp-network-dashboard__panel-sub">{alerts.length} in the last hour</span>
          </div>
          <ul className="cmp-network-dashboard__alerts">
            {alerts.length === 0 && (
              <li className="cmp-network-dashboard__alert cmp-network-dashboard__alert--empty">No alerts — nice.</li>
            )}
            {alerts.map((a, i) => (
              <li key={i} className={`cmp-network-dashboard__alert cmp-network-dashboard__alert--${a.severity}`}>
                <span className="cmp-network-dashboard__alert-severity">{a.severity}</span>
                <div className="cmp-network-dashboard__alert-body">
                  <div className="cmp-network-dashboard__alert-title">{a.title}</div>
                  <div className="cmp-network-dashboard__alert-meta">
                    {a.site && <span>{a.site}</span>}
                    {a.age && <span>· {a.age}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {features.length > 0 && (
        <div className="cmp-network-dashboard__features">
          {features.map((f, i) => (
            <div key={i} className="cmp-network-dashboard__feature">
              <div className="cmp-network-dashboard__feature-icon">{f.icon || '★'}</div>
              <div className="cmp-network-dashboard__feature-title">{f.title}</div>
              <div className="cmp-network-dashboard__feature-desc">{f.description}</div>
            </div>
          ))}
        </div>
      )}

      <footer className="cmp-network-dashboard__footer">
        <span className="cmp-network-dashboard__footer-note">{footerNote}</span>
        <a className="cmp-network-dashboard__cta" href={ctaLink}>
          {ctaLabel} <span aria-hidden>→</span>
        </a>
      </footer>
    </section>
  );
};

export default NetworkDashboard;
