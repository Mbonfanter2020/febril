'use client';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getEvaluaciones } from '../../lib/api';
import { IconPerformance, IconActivity, IconCheck, IconShield, IconTrendingUp, IconInfo } from '../../components/Icons';

export default function RendimientoPage() {
  const { supabase } = useAuth();
  const { t } = useLanguage();
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const { data } = await getEvaluaciones(supabase, { limit: 500 });
      setEvaluaciones(data || []);
    } catch (err) {
      console.error('Error cargando evaluaciones:', err);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const total = evaluaciones.length;
    const leve = evaluaciones.filter((e) => e.prediccion === 'Leve').length;
    const moderada = evaluaciones.filter((e) => e.prediccion === 'Moderada').length;
    const severa = evaluaciones.filter((e) => e.prediccion === 'Severa').length;
    const avgConfianza = total > 0
      ? (evaluaciones.reduce((s, e) => s + (e.confianza || 0), 0) / total).toFixed(1)
      : 0;

    // Confidence distribution
    const highConf = evaluaciones.filter((e) => e.confianza >= 80).length;
    const medConf = evaluaciones.filter((e) => e.confianza >= 50 && e.confianza < 80).length;
    const lowConf = evaluaciones.filter((e) => e.confianza < 50).length;

    return { total, leve, moderada, severa, avgConfianza, highConf, medConf, lowConf };
  }, [evaluaciones]);

  // Percentages for donut chart
  const pctLeve = stats.total > 0 ? ((stats.leve / stats.total) * 100).toFixed(1) : 0;
  const pctModerada = stats.total > 0 ? ((stats.moderada / stats.total) * 100).toFixed(1) : 0;
  const pctSevera = stats.total > 0 ? ((stats.severa / stats.total) * 100).toFixed(1) : 0;

  // CSS conic gradient for donut
  const deg1 = (stats.leve / Math.max(stats.total, 1)) * 360;
  const deg2 = deg1 + (stats.moderada / Math.max(stats.total, 1)) * 360;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>
          {t('performanceTitle').split(' ')[0]} <span className="text-gradient">{t('performanceTitle').split(' ').slice(1).join(' ')}</span>
        </h1>
        <p>{t('performanceSubtitle')}</p>
      </div>

      {/* Key Metrics */}
      <div className="kpi-grid" style={{ marginBottom: '1rem' }}>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#818CF8' }}>
            <IconPerformance />
          </div>
          <div className="kpi-value">74.6%</div>
          <div className="kpi-label">{t('accuracyCV')} V3</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#818CF8' }}>
            <IconTrendingUp />
          </div>
          <div className="kpi-value">{stats.avgConfianza}%</div>
          <div className="kpi-label">{t('modelConfidence')}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--severity-low-bg)', color: 'var(--severity-low)' }}>
            <IconCheck />
          </div>
          <div className="kpi-value" style={{ color: 'var(--severity-low)' }}>0</div>
          <div className="kpi-label">{t('criticalErrors')}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--severity-high-bg)', color: 'var(--severity-high)' }}>
            <IconShield />
          </div>
          <div className="kpi-value">{stats.total}</div>
          <div className="kpi-label">{t('patientsEvaluated')}</div>
        </div>
      </div>

      {/* Distribution Chart + Confidence */}
      <div className="grid-2" style={{ marginBottom: '1rem' }}>
        {/* Donut chart: severity distribution */}
        <div className="card">
          <div className="card-header">
            <h3>{t('distributionBySeverity')}</h3>
          </div>
          {stats.total === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {t('noEvaluations')}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div
                className="donut-chart"
                style={{
                  background: `conic-gradient(
                    var(--severity-low) 0deg ${deg1}deg,
                    var(--severity-mid) ${deg1}deg ${deg2}deg,
                    var(--severity-high) ${deg2}deg 360deg
                  )`,
                }}
              >
                <div className="donut-center">
                  <span className="value">{stats.total}</span>
                  <span className="label">{t('total')}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: 'var(--severity-low)' }} />
                  {t('mild')} — {stats.leve} ({pctLeve}%)
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: 'var(--severity-mid)' }} />
                  {t('moderate')} — {stats.moderada} ({pctModerada}%)
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: 'var(--severity-high)' }} />
                  {t('severe')} — {stats.severa} ({pctSevera}%)
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confidence distribution */}
        <div className="card">
          <div className="card-header">
            <h3>{t('confidenceLevel')}</h3>
          </div>
          {stats.total === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {t('noData')}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* High confidence */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('highConfidence')}</span>
                  <span style={{ fontWeight: 600, color: 'var(--severity-low)' }}>{stats.highConf}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(stats.highConf / Math.max(stats.total, 1)) * 100}%`, background: 'var(--severity-low)' }} />
                </div>
              </div>
              {/* Medium confidence */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('medConfidence')}</span>
                  <span style={{ fontWeight: 600, color: 'var(--severity-mid)' }}>{stats.medConf}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(stats.medConf / Math.max(stats.total, 1)) * 100}%`, background: 'var(--severity-mid)' }} />
                </div>
              </div>
              {/* Low confidence */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('lowConfidence')}</span>
                  <span style={{ fontWeight: 600, color: 'var(--severity-high)' }}>{stats.lowConf}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(stats.lowConf / Math.max(stats.total, 1)) * 100}%`, background: 'var(--severity-high)' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="card" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.7, display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
        <IconInfo style={{ width: 18, height: 18, flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong>{t('noteLabel') || 'Note'}:</strong> {t('modelNote')}
        </div>
      </div>
    </div>
  );
}
