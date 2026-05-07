'use client';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { IconUsers, IconClipboard, IconHeart, IconFlask, IconLoader, IconActivity } from './Icons';
import TriageTepModal from './TriageTepModal';

/**
 * Opciones de dropdowns — mapeo exacto a las categorías del modelo V3.
 */
const OPTIONS = {
    grupo_edad: [
        { value: 'Menor de 2', labelKey: 'under2' },
        { value: '2-5', labelKey: 'age2to5' },
        { value: '6-12', labelKey: 'age6to12' },
        { value: '13-17', labelKey: 'age13to17' },
    ],
    sexo: [
        { value: 'Femenino', labelKey: 'female' },
        { value: 'Masculino', labelKey: 'male' },
    ],
    area: [
        { value: 'Urban', labelKey: 'urban' },
        { value: 'Rural', labelKey: 'rural' },
    ],
    vacunacion: [
        { value: 'Completo', labelKey: 'complete' },
        { value: 'Incompleto', labelKey: 'incomplete' },
    ],
    antecedentes: [
        { value: 'Ninguno', labelKey: 'none' },
        { value: 'Asma', labelKey: 'asthma' },
        { value: 'Bronquiolitis', labelKey: 'bronchiolitis' },
        { value: 'Neumonía adquirida en la comunidad', labelKey: 'communityPneumonia' },
        { value: 'Otitis media aguda', labelKey: 'acuteOtitisMedia' },
        { value: 'Pretérmino', labelKey: 'preterm' },
        { value: 'Otro', labelKey: 'other' },
    ],
    contacto_epidemiologico: [
        { value: 'Ninguno', labelKey: 'none' },
        { value: 'Rinofaringitis', labelKey: 'rhinopharyngitis' },
        { value: 'Sinusitis', labelKey: 'sinusitis' },
        { value: 'Otro', labelKey: 'other' },
    ],
    exposicion_ambiental: [
        { value: 'Ninguno', labelKey: 'none' },
        { value: 'Polución ambiental', labelKey: 'environmentalPollution' },
        { value: 'Polvo casero', labelKey: 'houseDust' },
        { value: 'Preservativos químicos', labelKey: 'chemicalPreservatives' },
        { value: 'Tabaquismo', labelKey: 'smoking' },
    ],
    estado_nutricional: [
        { value: 'Normal', labelKey: 'normal' },
        { value: 'Riesgo de desnutrición', labelKey: 'malnutritionRisk' },
        { value: 'Otro', labelKey: 'obesity' },
    ],
};

const INITIAL_DATA = {
    grupo_edad: '2-5',
    sexo: 'Femenino',
    area: 'Urban',
    tiempo_fiebre: '',
    vacunacion: 'Completo',
    antecedentes: 'Ninguno',
    contacto_epidemiologico: 'Ninguno',
    exposicion_ambiental: 'Ninguno',
    estado_nutricional: 'Normal',
    glasgow: '15',
    cayados: '',
    plaquetas: '',
    albumina: '',
    globulina: '',
    procalcitonina: '',
    leucocitos: '',
    pcr: '',
    triage: '',
};

export default function PatientForm({ onSubmit, isLoading }) {
    const { t } = useLanguage();
    const [formData, setFormData] = useState(INITIAL_DATA);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            grupo_edad: formData.grupo_edad,
            sexo: formData.sexo,
            area: formData.area,
            tiempo_fiebre: parseInt(formData.tiempo_fiebre) || 0,
            vacunacion: formData.vacunacion,
            antecedentes: formData.antecedentes,
            contacto_epidemiologico: formData.contacto_epidemiologico,
            exposicion_ambiental: formData.exposicion_ambiental,
            estado_nutricional: formData.estado_nutricional,
            nivel_triage_tep: formData.triage,
            glasgow: parseInt(formData.glasgow),
            cayados: formData.cayados ? parseFloat(formData.cayados) : null,
            plaquetas: formData.plaquetas ? parseFloat(formData.plaquetas) : null,
            albumina: formData.albumina ? parseFloat(formData.albumina) : null,
            globulina: formData.globulina ? parseFloat(formData.globulina) : null,
            procalcitonina: formData.procalcitonina ? parseFloat(formData.procalcitonina) : null,
            leucocitos: formData.leucocitos ? parseFloat(formData.leucocitos) : null,
            pcr: formData.pcr ? parseFloat(formData.pcr) : null,
        };

        onSubmit(payload);
    };

    const handleReset = () => {
        setFormData(INITIAL_DATA);
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Datos Demográficos */}
            <div className="form-section">
                <div className="form-section-title">
                    <IconUsers style={{ width: 18, height: 18 }} /> {t('demographics')}
                </div>
                <div className="form-grid">
                    <div className="input-group">
                        <label>{t('ageGroup')}</label>
                        <select className="select" name="grupo_edad" value={formData.grupo_edad} onChange={handleChange}>
                            {OPTIONS.grupo_edad.map((o) => (
                                <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group">
                        <label>{t('sex')}</label>
                        <select className="select" name="sexo" value={formData.sexo} onChange={handleChange}>
                            {OPTIONS.sexo.map((o) => (
                                <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group">
                        <label>{t('area')}</label>
                        <select className="select" name="area" value={formData.area} onChange={handleChange}>
                            {OPTIONS.area.map((o) => (
                                <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group">
                        <label>{t('vaccination')}</label>
                        <select className="select" name="vacunacion" value={formData.vacunacion} onChange={handleChange}>
                            {OPTIONS.vacunacion.map((o) => (
                                <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Antecedentes y Exposición */}
            <div className="form-section">
                <div className="form-section-title">
                    <IconClipboard style={{ width: 18, height: 18 }} /> {t('historyAndExposure')}
                </div>
                <div className="form-grid">
                    <div className="input-group">
                        <label>{t('personalHistory')}</label>
                        <select className="select" name="antecedentes" value={formData.antecedentes} onChange={handleChange}>
                            {OPTIONS.antecedentes.map((o) => (
                                <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group">
                        <label>{t('epidemiologicalContact')}</label>
                        <select className="select" name="contacto_epidemiologico" value={formData.contacto_epidemiologico} onChange={handleChange}>
                            {OPTIONS.contacto_epidemiologico.map((o) => (
                                <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group">
                        <label>{t('environmentalExposure')}</label>
                        <select className="select" name="exposicion_ambiental" value={formData.exposicion_ambiental} onChange={handleChange}>
                            {OPTIONS.exposicion_ambiental.map((o) => (
                                <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group">
                        <label>{t('nutritionalStatus')}</label>
                        <select className="select" name="estado_nutricional" value={formData.estado_nutricional} onChange={handleChange}>
                            {OPTIONS.estado_nutricional.map((o) => (
                                <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Evaluación Clínica */}
            <div className="form-section">
                <div className="form-section-title">
                    <IconHeart style={{ width: 18, height: 18 }} /> {t('vitalSigns')}
                </div>
                <div className="form-grid">
                    <div className="input-group">
                        <label>{t('daysOfFever')}</label>
                        <input
                            className="input"
                            type="number"
                            name="tiempo_fiebre"
                            value={formData.tiempo_fiebre}
                            onChange={handleChange}
                            placeholder={t('feverPlaceholder') || 'Ej: 3'}
                            min="0"
                            max="60"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>{t('glasgow')}</label>
                        <select className="select" name="glasgow" value={formData.glasgow} onChange={handleChange}>
                            {Array.from({ length: 13 }, (_, i) => 15 - i).map((v) => (
                                <option key={v} value={v}>{v}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Laboratorios */}
            <div className="form-section">
                <div className="form-section-title">
                    <IconFlask style={{ width: 18, height: 18 }} /> {t('laboratories')}
                </div>
                <div className="form-grid">
                    <div className="input-group">
                        <label>{t('absoluteBandCells')}</label>
                        <input
                            className="input"
                            type="number"
                            name="cayados"
                            value={formData.cayados}
                            onChange={handleChange}
                            placeholder={t('bandCellsPlaceholder') || 'Ej: 200'}
                            step="0.1"
                            min="0"
                        />
                    </div>
                    <div className="input-group">
                        <label>{t('platelets')}</label>
                        <input
                            className="input"
                            type="number"
                            name="plaquetas"
                            value={formData.plaquetas}
                            onChange={handleChange}
                            placeholder="Ej: 250000"
                            min="0"
                        />
                    </div>
                    <div className="input-group">
                        <label>{t('serumAlbumin')}</label>
                        <input
                            className="input"
                            type="number"
                            name="albumina"
                            value={formData.albumina}
                            onChange={handleChange}
                            placeholder="Ej: 4.0"
                            step="0.1"
                            min="0"
                        />
                    </div>
                    <div className="input-group">
                        <label>{t('serumGlobulin')}</label>
                        <input
                            className="input"
                            type="number"
                            name="globulina"
                            value={formData.globulina}
                            onChange={handleChange}
                            placeholder="Ej: 2.5"
                            step="0.1"
                            min="0"
                        />
                    </div>
                    <div className="input-group">
                        <label>{t('procalcitonin')}</label>
                        <input
                            className="input"
                            type="number"
                            name="procalcitonina"
                            value={formData.procalcitonina}
                            onChange={handleChange}
                            placeholder="Ej: 0.25"
                            step="0.01"
                            min="0"
                        />
                    </div>
                    <div className="input-group">
                        <label>{t('leukocytes')}</label>
                        <input
                            className="input"
                            type="number"
                            name="leucocitos"
                            value={formData.leucocitos}
                            onChange={handleChange}
                            placeholder="Ej: 10000"
                            min="0"
                        />
                    </div>
                    <div className="input-group">
                        <label>{t('crp')}</label>
                        <input
                            className="input"
                            type="number"
                            name="pcr"
                            value={formData.pcr}
                            onChange={handleChange}
                            placeholder="Ej: 5.0"
                            step="0.1"
                            min="0"
                        />
                    </div>
                </div>
            </div>

            {/* Triage */}
            <div className="form-section">
                <div className="form-section-title">
                    {t('triageClassification')}
                </div>
                <div className="form-grid">
                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                        <TriageTepModal
                            value={formData.triage}
                            onChange={(val) => setFormData({ ...formData, triage: val })}
                        />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
                    {isLoading ? (
                        <><IconLoader style={{ width: '1em', height: '1em' }} /> {t('loading')}</>
                    ) : (
                        <><IconActivity style={{ width: '1em', height: '1em' }} /> {t('getPrediction')}</>
                    )}
                </button>
                <button type="button" className="btn btn-secondary btn-lg" onClick={handleReset}>
                    {t('clearForm')}
                </button>
            </div>
        </form>
    );
}
