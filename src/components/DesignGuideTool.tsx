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
  { id: 1, label: 'الأساس الاستراتيجي', icon: Target },
  { id: 2, label: 'التوجه الإبداعي', icon: Layers },
  { id: 3, label: 'الموجز الإبداعي', icon: FileText },
  { id: 4, label: 'لوحة الألوان', icon: Palette },
  { id: 5, label: 'أفكار الشعار', icon: Lightbulb },
  { id: 6, label: 'السكتشات', icon: PenTool },
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

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [moodImages, setMoodImages] = useState<MoodImage[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [moodboardMode, setMoodboardMode] = useState<'upload' | 'ai' | null>(null);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [generatedImgUrls, setGeneratedImgUrls] = useState<(string | null)[]>([]);
  const [sketchLoading, setSketchLoading] = useState(false);
  const [sketchImgLoaded, setSketchImgLoaded] = useState<boolean[]>([false, false, false]);
  const [sketchImgError, setSketchImgError] = useState<boolean[]>([false, false, false]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const core = ARCHETYPES[quizResult.coreArchetype];
  const edge = ARCHETYPES[quizResult.edgeArchetype];

  const inputCls = "w-full bg-slate-800/60 border border-brand-border rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-brand-teal transition-colors text-sm";
  const labelCls = "block text-sm text-slate-400 mb-1.5 font-medium";

  // Auto-generate sketches when entering step 6
  useEffect(() => {
    if (step === 6 && selectedConcept && selectedPath && logoSketches.length === 0) {
      handleGenerateSketches();
    }
  }, [step]);

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
      const urls = await generateLogoSketches(
        selectedConcept, brandInput, selectedPath,
        quizResult.coreArchetype, colorPalette,
      );
      setLogoSketches(urls);
    } catch {
      setLogoSketches([null, null, null]);
    } finally {
      setSketchLoading(false);
    }
  }

  function copyHex(hex: string) { navigator.clipboard.writeText(hex); }

  // ── SVG placeholder for sketches when image gen unavailable ──────────────────
  function SketchPlaceholder({ concept, idx, color }: { concept: LogoConcept; idx: number; color: string }) {
    const shapes = [
      <circle key="c" cx="80" cy="80" r="45" stroke={color} strokeWidth="2.5" fill="none" />,
      <rect key="r" x="35" y="35" width="90" height="90" rx="8" stroke={color} strokeWidth="2.5" fill="none" />,
      <polygon key="p" points="80,30 130,130 30,130" stroke={color} strokeWidth="2.5" fill="none" />,
    ];
    return (
      <div className="w-full h-64 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 bg-slate-900/40"
        style={{ borderColor: color + '40' }}>
        <svg width="160" height="160" viewBox="0 0 160 160" className="opacity-60">
          {shapes[idx % 3]}
          <text x="80" y="155" textAnchor="middle" fontSize="11" fill={color} opacity="0.7">
            {brandInput.name || 'العلامة'}
          </text>
          <line x1="20" y1="145" x2="140" y2="145" stroke={color} strokeWidth="1" opacity="0.3" />
        </svg>
        <p className="text-xs text-slate-500 text-center px-4 max-w-48">{concept.visualElements[idx] ?? concept.style}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-brand-card border-b border-brand-border px-4 py-3 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <button onClick={onBack} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors shrink-0">
            <ChevronLeft size={15} /> النتائج
          </button>
          <div className="flex items-center gap-0.5 overflow-x-auto">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} className="flex items-center shrink-0">
                  <button
                    onClick={() => setStep(s.id)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      active ? 'bg-brand-teal text-slate-900' : done ? 'text-brand-teal' : 'text-slate-600'
                    }`}
                  >
                    {done ? <CheckCircle size={12} /> : <Icon size={12} />}
                    <span className="hidden lg:inline">{s.label}</span>
                    <span className="lg:hidden">{s.id}</span>
                  </button>
                  {i < STEPS.length - 1 && <div className={`w-4 h-0.5 mx-0.5 shrink-0 ${done ? 'bg-brand-teal' : 'bg-slate-700'}`} />}
                </div>
              );
            })}
          </div>
          <div className="text-xs text-slate-600 shrink-0 hidden md:block">
            {core.nameAr} + {edge.nameAr}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 text-sm flex justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)}><X size={14} /></button>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="glass-card rounded-3xl p-8 flex flex-col items-center gap-4">
              <div className="w-14 h-14 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-300">{loadingMsg}</p>
            </div>
          </div>
        )}

        {/* ── STEP 1 ─────────────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-8 fade-in">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">الأساس الاستراتيجي</h2>
              <p className="text-slate-400">أدخل معلومات علامتك لبناء جوهرها الإبداعي</p>
            </div>
            <div className="glass-card rounded-3xl p-8 space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>اسم العلامة التجارية *</label>
                  <input className={inputCls} placeholder="مثال: نوما، أتلاس، سمّا..." value={brandInput.name}
                    onChange={e => setBrandInput({ ...brandInput, name: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>المجال / الصناعة *</label>
                  <input className={inputCls} placeholder="مثال: مطاعم، تقنية، أزياء..." value={brandInput.industry}
                    onChange={e => setBrandInput({ ...brandInput, industry: e.target.value })} />
                </div>
              </div>
              <div>
                <label className={labelCls}>الجمهور المستهدف</label>
                <input className={inputCls} placeholder="من هم عملاؤك المثاليون؟" value={brandInput.audience}
                  onChange={e => setBrandInput({ ...brandInput, audience: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>القيم الجوهرية للعلامة</label>
                <textarea className={inputCls + ' resize-none h-24'} placeholder="ما الذي تؤمن به علامتك؟"
                  value={brandInput.values} onChange={e => setBrandInput({ ...brandInput, values: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>معيار الصناعة — اختياري</label>
                <select className={inputCls} value={brandInput.standardArchetype}
                  onChange={e => setBrandInput({ ...brandInput, standardArchetype: e.target.value as ArchetypeKey })}>
                  <option value="">ما الشخصية التي يتوقعها العملاء من مجالك عادةً؟</option>
                  {Object.values(ARCHETYPES).map(a => (
                    <option key={a.key} value={a.key}>{a.nameAr} — {a.nameEn}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleLoadBrandEssence} disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-brand-teal hover:bg-teal-400 disabled:opacity-50 text-slate-900 font-bold py-4 rounded-2xl transition-all">
                <Sparkles size={18} /> تحليل جوهر العلامة بالذكاء الاصطناعي
              </button>
            </div>

            {brandEssence && (
              <div className="glass-card rounded-3xl p-8 space-y-5 fade-in border-brand-teal/20">
                <h3 className="text-lg font-bold text-brand-teal flex items-center gap-2"><Sparkles size={18} /> جوهر علامتك</h3>
                <div className="bg-gradient-to-r from-brand-teal/10 to-transparent border-r-2 border-brand-teal p-4 rounded-r-2xl">
                  <p className="text-white text-lg font-medium leading-relaxed">"{brandEssence.essence}"</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-2xl p-4">
                    <p className="text-xs text-brand-teal font-medium mb-2">التموضع</p>
                    <p className="text-slate-300 text-sm">{brandEssence.positioning}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-2xl p-4">
                    <p className="text-xs text-brand-teal font-medium mb-2">نبرة الصوت</p>
                    <p className="text-slate-300 text-sm">{brandEssence.brandVoice}</p>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-2xl p-4">
                  <p className="text-xs text-brand-teal font-medium mb-2">القيمة الفريدة</p>
                  <p className="text-slate-300 text-sm">{brandEssence.uniqueValue}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {brandEssence.personality.map((p, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 bg-brand-teal/10 text-brand-teal rounded-full border border-brand-teal/20">{p}</span>
                  ))}
                </div>
                <button onClick={() => setStep(2)}
                  className="w-full flex items-center justify-center gap-2 border border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-slate-900 font-bold py-3 rounded-2xl transition-all">
                  التالي: التوجه الإبداعي →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2 ─────────────────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-8 fade-in">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">التوجه الإبداعي</h2>
              <p className="text-slate-400">اختر المسار البصري الذي يعبّر عن علامتك</p>
            </div>

            {visualPaths.length === 0 ? (
              <div className="glass-card rounded-3xl p-8 text-center space-y-4">
                <p className="text-slate-400">سيقترح الذكاء الاصطناعي 3 مسارات بصرية مختلفة لعلامتك</p>
                <button onClick={handleLoadVisualPaths}
                  className="inline-flex items-center gap-2 bg-brand-teal hover:bg-teal-400 text-slate-900 font-bold px-8 py-4 rounded-2xl transition-all">
                  <Sparkles size={18} /> توليد المسارات البصرية
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {visualPaths.map((path, i) => {
                  const isSelected = selectedPath?.title === path.title;
                  return (
                    <div key={i} onClick={() => setSelectedPath(path)}
                      className={`glass-card rounded-3xl p-6 cursor-pointer transition-all duration-200 hover:scale-[1.01] ${isSelected ? 'border-brand-teal/60 glow-teal' : 'hover:border-slate-500/40'}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-brand-teal bg-brand-teal' : 'border-slate-600'}`}>
                          {isSelected && <div className="w-2.5 h-2.5 bg-slate-900 rounded-full" />}
                        </div>
                        <div className="text-right flex-1 mr-3">
                          <h3 className="font-bold text-white text-lg">{path.title}</h3>
                          <p className="text-brand-teal text-sm">{path.mood}</p>
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed mb-4">{path.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1.5">
                          {path.colors.map((c, j) => <div key={j} className="w-8 h-8 rounded-lg border border-white/10" style={{ background: c }} />)}
                        </div>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {path.keywords.map(k => <span key={k} className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-lg">{k}</span>)}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-3">الخطوط: {path.fontStyle}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedPath && (
              <>
                <div className="glass-card rounded-3xl p-6 space-y-5">
                  <h3 className="font-bold text-white">لوحة الإلهام (Moodboard)</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <button onClick={() => { setMoodboardMode('upload'); fileInputRef.current?.click(); }}
                      className={`p-5 rounded-2xl border-2 text-center transition-all ${moodboardMode === 'upload' ? 'border-brand-teal bg-brand-teal/10' : 'border-brand-border hover:border-slate-500'}`}>
                      <Upload size={24} className="mx-auto mb-2 text-brand-teal" />
                      <p className="font-bold text-white text-sm">ارفع صورك</p>
                      <p className="text-slate-500 text-xs mt-1">اختر صور إلهامك من جهازك</p>
                    </button>
                    <button onClick={handleAIMoodboard} disabled={generatingImages}
                      className={`p-5 rounded-2xl border-2 text-center transition-all ${moodboardMode === 'ai' ? 'border-brand-teal bg-brand-teal/10' : 'border-brand-border hover:border-slate-500'}`}>
                      <Sparkles size={24} className="mx-auto mb-2 text-brand-teal" />
                      <p className="font-bold text-white text-sm">اترك الأمر للذكاء الاصطناعي</p>
                      <p className="text-slate-500 text-xs mt-1">يولّد الموقع صور إلهام مناسبة</p>
                    </button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {uploadedImages.map((src, i) => (
                        <div key={i} className="relative group">
                          <img src={src} alt="" className="w-full h-32 object-cover rounded-xl" />
                          <button onClick={() => setUploadedImages(prev => prev.filter((_, j) => j !== i))}
                            className="absolute top-1.5 left-1.5 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={12} className="text-white" />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => fileInputRef.current?.click()}
                        className="h-32 border-2 border-dashed border-brand-border rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-400 hover:border-slate-500 transition-colors">
                        <Upload size={20} />
                      </button>
                    </div>
                  )}
                  {moodboardMode === 'ai' && (
                    <div>
                      {generatingImages && (
                        <div className="flex items-center gap-3 text-slate-400 text-sm">
                          <div className="w-5 h-5 border border-brand-teal border-t-transparent rounded-full animate-spin" />
                          يولّد صور الإلهام...
                        </div>
                      )}
                      {moodImages.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {moodImages.map((img, i) => (
                            <div key={i} className="space-y-1">
                              {generatedImgUrls[i]
                                ? <img src={generatedImgUrls[i]!} alt={img.mood} className="w-full h-36 object-cover rounded-xl" />
                                : <div className="w-full h-36 bg-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 p-3 text-center">
                                    <Sparkles size={20} className="text-brand-teal opacity-50" />
                                    <p className="text-slate-500 text-xs">{img.descriptionAr}</p>
                                  </div>
                              }
                              <p className="text-xs text-slate-500 text-center">{img.mood}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button onClick={() => setStep(3)}
                  className="w-full flex items-center justify-center gap-2 bg-brand-teal hover:bg-teal-400 text-slate-900 font-bold py-4 rounded-2xl transition-all">
                  التالي: إنشاء الموجز الإبداعي →
                </button>
              </>
            )}
          </div>
        )}

        {/* ── STEP 3 ─────────────────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-8 fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">الموجز الإبداعي</h2>
                <p className="text-slate-400 text-sm">مستند كامل للمصمم</p>
              </div>
              {creativeBrief && (
                <button onClick={() => printSection('print-brief')}
                  className="flex items-center gap-2 border border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-slate-900 font-bold px-5 py-2.5 rounded-xl transition-all text-sm">
                  <Download size={16} /> تحميل PDF
                </button>
              )}
            </div>

            {!creativeBrief ? (
              <div className="glass-card rounded-3xl p-8 text-center space-y-4">
                <FileText size={40} className="mx-auto text-slate-600" />
                <p className="text-slate-400">سيُنشئ الذكاء الاصطناعي موجزاً إبداعياً شاملاً يضم الهدف، نبرة الصوت، سيكولوجية الألوان، توجه الشعار، وما يجب وما لا يجب.</p>
                <button onClick={handleLoadBrief}
                  className="inline-flex items-center gap-2 bg-brand-teal hover:bg-teal-400 text-slate-900 font-bold px-8 py-4 rounded-2xl transition-all">
                  <Sparkles size={18} /> إنشاء الموجز الإبداعي
                </button>
              </div>
            ) : (
              <>
                <div id="brief-print" className="space-y-4">
                  <div className="glass-card rounded-3xl p-8 space-y-6">
                    <div className="border-b border-brand-border pb-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs text-brand-teal font-medium">CREATIVE BRIEF · الموجز الإبداعي</span>
                          <h3 className="text-2xl font-black text-white mt-1">{brandInput.name || 'اسم العلامة'}</h3>
                          <p className="text-slate-400 text-sm">{brandInput.industry}</p>
                        </div>
                        <div className="flex gap-2">
                          {[core, edge].map(a => (
                            <span key={a.key} className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: a.color + '20', color: a.color }}>{a.nameAr}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {[
                      { label: 'نظرة عامة', value: creativeBrief.projectOverview },
                      { label: 'الهدف', value: creativeBrief.objective },
                      { label: 'الجمهور المستهدف', value: creativeBrief.targetAudience },
                      { label: 'شخصية العلامة', value: creativeBrief.brandPersonality },
                      { label: 'نبرة الصوت', value: creativeBrief.toneOfVoice },
                      { label: 'سيكولوجية الألوان', value: creativeBrief.colorPsychology },
                      { label: 'توجه الخطوط', value: creativeBrief.typographyDirection },
                      { label: 'توجه الشعار', value: creativeBrief.logoDirection },
                    ].map(s => (
                      <div key={s.label} className="bg-slate-800/40 rounded-2xl p-4">
                        <p className="text-xs text-brand-teal font-bold mb-2">{s.label}</p>
                        <p className="text-slate-300 text-sm leading-relaxed">{s.value}</p>
                      </div>
                    ))}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
                        <p className="text-emerald-400 font-bold text-xs mb-3">✓ يجب أن تفعل</p>
                        <ul className="space-y-1.5">{creativeBrief.doList.map((item, i) => <li key={i} className="text-slate-400 text-xs flex gap-1.5"><span className="text-emerald-500 shrink-0">✓</span> {item}</li>)}</ul>
                      </div>
                      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4">
                        <p className="text-red-400 font-bold text-xs mb-3">✗ تجنّب</p>
                        <ul className="space-y-1.5">{creativeBrief.dontList.map((item, i) => <li key={i} className="text-slate-400 text-xs flex gap-1.5"><span className="text-red-500 shrink-0">✗</span> {item}</li>)}</ul>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-slate-800/40 rounded-2xl p-4">
                        <p className="text-xs text-brand-gold font-bold mb-2">✦ علامات إلهام مرجعية</p>
                        {creativeBrief.inspirations.map((it, j) => <p key={j} className="text-slate-400 text-xs">· {it}</p>)}
                      </div>
                      <div className="bg-slate-800/40 rounded-2xl p-4">
                        <p className="text-xs text-brand-teal font-bold mb-2">◆ المخرجات المطلوبة</p>
                        {creativeBrief.deliverables.map((d, j) => <p key={j} className="text-slate-400 text-xs">· {d}</p>)}
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={() => setStep(4)}
                  className="w-full flex items-center justify-center gap-2 bg-brand-teal hover:bg-teal-400 text-slate-900 font-bold py-4 rounded-2xl transition-all">
                  التالي: توليد لوحة الألوان →
                </button>
              </>
            )}
          </div>
        )}

        {/* ── STEP 4 ─────────────────────────────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-8 fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">لوحة الألوان</h2>
                <p className="text-slate-400 text-sm">لوحة مُولَّدة بالذكاء الاصطناعي لشخصية علامتك</p>
              </div>
              {colorPalette && (
                <button onClick={() => printSection('print-palette')}
                  className="flex items-center gap-2 border border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-slate-900 font-bold px-5 py-2.5 rounded-xl transition-all text-sm">
                  <Download size={16} /> تحميل PDF
                </button>
              )}
            </div>

            {!colorPalette ? (
              <div className="glass-card rounded-3xl p-8 text-center space-y-4">
                <Palette size={40} className="mx-auto text-slate-600" />
                <p className="text-slate-400">
                  يحلّل Gemini شخصية علامتك (<span className="text-brand-teal">{core.nameAr}</span> + <span style={{ color: edge.color }}>{edge.nameAr}</span>) والمسار البصري المختار ليقترح لوحة ألوان متناغمة.
                </p>
                <button onClick={handleLoadColors}
                  className="inline-flex items-center gap-2 bg-gradient-to-l from-brand-teal to-teal-500 text-slate-900 font-bold px-8 py-4 rounded-2xl transition-all hover:scale-105">
                  <Sparkles size={18} /> توليد لوحة الألوان
                </button>
              </div>
            ) : (
              <div className="space-y-6 fade-in">
                {/* Printable palette section */}
                <div id="palette-print">
                  <div className="glass-card rounded-3xl overflow-hidden">
                    <div className="grid grid-cols-5 h-32">
                      {[
                        { label: 'الرئيسي', swatch: colorPalette.primary },
                        { label: 'الثانوي', swatch: colorPalette.secondary },
                        { label: 'المميز', swatch: colorPalette.accent },
                        { label: 'المحايد', swatch: colorPalette.neutral },
                        { label: 'الخلفية', swatch: colorPalette.background },
                      ].map(({ label, swatch }) => (
                        <button key={label} onClick={() => copyHex(swatch.hex)}
                          className="relative group flex flex-col items-center justify-end pb-3 cursor-pointer" style={{ background: swatch.hex }}>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 text-xs text-white bg-black/60 px-2 py-1 rounded-lg transition-opacity">نسخ</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-5 border-t border-brand-border">
                      {[colorPalette.primary, colorPalette.secondary, colorPalette.accent, colorPalette.neutral, colorPalette.background].map((swatch, i) => (
                        <div key={i} className="p-3 text-center border-l border-brand-border first:border-r-0">
                          <p className="text-xs font-bold text-white truncate">{swatch.nameAr}</p>
                          <button onClick={() => copyHex(swatch.hex)} className="text-xs text-brand-teal hover:text-teal-300 font-mono transition-colors mt-0.5">{swatch.hex}</button>
                          <p className="text-xs text-slate-600 mt-0.5">rgb({swatch.rgb})</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="glass-card rounded-2xl p-5">
                      <p className="text-xs text-brand-teal font-bold mb-2">المنطق</p>
                      <p className="text-slate-300 text-sm leading-relaxed">{colorPalette.rationale}</p>
                    </div>
                    <div className="glass-card rounded-2xl p-5">
                      <p className="text-xs text-brand-teal font-bold mb-2">سيكولوجية الألوان</p>
                      <p className="text-slate-300 text-sm leading-relaxed">{colorPalette.psychologyNotes}</p>
                    </div>
                  </div>

                  <div className="glass-card rounded-2xl p-5 space-y-3 mt-4">
                    <p className="text-xs text-brand-gold font-bold">دليل الاستخدام</p>
                    {[
                      { label: 'الرئيسي', value: colorPalette.usage.primary, hex: colorPalette.primary.hex },
                      { label: 'الثانوي', value: colorPalette.usage.secondary, hex: colorPalette.secondary.hex },
                      { label: 'المميز', value: colorPalette.usage.accent, hex: colorPalette.accent.hex },
                    ].map(u => (
                      <div key={u.label} className="flex items-start gap-3">
                        <div className="w-4 h-4 rounded shrink-0 mt-0.5" style={{ background: u.hex }} />
                        <div><span className="text-white text-xs font-medium">{u.label}: </span><span className="text-slate-400 text-xs">{u.value}</span></div>
                      </div>
                    ))}
                  </div>

                  {colorPalette.combinations.length > 0 && (
                    <div className="glass-card rounded-2xl p-5 space-y-3 mt-4">
                      <p className="text-xs text-brand-gold font-bold">مجموعات التناسق</p>
                      <div className="grid md:grid-cols-3 gap-3">
                        {colorPalette.combinations.map((combo, i) => (
                          <div key={i} className="rounded-xl overflow-hidden border border-brand-border">
                            <div className="h-16 flex items-center justify-center text-sm font-bold" style={{ background: combo.bg, color: combo.text }}>
                              {brandInput.name || 'نموذج النص'}
                            </div>
                            <div className="p-2 bg-slate-800/60 text-center text-xs text-slate-400">{combo.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button onClick={handleLoadColors}
                    className="flex-1 flex items-center justify-center gap-2 border border-brand-border text-slate-400 hover:text-white hover:border-slate-400 py-3 rounded-2xl transition-all text-sm">
                    <Sparkles size={15} /> لوحة بديلة
                  </button>
                  <button onClick={() => { setLogoConcepts(null); setStep(5); }}
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-teal hover:bg-teal-400 text-slate-900 font-bold py-3 rounded-2xl transition-all">
                    التالي: أفكار الشعار →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 5: Logo Concepts ───────────────────────────────────────────── */}
        {step === 5 && (
          <div className="space-y-8 fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">أفكار الشعار</h2>
                <p className="text-slate-400 text-sm">3 مفاهيم إبداعية — اختر الأنسب لعلامتك</p>
              </div>
              {logoConcepts && (
                <button onClick={() => printSection('print-concepts')}
                  className="flex items-center gap-2 border border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-slate-900 font-bold px-5 py-2.5 rounded-xl transition-all text-sm">
                  <Download size={16} /> تحميل PDF
                </button>
              )}
            </div>

            {!logoConcepts ? (
              <div className="glass-card rounded-3xl p-8 text-center space-y-4">
                <Lightbulb size={40} className="mx-auto text-slate-600" />
                <p className="text-slate-400">
                  سيولّد الذكاء الاصطناعي 3 مفاهيم شعار مكتوبة ومتباينة — كلاسيكي، عصري، ورمزي — تتناسب مع شخصية{' '}
                  <span className="text-brand-teal">{core.nameAr}</span> ومسار <span className="text-brand-teal">{selectedPath?.title}</span>.
                </p>
                <button onClick={handleLoadConcepts}
                  className="inline-flex items-center gap-2 bg-gradient-to-l from-brand-gold to-yellow-400 text-slate-900 font-bold px-8 py-4 rounded-2xl transition-all hover:scale-105">
                  <Sparkles size={18} /> توليد 3 أفكار للشعار
                </button>
              </div>
            ) : (
              <>
                {/* Printable concepts */}
                <div id="concepts-print" className="space-y-4">
                  {/* Print header (hidden in screen mode via print CSS) */}
                  <div className="hidden print:block mb-6">
                    <h1 className="text-2xl font-black">{brandInput.name} — أفكار الشعار</h1>
                    <p className="text-gray-600 text-sm">{core.nameAr} + {edge.nameAr} · {selectedPath?.title}</p>
                  </div>

                  {logoConcepts.map((concept, i) => {
                    const isSelected = selectedConcept?.id === concept.id;
                    const conceptColor = [core.color, selectedPath?.colors[0] ?? '#2dd4bf', edge.color][i] ?? core.color;
                    return (
                      <div key={concept.id}
                        onClick={() => setSelectedConcept(concept)}
                        className={`glass-card rounded-3xl p-6 cursor-pointer transition-all duration-200 hover:scale-[1.01] ${isSelected ? 'glow-teal' : 'hover:border-slate-500/40'}`}
                        style={{ borderColor: isSelected ? conceptColor + '60' : undefined }}>

                        {/* Header */}
                        <div className="flex items-start gap-4 mb-5">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 ${isSelected ? 'text-slate-900' : 'text-white'}`}
                            style={{ background: isSelected ? conceptColor : conceptColor + '30' }}>
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-white text-lg">{concept.title}</h3>
                              {isSelected && <span className="text-xs px-2 py-0.5 rounded-full font-bold text-slate-900" style={{ background: conceptColor }}>✓ مختار</span>}
                            </div>
                            <p className="text-sm italic" style={{ color: conceptColor + 'cc' }}>{concept.style}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${isSelected ? 'border-brand-teal bg-brand-teal' : 'border-slate-600'}`}>
                            {isSelected && <div className="w-2.5 h-2.5 bg-slate-900 rounded-full" />}
                          </div>
                        </div>

                        <p className="text-slate-400 text-sm leading-relaxed mb-5">{concept.description}</p>

                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="bg-slate-800/50 rounded-2xl p-3">
                            <p className="text-xs font-bold mb-1.5" style={{ color: conceptColor }}>العناصر البصرية</p>
                            <div className="flex flex-wrap gap-1">
                              {concept.visualElements.map((el, j) => (
                                <span key={j} className="text-xs px-2 py-1 rounded-lg text-slate-300 border border-slate-700">{el}</span>
                              ))}
                            </div>
                          </div>
                          <div className="bg-slate-800/50 rounded-2xl p-3">
                            <p className="text-xs font-bold mb-1.5" style={{ color: conceptColor }}>الرمزية والمعنى</p>
                            <p className="text-slate-400 text-xs leading-relaxed">{concept.symbolism}</p>
                          </div>
                          <div className="bg-slate-800/50 rounded-2xl p-3">
                            <p className="text-xs font-bold mb-1.5" style={{ color: conceptColor }}>استخدام الألوان</p>
                            <p className="text-slate-400 text-xs">{concept.colorUsage}</p>
                          </div>
                          <div className="bg-slate-800/50 rounded-2xl p-3">
                            <p className="text-xs font-bold mb-1.5" style={{ color: conceptColor }}>توجه الخط</p>
                            <p className="text-slate-400 text-xs">{concept.typography}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button onClick={handleLoadConcepts}
                    className="flex items-center justify-center gap-2 border border-brand-border text-slate-400 hover:text-white hover:border-slate-400 px-5 py-3 rounded-2xl transition-all text-sm">
                    <Sparkles size={15} /> توليد جديد
                  </button>
                  <button
                    onClick={() => { setLogoSketches([]); setStep(6); }}
                    disabled={!selectedConcept}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-l from-brand-teal to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 font-bold py-3 rounded-2xl transition-all hover:scale-[1.02]"
                  >
                    <PenTool size={18} />
                    {selectedConcept ? `رسم السكتشات لـ "${selectedConcept.title.split(' — ')[0]}"` : 'اختر فكرة أولاً'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── STEP 6: Logo Sketches ───────────────────────────────────────────── */}
        {step === 6 && selectedConcept && (
          <div className="space-y-8 fade-in">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">رسم السكتشات</h2>
              <p className="text-slate-400 text-sm">
                3 تفسيرات بصرية لفكرة <span className="text-brand-teal font-medium">"{selectedConcept.title}"</span>
              </p>
            </div>

            {/* Concept reminder card */}
            <div className="glass-card rounded-2xl p-5 border-brand-teal/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-900 font-black text-sm" style={{ background: core.color }}>
                  ✓
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{selectedConcept.title}</p>
                  <p className="text-xs text-slate-500">{selectedConcept.style}</p>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">{selectedConcept.description}</p>
            </div>

            {/* Sketch loading state — only while URLs being generated */}
            {sketchLoading && (
              <div className="glass-card rounded-3xl p-10 text-center space-y-4">
                <div className="flex justify-center gap-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-4 h-4 rounded-full bg-brand-teal animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <p className="text-slate-400">يُجهّز روابط التوليد...</p>
                <p className="text-slate-600 text-xs">ستبدأ الصور بالتحميل فور الانتهاء</p>
              </div>
            )}

            {/* Sketches grid — shown once URLs are ready */}
            {!sketchLoading && (
              <div className="grid md:grid-cols-3 gap-5">
                {[0, 1, 2].map(i => {
                  const sketchUrl = logoSketches[i];
                  const labels = ['الرمز الأساسي — الخطوط', 'الرمز الجريء — المملوء', 'الشعار المركّب — رمز + اسم'];
                  const subLabels = ['outline · مساحة سلبية · بسيط', 'filled · حضور قوي · جريء', 'logomark + wordmark · متوازن'];
                  const isLoaded = sketchImgLoaded[i];
                  const hasError = sketchImgError[i];
                  return (
                    <div key={i} className="glass-card rounded-3xl overflow-hidden">
                      <div className="aspect-square relative bg-white overflow-hidden">
                        {/* ── SVG data URL → render inline (instant, no loading) ── */}
                        {sketchUrl?.startsWith('data:image/svg+xml,') ? (
                          <div
                            className="w-full h-full p-3 [&>svg]:w-full [&>svg]:h-full"
                            dangerouslySetInnerHTML={{
                              __html: decodeURIComponent(sketchUrl.slice('data:image/svg+xml,'.length)),
                            }}
                          />
                        ) : sketchUrl && !hasError ? (
                          /* ── External image (Pollinations URL / base64) ── */
                          <>
                            <img
                              src={sketchUrl}
                              alt={labels[i]}
                              className={`w-full h-full object-contain transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                              onLoad={() => setSketchImgLoaded(prev => { const n = [...prev]; n[i] = true; return n; })}
                              onError={() => setSketchImgError(prev => { const n = [...prev]; n[i] = true; return n; })}
                            />
                            {!isLoaded && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white">
                                <div className="w-10 h-10 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
                                <p className="text-xs text-slate-500">يُحمّل...</p>
                              </div>
                            )}
                          </>
                        ) : logoSketches.length > 0 ? (
                          /* ── Error / null fallback ── */
                          <div className="absolute inset-0">
                            <SketchPlaceholder concept={selectedConcept} idx={i} color={core.color} />
                          </div>
                        ) : (
                          /* ── Initial empty state ── */
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-800/40">
                            <PenTool size={32} className="text-slate-700" />
                          </div>
                        )}
                      </div>
                      <div className="p-4 border-t border-brand-border">
                        <p className="font-bold text-white text-sm">{labels[i]}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{subLabels[i]}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedConcept.visualElements.slice(0, 2).map((el, j) => (
                            <span key={j} className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-lg">{el}</span>
                          ))}
                        </div>
                        {/* Per-image status badge */}
                        {sketchUrl && (
                          <div className="mt-2">
                            {sketchUrl.startsWith('data:image/svg+xml,')
                              ? <span className="text-xs text-emerald-400">✓ SVG جاهز للتنزيل</span>
                              : isLoaded
                                ? <span className="text-xs text-emerald-400">✓ تم التوليد</span>
                                : !hasError
                                  ? <span className="text-xs text-brand-teal animate-pulse">⟳ جارٍ التحميل...</span>
                                  : <span className="text-xs text-slate-500">⚠ نموذج بديل</span>
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
                <button onClick={handleGenerateSketches}
                  className="flex items-center justify-center gap-2 border border-brand-border text-slate-400 hover:text-white hover:border-slate-400 px-5 py-3 rounded-2xl transition-all text-sm">
                  <Sparkles size={15} /> توليد جديد
                </button>
                <button onClick={() => setStep(5)}
                  className="flex items-center justify-center gap-2 border border-brand-teal/40 text-brand-teal hover:bg-brand-teal/10 px-5 py-3 rounded-2xl transition-all text-sm">
                  <Lightbulb size={15} /> تغيير الفكرة
                </button>
                <button
                  onClick={async () => {
                    const name = brandInput.name || 'logo';
                    // Download all 3 SVGs — or at least the first available one
                    const urls = logoSketches.filter(Boolean) as string[];
                    for (let idx = 0; idx < urls.length; idx++) {
                      const url = urls[idx];
                      try {
                        let blob: Blob;
                        let filename: string;
                        if (url.startsWith('data:image/svg+xml,')) {
                          const svgStr = decodeURIComponent(url.slice('data:image/svg+xml,'.length));
                          blob = new Blob([svgStr], { type: 'image/svg+xml' });
                          const labels = ['minimal', 'bold', 'combined'];
                          filename = `${name}-logo-${labels[idx] ?? idx + 1}.svg`;
                        } else {
                          const res = await fetch(url);
                          blob = await res.blob();
                          filename = `${name}-sketch-${idx + 1}.png`;
                        }
                        const objectUrl = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = objectUrl; a.download = filename; a.click();
                        URL.revokeObjectURL(objectUrl);
                        // Small delay between downloads
                        if (idx < urls.length - 1) await new Promise(r => setTimeout(r, 300));
                      } catch {
                        window.open(url, '_blank');
                      }
                    }
                  }}
                  disabled={!logoSketches.some(Boolean)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-l from-brand-teal to-teal-500 disabled:opacity-40 text-slate-900 font-bold py-3 rounded-2xl transition-all text-sm">
                  <Download size={16} /> تحميل الـ SVG
                </button>
              </div>
            )}

            {/* Summary banner */}
            <div className="glass-card rounded-3xl p-6 border-brand-teal/20 text-center space-y-2">
              <div className="text-3xl">🎉</div>
              <h3 className="font-bold text-white">اكتملت رحلة الهوية البصرية!</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                لديك الآن: جوهر العلامة · الموجز الإبداعي · لوحة الألوان · أفكار الشعار · السكتشات.<br />
                ابدأ بمشاركة هذه المواد مع مصممك لبدء التنفيذ.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
