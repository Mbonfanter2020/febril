'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { IconMail, IconLock, IconShield } from '../../components/Icons';
import { useLanguage, LanguageProvider } from '../../context/LanguageContext';
import { getPublicStats } from '../../lib/api';
import { supabase } from '../../lib/supabase';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDisclaimer, setShowDisclaimer] = useState(false);
    const { signIn, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const { t, language, toggleLanguage } = useLanguage();


    useEffect(() => {
        if (!loading && isAuthenticated && !showDisclaimer) {
            router.replace('/dashboard');
        }
    }, [isAuthenticated, loading, router, showDisclaimer]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const result = await signIn(email, password);
        if (result.success) {
            setShowDisclaimer(true);
        } else {
            setError(result.error);
            setIsSubmitting(false);
        }
    };

    const handleAcceptDisclaimer = () => {
        router.push('/dashboard');
    };

    if (loading) return null;

    return (
        <div className="login-page">
            <div className="login-bg" />
            <div className="login-bg-pattern" />

            {/* Left — Hero Section */}
            <div className="login-left">

                <div className="login-hero-content">
                    <div className="login-hero-icon">
                        <IconShield style={{ width: 48, height: 48 }} />
                    </div>
                    <h1>
                        {t('loginHeroTitlePart1')}{' '}
                        <span className="text-gradient">{t('loginHeroTitlePart2')}</span> {t('loginHeroTitlePart3')}
                    </h1>
                    <p>
                        {t('loginHeroDesc')}
                    </p>
                    <div className="login-hero-stats">
                        <div className="login-stat">
                            <div className="value">95.1%</div>
                            <div className="label">{t('recallSevere')}</div>
                        </div>
                        <div className="login-stat">
                            <div className="value">74.6%</div>
                            <div className="label">{t('accuracyCV')}</div>
                        </div>
                        <div className="login-stat">
                            <div className="value">0</div>
                            <div className="label">{t('criticalErrors')}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right — Login Form / Disclaimer */}
            <div className="login-right">
                {!showDisclaimer ? (
                    <div className="login-card animate-slide">
                        <h2>{t('loginAction')}</h2>
                        <p className="subtitle">{t('loginSubtitle')}</p>

                        <form className="login-form" onSubmit={handleSubmit}>
                            {error && <div className="login-error">{error}</div>}

                            <div className="input-group">
                                <label htmlFor="email">{t('email')}</label>
                                <div className="input-icon-wrapper">
                                    <span className="input-icon"><IconMail /></span>
                                    <input
                                        id="email"
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
                                <label htmlFor="password">{t('password')}</label>
                                <div className="input-icon-wrapper">
                                    <span className="input-icon"><IconLock /></span>
                                    <input
                                        id="password"
                                        className="input"
                                        type="password"
                                        placeholder={t('enterPassword')}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
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
                                {isSubmitting ? t('verifying') : t('enter')}
                            </button>
                        </form>

                        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{t('noAccount')} </span>
                            <Link href="/register" style={{ fontWeight: 600 }}>
                                {t('registerAction')}
                            </Link>
                        </div>

                        <div className="login-footer">
                            {t('unisinuFooter')}
                            <br />
                            {t('researchFooter')}
                        </div>
                    </div>
                ) : (
                    <div className="login-card animate-slide" style={{ maxWidth: '600px', textAlign: 'left', padding: '2.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--accent)', fontWeight: 'bold' }}>
                            {t('disclaimerTitle')}
                        </h2>

                        <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <strong style={{ color: 'var(--text-primary)' }}>{t('disclaimer1Title')}</strong><br/>
                                {t('disclaimer1Desc')}
                            </div>
                            <div>
                                <strong style={{ color: 'var(--text-primary)' }}>{t('disclaimer2Title')}</strong><br/>
                                {t('disclaimer2Desc')}
                            </div>
                            <div>
                                <strong style={{ color: 'var(--text-primary)' }}>{t('disclaimer3Title')}</strong><br/>
                                {t('disclaimer3Desc')}
                            </div>
                            <div>
                                <strong style={{ color: 'var(--text-primary)' }}>{t('disclaimer4Title')}</strong><br/>
                                {t('disclaimer4Desc')}
                            </div>
                            <div>
                                <strong style={{ color: 'var(--text-primary)' }}>{t('disclaimer5Title')}</strong><br/>
                                {t('disclaimer5Desc')}
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                {t('disclaimerFooter')}
                            </p>
                            <button
                                type="button"
                                className="btn btn-primary btn-lg"
                                onClick={handleAcceptDisclaimer}
                                style={{ width: '100%' }}
                            >
                                {t('disclaimerAccept')}
                            </button>
                        </div>
                    </div>
                )}
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

export default function LoginPage() {
    return (
        <AuthProvider>
            <LanguageProvider>
                <LoginForm />
            </LanguageProvider>
        </AuthProvider>
    );
}
