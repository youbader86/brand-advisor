import { useState, useEffect } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import { Sparkles, ChevronLeft, RotateCcw, ArrowLeft } from 'lucide-react';
import type { QuizResult, LogoAnalysis } from '../types';
import { ARCHETYPES, LOGO_TYPES } from '../constants';
import { getLogoAnalysis } from '../services/gemini';

interface Props {
  result: QuizResult;
  logoAnalysis: LogoAnalysis | null;
  setLogoAnalysis: (a: LogoAnalysis) => void;
  onGoToDesignGuide: () => void;
  onRestart: () => void;
}

export default function Results({ result, logoAnalysis, setLogoAnalysis, onGoToDesignGuide, onRestart }: Props) {
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const core = ARCHETYPES[result.coreArchetype];
  const edge = ARCHETYPES[result.edgeArchetype];

  const chartData = result.scores.map(s => ({
    archetype: ARCHETYPES[s.archetype]?.nameAr ?? s.archetype,
    score: s.score,
    fullMark: 20,
  }));

  useEffect(() => {
    if (!logoAnalysis) loadAnalysis();
  }, []);

  async function loadAnalysis() {
    setLoading(true); setError(null);
    try {
      setLogoAnalysis(await getLogoAnalysis(result.coreArchetype, result.edgeArchetype));
    } catch {
      setError('حدث خطأ في الاتصال بالذكاء الاصطناعي');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg">

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-brand-bg/95 backdrop-blur-md border-b border-brand-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={onRestart} className="flex items-center gap-2 text-brand-muted hover:text-brand-subtle text-sm transition-colors">
            <RotateCcw size={14} /> إعادة الاختبار
          </button>
          <div className="text-sm font-medium text-brand-subtle">نتائج الاختبار</div>
          <button
            onClick={onGoToDesignGuide}
            className="btn-primary text-sm px-4 py-2 rounded-xl"
          >
            ورشة التصميم <ArrowLeft size={14} />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">

        {/* ── RESULT BANNER ─────────────────────────────────────────── */}
        <div className="card rounded-2xl p-8 slide-up relative overflow-hidden">
          {/* BG accent */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ background: `radial-gradient(ellipse at top right, ${core.color}, transparent 60%)` }}
          />
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <div className="text-xs text-brand-muted tracking-wider uppercase mb-3">شخصيتك الجوهرية</div>
              <h1 className="text-4xl md:text-5xl font-black text-brand-text mb-1">
                {core.nameAr}
              </h1>
              <p className="text-lg italic mb-4" style={{ color: core.color }}>{core.tagline}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className="text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ background: core.color + '15', color: core.color }}
                >
                  CORE · {core.nameEn}
                </span>
                <span className="text-brand-muted text-xs">+</span>
                <span
                  className="text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ background: edge.color + '15', color: edge.color }}
                >
                  EDGE · {edge.nameEn}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              {[core, edge].map((a, i) => (
                <div key={a.key} className="text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black mb-1.5"
                    style={{ background: a.color + '15', color: a.color, border: `1px solid ${a.color}25` }}
                  >
                    {a.nameAr[0]}
                  </div>
                  <div className="text-xs text-brand-muted">{i === 0 ? 'الأساسية' : 'الداعمة'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ARCHETYPE DETAIL ──────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-5 fade-in">
          {/* Core */}
          <div className="card rounded-2xl p-7 space-y-4" style={{ borderColor: core.color + '25' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-10 rounded-full" style={{ background: core.color }} />
              <div>
                <div className="text-xs tracking-wider uppercase font-bold" style={{ color: core.color }}>CORE · الجوهرية</div>
                <h2 className="text-2xl font-black text-brand-text">{core.nameAr}</h2>
              </div>
            </div>
            <p className="text-brand-subtle text-sm leading-relaxed">{core.description}</p>
            <div className="flex flex-wrap gap-2">
              {core.traits.map(t => (
                <span key={t} className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: core.color + '12', color: core.color }}>
                  {t}
                </span>
              ))}
            </div>
            <div className="pt-2 border-t border-brand-border">
              <p className="text-xs text-brand-muted mb-1">علامات مرجعية</p>
              <p className="text-brand-subtle text-sm">{core.examples.join(' · ')}</p>
            </div>
          </div>

          {/* Edge */}
          <div className="card rounded-2xl p-7 space-y-4" style={{ borderColor: edge.color + '25' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-10 rounded-full" style={{ background: edge.color }} />
              <div>
                <div className="text-xs tracking-wider uppercase font-bold" style={{ color: edge.color }}>EDGE · الداعمة</div>
                <h2 className="text-2xl font-black text-brand-text">{edge.nameAr}</h2>
              </div>
            </div>
            <p className="text-brand-subtle text-sm leading-relaxed">{edge.description}</p>
            <div className="flex flex-wrap gap-2">
              {edge.traits.map(t => (
                <span key={t} className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: edge.color + '12', color: edge.color }}>
                  {t}
                </span>
              ))}
            </div>
            <div className="pt-2 border-t border-brand-border bg-brand-elevated/50 rounded-xl p-3">
              <p className="text-xs text-brand-muted mb-1">كيف تتكاملان</p>
              <p className="text-brand-subtle text-sm leading-relaxed">
                {core.nameAr} تُشكّل قلب علامتك، بينما {edge.nameAr} تُضيف عمقاً بلمسة من {edge.traits[0]}.
              </p>
            </div>
          </div>
        </div>

        {/* ── SCORE CHART ───────────────────────────────────────────── */}
        <div className="card rounded-2xl p-7">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-brand-text">توزيع درجات الشخصيات الـ 12</h3>
            <div className="text-xs text-brand-muted">الدرجة القصوى: 20</div>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Radar */}
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#1a1a2e" />
                  <PolarAngleAxis dataKey="archetype" tick={{ fill: '#475569', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: '#0c0c1a', border: '1px solid #1a1a2e', borderRadius: 10, color: '#e2e8f0', fontSize: 12 }}
                    formatter={(v: number) => [`${v} / 20`, 'الدرجة']}
                  />
                  <Radar dataKey="score" stroke="#2dd4bf" fill="#2dd4bf" fillOpacity={0.15} strokeWidth={1.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Score bars */}
            <div className="space-y-2.5">
              {result.scores.map((s, i) => {
                const a = ARCHETYPES[s.archetype];
                const isPrimary = i < 2;
                return (
                  <div key={s.archetype} className="flex items-center gap-3">
                    <div className="text-right w-16 shrink-0">
                      <span className="text-xs text-brand-subtle">{a.nameAr}</span>
                    </div>
                    <div className="flex-1 h-1.5 bg-brand-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(s.score / 20) * 100}%`,
                          background: isPrimary ? a.color : '#1a1a2e',
                          boxShadow: isPrimary ? `0 0 8px ${a.color}50` : 'none',
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold w-6 text-left shrink-0" style={{ color: isPrimary ? a.color : '#475569' }}>
                      {s.score}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── AI ANALYSIS ───────────────────────────────────────────── */}
        <div className="card rounded-2xl p-7 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-brand-teal" />
              <h3 className="font-bold text-brand-text">تحليل الذكاء الاصطناعي وتوصيات الشعار</h3>
            </div>
            {error && (
              <button onClick={loadAnalysis} className="text-sm text-brand-teal hover:underline">
                إعادة المحاولة
              </button>
            )}
          </div>

          {loading && (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-brand-teal/20 rounded-full" />
                <div className="absolute inset-0 w-12 h-12 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-brand-subtle text-sm">يحلّل الذكاء الاصطناعي شخصية علامتك...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/8 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {logoAnalysis && !loading && (
            <div className="space-y-5 fade-in">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: 'جوهر العلامة', value: logoAnalysis.brandEssence },
                  { label: 'البصيرة الأرشيتيبية', value: logoAnalysis.archetypeInsight },
                ].map(item => (
                  <div key={item.label} className="card-elevated rounded-xl p-4">
                    <p className="text-xs text-brand-teal font-medium tracking-wide uppercase mb-2">{item.label}</p>
                    <p className="text-brand-subtle text-sm leading-relaxed">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Logo recommendations */}
              <div>
                <h4 className="text-sm font-bold text-brand-subtle mb-3">أنواع الشعارات الموصى بها</h4>
                <div className="space-y-2">
                  {logoAnalysis.logoRecommendations.map((rec, i) => {
                    const lt = LOGO_TYPES.find(l => l.key === rec.type);
                    const isOpen = expanded === rec.type;
                    return (
                      <div key={rec.type} className="card-elevated rounded-xl overflow-hidden">
                        <button
                          className="w-full flex items-center justify-between p-4 hover:bg-brand-line/20 transition-colors"
                          onClick={() => setExpanded(isOpen ? null : rec.type)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                              i === 0 ? 'bg-brand-teal text-slate-900' : 'bg-brand-border text-brand-subtle'
                            }`}>
                              {i + 1}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-brand-text text-sm">{rec.typeAr || lt?.nameAr}</p>
                              <p className="text-xs text-brand-muted">{lt?.nameEn}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="hidden md:flex items-center gap-1">
                              {Array.from({ length: 5 }, (_, j) => (
                                <div key={j} className="w-1.5 h-1.5 rounded-full" style={{
                                  background: j < Math.round(rec.score / 20) ? '#2dd4bf' : '#1a1a2e'
                                }} />
                              ))}
                            </div>
                            <ChevronLeft size={14} className={`text-brand-muted transition-transform ${isOpen ? 'rotate-[-90deg]' : ''}`} />
                          </div>
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 space-y-3 fade-in border-t border-brand-border pt-3">
                            <p className="text-brand-subtle text-sm leading-relaxed">{rec.reason}</p>
                            <div>
                              <p className="text-xs text-brand-teal font-medium mb-2">نصائح التصميم</p>
                              <ul className="space-y-1.5">
                                {rec.designTips.map((tip, j) => (
                                  <li key={j} className="text-sm text-brand-subtle flex gap-2">
                                    <span className="text-brand-teal shrink-0">◆</span> {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Do / Don't */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl p-4 border" style={{ background: '#10b98108', borderColor: '#10b98125' }}>
                  <p className="text-emerald-400 font-bold text-xs tracking-wide uppercase mb-3">✓ يجب أن تفعل</p>
                  <ul className="space-y-2">
                    {logoAnalysis.doList.map((item, i) => (
                      <li key={i} className="text-brand-subtle text-sm flex gap-2">
                        <span className="text-emerald-500 shrink-0">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl p-4 border" style={{ background: '#ef444408', borderColor: '#ef444425' }}>
                  <p className="text-red-400 font-bold text-xs tracking-wide uppercase mb-3">✗ تجنّب</p>
                  <ul className="space-y-2">
                    {logoAnalysis.dontList.map((item, i) => (
                      <li key={i} className="text-brand-subtle text-sm flex gap-2">
                        <span className="text-red-500 shrink-0">✗</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── BOTTOM CTA ───────────────────────────────────────────── */}
        <div className="card rounded-2xl p-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-xs text-brand-muted border border-brand-border rounded-full px-4 py-1.5 mb-2">
            الخطوة التالية · 6 مراحل تصميم
          </div>
          <h3 className="text-xl font-bold text-brand-text">جاهز لبناء هويتك البصرية؟</h3>
          <p className="text-brand-subtle text-sm">الموجز الإبداعي · لوحة الألوان · أفكار الشعار · السكتشات</p>
          <button
            onClick={onGoToDesignGuide}
            className="btn-primary text-base px-8 py-4 rounded-2xl hover:scale-[1.02] transition-transform shadow-lg shadow-brand-teal/15"
          >
            <Sparkles size={18} />
            انتقل إلى ورشة التصميم
            <ArrowLeft size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
