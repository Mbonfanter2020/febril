'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { IconUser, IconMedical, IconMail, IconLock, IconCheck } from '../../components/Icons';
import { LanguageProvider, useLanguage } from '../../context/LanguageContext';
import { getPublicStats } from '../../lib/api';
import { supabase } from '../../lib/supabase';

function RegisterForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [especialidad, setEspecialidad] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [totalPatients, setTotalPatients] = useState(null);
    const { signUp, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const { t, language, toggleLanguage } = useLanguage();

    useEffect(() => {
        const fetchStats = async () => {
            const count = await getPublicStats(supabase);
            setTotalPatients(count);
        };
        fetchStats();

        // Suscripción Real-time para el contador
        const channel = supabase
            .channel('public:evaluaciones_count')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'evaluaciones' }, () => {
                fetchStats();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        if (!loading && isAuthenticated) {
            router.replace('/dashboard');
        }
    }, [isAuthenticated, loading, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError(t('passwordsDontMatch'));
            return;
        }
        if (password.length < 6) {
            setError(t('passwordTooShort'));
            return;
        }
        if (!nombre.trim()) {
            setError(t('nameRequired'));
            return;
        }

        setIsSubmitting(true);

        const result = await signUp(email, password, {
            nombre: nombre.trim(),
            especialidad: especialidad.trim() || null,
        });

        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.error);
        }
        setIsSubmitting(false);
    };

    if (loading) return null;

    return (
        <div className="login-page">
            <div className="login-bg" />
            <div className="login-bg-pattern" />

            {/* Left — Hero */}
            <div className="login-left">

                <div className="login-hero-content">
                    <div className="login-hero-icon">
                        <IconMedical style={{ width: 48, height: 48 }} />
                    </div>
                    <h1>
                        {t('medicalRegisterTitlePart1')}{' '}
                        <span className="text-gradient">{t('medicalRegisterTitlePart2')}</span>
                    </h1>
                    <p>
                        {t('authHeroDesc')}
                    </p>
                    <div className="login-hero-stats">
                        <div className="login-stat">
                            <div className="value">15</div>
                            <div className="label">{t('clinicalVariables')}</div>
                        </div>
                        <div className="login-stat">
                            <div className="value">3</div>
                            <div className="label">{t('severityLevels')}</div>
                        </div>
                        <div className="login-stat">
                            <div className="value">{totalPatients !== null ? totalPatients : '...'}</div>
                            <div className="label">{t('patientsAnalyzed')}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right — Register Form */}
            <div className="login-right">
                <div className="login-card animate-slide">
                    <h2>{t('createAccount')}</h2>
                    <p className="subtitle">{t('registerSubtitle')}</p>

                    {success ? (
                        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                            <div style={{ marginBottom: '1rem', color: 'var(--severity-low)' }}>
                                <IconCheck style={{ width: 48, height: 48 }} />
                            </div>
                            <h3 style={{ marginBottom: '0.5rem' }}>{t('registerSuccessTitle')}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                {t('registerSuccessDesc')}
                            </p>
                            <Link href="/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                                {t('goToLogin')}
                            </Link>
                        </div>
                    ) : (
                        <form className="login-form" onSubmit={handleSubmit}>
                            {error && <div className="login-error">{error}</div>}

                            <div className="input-group">
                                <label htmlFor="nombre">{t('fullName')} *</label>
                                <div className="input-icon-wrapper">
                                    <span className="input-icon"><IconUser /></span>
                                    <input
                                        id="nombre"
                                        className="input"
                                        type="text"
                                        placeholder="Dr. Juan Pérez"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="especialidad">{t('medicalSpecialty')}</label>
                                <div className="input-icon-wrapper">
                                    <span className="input-icon"><IconMedical /></span>
                                    <input
                                        id="especialidad"
                                        className="input"
                                        type="text"
                                        placeholder="Pediatría, Urgencias, etc."
                                        value={especialidad}
                                        onChange={(e) => setEspecialidad(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="reg-email">{t('email')} *</label>
                                <div className="input-icon-wrapper">
                                    <span className="input-icon"><IconMail /></span>
                                    <input
                                        id="reg-email"
                                        className="input"
                                        type="email"
                                        placeholder="doctor@ejemplo.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="reg-password">{t('password')} *</label>
                                <div className="input-icon-wrapper">
                                    <span className="input-icon"><IconLock /></span>
                                    <input
                                        id="reg-password"
                                        className="input"
                                        type="password"
                                        placeholder={t('passwordTooShort')}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="reg-confirm">{t('confirmPassword')} *</label>
                                <div className="input-icon-wrapper">
                                    <span className="input-icon"><IconLock /></span>
                                    <input
                                        id="reg-confirm"
                                        className="input"
                                        type="password"
                                        placeholder={t('confirmPassword')}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={isSubmitting}
                                style={{ width: '100%', marginTop: '0.5rem' }}
                            >
                                {isSubmitting ? t('registering') : t('createAccount')}
                            </button>
                        </form>
                    )}

                    <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{t('alreadyHaveAccount')} </span>
                        <Link href="/login" style={{ fontWeight: 600 }}>
                            {t('loginAction')}
                        </Link>
                    </div>

                    <div className="login-footer">
                        {t('unisinuFooter')}
                        <br />
                        {t('researchFooter')}
                    </div>
                </div>
            </div>

            {/* Language Toggle — Global Fixed Position */}
            <button 
                className="lang-toggle-auth" 
                onClick={toggleLanguage}
                aria-label="Toggle Language"
            >
                <span className="lang-icon">{language === 'es' ? '🇺🇸' : '🇪🇸'}</span>
                <span className="lang-text">{language === 'es' ? 'English' : 'Español'}</span>
            </button>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <AuthProvider>
            <LanguageProvider>
                <RegisterForm />
            </LanguageProvider>
        </AuthProvider>
    );
}
