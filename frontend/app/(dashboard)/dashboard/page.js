'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getDashboardStats, healthCheck } from '../../lib/api';
import {
  IconEvaluation, IconPerformance, IconHistory, IconActivity,
  IconShield, IconCheck, IconTrendingUp, IconUser, IconPlus,
  IconAlertTriangle,
} from '../../components/Icons';

/* ── Helpers ── */
const EDAD_LABELS = (t) => ({
  'Menor de 2': t('under2'),
  '2-5': t('age2to5'),
  '6-12': t('age6to12'),
  '13-17': t('age13to17'),
});

function SeverityBadge({ prediccion }) {
  const { t } = useLanguage();
  const cls = prediccion === 'Leve' ? 'badge badge-low'
    : prediccion === 'Moderada' ? 'badge badge-mid'
      : 'badge badge-high';
  return <span className={cls}>{prediccion === 'Leve' ? t('mild') : prediccion === 'Moderada' ? t('moderate') : t('severe')}</span>;
}

/* ── Donut CSS puro ── */
function SeverityDonut({ leve, moderada, severa, total }) {
  const { t } = useLanguage();
  if (total === 0) return null;
  const pLeve = (leve / total) * 100;
  const pMod = (moderada / total) * 100;

  const gradient = `conic-gradient(
    var(--severity-low) 0% ${pLeve}%,
    var(--severity-mid) ${pLeve}% ${pLeve + pMod}%,
    var(--severity-high) ${pLeve + pMod}% 100%
  )`;

  return (
    <div className="dash-donut-wrap">
      <div className="dash-donut" style={{ background: gradient }}>
        <div className="dash-donut-center">
          <span className="dash-donut-value">{total}</span>
          <span className="dash-donut-label">{t('total')}</span>
        </div>
      </div>
      <div className="dash-donut-legend">
        {[
          { label: t('mild'), count: leve, color: 'var(--severity-low)' },
          { label: t('moderate'), count: moderada, color: 'var(--severity-mid)' },
          { label: t('severe'), count: severa, color: 'var(--severity-high)' },
        ].map((s) => (
          <div key={s.label} className="dash-legend-row">
            <span className="legend-dot" style={{ background: s.color }} />
            <span className="dash-legend-text">{s.label}</span>
            <span className="dash-legend-count">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Sparkline de actividad últimos 7 días (SVG Area) ── */
function WeekSparkline({ evaluaciones }) {
    const { t } = useLanguage();
    const { days, max } = useMemo(() => {
        const arr = Array(7).fill(0);
        const now = new Date();
        // Normalize "now" to start of day for accurate day diffing
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    (evaluaciones || []).forEach((e) => {
      const d = new Date(e.created_at);
      const entryDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const diffTime = todayStart - entryDay;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays < 7) {
        arr[6 - diffDays]++;
      }
    });
    return { days: arr, max: Math.max(...arr, 1) };
  }, [evaluaciones]);

  const points = days.map((val, i) => {
    const x = (i / 6) * 100;
    const y = 100 - (val / max) * 100; // Invert SVG y-axis
    return `${x},${y}`;
  }).join(' ');

  // Create area path: start bottom-left, go to points, end bottom-right
  const areaPath = `M0,100 ${days.map((val, i) => `L${(i / 6) * 100},${100 - (val / max) * 100}`).join(' ')} L100,100 Z`;

    const dayLabels = [t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat'), t('sun')];
    const today = new Date().getDay(); // 0=Sun, 1=Mon
    // Reorder labels so the last one is today
    // If today is Monday (1), order is: [M, X, J, V, S, D, L] (Last 7 days ending today)
    // Actually simpler: just get the day letter for (Today - 6 + i)
    const todayDay = new Date().getDay(); // 0=Sun, 1=Mon...
    const labels = Array.from({ length: 7 }, (_, i) => {
        const dIndex = (todayDay - 6 + i + 7) % 7;
        const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        return t(dayKeys[dIndex]);
    });

  return (
    <div className="dash-sparkline-container" style={{ position: 'relative', height: '100px', width: '100%', marginTop: '1rem' }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        <line x1="0" y1="25" x2="100" y2="25" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2" />

        {/* Area */}
        <path d={areaPath} fill="url(#sparkGradient)" stroke="none" />

        {/* Line */}
        <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

        {/* Points */}
        {days.map((val, i) => (
          val > 0 && <circle
            key={i}
            cx={(i / 6) * 100}
            cy={100 - (val / max) * 100}
            r="3"
            fill="var(--bg-card)"
            stroke="var(--accent)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      <div className="dash-spark-labels" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        {labels.map((l, i) => <span key={i}>{l}</span>)}
      </div>
    </div>
  );
}

/* ═══════════ MAIN COMPONENT ═══════════ */
export default function DashboardPage() {
  const { language, t, translateValue } = useLanguage();
  const { session, user, supabase } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState(true);

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [dashStats, health] = await Promise.all([
                getDashboardStats(supabase),
                healthCheck(),
            ]);
            setStats(dashStats);
            setRecent((dashStats.evaluaciones || []).slice(0, 6)); // Set recent evaluations here
            setApiOnline(health); // Use setApiOnline
        } catch (err) {
            console.error('Error loading dashboard:', err);
            setApiOnline(false); // Set API offline on error
        } finally {
            setLoading(false);
        }
    }

    const formatDate = (d) =>
        new Date(d).toLocaleDateString(language === 'es' ? 'es-CO' : 'en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
        });

    const formatDateShort = (d) =>
        new Date(d).toLocaleDateString(language === 'es' ? 'es-CO' : 'en-US', { month: 'short', day: 'numeric' });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t('goodMorning');
    if (h < 18) return t('goodAfternoon');
    return t('goodEvening');
  };

  const severaCritical = stats && stats.severa > 0; // Check stats is not null

  return (
    <div className="page-container dash-page">
      {/* ── Header ── */}
      <div className="dash-header">
        <div className="dash-header-left">
          <h1 className="dash-title">
            {greeting()}, <span className="text-gradient">{user?.user_metadata?.full_name === 'Sin nombre' ? t('unnamed') : (user?.user_metadata?.full_name || 'Doctor')}</span>
          </h1>
          <p className="dash-subtitle">
            {t('dashboardSubtitle')}
            {user?.user_metadata?.especialidad && (
              <span className="dash-subtitle-dim"> · {user.user_metadata.especialidad}</span>
            )}
          </p>
        </div>
        <div className="dash-header-actions">
          <div className={`dash-status-pill ${loading ? '' : apiOnline ? 'online' : 'offline'}`}>
            <span className="dash-status-dot" />
            <span>{loading ? '...' : apiOnline ? t('apiOnline') || 'API Activa' : t('apiOffline') || 'API Inactiva'}</span>
          </div>
          <Link href="/evaluacion" className="btn btn-primary">
            <IconPlus style={{ width: '1em', height: '1em' }} /> {t('newEvaluation')}
          </Link>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="dash-kpi-row">
        <div className="dash-kpi">
          <div className="dash-kpi-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#818CF8' }}>
            <IconEvaluation />
          </div>
          <div className="dash-kpi-body">
            <span className="dash-kpi-value">{loading || !stats ? '—' : stats.total}</span>
            <span className="dash-kpi-label">{t('evaluations')}</span>
          </div>
        </div>
        <div className="dash-kpi">
          <div className="dash-kpi-icon" style={{ background: 'var(--severity-low-bg)', color: 'var(--severity-low)' }}>
            <IconCheck />
          </div>
          <div className="dash-kpi-body">
            <span className="dash-kpi-value" style={{ color: 'var(--severity-low)' }}>{loading || !stats ? '—' : stats.leve}</span>
            <span className="dash-kpi-label">{t('mild')}</span>
          </div>
        </div>
        <div className="dash-kpi">
          <div className="dash-kpi-icon" style={{ background: 'var(--severity-mid-bg)', color: 'var(--severity-mid)' }}>
            <IconActivity />
          </div>
          <div className="dash-kpi-body">
            <span className="dash-kpi-value" style={{ color: 'var(--severity-mid)' }}>{loading || !stats ? '—' : stats.moderada}</span>
            <span className="dash-kpi-label">{t('moderate')}</span>
          </div>
        </div>
        <div className="dash-kpi">
          <div className="dash-kpi-icon" style={{ background: 'var(--severity-high-bg)', color: 'var(--severity-high)' }}>
            <IconShield />
          </div>
          <div className="dash-kpi-body">
            <span className="dash-kpi-value" style={{ color: 'var(--severity-high)' }}>{loading || !stats ? '—' : stats.severa}</span>
            <span className="dash-kpi-label">{t('severe')}</span>
          </div>
        </div>
      </div>

      {/* ── Alerta severa condicional ── */}
      {!loading && severaCritical && (
        <div className="dash-alert">
          <IconAlertTriangle style={{ width: 18, height: 18, flexShrink: 0 }} />
          <span>
            <strong>{stats.severa} {stats.severa > 1 ? t('severeCasesAlert') : t('severeAlert')}</strong>
          </span>
          <Link href="/historial" className="dash-alert-link">{t('viewHistory')}</Link>
        </div>
      )}

      {/* ── Grid: Distribución + Modelo + Actividad ── */}
      <div className="dash-grid-3">
        <div className="card dash-card-animate">
          <div className="card-header">
            <h3><IconPerformance style={{ width: '1em', height: '1em', verticalAlign: 'middle', marginRight: 6 }} /> {t('severityDistribution')}</h3>
          </div>
          {loading || !stats ? (
            <div className="dash-skeleton-block" />
          ) : stats.total === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {t('noData')}
            </div>
          ) : (
            <SeverityDonut leve={stats.leve} moderada={stats.moderada} severa={stats.severa} total={stats.total} />
          )}
        </div>

        <div className="card dash-card-animate" style={{ animationDelay: '0.06s' }}>
          <div className="card-header">
            <h3><IconTrendingUp style={{ width: '1em', height: '1em', verticalAlign: 'middle', marginRight: 6 }} /> {t('acuityModel')}</h3>
            <span className="dash-version-tag">V3</span>
          </div>
          <div className="dash-model-metrics">
            <div className="dash-metric-item">
              <div className="dash-metric-ring" style={{ '--pct': '74.57', '--clr': 'var(--severity-low)' }}>
                <span>74.6%</span>
              </div>
              <span className="dash-metric-label">Accuracy CV</span>
            </div>
            <div className="dash-metric-item">
              <div className="dash-metric-ring" style={{ '--pct': '69.47', '--clr': 'var(--accent)' }}>
                <span>69.5%</span>
              </div>
              <span className="dash-metric-label">F1-Macro</span>
            </div>
            <div className="dash-metric-item">
              <div className="dash-metric-ring" style={{ '--pct': (stats?.avgConfianza || 0), '--clr': 'var(--unisinu-gold)' }}>
                <span>{loading || !stats ? '—' : stats.avgConfianza + '%'}</span>
              </div>
              <span className="dash-metric-label">{t('modelConfidence')}</span>
            </div>
          </div>
        </div>

        <div className="card dash-card-animate" style={{ animationDelay: '0.12s' }}>
          <div className="card-header">
            <h3><IconHistory style={{ width: '1em', height: '1em', verticalAlign: 'middle', marginRight: 6 }} /> {t('weekActivity')}</h3>
          </div>
          {loading || !stats ? (
            <div className="dash-skeleton-block" />
          ) : (
            <WeekSparkline evaluaciones={stats.evaluaciones} />
          )}
        </div>
      </div>

      {/* ── Evaluaciones Recientes ── */}
      <div className="card dash-card-animate" style={{ animationDelay: '0.18s' }}>
        <div className="card-header">
          <h3>
            <IconEvaluation style={{ width: '1em', height: '1em', verticalAlign: 'middle', marginRight: 6 }} />
            {t('recentEvaluationsSection')}
          </h3>
          {recent.length > 0 && (
            <Link href="/historial" className="btn btn-secondary btn-sm">{t('viewAllLink')} →</Link>
          )}
        </div>

        {loading ? (
          <div className="dash-table-skeleton">
            {[1, 2, 3].map((i) => <div key={i} className="dash-skeleton-row" />)}
          </div>
        ) : recent.length === 0 ? (
          <div className="empty-state">
            <div className="dash-empty-icon">
              <IconEvaluation style={{ width: 40, height: 40 }} />
            </div>
            <h3>{t('noEvaluationsYet')}</h3>
            <p>{t('noEvaluationsDesc')}</p>
            <Link href="/evaluacion" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              <IconPlus style={{ width: '1em', height: '1em' }} /> {t('getStarted')}
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="table-container desktop-only">
              <table className="table dash-table">
                <thead>
                  <tr>
                    <th>{t('dateColumn')}</th>
                    <th>{t('patientColumn')}</th>
                    <th>{t('physicalFindingColumn')}</th>
                    <th>{t('severityField')}</th>
                    <th>{t('confidenceField')}</th>
                    <th>{t('keyFactorsColumn')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((e, idx) => {
                    const datos = e.datos_paciente || {};
                    const factores = e.factores || [];
                    const severityColor = e.prediccion === 'Leve' ? 'var(--severity-low)'
                      : e.prediccion === 'Moderada' ? 'var(--severity-mid)' : 'var(--severity-high)';
                    return (
                      <tr key={e.id || e.created_at} className="dash-table-row" style={{ animationDelay: `${idx * 0.04}s` }}>
                        <td>
                          <span className="dash-date-cell">
                            <span className="dash-date-day">{formatDateShort(e.created_at)}</span>
                            <span className="dash-date-time">
                                {new Date(e.created_at).toLocaleTimeString(language === 'es' ? 'es-CO' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </span>
                        </td>
                        <td>
                          <div className="dash-patient-cell">
                            <div className="dash-patient-avatar" style={{ background: `${severityColor}20`, color: severityColor }}>
                              <IconUser style={{ width: 14, height: 14 }} />
                            </div>
                            <div>
                              <span className="dash-patient-age">
                                {EDAD_LABELS(t)[datos.grupo_edad] || datos.grupo_edad || '—'}
                              </span>
                              <span className="dash-patient-meta">
                                {translateValue(datos.sexo) || ''}{datos.sexo && datos.area ? ' · ' : ''}{datos.area === 'Urban' ? t('urban') : datos.area === 'Rural' ? t('rural') : datos.area || ''}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td><span className="badge badge-info" style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>{translateValue(datos.hallazgo_examen_fisico) || '—'}</span></td>
                        <td><SeverityBadge prediccion={e.prediccion} /></td>
                        <td>
                          <div className="dash-confidence-cell">
                            <div className="dash-conf-bar">
                              <div
                                className="dash-conf-fill"
                                style={{ width: (e.confianza || 0) + '%', background: severityColor }}
                              />
                            </div>
                            <span className="dash-conf-value">{e.confianza}%</span>
                          </div>
                        </td>
                        <td>
                          <div className="dash-factors">
                            {factores.length > 0
                              ? factores.slice(0, 2).map((f, i) => (
                                <span key={i} className="dash-factor-chip">{translateValue(f)}</span>
                              ))
                              : <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                            }
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="mobile-only dash-eval-cards">
              {recent.map((e, idx) => {
                const datos = e.datos_paciente || {};
                const severityColor = e.prediccion === 'Leve' ? 'var(--severity-low)'
                  : e.prediccion === 'Moderada' ? 'var(--severity-mid)' : 'var(--severity-high)';
                const factoresM = e.factores || [];
                return (
                  <div
                    key={e.id || e.created_at}
                    className="dash-eval-card"
                    style={{ borderLeftColor: severityColor, animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="dash-eval-card-top">
                      <SeverityBadge prediccion={e.prediccion} />
                      <span className="dash-eval-card-date">{formatDate(e.created_at)}</span>
                    </div>
                    <div className="dash-eval-card-grid">
                      <div className="dash-eval-field">
                        <span className="dash-eval-field-label">{t('confidenceField')}</span>
                        <span className="dash-eval-field-val" style={{ color: severityColor, fontWeight: 700 }}>{e.confianza}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
