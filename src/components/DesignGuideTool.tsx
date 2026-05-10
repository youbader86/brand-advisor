import { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Upload, X, ChevronLeft, Download, Palette,
  FileText, Layers, Target, Lightbulb, PenTool, CheckCircle,
} from 'lucide-react';
import type {
  QuizResult, BrandInput, BrandEssence, VisualPath,
  CreativeBrief, ColorPalette, MoodImage, ArchetypeKey, LogoConcept,
} from '../types';
import { ARCHETYPES } from '../constants';
import {
  getBrandEssence, getVisualPaths, getMoodboardDescriptions,
  generateMoodImage, getCreativeBrief, getColorPalette,
  getLogoConcepts, generateLogoSketches,
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
  logoSketches: (string | null)[]; setLogoSketches: (s: (string | null)[]) => void;
  onBack: () => void;
}

const STEPS = [
  { id: 1, label: 'الأساس',     sublabel: 'الاستراتيجي',   icon: Target   },
  { id: 2, label: 'التوجه',     sublabel: 'الإبداعي',      icon: Layers   },
  { id: 3, label: 'الموجز',     sublabel: 'الإبداعي',      icon: FileText },
  { id: 4, label: 'الألوان',    sublabel: 'لوحة متناغمة',  icon: Palette  },
  { id: 5, label: 'الشعار',     sublabel: '3 أفكار',       icon: Lightbulb},
  { id: 6, label: 'السكتشات',   sublabel: 'رسومات SVG',    icon: PenTool  },
];

function printSection(cls: 'print-brief' | 'print-palette' | 'print-concepts') {
  document.body.classList.add(cls);
  window.print();
  document.body.classList.remove(cls);
}

export default function DesignGuideTool(props: Props) {
  const {
    quizResult, brandInput, setBrandInput,
    brandEssence, setBrandEssence, visualPaths, setVisualPaths,
    selectedPath, setSelectedPath, creativeBrief, setCreativeBrief,
    colorPalette, setColorPalette, logoConcepts, setLogoConcepts,
    selectedConcept, setSelectedConcept, logoSketches, setLogoSketches,
    onBack,
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
  const [sketchLoading, setSketchLoading]   = useState(false);
  const [sketchImgLoaded, setSketchImgLoaded]   = useState<boolean[]>([false, false, false]);
  const [sketchImgError, setSketchImgError]     = useState<boolean[]>([false, false, false]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const core = ARCHETYPES[quizResult.coreArchetype];
  const edge = ARCHETYPES[quizResult.edgeArchetype];

  useEffect(() => {
    if (step === 6 && selectedConcept && selectedPath && logoSketches.length === 0) {
      handleGenerateSketches();
    }
  }, [step]);

  // ── Handlers ─────────────────────────────────────────────────────────────
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

  async function handleGenerateSketches() {
    if (!selectedConcept || !selectedPath) return;
    setSketchLoading(true);
    setLogoSketches([null, null, null]);
    setSketchImgLoaded([false, false, false]);
    setSketchImgError([false, false, false]);
    try {
      const urls = await generateLogoSketches(selectedConcept, brandInput, selectedPath, quizResult.coreArchetype, colorPalette);
      setLogoSketches(urls);
    } catch {
      setLogoSketches([null, null, null]);
    } finally {
      setSketchLoading(false);
    }
  }

  function copyHex(hex: string) { navigator.clipboard.writeText(hex); }

  function SketchPlaceholder({ concept, idx, color }: { concept: LogoConcept; idx: number; color: string }) {
    const shapes = [
      <circle key="c" cx="80" cy="80" r="45" stroke={color} strokeWidth="2" fill="none" />,
      <rect key="r" x="35" y="35" width="90" height="90" rx="6" stroke={color} strokeWidth="2" fill="none" />,
      <polygon key="p" points="80,28 132,132 28,132" stroke={color} strokeWidth="2" fill="none" />,
    ];
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-brand-surface">
        <svg width="160" height="160" viewBox="0 0 160 160" className="opacity-50">
          {shapes[idx % 3]}
          <text x="80" y="152" textAnchor="middle" fontSize="10" fill={color} opacity="0.6">
            {brandInput.name || 'العلامة'}
          </text>
        </svg>
        <p className="text-xs text-brand-muted text-center px-4 max-w-40">{concept.visualElements[idx] ?? concept.style}</p>
      </div>
    );
  }

  // ── Shared UI bits ────────────────────────────────────────────────────────
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

  return (
    <div className="min-h-screen bg-brand-bg">

      {/* ── STICKY HEADER / STEP NAV ─────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-brand-bg/95 backdrop-blur-md border-b border-brand-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Back */}
          <button onClick={onBack} className="flex items-center gap-1.5 text-brand-muted hover:text-brand-subtle text-sm transition-colors shrink-0">
            <ChevronLeft size={15} /> النتائج
          </button>

          {/* Steps */}
          <div className="flex-1 flex items-center gap-0 overflow-x-auto no-scrollbar">
            {STEPS.map((s, i) => {
              const Icon  = s.icon;
              const done  = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} className="flex items-center shrink-0">
                  <button
                    onClick={() => setStep(s.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                      active
                        ? 'bg-brand-teal/10 text-brand-teal border border-brand-teal/30'
                        : done
                        ? 'text-brand-teal/60 hover:text-brand-teal'
                        : 'text-brand-muted hover:text-brand-subtle'
                    }`}
                  >
                    {done
                      ? <CheckCircle size={13} />
                      : <Icon size={13} />
                    }
                    <span className="hidden lg:inline">{s.label}</span>
                    <span className="lg:hidden text-xs">{s.id}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`w-5 h-px mx-0.5 shrink-0 transition-colors ${done ? 'bg-brand-teal/30' : 'bg-brand-border'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Archetypes */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: core.color + '15', color: core.color }}>{core.nameAr}</span>
            <span className="text-brand-border text-xs">+</span>
            <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: edge.color + '15', color: edge.color }}>{edge.nameAr}</span>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-500/8 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)}><X size={14} /></button>
          </div>
        )}

        {/* Loading overlay */}
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

        {/* ════════════════════════════════════════════════════════════
            STEP 1 — Strategic Foundation
        ════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-6 slide-up">
            <SectionHeader step={1} title="الأساس الاستراتيجي" subtitle="أدخل معلومات علامتك لبناء جوهرها الإبداعي" />

            <div className="card rounded-2xl p-7 space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">اسم العلامة التجارية *</label>
                  <input className="field" placeholder="مثال: نوما، أتلاس، سمّا..."
                    value={brandInput.name}
                    onChange={e => setBrandInput({ ...brandInput, name: e.target.value })} />
                </div>
                <div>
                  <label className="label">المجال / الصناعة *</label>
                  <input className="field" placeholder="مثال: مطاعم، تقنية، أزياء..."
                    value={brandInput.industry}
                    onChange={e => setBrandInput({ ...brandInput, industry: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">الجمهور المستهدف</label>
                <input className="field" placeholder="من هم عملاؤك المثاليون؟"
                  value={brandInput.audience}
                  onChange={e => setBrandInput({ ...brandInput, audience: e.target.value })} />
              </div>
              <div>
                <label className="label">القيم الجوهرية</label>
                <textarea className="field resize-none h-24" placeholder="ما الذي تؤمن به علامتك؟"
                  value={brandInput.values}
                  onChange={e => setBrandInput({ ...brandInput, values: e.target.value })} />
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
              <button onClick={handleLoadBrandEssence} disabled={loading}
                className="btn-primary w-full py-4 rounded-xl text-base">
                <Sparkles size={18} /> تحليل جوهر العلامة بالذكاء الاصطناعي
              </button>
            </div>

            {/* Brand Essence Result */}
            {brandEssence && (
              <div className="card rounded-2xl p-7 space-y-5 slide-up" style={{ borderColor: core.color + '20' }}>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-brand-teal" />
                  <h3 className="font-bold text-brand-text">جوهر علامتك</h3>
                </div>

                {/* Main quote */}
                <div className="border-r-2 border-brand-teal pr-5 py-1">
                  <p className="text-brand-text text-lg font-medium leading-relaxed">"{brandEssence.essence}"</p>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { key: 'التموضع', val: brandEssence.positioning },
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

                <button onClick={() => setStep(2)}
                  className="btn-outline w-full py-3 rounded-xl">
                  التالي: التوجه الإبداعي <ChevronLeft size={15} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            STEP 2 — Visual Direction
        ════════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-6 slide-up">
            <SectionHeader step={2} title="التوجه الإبداعي" subtitle="اختر المسار البصري الذي يعبّر عن علامتك" />

            {visualPaths.length === 0 ? (
              <EmptyState
                icon={Layers}
                title="توليد المسارات البصرية"
                desc="سيقترح الذكاء الاصطناعي 3 مسارات بصرية مختلفة لعلامتك بناءً على شخصيتها وقيمها"
                action={
                  <button onClick={handleLoadVisualPaths}
                    className="btn-primary px-8 py-3.5 rounded-xl">
                    <Sparkles size={17} /> توليد المسارات البصرية
                  </button>
                }
              />
            ) : (
              <div className="space-y-3">
                {visualPaths.map((path, i) => {
                  const isSelected = selectedPath?.title === path.title;
                  return (
                    <div key={i} onClick={() => setSelectedPath(path)}
                      className={`card rounded-2xl p-6 cursor-pointer transition-all duration-200 ${
                        isSelected ? 'border-brand-teal/50 bg-brand-teal/3' : 'hover:border-brand-line'
                      }`}>
                      <div className="flex items-start gap-4">
                        {/* Radio */}
                        <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'border-brand-teal' : 'border-brand-line'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-brand-teal" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-brand-text">{path.title}</h3>
                            <span className="text-xs text-brand-teal bg-brand-teal/8 px-2 py-0.5 rounded-full">{path.mood}</span>
                          </div>
                          <p className="text-brand-subtle text-sm leading-relaxed mb-4">{path.description}</p>
                          <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex gap-1.5">
                              {path.colors.map((c, j) => (
                                <div key={j} className="w-7 h-7 rounded-lg border border-white/8" style={{ background: c }} />
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {path.keywords.map(k => (
                                <span key={k} className="text-xs bg-brand-elevated border border-brand-line text-brand-muted px-2 py-0.5 rounded-lg">{k}</span>
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-brand-muted mt-2.5 border-t border-brand-border pt-2.5">الخطوط المقترحة: {path.fontStyle}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Moodboard */}
            {selectedPath && (
              <>
                <div className="card rounded-2xl p-6 space-y-5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-brand-text">لوحة الإلهام</h3>
                    <span className="text-xs text-brand-muted bg-brand-elevated px-2 py-0.5 rounded-full border border-brand-line">Moodboard</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <button onClick={() => { setMoodboardMode('upload'); fileInputRef.current?.click(); }}
                      className={`p-5 rounded-xl border-2 text-center transition-all ${
                        moodboardMode === 'upload' ? 'border-brand-teal bg-brand-teal/5' : 'border-brand-border hover:border-brand-line'
                      }`}>
                      <Upload size={22} className="mx-auto mb-2 text-brand-teal" />
                      <p className="font-semibold text-brand-text text-sm">ارفع صورك</p>
                      <p className="text-brand-muted text-xs mt-1">اختر صور إلهامك من جهازك</p>
                    </button>
                    <button onClick={handleAIMoodboard} disabled={generatingImages}
                      className={`p-5 rounded-xl border-2 text-center transition-all ${
                        moodboardMode === 'ai' ? 'border-brand-teal bg-brand-teal/5' : 'border-brand-border hover:border-brand-line'
                      }`}>
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

        {/* ════════════════════════════════════════════════════════════
            STEP 3 — Creative Brief
        ════════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="space-y-6 slide-up">
            <SectionHeader
              step={3}
              title="الموجز الإبداعي"
              subtitle="مستند كامل للمصمم"
              extra={creativeBrief && (
                <button onClick={() => printSection('print-brief')}
                  className="btn-ghost">
                  <Download size={15} /> PDF
                </button>
              )}
            />

            {!creativeBrief ? (
              <EmptyState
                icon={FileText}
                title="إنشاء الموجز الإبداعي"
                desc="موجز شامل يضم الهدف، نبرة الصوت، سيكولوجية الألوان، توجه الشعار، وما يجب وما لا يجب"
                action={
                  <button onClick={handleLoadBrief}
                    className="btn-primary px-8 py-3.5 rounded-xl">
                    <Sparkles size={17} /> إنشاء الموجز الإبداعي
                  </button>
                }
              />
            ) : (
              <>
                <div id="brief-print" className="space-y-4">
                  <div className="card rounded-2xl p-7 space-y-5">
                    {/* Brief header */}
                    <div className="flex items-start justify-between border-b border-brand-border pb-5">
                      <div>
                        <p className="text-xs text-brand-teal font-medium tracking-widest uppercase mb-1">Creative Brief · الموجز الإبداعي</p>
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

                    {/* Brief sections */}
                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        { label: 'نظرة عامة',     value: creativeBrief.projectOverview },
                        { label: 'الهدف',          value: creativeBrief.objective },
                        { label: 'الجمهور المستهدف', value: creativeBrief.targetAudience },
                        { label: 'شخصية العلامة', value: creativeBrief.brandPersonality },
                        { label: 'نبرة الصوت',    value: creativeBrief.toneOfVoice },
                        { label: 'سيكولوجية الألوان', value: creativeBrief.colorPsychology },
                        { label: 'توجه الخطوط',   value: creativeBrief.typographyDirection },
                        { label: 'توجه الشعار',   value: creativeBrief.logoDirection },
                      ].map(s => (
                        <div key={s.label} className="card-elevated rounded-xl p-4">
                          <p className="text-xs text-brand-teal font-bold tracking-wide uppercase mb-2">{s.label}</p>
                          <p className="text-brand-subtle text-sm leading-relaxed">{s.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Do / Don't */}
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="rounded-xl p-4 border" style={{ background: '#10b98108', borderColor: '#10b98120' }}>
                        <p className="text-emerald-400 font-bold text-xs tracking-wide uppercase mb-3">✓ يجب أن تفعل</p>
                        <ul className="space-y-1.5">{creativeBrief.doList.map((item, i) => (
                          <li key={i} className="text-brand-subtle text-xs flex gap-2">
                            <span className="text-emerald-500 shrink-0">✓</span> {item}
                          </li>
                        ))}</ul>
                      </div>
                      <div className="rounded-xl p-4 border" style={{ background: '#ef444408', borderColor: '#ef444420' }}>
                        <p className="text-red-400 font-bold text-xs tracking-wide uppercase mb-3">✗ تجنّب</p>
                        <ul className="space-y-1.5">{creativeBrief.dontList.map((item, i) => (
                          <li key={i} className="text-brand-subtle text-xs flex gap-2">
                            <span className="text-red-500 shrink-0">✗</span> {item}
                          </li>
                        ))}</ul>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="card-elevated rounded-xl p-4">
                        <p className="text-xs text-brand-gold font-bold tracking-wide uppercase mb-2">✦ علامات إلهام</p>
                        {creativeBrief.inspirations.map((it, j) => (
                          <p key={j} className="text-brand-subtle text-xs mb-1">· {it}</p>
                        ))}
                      </div>
                      <div className="card-elevated rounded-xl p-4">
                        <p className="text-xs text-brand-teal font-bold tracking-wide uppercase mb-2">◆ المخرجات</p>
                        {creativeBrief.deliverables.map((d, j) => (
                          <p key={j} className="text-brand-subtle text-xs mb-1">· {d}</p>
                        ))}
                      </div>
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

        {/* ════════════════════════════════════════════════════════════
            STEP 4 — Color Palette
        ════════════════════════════════════════════════════════════ */}
        {step === 4 && (
          <div className="space-y-6 slide-up">
            <SectionHeader
              step={4}
              title="لوحة الألوان"
              subtitle="مُولَّدة بالذكاء الاصطناعي لشخصية علامتك"
              extra={colorPalette && (
                <button onClick={() => printSection('print-palette')} className="btn-ghost">
                  <Download size={15} /> PDF
                </button>
              )}
            />

            {!colorPalette ? (
              <EmptyState
                icon={Palette}
                title="توليد لوحة الألوان"
                desc={`يحلّل Gemini شخصية ${core.nameAr} + ${edge.nameAr} والمسار البصري المختار ليقترح لوحة ألوان متناغمة`}
                action={
                  <button onClick={handleLoadColors} className="btn-primary px-8 py-3.5 rounded-xl">
                    <Sparkles size={17} /> توليد لوحة الألوان
                  </button>
                }
              />
            ) : (
              <div className="space-y-5 fade-in">
                <div id="palette-print" className="card rounded-2xl overflow-hidden">
                  {/* Color swatches strip */}
                  <div className="grid grid-cols-5 h-28">
                    {[
                      { label: 'الرئيسي', swatch: colorPalette.primary },
                      { label: 'الثانوي', swatch: colorPalette.secondary },
                      { label: 'المميز',  swatch: colorPalette.accent },
                      { label: 'المحايد', swatch: colorPalette.neutral },
                      { label: 'الخلفية', swatch: colorPalette.background },
                    ].map(({ label, swatch }) => (
                      <button key={label} onClick={() => copyHex(swatch.hex)}
                        className="relative group flex flex-col items-end justify-end p-2.5 cursor-pointer"
                        style={{ background: swatch.hex }}>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 text-xs text-white bg-black/60 px-2 py-0.5 rounded-lg transition-opacity">نسخ</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Color details */}
                  <div className="grid grid-cols-5 border-t border-brand-border">
                    {[colorPalette.primary, colorPalette.secondary, colorPalette.accent, colorPalette.neutral, colorPalette.background].map((swatch, i) => (
                      <div key={i} className="p-3 text-center border-l border-brand-border first:border-l-0">
                        <p className="text-xs font-bold text-brand-text truncate mb-0.5">{swatch.nameAr}</p>
                        <button onClick={() => copyHex(swatch.hex)}
                          className="text-xs text-brand-teal hover:text-teal-300 font-mono transition-colors">
                          {swatch.hex}
                        </button>
                        <p className="text-xs text-brand-muted mt-0.5 hidden sm:block">rgb({swatch.rgb})</p>
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

                <div className="card rounded-2xl p-5 space-y-3">
                  <p className="text-xs text-brand-gold font-bold tracking-wide uppercase">دليل الاستخدام</p>
                  {[
                    { label: 'الرئيسي', value: colorPalette.usage.primary,   hex: colorPalette.primary.hex },
                    { label: 'الثانوي', value: colorPalette.usage.secondary, hex: colorPalette.secondary.hex },
                    { label: 'المميز',  value: colorPalette.usage.accent,    hex: colorPalette.accent.hex },
                  ].map(u => (
                    <div key={u.label} className="flex items-start gap-3">
                      <div className="w-3.5 h-3.5 rounded shrink-0 mt-0.5 border border-white/10" style={{ background: u.hex }} />
                      <div>
                        <span className="text-brand-text text-xs font-medium">{u.label}: </span>
                        <span className="text-brand-muted text-xs">{u.value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {colorPalette.combinations.length > 0 && (
                  <div className="card rounded-2xl p-5 space-y-3">
                    <p className="text-xs text-brand-gold font-bold tracking-wide uppercase">مجموعات التناسق</p>
                    <div className="grid md:grid-cols-3 gap-3">
                      {colorPalette.combinations.map((combo, i) => (
                        <div key={i} className="rounded-xl overflow-hidden border border-brand-border">
                          <div className="h-14 flex items-center justify-center text-sm font-bold" style={{ background: combo.bg, color: combo.text }}>
                            {brandInput.name || 'نموذج النص'}
                          </div>
                          <div className="p-2 bg-brand-elevated text-center text-xs text-brand-muted">{combo.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={handleLoadColors} className="btn-ghost flex-none">
                    <Sparkles size={14} /> لوحة بديلة
                  </button>
                  <button onClick={() => { setLogoConcepts([]); setStep(5); }} className="btn-primary flex-1 py-3.5 rounded-xl">
                    التالي: أفكار الشعار <ChevronLeft size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            STEP 5 — Logo Concepts
        ════════════════════════════════════════════════════════════ */}
        {step === 5 && (
          <div className="space-y-6 slide-up">
            <SectionHeader
              step={5}
              title="أفكار الشعار"
              subtitle="3 مفاهيم إبداعية — اختر الأنسب لعلامتك"
              extra={logoConcepts && (
                <button onClick={() => printSection('print-concepts')} className="btn-ghost">
                  <Download size={15} /> PDF
                </button>
              )}
            />

            {!logoConcepts || logoConcepts.length === 0 ? (
              <EmptyState
                icon={Lightbulb}
                title="توليد أفكار الشعار"
                desc={`3 مفاهيم متباينة — كلاسيكي، عصري، ورمزي — لشخصية ${core.nameAr} ومسار ${selectedPath?.title ?? ''}`}
                action={
                  <button onClick={handleLoadConcepts} className="btn-primary px-8 py-3.5 rounded-xl"
                    style={{ background: 'linear-gradient(135deg, #2dd4bf, #06b6d4)' }}>
                    <Sparkles size={17} /> توليد 3 أفكار للشعار
                  </button>
                }
              />
            ) : (
              <>
                <div id="concepts-print" className="space-y-4">
                  {logoConcepts.map((concept, i) => {
                    const isSelected   = selectedConcept?.id === concept.id;
                    const conceptColor = [core.color, selectedPath?.colors[0] ?? '#2dd4bf', edge.color][i] ?? core.color;
                    return (
                      <div key={concept.id} onClick={() => setSelectedConcept(concept)}
                        className={`card rounded-2xl p-6 cursor-pointer transition-all duration-200 ${
                          isSelected ? 'bg-brand-teal/3' : 'hover:border-brand-line'
                        }`}
                        style={{ borderColor: isSelected ? conceptColor + '40' : undefined }}>

                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
                            style={{ background: isSelected ? conceptColor : conceptColor + '20', color: isSelected ? '#0a0a12' : conceptColor }}>
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="font-bold text-brand-text">{concept.title}</h3>
                              {isSelected && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                                  style={{ background: conceptColor, color: '#0a0a12' }}>✓ مختار</span>
                              )}
                            </div>
                            <p className="text-xs font-medium" style={{ color: conceptColor + 'bb' }}>{concept.style}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-colors ${
                            isSelected ? 'border-brand-teal' : 'border-brand-border'
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-brand-teal" />}
                          </div>
                        </div>

                        <p className="text-brand-subtle text-sm leading-relaxed mb-4">{concept.description}</p>

                        <div className="grid md:grid-cols-2 gap-2.5">
                          {[
                            { label: 'العناصر البصرية', content: concept.visualElements.map((el, j) => (
                              <span key={j} className="text-xs px-2 py-0.5 rounded-lg text-brand-subtle border border-brand-border">{el}</span>
                            )) },
                            { label: 'الرمزية والمعنى', content: <p className="text-brand-subtle text-xs leading-relaxed">{concept.symbolism}</p> },
                            { label: 'استخدام الألوان',  content: <p className="text-brand-subtle text-xs">{concept.colorUsage}</p> },
                            { label: 'توجه الخط',       content: <p className="text-brand-subtle text-xs">{concept.typography}</p> },
                          ].map(item => (
                            <div key={item.label} className="card-elevated rounded-xl p-3">
                              <p className="text-xs font-bold mb-1.5 tracking-wide" style={{ color: conceptColor }}>
                                {item.label}
                              </p>
                              <div className="flex flex-wrap gap-1">{item.content}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button onClick={handleLoadConcepts} className="btn-ghost">
                    <Sparkles size={14} /> توليد جديد
                  </button>
                  <button
                    onClick={() => { setLogoSketches([]); setStep(6); }}
                    disabled={!selectedConcept}
                    className="btn-primary flex-1 py-3.5 rounded-xl disabled:opacity-40">
                    <PenTool size={16} />
                    {selectedConcept ? `رسم السكتشات لـ "${selectedConcept.title.split(' — ')[0]}"` : 'اختر فكرة أولاً'}
                    <ChevronLeft size={15} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            STEP 6 — Logo Sketches
        ════════════════════════════════════════════════════════════ */}
        {step === 6 && selectedConcept && (
          <div className="space-y-6 slide-up">
            <SectionHeader
              step={6}
              title="رسم السكتشات"
              subtitle={`3 تفسيرات بصرية لفكرة "${selectedConcept.title}"`}
            />

            {/* Concept reminder */}
            <div className="card-elevated rounded-xl p-4 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: core.color, color: '#0a0a12' }}>✓</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-brand-text text-sm">{selectedConcept.title}</p>
                <p className="text-xs text-brand-muted mt-0.5">{selectedConcept.style}</p>
                <p className="text-brand-subtle text-xs leading-relaxed mt-1.5">{selectedConcept.description}</p>
              </div>
            </div>

            {/* Loading */}
            {sketchLoading && (
              <div className="card rounded-2xl p-12 text-center space-y-4">
                <div className="flex justify-center gap-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-3 h-3 rounded-full bg-brand-teal animate-bounce"
                      style={{ animationDelay: `${i * 0.12}s` }} />
                  ))}
                </div>
                <p className="text-brand-subtle text-sm">يُجهّز الرسومات...</p>
              </div>
            )}

            {/* Sketches grid */}
            {!sketchLoading && (
              <div className="grid md:grid-cols-3 gap-4">
                {[0, 1, 2].map(i => {
                  const sketchUrl = logoSketches[i];
                  const labels    = ['الرمز الأساسي', 'الرمز الجريء', 'الشعار المركّب'];
                  const subLabels = ['Outline · خطوط فقط', 'Filled · مملوء', 'Symbol + Wordmark'];
                  const isLoaded  = sketchImgLoaded[i];
                  const hasError  = sketchImgError[i];

                  return (
                    <div key={i} className="card rounded-2xl overflow-hidden">
                      {/* Sketch display */}
                      <div className="aspect-square relative bg-white">
                        {sketchUrl?.startsWith('data:image/svg+xml,') ? (
                          <div className="w-full h-full p-2 [&>svg]:w-full [&>svg]:h-full"
                            dangerouslySetInnerHTML={{
                              __html: decodeURIComponent(sketchUrl.slice('data:image/svg+xml,'.length)),
                            }} />
                        ) : sketchUrl && !hasError ? (
                          <>
                            <img src={sketchUrl} alt={labels[i]}
                              className={`w-full h-full object-contain transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                              onLoad={() => setSketchImgLoaded(prev => { const n = [...prev]; n[i] = true; return n; })}
                              onError={() => setSketchImgError(prev => { const n = [...prev]; n[i] = true; return n; })} />
                            {!isLoaded && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white">
                                <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
                                <p className="text-xs text-brand-muted">يُحمّل...</p>
                              </div>
                            )}
                          </>
                        ) : logoSketches.length > 0 ? (
                          <div className="absolute inset-0">
                            <SketchPlaceholder concept={selectedConcept} idx={i} color={core.color} />
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-brand-elevated">
                            <PenTool size={28} className="text-brand-border" />
                          </div>
                        )}
                      </div>

                      {/* Sketch info */}
                      <div className="p-4 border-t border-brand-border">
                        <p className="font-bold text-brand-text text-sm">{labels[i]}</p>
                        <p className="text-xs text-brand-muted mt-0.5">{subLabels[i]}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedConcept.visualElements.slice(0, 2).map((el, j) => (
                            <span key={j} className="text-xs bg-brand-elevated border border-brand-border text-brand-muted px-2 py-0.5 rounded-lg">{el}</span>
                          ))}
                        </div>
                        {sketchUrl && (
                          <div className="mt-2">
                            {sketchUrl.startsWith('data:image/svg+xml,')
                              ? <span className="text-xs text-emerald-400">✓ SVG جاهز</span>
                              : isLoaded ? <span className="text-xs text-emerald-400">✓ تم التوليد</span>
                              : !hasError ? <span className="text-xs text-brand-teal animate-pulse">⟳ جارٍ التحميل</span>
                              : <span className="text-xs text-brand-muted">⚠ نموذج بديل</span>
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Actions */}
            {!sketchLoading && logoSketches.length > 0 && (
              <div className="flex gap-3">
                <button onClick={handleGenerateSketches} className="btn-ghost">
                  <Sparkles size={14} /> توليد جديد
                </button>
                <button onClick={() => setStep(5)} className="btn-ghost">
                  <Lightbulb size={14} /> تغيير الفكرة
                </button>
                <button
                  onClick={async () => {
                    const name = brandInput.name || 'logo';
                    const urls = logoSketches.filter(Boolean) as string[];
                    for (let idx = 0; idx < urls.length; idx++) {
                      const url = urls[idx];
                      try {
                        let blob: Blob; let filename: string;
                        if (url.startsWith('data:image/svg+xml,')) {
                          const svgStr = decodeURIComponent(url.slice('data:image/svg+xml,'.length));
                          blob = new Blob([svgStr], { type: 'image/svg+xml' });
                          const ls = ['minimal', 'bold', 'combined'];
                          filename = `${name}-logo-${ls[idx] ?? idx + 1}.svg`;
                        } else {
                          const res = await fetch(url);
                          blob = await res.blob();
                          filename = `${name}-sketch-${idx + 1}.png`;
                        }
                        const objUrl = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = objUrl; a.download = filename; a.click();
                        URL.revokeObjectURL(objUrl);
                        if (idx < urls.length - 1) await new Promise(r => setTimeout(r, 300));
                      } catch {
                        window.open(url, '_blank');
                      }
                    }
                  }}
                  disabled={!logoSketches.some(Boolean)}
                  className="btn-primary flex-1 py-3 rounded-xl disabled:opacity-40">
                  <Download size={15} /> تحميل الـ SVG
                </button>
              </div>
            )}

            {/* Completion banner */}
            <div className="card rounded-2xl p-7 text-center space-y-3" style={{ borderColor: core.color + '20' }}>
              <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center mx-auto text-2xl">
                🎉
              </div>
              <h3 className="font-bold text-brand-text text-lg">اكتملت رحلة الهوية البصرية!</h3>
              <p className="text-brand-subtle text-sm leading-relaxed max-w-md mx-auto">
                لديك الآن: جوهر العلامة · الموجز الإبداعي · لوحة الألوان · أفكار الشعار · السكتشات.<br />
                شارك هذه المواد مع مصممك لبدء التنفيذ.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
