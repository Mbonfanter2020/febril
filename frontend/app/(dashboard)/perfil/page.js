'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getDashboardStats } from '../../lib/api';
import {
  IconUser, IconMail, IconMedical, IconSave, IconLoader,
  IconCheck, IconAlertCircle, IconEvaluation, IconShield, IconDatabase,
} from '../../components/Icons';

export default function ProfilePage() {
  const { user, profile, updateProfile, supabase, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    nombre: '',
    especialidad: '',
    institucion: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [stats, setStats] = useState({ total: 0, leve: 0, moderada: 0, severa: 0 });

  useEffect(() => {
    if (profile) {
      setFormData({
        nombre: profile.nombre || '',
        especialidad: profile.especialidad || '',
        institucion: profile.institucion || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (supabase) {
      getDashboardStats(supabase)
        .then((s) => setStats(s))
        .catch(() => {});
    }
  }, [supabase]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { success, error } = await updateProfile(formData);
    if (success) {
      setMessage({ type: 'success', text: t('profileUpdated') });
    } else {
      setMessage({ type: 'error', text: t('profileError') + error });
    }
    setSaving(false);
    setTimeout(() => setMessage(null), 4000);
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <IconLoader style={{ width: 20, height: 20 }} /> {t('loading')}
        </div>
      </div>
    );
  }

  const initials = profile?.nombre
    ? profile.nombre.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('es-CO', {
        year: 'numeric', month: 'long',
      })
    : '—';

  return (
    <div className="page-container" style={{ maxWidth: '900px' }}>
      <div className="page-header">
        <h1>{t('myProfile').split(' ')[0]} <span className="text-gradient">{t('myProfile').split(' ').slice(1).join(' ')}</span></h1>
        <p>{t('profileSubtitle')}</p>
      </div>

      {/* Avatar + resumen rápido */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          {/* Avatar grande */}
          <div
            style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', fontWeight: 800, color: '#fff',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>

          {/* Info principal */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
              {profile?.nombre === 'Sin nombre' ? t('unnamed') : (profile?.nombre || t('unnamed'))}
            </h2>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {profile?.especialidad || t('noSpecialty')}
              {profile?.institucion ? ` · ${profile.institucion}` : ''}
            </p>
            <p style={{ margin: '0.35rem 0 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              <IconMail style={{ width: 12, height: 12, verticalAlign: 'middle', marginRight: 4 }} />
              {user?.email || '—'}
              <span style={{ marginLeft: '1rem' }}>
                {t('memberSince')} {memberSince}
              </span>
            </p>
          </div>

          {/* Mini stats */}
          <div style={{ display: 'flex', gap: '1.5rem', flexShrink: 0 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.total}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('evaluations')}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--severity-high)' }}>{stats.severa}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('severe_plural')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de edición */}
      <div className="card">
        <div className="card-header">
          <h3>
            <IconUser style={{ width: '1em', height: '1em', verticalAlign: 'middle', marginRight: 6 }} />
            {t('personalInfo')}
          </h3>
        </div>

        {/* Mensaje de éxito/error */}
        {message && (
          <div
            style={{
              background: message.type === 'success' ? 'var(--severity-low-bg)' : 'var(--severity-high-bg)',
              color: message.type === 'success' ? 'var(--severity-low)' : 'var(--severity-high)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 500,
              marginBottom: '1rem',
            }}
          >
            {message.type === 'success'
              ? <IconCheck style={{ width: 16, height: 16 }} />
              : <IconAlertCircle style={{ width: 16, height: 16 }} />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ gap: '1.25rem' }}>
            {/* Email (readonly) */}
            <div className="form-group">
              <label>{t('emailLabel')}</label>
              <div className="input-with-icon">
                <IconMail className="icon" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input"
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('emailReadonly')}</span>
            </div>

            {/* Nombre */}
            <div className="form-group">
              <label>{t('fullName')} <span style={{ color: 'var(--severity-high)' }}>*</span></label>
              <div className="input-with-icon">
                <IconUser className="icon" />
                <input
                  type="text"
                  className="input"
                  placeholder="Dr. Juan Pérez"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Especialidad */}
            <div className="form-group">
              <label>{t('medicalSpecialty')}</label>
              <div className="input-with-icon">
                <IconMedical className="icon" />
                <input
                  type="text"
                  className="input"
                  placeholder="Ej: Pediatría, Medicina General"
                  value={formData.especialidad}
                  onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                />
              </div>
            </div>

            {/* Institución */}
            <div className="form-group">
              <label>{t('institution')}</label>
              <div className="input-with-icon">
                <IconDatabase className="icon" />
                <input
                  type="text"
                  className="input"
                  placeholder="Universidad del Sinú"
                  value={formData.institucion}
                  onChange={(e) => setFormData({ ...formData, institucion: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Botón guardar */}
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving
                ? <><IconLoader style={{ width: '1em', height: '1em' }} /> {t('saving')}</>
                : <><IconSave style={{ width: '1em', height: '1em' }} /> {t('saveChanges')}</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
