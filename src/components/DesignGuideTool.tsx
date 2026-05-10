import { useState, useRef } from 'react';
import {
  Sparkles, Upload, X, ChevronLeft, Download, Palette,
  FileText, Layers, Target, Lightbulb, CheckCircle,
  RotateCcw, BookOpen,
} from 'lucide-react';
import type {
  QuizResult, BrandInput, BrandEssence, VisualPath,
  CreativeBrief, ColorPalette, MoodImage, ArchetypeKey, LogoConcept,
} from '../types';
import { ARCHETYPES } from '../constants';
import {
  getBrandEssence, getVisualPaths, getMoodboardDescriptions,
  generateMoodImage, getCreativeBrief, getColorPalette,
  getLogoConcepts,
} from '../services/gemini';

interface Props {
  quizResult: QuizResult;
  brandInput: BrandInput; setBrandInput: (b: BrandInput) => void;
  brandEssence: BrandEssence | null; setBrandEssence: (e: BrandEssence) => void;
  visualPaths: VisualPath[]; setVisualPaths: (p: VisualPath[]) => void;
  selectedPath: VisualPath | null; setSelectedPath: (p: VisualPath) => void;
  creativeBrief: CreativeBrief | null; setCreativeBrief: (b: CreativeBrief) => void;
  colorPalette: ColorPalette | null; setColorPalette: (p: ColorPalette) => void;
  logoConcepts: LogoConcept[] | null; setLogoConcepts: (c: LogoConcept[]) => void;
  selectedConcept: LogoConcept | null; setSelectedConcept: (c: LogoConcept) => void;
  onBack: () => void;
  onRestart: () => void;
}

const STEPS = [
  { id: 1, label: 'الأساس',   sublabel: 'الاستراتيجي', icon: Target    },
  { id: 2, label: 'التوجه',   sublabel: 'الإبداعي',    icon: Layers    },
  { id: 3, label: 'الموجز',   sublabel: 'الإبداعي',    icon: FileText  },
  { id: 4, label: 'الألوان',  sublabel: 'لوحة متناغمة', icon: Palette  },
  { id: 5, label: 'الشعار',   sublabel: '3 أفكار',     icon: Lightbulb },
  { id: 6, label: 'التقرير',  sublabel: 'PDF كامل',    icon: BookOpen  },
];

function printFullReport() {
  document.body.classList.add('print-report');
  window.print();
  document.body.classList.remove('print-report');
}

export default function DesignGuideTool(props: Props) {
  const {
    quizResult, brandInput, setBrandInput,
    brandEssence, setBrandEssence, visualPaths, setVisualPaths,
    selectedPath, setSelectedPath, creativeBrief, setCreativeBrief,
    colorPalette, setColorPalette, logoConcepts, setLogoConcepts,
    selectedConcept, setSelectedConcept,
    onBack, onRestart,
  } = props;

  const [step, setStep]                     = useState(1);
  const [loading, setLoading]               = useState(false);
  const [loadingMsg, setLoadingMsg]         = useState('');
  const [error, setError]                   = useState<string | null>(null);
  const [moodImages, setMoodImages]         = useState<MoodImage[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [moodboardMode, setMoodboardMode]   = useState<'upload' | 'ai' | null>(null);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [generatedImgUrls, setGeneratedImgUrls] = useState<(string | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const core = ARCHETYPES[quizResult.coreArchetype];
  const edge = ARCHETYPES[quizResult.edgeArchetype];

  // ── Handlers ────────────────────────────────────────────────────
  async function handleLoadBrandEssence() {
    if (!brandInput.name || !brandInput.industry) { setError('يرجى إدخال اسم العلامة والمجال على الأقل'); return; }
    setLoading(true); setError(null);
    setLoadingMsg('يحلّل الذكاء الاصطناعي جوهر علامتك...');
    try { setBrandEssence(await getBrandEssence(brandInput, quizResult.coreArchetype, quizResult.edgeArchetype)); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  async function handleLoadVisualPaths() {
    setLoading(true); setError(null);
    setLoadingMsg('يولّد 3 مسارات بصرية مختلفة...');
    try { setVisualPaths(await getVisualPaths(brandInput, quizResult.coreArchetype, quizResult.edgeArchetype)); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  async function handleAIMoodboard() {
    if (!selectedPath) return;
    setMoodboardMode('ai'); setGeneratingImages(true); setError(null);
    try {
      const descs = await getMoodboardDescriptions(selectedPath, brandInput, quizResult.coreArchetype);
      setMoodImages(descs);
      setGeneratedImgUrls(await Promise.all(descs.map(d => generateMoodImage(d.prompt))));
    } catch (e: any) { setError(e.message); } finally { setGeneratingImages(false); }
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setUploadedImages(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
    setMoodboardMode('upload');
  }

  async function handleLoadBrief() {
    if (!selectedPath || !brandEssence) return;
    setLoading(true); setError(null);
    setLoadingMsg('يُنشئ الموجز الإبداعي الشامل...');
    try { setCreativeBrief(await getCreativeBrief(brandInput, quizResult.coreArchetype, quizResult.edgeArchetype, selectedPath, brandEssence)); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  async function handleLoadColors() {
    if (!selectedPath) return;
    setLoading(true); setError(null);
    setLoadingMsg('يولّد لوحة الألوان المثالية لعلامتك...');
    try { setColorPalette(await getColorPalette(quizResult.coreArchetype, quizResult.edgeArchetype, brandInput, selectedPath)); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  async function handleLoadConcepts() {
    setLoading(true); setError(null);
    setLoadingMsg('يُولّد 3 أفكار إبداعية للشعار...');
    try { setLogoConcepts(await getLogoConcepts(quizResult.coreArchetype, quizResult.edgeArchetype, brandInput, selectedPath!, creativeBrief)); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  // ── Shared UI ───────────────────────────────────────────────────
  const EmptyState = ({ icon: Icon, title, desc, action }: {
    icon: React.ElementType; title: string; desc: string; action: React.ReactNode;
  }) => (
    <div className="card rounded-2xl p-10 text-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-brand-elevated border border-brand-line flex items-center justify-center mx-auto">
        <Icon size={22} className="text-brand-muted" />
      </div>
      <div>
        <h4 className="font-semibold text-brand-text mb-1">{title}</h4>
        <p className="text-brand-subtle text-sm max-w-sm mx-auto leading-relaxed">{desc}</p>
      </div>
      {action}
    </div>
  );

  const SectionHeader = ({ step: s, title, subtitle, extra }: {
    step: number; title: string; subtitle: string; extra?: React.ReactNode;
  }) => (
    <div className="flex items-start justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-teal/10 border border-brand-teal/20 text-brand-teal font-black text-sm shrink-0">
          {s}
        </div>
        <div>
          <h2 className="text-xl font-bold text-brand-text">{title}</h2>
          <p className="text-sm text-brand-muted">{subtitle}</p>
        </div>
      </div>
      {extra}
    </div>
  );

  // ── PDF Print Layout (hidden on screen, shown on print) ─────────
  const PrintReport = () => {
    if (!brandEssence && !creativeBrief && !colorPalette && !logoConcepts) return null;
    const today = new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
      <div id="full-report-print" style={{ display: 'none' }}>
        {/* ── COVER ── */}
        <div className="rpt-cover">
          <div className="rpt-cover-badge">Brand Identity Report · تقرير الهوية البصرية</div>
          <h1 className="rpt-brand-name">{brandInput.name || 'العلامة التجارية'}</h1>
          {brandInput.industry && <p className="rpt-industry">{brandInput.industry}</p>}
          <div className="rpt-archetypes">
            <span className="rpt-arch-badge" style={{ borderColor: core.color, color: core.color }}>
              CORE · {core.nameAr}
            </span>
            <span className="rpt-arch-badge" style={{ borderColor: edge.color, color: edge.color }}>
              EDGE · {edge.nameAr}
            </span>
          </div>
          <div className="rpt-cover-meta">
            <span>{today}</span>
            <span>·</span>
            <span>مُعدّ بواسطة مستشار الهوية البصرية</span>
          </div>
          <div className="rpt-cover-line" />
          <div className="rpt-cover-contents">
            <p className="rpt-contents-title">محتويات التقرير</p>
            <div className="rpt-contents-grid">
              {[
                brandEssence    && '١ · جوهر العلامة',
                selectedPath    && '٢ · التوجه الإبداعي',
                creativeBrief   && '٣ · الموجز الإبداعي',
                colorPalette    && '٤ · لوحة الألوان',
                logoConcepts?.length && '٥ · أفكار الشعار',
              ].filter(Boolean).map((item, i) => (
                <span key={i} className="rpt-contents-item">{item as string}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── SECTION 1: Brand Essence ── */}
        {brandEssence && (
          <div className="rpt-section">
            <div className="rpt-section-header" style={{ borderColor: core.color }}>
              <span className="rpt-section-num">١</span>
              <h2 className="rpt-section-title">جوهر العلامة التجارية</h2>
            </div>
            <blockquote className="rpt-quote">"{brandEssence.essence}"</blockquote>
            <div className="rpt-grid-2">
              <div className="rpt-card">
                <p className="rpt-card-label">التموضع</p>
                <p className="rpt-card-text">{brandEssence.positioning}</p>
              </div>
              <div className="rpt-card">
                <p className="rpt-card-label">نبرة الصوت</p>
                <p className="rpt-card-text">{brandEssence.brandVoice}</p>
              </div>
            </div>
            <div className="rpt-card" style={{ marginTop: 12 }}>
              <p className="rpt-card-label">القيمة الفريدة</p>
              <p className="rpt-card-text">{brandEssence.uniqueValue}</p>
            </div>
            {brandEssence.personality?.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <p className="rpt-card-label">سمات الشخصية</p>
                <div className="rpt-tags">
                  {brandEssence.personality.map((p, i) => (
                    <span key={i} className="rpt-tag" style={{ borderColor: core.color, color: core.color }}>{p}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SECTION 2: Visual Direction ── */}
        {selectedPath && (
          <div className="rpt-section">
            <div className="rpt-section-header" style={{ borderColor: '#2dd4bf' }}>
              <span className="rpt-section-num">٢</span>
              <h2 className="rpt-section-title">التوجه الإبداعي</h2>
            </div>
            <div className="rpt-path-header">
              <h3 className="rpt-path-title">{selectedPath.title}</h3>
              <span className="rpt-path-mood">{selectedPath.mood}</span>
            </div>
            <p className="rpt-body-text">{selectedPath.description}</p>
            <div className="rpt-grid-2" style={{ marginTop: 12 }}>
              <div className="rpt-card">
                <p className="rpt-card-label">الكلمات المفتاحية</p>
                <div className="rpt-tags">
                  {selectedPath.keywords.map(k => <span key={k} className="rpt-tag-gray">{k}</span>)}
                </div>
              </div>
              <div className="rpt-card">
                <p className="rpt-card-label">الخطوط المقترحة</p>
                <p className="rpt-card-text">{selectedPath.fontStyle}</p>
              </div>
            </div>
            {selectedPath.colors?.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <p className="rpt-card-label">لوحة الإلهام</p>
                <div className="rpt-swatch-row">
                  {selectedPath.colors.map((c, i) => (
                    <div key={i} className="rpt-swatch-small" style={{ background: c }} title={c} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SECTION 3: Creative Brief ── */}
        {creativeBrief && (
          <div className="rpt-section">
            <div className="rpt-section-header" style={{ borderColor: '#2dd4bf' }}>
              <span className="rpt-section-num">٣</span>
              <h2 className="rpt-section-title">الموجز الإبداعي</h2>
            </div>
            <div className="rpt-grid-2">
              {[
                { label: 'نظرة عامة',         value: creativeBrief.projectOverview },
                { label: 'الهدف',              value: creativeBrief.objective },
                { label: 'الجمهور المستهدف',   value: creativeBrief.targetAudience },
                { label: 'شخصية العلامة',      value: creativeBrief.brandPersonality },
                { label: 'نبرة الصوت',         value: creativeBrief.toneOfVoice },
                { label: 'سيكولوجية الألوان',  value: creativeBrief.colorPsychology },
                { label: 'توجه الخطوط',        value: creativeBrief.typographyDirection },
                { label: 'توجه الشعار',        value: creativeBrief.logoDirection },
              ].map(s => (
                <div key={s.label} className="rpt-card">
                  <p className="rpt-card-label">{s.label}</p>
                  <p className="rpt-card-text">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="rpt-grid-2" style={{ marginTop: 12 }}>
              <div className="rpt-card rpt-card-green">
                <p className="rpt-card-label" style={{ color: '#059669' }}>✓ يجب أن تفعل</p>
                <ul>{creativeBrief.doList.map((item, i) => <li key={i} className="rpt-list-item">✓ {item}</li>)}</ul>
              </div>
              <div className="rpt-card rpt-card-red">
                <p className="rpt-card-label" style={{ color: '#dc2626' }}>✗ تجنّب</p>
                <ul>{creativeBrief.dontList.map((item, i) => <li key={i} className="rpt-list-item">✗ {item}</li>)}</ul>
              </div>
            </div>
            {creativeBrief.inspirations?.length > 0 && (
              <div className="rpt-grid-2" style={{ marginTop: 12 }}>
                <div className="rpt-card">
                  <p className="rpt-card-label">✦ علامات إلهام</p>
                  {creativeBrief.inspirations.map((it, j) => <p key={j} className="rpt-card-text">· {it}</p>)}
                </div>
                <div className="rpt-card">
                  <p className="rpt-card-label">◆ المخرجات المطلوبة</p>
                  {creativeBrief.deliverables.map((d, j) => <p key={j} className="rpt-card-text">· {d}</p>)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SECTION 4: Color Palette ── */}
        {colorPalette && (
          <div className="rpt-section">
            <div className="rpt-section-header" style={{ borderColor: '#2dd4bf' }}>
              <span className="rpt-section-num">٤</span>
              <h2 className="rpt-section-title">لوحة الألوان</h2>
            </div>
            {/* Big swatch strip */}
            <div className="rpt-swatch-strip">
              {[colorPalette.primary, colorPalette.secondary, colorPalette.accent, colorPalette.neutral, colorPalette.background].map((s, i) => (
                <div key={i} className="rpt-swatch-block">
                  <div className="rpt-swatch-color" style={{ background: s.hex }} />
                  <div className="rpt-swatch-info">
                    <p className="rpt-swatch-name">{s.nameAr}</p>
                    <p className="rpt-swatch-hex">{s.hex}</p>
                    <p className="rpt-swatch-rgb">rgb({s.rgb})</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rpt-grid-2" style={{ marginTop: 16 }}>
              <div className="rpt-card">
                <p className="rpt-card-label">المنطق اللوني</p>
                <p className="rpt-card-text">{colorPalette.rationale}</p>
              </div>
              <div className="rpt-card">
                <p className="rpt-card-label">سيكولوجية الألوان</p>
                <p className="rpt-card-text">{colorPalette.psychologyNotes}</p>
              </div>
            </div>
            <div className="rpt-card" style={{ marginTop: 12 }}>
              <p className="rpt-card-label">دليل الاستخدام</p>
              {[
                { label: 'الرئيسي', value: colorPalette.usage.primary,   hex: colorPalette.primary.hex },
                { label: 'الثانوي', value: colorPalette.usage.secondary, hex: colorPalette.secondary.hex },
                { label: 'المميز',  value: colorPalette.usage.accent,    hex: colorPalette.accent.hex },
              ].map(u => (
                <div key={u.label} className="rpt-usage-row">
                  <span className="rpt-usage-dot" style={{ background: u.hex }} />
                  <span className="rpt-usage-label">{u.label}:</span>
                  <span className="rpt-card-text">{u.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SECTION 5: Logo Concepts ── */}
        {logoConcepts && logoConcepts.length > 0 && (
          <div className="rpt-section">
            <div className="rpt-section-header" style={{ borderColor: '#f59e0b' }}>
              <span className="rpt-section-num">٥</span>
              <h2 className="rpt-section-title">أفكار الشعار</h2>
            </div>
            {logoConcepts.map((concept, i) => {
              const conceptColor = [core.color, selectedPath?.colors[0] ?? '#2dd4bf', edge.color][i] ?? core.color;
              return (
                <div key={concept.id} className="rpt-concept">
                  <div className="rpt-concept-header" style={{ borderColor: conceptColor }}>
                    <span className="rpt-concept-num" style={{ background: conceptColor }}>{i + 1}</span>
                    <div>
                      <h3 className="rpt-concept-title" style={{ color: conceptColor }}>{concept.title}</h3>
                      <p className="rpt-concept-style">{concept.style}</p>
                    </div>
                    {selectedConcept?.id === concept.id && (
                      <span className="rpt-concept-selected" style={{ background: conceptColor }}>✓ المختار</span>
                    )}
                  </div>
                  <p className="rpt-body-text" style={{ marginBottom: 10 }}>{concept.description}</p>
                  <div className="rpt-grid-2">
                    <div className="rpt-card">
                      <p className="rpt-card-label">العناصر البصرية</p>
                      <div className="rpt-tags">
                        {concept.visualElements.map((el, j) => <span key={j} className="rpt-tag-gray">{el}</span>)}
                      </div>
                    </div>
                    <div className="rpt-card">
                      <p className="rpt-card-label">الرمزية والمعنى</p>
                      <p className="rpt-card-text">{concept.symbolism}</p>
                    </div>
                    <div className="rpt-card">
                      <p className="rpt-card-label">استخدام الألوان</p>
                      <p className="rpt-card-text">{concept.colorUsage}</p>
                    </div>
                    <div className="rpt-card">
                      <p className="rpt-card-label">توجه الخط</p>
                      <p className="rpt-card-text">{concept.typography}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="rpt-footer">
          <p>مُعدّ بواسطة مستشار الهوية البصرية · {today}</p>
          <p style={{ color: '#2dd4bf' }}>{brandInput.name} · {core.nameAr} + {edge.nameAr}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-brand-bg">

      {/* ── STEP NAV ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-brand-bg/95 backdrop-blur-md border-b border-brand-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={onBack}
            className="flex items-center gap-1.5 text-brand-muted hover:text-brand-subtle text-sm transition-colors shrink-0">
            <ChevronLeft size={15} /> النتائج
          </button>

          <div className="flex-1 flex items-center gap-0 overflow-x-auto">
            {STEPS.map((s, i) => {
              const Icon  = s.icon;
              const done  = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} className="flex items-center shrink-0">
                  <button onClick={() => setStep(s.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                      active  ? 'bg-brand-teal/10 text-brand-teal border border-brand-teal/30'
                      : done  ? 'text-brand-teal/60 hover:text-brand-teal'
                      : 'text-brand-muted hover:text-brand-subtle'
                    }`}>
                    {done ? <CheckCircle size={13} /> : <Icon size={13} />}
                    <span className="hidden lg:inline">{s.label}</span>
                    <span className="lg:hidden">{s.id}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`w-4 h-px mx-0.5 transition-colors ${done ? 'bg-brand-teal/30' : 'bg-brand-border'}`} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: core.color + '15', color: core.color }}>{core.nameAr}</span>
            <span className="text-brand-border text-xs">+</span>
            <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: edge.color + '15', color: edge.color }}>{edge.nameAr}</span>
          </div>
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 py-8">

        {error && (
          <div className="mb-6 bg-red-500/8 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)}><X size={14} /></button>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-brand-bg/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="card rounded-2xl px-10 py-8 flex flex-col items-center gap-4 border-brand-line">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-brand-teal/20 rounded-full" />
                <div className="absolute inset-0 w-12 h-12 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-brand-subtle text-sm">{loadingMsg}</p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════
            STEP 1 — Strategic Foundation
        ═══════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-6 slide-up">
            <SectionHeader step={1} title="الأساس الاستراتيجي" subtitle="أدخل معلومات علامتك لبناء جوهرها الإبداعي" />
            <div className="card rounded-2xl p-7 space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">اسم العلامة التجارية *</label>
                  <input className="field" placeholder="مثال: نوما، أتلاس، سمّا..."
                    value={brandInput.name} onChange={e => setBrandInput({ ...brandInput, name: e.target.value })} />
                </div>
                <div>
                  <label className="label">المجال / الصناعة *</label>
                  <input className="field" placeholder="مثال: مطاعم، تقنية، أزياء..."
                    value={brandInput.industry} onChange={e => setBrandInput({ ...brandInput, industry: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">الجمهور المستهدف</label>
                <input className="field" placeholder="من هم عملاؤك المثاليون؟"
                  value={brandInput.audience} onChange={e => setBrandInput({ ...brandInput, audience: e.target.value })} />
              </div>
              <div>
                <label className="label">القيم الجوهرية</label>
                <textarea className="field resize-none h-24" placeholder="ما الذي تؤمن به علامتك؟"
                  value={brandInput.values} onChange={e => setBrandInput({ ...brandInput, values: e.target.value })} />
              </div>
              <div>
                <label className="label">معيار الصناعة — اختياري</label>
                <select className="field" value={brandInput.standardArchetype}
                  onChange={e => setBrandInput({ ...brandInput, standardArchetype: e.target.value as ArchetypeKey })}>
                  <option value="">ما الشخصية التي يتوقعها العملاء من مجالك؟</option>
                  {Object.values(ARCHETYPES).map(a => (
                    <option key={a.key} value={a.key}>{a.nameAr} — {a.nameEn}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleLoadBrandEssence} disabled={loading} className="btn-primary w-full py-4 rounded-xl text-base">
                <Sparkles size={18} /> تحليل جوهر العلامة بالذكاء الاصطناعي
              </button>
            </div>

            {brandEssence && (
              <div className="card rounded-2xl p-7 space-y-5 slide-up" style={{ borderColor: core.color + '20' }}>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-brand-teal" />
                  <h3 className="font-bold text-brand-text">جوهر علامتك</h3>
                </div>
                <div className="border-r-2 border-brand-teal pr-5 py-1">
                  <p className="text-brand-text text-lg font-medium leading-relaxed">"{brandEssence.essence}"</p>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { key: 'التموضع',     val: brandEssence.positioning },
                    { key: 'نبرة الصوت', val: brandEssence.brandVoice },
                    { key: 'القيمة الفريدة', val: brandEssence.uniqueValue },
                  ].map(item => (
                    <div key={item.key} className="card-elevated rounded-xl p-4">
                      <p className="text-xs text-brand-teal font-medium tracking-wide uppercase mb-1.5">{item.key}</p>
                      <p className="text-brand-subtle text-sm leading-relaxed">{item.val}</p>
                    </div>
                  ))}
                  <div className="card-elevated rounded-xl p-4">
                    <p className="text-xs text-brand-teal font-medium tracking-wide uppercase mb-2">سمات الشخصية</p>
                    <div className="flex flex-wrap gap-1.5">
                      {brandEssence.personality.map((p, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 bg-brand-teal/8 text-brand-teal rounded-full border border-brand-teal/15">{p}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={() => setStep(2)} className="btn-outline w-full py-3 rounded-xl">
                  التالي: التوجه الإبداعي <ChevronLeft size={15} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════
            STEP 2 — Visual Direction
        ═══════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-6 slide-up">
            <SectionHeader step={2} title="التوجه الإبداعي" subtitle="اختر المسار البصري الذي يعبّر عن علامتك" />

            {visualPaths.length === 0 ? (
              <EmptyState icon={Layers} title="توليد المسارات البصرية"
                desc="سيقترح الذكاء الاصطناعي 3 مسارات بصرية مختلفة لعلامتك"
                action={<button onClick={handleLoadVisualPaths} className="btn-primary px-8 py-3.5 rounded-xl"><Sparkles size={17} /> توليد المسارات البصرية</button>} />
            ) : (
              <div className="space-y-3">
                {visualPaths.map((path, i) => {
                  const isSel = selectedPath?.title === path.title;
                  return (
                    <div key={i} onClick={() => setSelectedPath(path)}
                      className={`card rounded-2xl p-6 cursor-pointer transition-all duration-200 ${isSel ? 'border-brand-teal/50 bg-brand-teal/3' : 'hover:border-brand-line'}`}>
                      <div className="flex items-start gap-4">
                        <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSel ? 'border-brand-teal' : 'border-brand-line'}`}>
                          {isSel && <div className="w-2 h-2 rounded-full bg-brand-teal" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-brand-text">{path.title}</h3>
                            <span className="text-xs text-brand-teal bg-brand-teal/8 px-2 py-0.5 rounded-full">{path.mood}</span>
                          </div>
                          <p className="text-brand-subtle text-sm leading-relaxed mb-4">{path.description}</p>
                          <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex gap-1.5">
                              {path.colors.map((c, j) => <div key={j} className="w-7 h-7 rounded-lg border border-white/8" style={{ background: c }} />)}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {path.keywords.map(k => <span key={k} className="text-xs bg-brand-elevated border border-brand-line text-brand-muted px-2 py-0.5 rounded-lg">{k}</span>)}
                            </div>
                          </div>
                          <p className="text-xs text-brand-muted mt-2.5 border-t border-brand-border pt-2.5">الخطوط: {path.fontStyle}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedPath && (
              <>
                <div className="card rounded-2xl p-6 space-y-5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-brand-text">لوحة الإلهام</h3>
                    <span className="text-xs text-brand-muted bg-brand-elevated px-2 py-0.5 rounded-full border border-brand-line">Moodboard</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <button onClick={() => { setMoodboardMode('upload'); fileInputRef.current?.click(); }}
                      className={`p-5 rounded-xl border-2 text-center transition-all ${moodboardMode === 'upload' ? 'border-brand-teal bg-brand-teal/5' : 'border-brand-border hover:border-brand-line'}`}>
                      <Upload size={22} className="mx-auto mb-2 text-brand-teal" />
                      <p className="font-semibold text-brand-text text-sm">ارفع صورك</p>
                      <p className="text-brand-muted text-xs mt-1">اختر صور إلهامك من جهازك</p>
                    </button>
                    <button onClick={handleAIMoodboard} disabled={generatingImages}
                      className={`p-5 rounded-xl border-2 text-center transition-all ${moodboardMode === 'ai' ? 'border-brand-teal bg-brand-teal/5' : 'border-brand-border hover:border-brand-line'}`}>
                      <Sparkles size={22} className="mx-auto mb-2 text-brand-teal" />
                      <p className="font-semibold text-brand-text text-sm">اترك الأمر للذكاء الاصطناعي</p>
                      <p className="text-brand-muted text-xs mt-1">يولّد صور إلهام مناسبة</p>
                    </button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                      {uploadedImages.map((src, i) => (
                        <div key={i} className="relative group">
                          <img src={src} alt="" className="w-full h-28 object-cover rounded-xl" />
                          <button onClick={() => setUploadedImages(prev => prev.filter((_, j) => j !== i))}
                            className="absolute top-1.5 left-1.5 bg-black/70 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={11} className="text-white" />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => fileInputRef.current?.click()}
                        className="h-28 border-2 border-dashed border-brand-border rounded-xl flex items-center justify-center text-brand-muted hover:text-brand-subtle hover:border-brand-line transition-colors">
                        <Upload size={18} />
                      </button>
                    </div>
                  )}
                  {moodboardMode === 'ai' && (
                    <div>
                      {generatingImages && (
                        <div className="flex items-center gap-2.5 text-brand-subtle text-sm">
                          <div className="w-4 h-4 border border-brand-teal border-t-transparent rounded-full animate-spin" />
                          يولّد صور الإلهام...
                        </div>
                      )}
                      {moodImages.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                          {moodImages.map((img, i) => (
                            <div key={i} className="space-y-1">
                              {generatedImgUrls[i]
                                ? <img src={generatedImgUrls[i]!} alt={img.mood} className="w-full h-32 object-cover rounded-xl" />
                                : <div className="w-full h-32 bg-brand-elevated rounded-xl flex flex-col items-center justify-center gap-2 p-3 text-center border border-brand-border">
                                    <Sparkles size={18} className="text-brand-teal opacity-40" />
                                    <p className="text-brand-muted text-xs">{img.descriptionAr}</p>
                                  </div>
                              }
                              <p className="text-xs text-brand-muted text-center">{img.mood}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button onClick={() => setStep(3)} className="btn-primary w-full py-4 rounded-xl">
                  التالي: إنشاء الموجز الإبداعي <ChevronLeft size={16} />
                </button>
              </>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════
            STEP 3 — Creative Brief
        ═══════════════════════════════════════ */}
        {step === 3 && (
          <div className="space-y-6 slide-up">
            <SectionHeader step={3} title="الموجز الإبداعي" subtitle="مستند كامل للمصمم" />
            {!creativeBrief ? (
              <EmptyState icon={FileText} title="إنشاء الموجز الإبداعي"
                desc="موجز شامل: الهدف، نبرة الصوت، سيكولوجية الألوان، توجه الشعار، وما يجب وما لا يجب"
                action={<button onClick={handleLoadBrief} className="btn-primary px-8 py-3.5 rounded-xl"><Sparkles size={17} /> إنشاء الموجز الإبداعي</button>} />
            ) : (
              <>
                <div className="card rounded-2xl p-7 space-y-5">
                  <div className="flex items-start justify-between border-b border-brand-border pb-5">
                    <div>
                      <p className="text-xs text-brand-teal font-medium tracking-widest uppercase mb-1">Creative Brief</p>
                      <h3 className="text-2xl font-black text-brand-text">{brandInput.name || 'اسم العلامة'}</h3>
                      <p className="text-brand-subtle text-sm">{brandInput.industry}</p>
                    </div>
                    <div className="flex gap-2">
                      {[core, edge].map(a => (
                        <span key={a.key} className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ background: a.color + '15', color: a.color }}>{a.nameAr}</span>
                      ))}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { label: 'نظرة عامة',         value: creativeBrief.projectOverview },
                      { label: 'الهدف',              value: creativeBrief.objective },
                      { label: 'الجمهور المستهدف',   value: creativeBrief.targetAudience },
                      { label: 'شخصية العلامة',      value: creativeBrief.brandPersonality },
                      { label: 'نبرة الصوت',         value: creativeBrief.toneOfVoice },
                      { label: 'سيكولوجية الألوان',  value: creativeBrief.colorPsychology },
                      { label: 'توجه الخطوط',        value: creativeBrief.typographyDirection },
                      { label: 'توجه الشعار',        value: creativeBrief.logoDirection },
                    ].map(s => (
                      <div key={s.label} className="card-elevated rounded-xl p-4">
                        <p className="text-xs text-brand-teal font-bold tracking-wide uppercase mb-2">{s.label}</p>
                        <p className="text-brand-subtle text-sm leading-relaxed">{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="rounded-xl p-4 border" style={{ background: '#10b98108', borderColor: '#10b98120' }}>
                      <p className="text-emerald-400 font-bold text-xs tracking-wide uppercase mb-3">✓ يجب أن تفعل</p>
                      <ul className="space-y-1.5">{creativeBrief.doList.map((item, i) => (
                        <li key={i} className="text-brand-subtle text-xs flex gap-2"><span className="text-emerald-500 shrink-0">✓</span> {item}</li>
                      ))}</ul>
                    </div>
                    <div className="rounded-xl p-4 border" style={{ background: '#ef444408', borderColor: '#ef444420' }}>
                      <p className="text-red-400 font-bold text-xs tracking-wide uppercase mb-3">✗ تجنّب</p>
                      <ul className="space-y-1.5">{creativeBrief.dontList.map((item, i) => (
                        <li key={i} className="text-brand-subtle text-xs flex gap-2"><span className="text-red-500 shrink-0">✗</span> {item}</li>
                      ))}</ul>
                    </div>
                  </div>
                </div>
                <button onClick={() => setStep(4)} className="btn-primary w-full py-4 rounded-xl">
                  التالي: توليد لوحة الألوان <ChevronLeft size={16} />
                </button>
              </>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════
            STEP 4 — Color Palette
        ═══════════════════════════════════════ */}
        {step === 4 && (
          <div className="space-y-6 slide-up">
            <SectionHeader step={4} title="لوحة الألوان" subtitle="مُولَّدة بالذكاء الاصطناعي لشخصية علامتك" />
            {!colorPalette ? (
              <EmptyState icon={Palette} title="توليد لوحة الألوان"
                desc={`يحلّل Gemini شخصية ${core.nameAr} + ${edge.nameAr} والمسار البصري المختار ليقترح لوحة ألوان متناغمة`}
                action={<button onClick={handleLoadColors} className="btn-primary px-8 py-3.5 rounded-xl"><Sparkles size={17} /> توليد لوحة الألوان</button>} />
            ) : (
              <div className="space-y-5 fade-in">
                <div className="card rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-5 h-28">
                    {[colorPalette.primary, colorPalette.secondary, colorPalette.accent, colorPalette.neutral, colorPalette.background].map((s, i) => (
                      <button key={i} onClick={() => navigator.clipboard.writeText(s.hex)}
                        className="relative group" style={{ background: s.hex }}>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 text-xs text-white bg-black/60 px-2 py-0.5 rounded-lg transition-opacity">نسخ</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-5 border-t border-brand-border">
                    {[colorPalette.primary, colorPalette.secondary, colorPalette.accent, colorPalette.neutral, colorPalette.background].map((s, i) => (
                      <div key={i} className="p-3 text-center border-l border-brand-border first:border-l-0">
                        <p className="text-xs font-bold text-brand-text truncate mb-0.5">{s.nameAr}</p>
                        <button onClick={() => navigator.clipboard.writeText(s.hex)}
                          className="text-xs text-brand-teal hover:text-teal-300 font-mono transition-colors">{s.hex}</button>
                        <p className="text-xs text-brand-muted mt-0.5 hidden sm:block">rgb({s.rgb})</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="card-elevated rounded-xl p-5">
                    <p className="text-xs text-brand-teal font-bold tracking-wide uppercase mb-2">المنطق اللوني</p>
                    <p className="text-brand-subtle text-sm leading-relaxed">{colorPalette.rationale}</p>
                  </div>
                  <div className="card-elevated rounded-xl p-5">
                    <p className="text-xs text-brand-teal font-bold tracking-wide uppercase mb-2">سيكولوجية الألوان</p>
                    <p className="text-brand-subtle text-sm leading-relaxed">{colorPalette.psychologyNotes}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleLoadColors} className="btn-ghost"><Sparkles size={14} /> لوحة بديلة</button>
                  <button onClick={() => { setLogoConcepts([]); setStep(5); }} className="btn-primary flex-1 py-3.5 rounded-xl">
                    التالي: أفكار الشعار <ChevronLeft size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════
            STEP 5 — Logo Concepts
        ═══════════════════════════════════════ */}
        {step === 5 && (
          <div className="space-y-6 slide-up">
            <SectionHeader step={5} title="أفكار الشعار" subtitle="3 مفاهيم إبداعية — اختر الأنسب لعلامتك" />
            {!logoConcepts || logoConcepts.length === 0 ? (
              <EmptyState icon={Lightbulb} title="توليد أفكار الشعار"
                desc={`3 مفاهيم متباينة — كلاسيكي، عصري، ورمزي — لشخصية ${core.nameAr} ومسار ${selectedPath?.title ?? ''}`}
                action={
                  <button onClick={handleLoadConcepts} className="btn-primary px-8 py-3.5 rounded-xl">
                    <Sparkles size={17} /> توليد 3 أفكار للشعار
                  </button>
                } />
            ) : (
              <>
                <div className="space-y-4">
                  {logoConcepts.map((concept, i) => {
                    const isSel = selectedConcept?.id === concept.id;
                    const conceptColor = [core.color, selectedPath?.colors[0] ?? '#2dd4bf', edge.color][i] ?? core.color;
                    return (
                      <div key={concept.id} onClick={() => setSelectedConcept(concept)}
                        className={`card rounded-2xl p-6 cursor-pointer transition-all duration-200 ${isSel ? 'bg-brand-teal/3' : 'hover:border-brand-line'}`}
                        style={{ borderColor: isSel ? conceptColor + '40' : undefined }}>
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
                            style={{ background: isSel ? conceptColor : conceptColor + '20', color: isSel ? '#0a0a12' : conceptColor }}>
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="font-bold text-brand-text">{concept.title}</h3>
                              {isSel && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: conceptColor, color: '#0a0a12' }}>✓ مختار</span>}
                            </div>
                            <p className="text-xs font-medium" style={{ color: conceptColor + 'bb' }}>{concept.style}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${isSel ? 'border-brand-teal' : 'border-brand-border'}`}>
                            {isSel && <div className="w-2 h-2 rounded-full bg-brand-teal" />}
                          </div>
                        </div>
                        <p className="text-brand-subtle text-sm leading-relaxed mb-4">{concept.description}</p>
                        <div className="grid md:grid-cols-2 gap-2.5">
                          {[
                            { label: 'العناصر البصرية', content: <div className="flex flex-wrap gap-1">{concept.visualElements.map((el, j) => <span key={j} className="text-xs px-2 py-0.5 rounded-lg text-brand-subtle border border-brand-border">{el}</span>)}</div> },
                            { label: 'الرمزية والمعنى', content: <p className="text-brand-subtle text-xs leading-relaxed">{concept.symbolism}</p> },
                            { label: 'استخدام الألوان',  content: <p className="text-brand-subtle text-xs">{concept.colorUsage}</p> },
                            { label: 'توجه الخط',       content: <p className="text-brand-subtle text-xs">{concept.typography}</p> },
                          ].map(item => (
                            <div key={item.label} className="card-elevated rounded-xl p-3">
                              <p className="text-xs font-bold mb-1.5 tracking-wide" style={{ color: conceptColor }}>{item.label}</p>
                              {item.content}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-3">
                  <button onClick={handleLoadConcepts} className="btn-ghost"><Sparkles size={14} /> توليد جديد</button>
                  <button onClick={() => setStep(6)} disabled={!selectedConcept}
                    className="btn-primary flex-1 py-3.5 rounded-xl disabled:opacity-40">
                    <BookOpen size={16} />
                    {selectedConcept ? 'التالي: إنشاء التقرير النهائي' : 'اختر فكرة أولاً'}
                    <ChevronLeft size={15} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════
            STEP 6 — Final Report
        ═══════════════════════════════════════ */}
        {step === 6 && (
          <div className="space-y-6 slide-up">
            <SectionHeader step={6} title="التقرير النهائي" subtitle="ملخص كامل لهوية علامتك — جاهز للتحميل" />

            {/* Completion banner */}
            <div className="card rounded-2xl p-8 relative overflow-hidden" style={{ borderColor: core.color + '25' }}>
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ background: `radial-gradient(ellipse at top right, ${core.color}, transparent 60%)` }} />
              <div className="relative text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center mx-auto text-3xl">🎉</div>
                <h3 className="text-2xl font-black text-brand-text">اكتملت رحلة الهوية البصرية!</h3>
                <p className="text-brand-subtle text-sm leading-relaxed max-w-md mx-auto">
                  {brandInput.name || 'علامتك'} · {core.nameAr} + {edge.nameAr}<br />
                  تقريرك يضم كل ما تحتاجه للبدء مع مصممك
                </p>
              </div>
            </div>

            {/* What's included */}
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { icon: '💡', label: 'جوهر العلامة',    done: !!brandEssence,   desc: brandEssence?.essence.slice(0,60) + '...' },
                { icon: '🎨', label: 'التوجه الإبداعي', done: !!selectedPath,   desc: selectedPath?.title },
                { icon: '📄', label: 'الموجز الإبداعي', done: !!creativeBrief,  desc: `${creativeBrief?.doList.length ?? 0} توجيه، ${creativeBrief?.dontList.length ?? 0} محظور` },
                { icon: '🖌', label: 'لوحة الألوان',    done: !!colorPalette,   desc: colorPalette ? `${[colorPalette.primary, colorPalette.secondary, colorPalette.accent].map(s => s.hex).join(' · ')}` : '' },
                { icon: '✦', label: 'أفكار الشعار',    done: !!(logoConcepts?.length), desc: selectedConcept ? `المختار: ${selectedConcept.title.split(' — ')[0]}` : `${logoConcepts?.length ?? 0} أفكار` },
              ].map(item => (
                <div key={item.label} className={`card-elevated rounded-xl p-4 flex items-start gap-3 ${!item.done ? 'opacity-40' : ''}`}>
                  <div className="text-xl shrink-0">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-brand-text text-sm">{item.label}</p>
                      {item.done
                        ? <span className="text-xs text-emerald-400">✓ مكتمل</span>
                        : <span className="text-xs text-brand-muted">غير مكتمل</span>}
                    </div>
                    {item.desc && <p className="text-xs text-brand-muted truncate">{item.desc}</p>}
                  </div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={printFullReport}
                className="btn-primary w-full py-4 rounded-xl text-base"
                style={{ background: 'linear-gradient(135deg, #2dd4bf, #0891b2)' }}
              >
                <Download size={20} />
                تحميل التقرير الكامل — PDF
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setStep(1)} className="btn-ghost py-3 rounded-xl justify-center">
                  <ChevronLeft size={15} /> مراجعة الخطوات
                </button>
                <button
                  onClick={onRestart}
                  className="flex items-center justify-center gap-2 border-2 border-brand-border text-brand-subtle hover:border-red-500/40 hover:text-red-400 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                >
                  <RotateCcw size={15} /> إعادة الاختبار من البداية
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── HIDDEN PRINT LAYOUT ─────────────────────────────────── */}
      <PrintReport />
    </div>
  );
}
