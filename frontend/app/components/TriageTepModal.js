'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Sparkles, AlertTriangle, CheckCircle2, HelpCircle, X, ChevronRight, Calculator, CheckSquare } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import styles from './TriageTepModal.module.css'

export default function TriageTepModal({ value, onChange }) {
  const { t } = useLanguage()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Identify the numeric value from the model's exact strings
  let savedLevelNum = null;
  if (value === 'Nivel I' || String(value) === '1') savedLevelNum = 1;
  else if (value === 'Nivel II' || String(value) === '2') savedLevelNum = 2;
  else if (value === 'Nivel III' || String(value) === '3') savedLevelNum = 3;
  else if (value === 'Nivel IV' || String(value) === '4') savedLevelNum = 4;
  else if (value === 'Nivel V' || String(value) === '5') savedLevelNum = 5;

  const [state, setState] = useState({
    apariencia: null,
    respiratorio: null,
    circulacion: null,
  })
  const [showHelp, setShowHelp] = useState(false)
  const [manualSelection, setManualSelection] = useState(null)

  const handleSectorClick = (variable, val) => {
    setState(prev => ({
      ...prev,
      [variable]: prev[variable] === val ? null : val
    }))
    setManualSelection(null)
  }

  const aCount = Object.values(state).filter(v => v === 'A').length
  const nullCount = Object.values(state).filter(v => v === null).length
  const isComplete = nullCount === 0

  let baseLevel = 0
  if (isComplete) {
    if (aCount === 3) baseLevel = 1
    if (aCount === 2) baseLevel = 2 
    if (aCount === 1) baseLevel = 3
    if (aCount === 0) baseLevel = 4
  }

  let finalLevel = 0
  if (isComplete) {
      if (aCount === 3 || aCount === 2) {
          finalLevel = manualSelection !== null ? manualSelection : (aCount === 3 ? 1 : 2)
      } else if (aCount === 1) {
          finalLevel = 3
      } else if (aCount === 0) {
          finalLevel = manualSelection !== null ? manualSelection : 4
      }
  }

  const getTriageColorClass = (level) => {
    switch(level) {
      case 1: return styles.bgLevel1
      case 2: return styles.bgLevel2
      case 3: return styles.bgLevel3
      case 4: return styles.bgLevel4
      case 5: return styles.bgLevel5
      default: return ''
    }
  }

  const getTriageLabel = (level) => {
    switch(level) {
      case 1: return `N.1 - ${t('level1Triage').split('(')[1].replace(')','')}`
      case 2: return `N.2 - ${t('level2Triage').split('(')[1].replace(')','')}`
      case 3: return `N.3 - ${t('triageDesc3').split(' - ')[0]}`
      case 4: return `N.4 - ${t('level4Triage').split('(')[1].replace(')','')}`
      case 5: return `N.5 - ${t('level5Triage').split('(')[1].replace(')','')}` 
      default: return t('selectTriageLevel')
    }
  }

  const handleSave = () => {
    if (finalLevel > 0) {
        let romanLevel = '';
        switch(finalLevel) {
            case 1: romanLevel = 'Nivel I'; break;
            case 2: romanLevel = 'Nivel II'; break;
            case 3: romanLevel = 'Nivel III'; break;
            case 4: romanLevel = 'Nivel IV'; break;
            case 5: romanLevel = 'Nivel V'; break;
        }
        onChange(romanLevel);
        setIsModalOpen(false);
    }
  }

  const handleResetModal = () => {
    setState({
        apariencia: null,
        respiratorio: null,
        circulacion: null,
    })
    setManualSelection(null)
    setIsModalOpen(true)
  }

  const w = 400;
  const h = 346;
  const A = { x: w/2,    y: 10 };
  const B = { x: 10,     y: h + 10 };
  const C = { x: w - 10, y: h + 10 };

  const O = {
    x: (A.x + B.x + C.x) / 3,
    y: (A.y + B.y + C.y) / 3
  }

  const MAB = { x: (A.x + B.x)/2, y: (A.y + B.y)/2 }
  const MAC = { x: (A.x + C.x)/2, y: (A.y + C.y)/2 }
  const MBC = { x: (B.x + C.x)/2, y: (B.y + C.y)/2 }

  const polyAparienciaN = `${A.x},${A.y} ${MAB.x},${MAB.y} ${O.x},${O.y}`
  const polyAparienciaA = `${MAB.x},${MAB.y} ${B.x},${B.y} ${O.x},${O.y}`

  const polyRespiratorioA = `${A.x},${A.y} ${MAC.x},${MAC.y} ${O.x},${O.y}`
  const polyRespiratorioN = `${MAC.x},${MAC.y} ${C.x},${C.y} ${O.x},${O.y}`

  const polyCirculacionN = `${B.x},${B.y} ${MBC.x},${MBC.y} ${O.x},${O.y}`
  const polyCirculacionA = `${MBC.x},${MBC.y} ${C.x},${C.y} ${O.x},${O.y}`

  const SubSector = ({ 
    points, colorBase, val, variable, 
    activeState, textPos 
  }) => {
    const isSelected = activeState === val;
    const isOtherSelected = activeState !== null && activeState !== val;
    
    let fill = 'var(--bg-input)';
    let textColor = 'var(--text-muted)';
    let opacity = 1;

    // Theme friendly colors (Better contrast for light/dark)
    if (isSelected) {
      fill = colorBase;
      textColor = '#ffffff';
    } else if (isOtherSelected) {
      fill = 'var(--bg-secondary)'; // Use theme variable instead of hardcoded dark color
      textColor = 'var(--text-muted)';
    } else {
      fill = colorBase;
      opacity = 0.3; // Much lighter when unselected to allow black text in light mode / white text in dark mode to shine
      textColor = 'var(--text-primary)';
    }

    return (
      <g onClick={() => handleSectorClick(variable, val)} style={{cursor:'pointer', transition:'all 0.3s'}}>
        <polygon 
          points={points} 
          fill={fill} 
          fillOpacity={opacity}
          stroke="var(--bg-card)" 
          strokeWidth="4"
          strokeLinejoin="round"
          style={{transition:'all 0.3s'}}
        />
        <text 
          x={textPos.x} 
          y={textPos.y} 
          fill={textColor} 
          fontSize="24" 
          fontWeight="bold" 
          textAnchor="middle" 
          alignmentBaseline="middle"
          style={{userSelect:'none', pointerEvents:'none', transition:'all 0.3s'}}
        >
          {val}
        </text>
      </g>
    )
  }

  const getActiveRowClass = (variable) => {
    if(!state[variable]) return ''
    if(variable === 'apariencia') return styles.rowActiveBlue
    if(variable === 'respiratorio') return styles.rowActiveGreen
    if(variable === 'circulacion') return styles.rowActiveRed
    return ''
  }

  const getActiveBtnClass = (variable, val) => {
    if(state[variable] !== val) return ''
    if(val === 'A') return styles.btnSectorActiveAlert
    if(variable === 'apariencia') return styles.btnSectorActiveBlue
    if(variable === 'respiratorio') return styles.btnSectorActiveGreen
    if(variable === 'circulacion') return styles.btnSectorActiveRed
    return ''
  }

  return (
    <div className={styles.main}>
      
      {/* VISTA PADRE */}
      <div className={styles.triggerCard}>
        <button 
            type="button"
            onClick={handleResetModal}
            className={savedLevelNum ? styles.btnSaved : styles.btnPrimary}
            style={savedLevelNum ? { 
                background: savedLevelNum === 1 ? 'var(--severity-high)' : 
                            savedLevelNum === 2 ? '#ea580c' : 
                            savedLevelNum === 3 ? 'var(--severity-mid)' : 
                            savedLevelNum === 4 ? '#65a30d' : 'var(--severity-low)',
                color: savedLevelNum === 3 ? '#000' : '#fff',
                borderColor: 'transparent'
            } : {}}
        >
            {savedLevelNum ? (
                <>
                    <CheckSquare style={{width: 20, height: 20, opacity: 0.7}} />
                    {t('assigned')} {t('level')} {savedLevelNum} ({t('triageLevelPrefix')} {['I','II','III','IV','V'][savedLevelNum-1]})
                </>
            ) : (
                <>
                    <Calculator style={{width: 20, height: 20}} />
                    {t('evaluateTriage')}
                </>
            )}
        </button>

        {savedLevelNum > 0 && (
            <p className={styles.savedHelperText}>{t('triageAssignedSuccess')}</p>
        )}
      </div>

      {/* VISTA OVERLAY (MODAL) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.modalOverlay}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={styles.modalWindow}
              onClick={e => e.stopPropagation()}
            >
              
              {/* Header Modal */}
              <div className={styles.modalHeader}>
                <div className={styles.headerTitleGroup}>
                  <div className={styles.headerIcon}>
                    <Sparkles style={{width: 16, height: 16}} />
                  </div>
                  <h2 className={styles.headerTitle}>{t('triageTitle')}</h2>
                </div>
                <div className={styles.headerActions}>
                  <button type="button"
                    onClick={() => setShowHelp(true)}
                    className={styles.btnGuide}
                  >
                    <HelpCircle style={{width: 18, height: 18}} />
                    <span className={styles.hideOnMobile}>{t('clinicalGuide')}</span>
                  </button>
                  <button type="button"
                    onClick={() => setIsModalOpen(false)}
                    className={styles.btnClose}
                    aria-label="Cerrar modal"
                  >
                    <X style={{width: 20, height: 20}} />
                  </button>
                </div>
              </div>

              {/* Body Modal */}
              <div className={styles.modalBody}>
                
                {/* Panel Izquierdo */}
                <div className={styles.leftPanel}>
                  <p className={styles.introText}>
                    {t('triageInstruction')}
                  </p>

                  <div className={styles.selectorList}>
                     <div className={`${styles.selectorRow} ${getActiveRowClass('apariencia')}`}>
                        <span className={styles.selectorLabel}>1. {t('appearance')}</span>
                        <div className={styles.selectorButtons}>
                          <button type="button" onClick={()=>handleSectorClick('apariencia', 'N')} className={`${styles.btnSector} ${getActiveBtnClass('apariencia', 'N')}`}>N</button>
                          <button type="button" onClick={()=>handleSectorClick('apariencia', 'A')} className={`${styles.btnSector} ${getActiveBtnClass('apariencia', 'A')}`}>A</button>
                        </div>
                     </div>
                     
                     <div className={`${styles.selectorRow} ${getActiveRowClass('respiratorio')}`}>
                        <span className={styles.selectorLabel}>2. {t('breathing')}</span>
                        <div className={styles.selectorButtons}>
                          <button type="button" onClick={()=>handleSectorClick('respiratorio', 'N')} className={`${styles.btnSector} ${getActiveBtnClass('respiratorio', 'N')}`}>N</button>
                          <button type="button" onClick={()=>handleSectorClick('respiratorio', 'A')} className={`${styles.btnSector} ${getActiveBtnClass('respiratorio', 'A')}`}>A</button>
                        </div>
                     </div>

                     <div className={`${styles.selectorRow} ${getActiveRowClass('circulacion')}`}>
                        <span className={styles.selectorLabel}>3. {t('circulation')}</span>
                        <div className={styles.selectorButtons}>
                          <button type="button" onClick={()=>handleSectorClick('circulacion', 'N')} className={`${styles.btnSector} ${getActiveBtnClass('circulacion', 'N')}`}>N</button>
                          <button type="button" onClick={()=>handleSectorClick('circulacion', 'A')} className={`${styles.btnSector} ${getActiveBtnClass('circulacion', 'A')}`}>A</button>
                        </div>
                     </div>
                  </div>

                  <div style={{flex: 1, minHeight: '1rem'}}></div>

                  {/* Tarjeta Save */}
                  <div className={styles.resultCard}>
                    <AnimatePresence mode="wait">
                      {isComplete ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <div className={`${styles.levelIndicator} ${getTriageColorClass(finalLevel)}`}>
                            <div className={styles.levelLabelMini}>
                              {finalLevel <= 2 ? <AlertTriangle style={{width:16, height:16}} /> : <CheckCircle2 style={{width:16, height:16}} />}
                              {t('calculatedFinalLevel')}
                            </div>
                            <div className={styles.levelTitle}>
                              {getTriageLabel(finalLevel)}
                            </div>
                          </div>

                          <button type="button" onClick={handleSave} className={styles.btnSaveFinish}>
                            <CheckCircle2 style={{width:20, height:20}} /> {t('saveAndReturn')}
                          </button>
                        </motion.div>
                      ) : (
                          <div className={styles.emptyState}>
                             <div className={styles.emptyIcon}>
                               <CheckCircle2 style={{width:24, height:24}} />
                             </div>
                             <p className={styles.emptyText}>{t('completeDrawingToSave')}</p>
                          </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Panel Derecho */}
                <div className={styles.rightPanel}>
                  
                  <div className={styles.triangleWrapper}>
                    <div className={styles.labelApariencia}>{t('appearance').toUpperCase()}</div>
                    <div className={styles.labelRespiratorio}>{t('breathing').toUpperCase()}</div>
                    <div className={styles.labelCirculacion}>{t('circulation').toUpperCase()}</div>

                    <svg viewBox="0 0 400 360" className={styles.svgElement}>
                      <SubSector points={polyAparienciaN} colorBase="#82A1D9" val="N" variable="apariencia" activeState={state.apariencia} textPos={{x: 165, y: 110}} />
                      <SubSector points={polyAparienciaA} colorBase="#82A1D9" val="A" variable="apariencia" activeState={state.apariencia} textPos={{x: 115, y: 200}} />
                      <SubSector points={polyRespiratorioA} colorBase="#7BCB8C" val="A" variable="respiratorio" activeState={state.respiratorio} textPos={{x: 235, y: 110}} />
                      <SubSector points={polyRespiratorioN} colorBase="#7BCB8C" val="N" variable="respiratorio" activeState={state.respiratorio} textPos={{x: 285, y: 200}} />
                      <SubSector points={polyCirculacionN} colorBase="#C56D60" val="N" variable="circulacion" activeState={state.circulacion} textPos={{x: 155, y: 300}} />
                      <SubSector points={polyCirculacionA} colorBase="#C56D60" val="A" variable="circulacion" activeState={state.circulacion} textPos={{x: 245, y: 300}} />
                    </svg>
                  </div>

                  {/* Disambiguacion */}
                  <div className={styles.disambigContainer}>
                    <AnimatePresence mode="wait">
                      {isComplete && (aCount === 3 || aCount === 2 || aCount === 0) && (
                          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={styles.disambigCard}>
                              {(aCount === 3 || aCount === 2) && (
                                <div>
                                  <p className={styles.disambigTitle}>
                                    <Sparkles style={{width:16,height:16,color:'var(--accent)'}} /> {t('refineSevereState')}
                                  </p>
                                  <button type="button" onClick={() => setManualSelection(1)} className={`${styles.btnDisambig} ${finalLevel===1 ? styles.btnDisambigActiveL1 : ''}`}>
                                    <div className={`${styles.radioDot} ${finalLevel===1 ? styles.dotActiveL1 : ''}`} />
                                    <div className={styles.btnDisambigText}>
                                      <div className={styles.disambigLabel}>{t('level1Triage')}</div>
                                      <div className={styles.disambigDesc}>{t('level1Desc')}</div>
                                    </div>
                                  </button>
                                  <button type="button" onClick={() => setManualSelection(2)} className={`${styles.btnDisambig} ${finalLevel===2 ? styles.btnDisambigActiveL2 : ''}`}>
                                    <div className={`${styles.radioDot} ${finalLevel===2 ? styles.dotActiveL2 : ''}`} />
                                    <div className={styles.btnDisambigText}>
                                      <div className={styles.disambigLabel}>{t('level2Triage')}</div>
                                      <div className={styles.disambigDesc}>{t('level2Desc')}</div>
                                    </div>
                                  </button>
                                </div>
                              )}
                              {(aCount === 0) && (
                                <div>
                                  <p className={styles.disambigTitle}>
                                    <Sparkles style={{width:16,height:16,color:'var(--accent)'}} /> {t('classifyStability')}
                                  </p>
                                  <button type="button" onClick={() => setManualSelection(4)} className={`${styles.btnDisambig} ${finalLevel===4 ? styles.btnDisambigActiveL4 : ''}`}>
                                    <div className={`${styles.radioDot} ${finalLevel===4 ? styles.dotActiveL4 : ''}`} />
                                    <div className={styles.btnDisambigText}>
                                      <div className={styles.disambigLabel}>{t('level4Triage')}</div>
                                      <div className={styles.disambigDesc}>{t('level4Desc')}</div>
                                    </div>
                                  </button>
                                  <button type="button" onClick={() => setManualSelection(5)} className={`${styles.btnDisambig} ${finalLevel===5 ? styles.btnDisambigActiveL5 : ''}`}>
                                    <div className={`${styles.radioDot} ${finalLevel===5 ? styles.dotActiveL5 : ''}`} />
                                    <div className={styles.btnDisambigText}>
                                      <div className={styles.disambigLabel}>{t('level5Triage')}</div>
                                      <div className={styles.disambigDesc}>{t('level5Desc')}</div>
                                    </div>
                                  </button>
                                </div>
                              )}
                          </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GUIA CLINICA */}
      <AnimatePresence>
        {showHelp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.helpOverlay}
            onClick={() => setShowHelp(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={styles.helpWindow}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.helpHeader}>
                <h3 className={styles.headerTitle} style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
                  <div className={styles.headerIcon} style={{backgroundColor: 'var(--bg-card)', border:'1px solid var(--border)'}}>
                    <HelpCircle style={{width:20, height:20}} />
                  </div>
                  {t('helpTitle')}
                </h3>
                <button type="button" onClick={() => setShowHelp(false)} className={styles.btnClose}>
                  <X style={{width:20, height:20}} />
                </button>
              </div>

              <div className={styles.helpBody}>
                <div className={styles.helpBanner}>
                  {t('helpBanner')}
                </div>

                <div className={styles.helpSection}>
                  <div className={`${styles.helpSectionBar} ${styles.bgBlue}`}></div>
                  <div>
                    <h4 className={styles.helpSectionTitle}>1. {t('appearance')}</h4>
                    <p className={styles.helpSectionDesc}>{t('helpAparienciaDesc')}</p>
                    <div className={styles.helpWarningBox}>
                      <strong className={styles.helpWarningTitle}>{t('markAbnormalIf')}</strong>
                      <ul className={styles.helpWarningList}>
                        <li>{t('aparienciaItem1')}</li>
                        <li>{t('aparienciaItem2')}</li>
                        <li>{t('aparienciaItem3')}</li>
                        <li>{t('aparienciaItem4')}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className={styles.helpSection}>
                  <div className={`${styles.helpSectionBar} ${styles.bgGreen}`}></div>
                  <div>
                    <h4 className={styles.helpSectionTitle}>2. {t('breathing')}</h4>
                    <p className={styles.helpSectionDesc}>{t('helpRespiratorioDesc')}</p>
                    <div className={styles.helpWarningBox}>
                      <strong className={styles.helpWarningTitle}>{t('markAbnormalIf')}</strong>
                      <ul className={styles.helpWarningList}>
                        <li>{t('respItem1')}</li>
                        <li>{t('respItem2')}</li>
                        <li>{t('respItem3')}</li>
                        <li>{t('respItem4')}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className={styles.helpSection}>
                  <div className={`${styles.helpSectionBar} ${styles.bgRed}`}></div>
                  <div>
                    <h4 className={styles.helpSectionTitle}>3. {t('circulation')}</h4>
                    <p className={styles.helpSectionDesc}>{t('helpCirculacionDesc')}</p>
                    <div className={styles.helpWarningBox}>
                      <strong className={styles.helpWarningTitle}>{t('markAbnormalIf')}</strong>
                      <ul className={styles.helpWarningList}>
                        <li>{t('circItem1')}</li>
                        <li>{t('circItem2')}</li>
                        <li>{t('circItem3')}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.helpFooter}>
                <button type="button" onClick={() => setShowHelp(false)} className={styles.btnPrimary} style={{maxWidth:'240px'}}>
                  {t('continueEval')} <ChevronRight style={{width:20,height:20}} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
