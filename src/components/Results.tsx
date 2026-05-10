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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setLoading(true);
    setError(null);
    try {
      const analysis = await getLogoAnalysis(result.coreArchetype, result.edgeArchetype);
      setLogoAnalysis(analysis);
    } catch (e: any) {
      setError('حدث خطأ في الاتصال بالذكاء الاصطناعي');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-brand-card border-b border-brand-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={onRestart} className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors">
            <RotateCcw size={15} /> إعادة الاختبار
          </button>
          <h2 className="font-bold text-white">نتائج اختبار الشخصية</h2>
          <button
            onClick={onGoToDesignGuide}
            className="flex items-center gap-2 bg-brand-teal hover:bg-teal-400 text-slate-900 font-bold px-4 py-2 rounded-xl text-sm transition-all"
          >
            ورشة التصميم <ArrowLeft size={15} />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        {/* Core + Edge */}
        <div className="grid md:grid-cols-2 gap-6 fade-in">
          {/* Core */}
          <div
            className="glass-card rounded-3xl p-8 space-y-4 glow-teal"
            style={{ borderColor: core.color + '40' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: core.color + '20', color: core.color }}
              >
                CORE · الشخصية الأساسية
              </div>
            </div>
            <h2 className="text-3xl font-black text-white">{core.nameAr}</h2>
            <p className="text-brand-teal text-sm italic">{core.tagline}</p>
            <p className="text-slate-400 leading-relaxed">{core.description}</p>
            <div className="flex flex-wrap gap-2">
              {core.traits.map(t => (
                <span key={t} className="text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{ background: core.color + '15', color: core.color }}>
                  {t}
                </span>
              ))}
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-2">علامات مماثلة:</p>
              <p className="text-slate-400 text-sm">{core.examples.join(' · ')}</p>
            </div>
          </div>

          {/* Edge */}
          <div
            className="glass-card rounded-3xl p-8 space-y-4"
            style={{ borderColor: edge.color + '30' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: edge.color + '20', color: edge.color }}
              >
                EDGE · الشخصية الداعمة
              </div>
            </div>
            <h2 className="text-3xl font-black text-white">{edge.nameAr}</h2>
            <p className="text-sm italic" style={{ color: edge.color }}>{edge.tagline}</p>
            <p className="text-slate-400 leading-relaxed">{edge.description}</p>
            <div className="flex flex-wrap gap-2">
              {edge.traits.map(t => (
                <span key={t} className="text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{ background: edge.color + '15', color: edge.color }}>
                  {t}
                </span>
              ))}
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/60 text-sm text-slate-400">
              <span className="font-bold text-slate-300">كيف تتكاملان: </span>
              شخصية {core.nameAr} تُشكّل قلب العلامة، بينما تُضيف {edge.nameAr} لمسة من {edge.traits[0]} و{edge.traits[1]} تمنح العلامة عمقاً وتنوعاً.
            </div>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="glass-card rounded-3xl p-8">
          <h3 className="text-lg font-bold text-white mb-6 text-center">توزيع درجات الشخصيات</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="#1e1e2e" />
                <PolarAngleAxis dataKey="archetype" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#13131d', border: '1px solid #1e1e2e', borderRadius: 12, color: '#f8fafc' }}
                  formatter={(v: number) => [`${v} / 20`, 'الدرجة']}
                />
                <Radar dataKey="score" stroke="#2dd4bf" fill="#2dd4bf" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          {/* Score bars */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
            {result.scores.map((s, i) => {
              const a = ARCHETYPES[s.archetype];
              return (
                <div key={s.archetype} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">{a.nameAr}</span>
                    <span className="font-bold" style={{ color: i < 2 ? a.color : '#64748b' }}>{s.score}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(s.score / 20) * 100}%`, background: i < 2 ? a.color : '#334155' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Analysis */}
        <div className="glass-card rounded-3xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles size={20} className="text-brand-teal" />
              تحليل الذكاء الاصطناعي وتوصيات الشعار
            </h3>
            {error && (
              <button onClick={loadAnalysis} className="text-sm text-brand-teal hover:underline">
                إعادة المحاولة
              </button>
            )}
          </div>

          {loading && (
            <div className="flex flex-col items-center gap-4 py-10">
              <div className="w-12 h-12 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">يحلّل الذكاء الاصطناعي شخصية علامتك...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {logoAnalysis && !loading && (
            <div className="space-y-6 fade-in">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-2xl p-4">
                  <p className="text-xs text-brand-teal font-medium mb-2">جوهر العلامة</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{logoAnalysis.brandEssence}</p>
                </div>
                <div className="bg-slate-800/50 rounded-2xl p-4">
                  <p className="text-xs text-brand-teal font-medium mb-2">البصيرة الأرشيتيبية</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{logoAnalysis.archetypeInsight}</p>
                </div>
              </div>

              {/* Logo recommendations */}
              <div>
                <h4 className="text-sm font-bold text-slate-300 mb-4">أنواع الشعارات الموصى بها</h4>
                <div className="space-y-3">
                  {logoAnalysis.logoRecommendations.map((rec, i) => {
                    const lt = LOGO_TYPES.find(l => l.key === rec.type);
                    const isOpen = expanded === rec.type;
                    return (
                      <div key={rec.type} className="border border-brand-border rounded-2xl overflow-hidden">
                        <button
                          className="w-full flex items-center justify-between p-4 hover:bg-slate-800/40 transition-colors"
                          onClick={() => setExpanded(isOpen ? null : rec.type)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold ${
                              i === 0 ? 'bg-brand-teal text-slate-900' : 'bg-slate-700 text-slate-300'
                            }`}>
                              {i + 1}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-white text-sm">{rec.typeAr || lt?.nameAr}</p>
                              <p className="text-xs text-slate-500">{lt?.nameEn}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-left hidden md:block">
                              <div className="flex gap-1 mb-1">
                                {Array.from({ length: 5 }, (_, j) => (
                                  <div key={j} className={`w-2 h-2 rounded-full ${j < Math.round(rec.score / 20) ? 'bg-brand-teal' : 'bg-slate-700'}`} />
                                ))}
                              </div>
                              <p className="text-xs text-slate-500">{rec.score}%</p>
                            </div>
                            <ChevronLeft size={16} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-[-90deg]' : ''}`} />
                          </div>
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 space-y-3 fade-in">
                            <p className="text-slate-400 text-sm leading-relaxed">{rec.reason}</p>
                            <div>
                              <p className="text-xs text-brand-teal font-medium mb-2">نصائح التصميم:</p>
                              <ul className="space-y-1">
                                {rec.designTips.map((tip, j) => (
                                  <li key={j} className="text-sm text-slate-400 flex gap-2">
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
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
                  <p className="text-emerald-400 font-bold text-sm mb-3">✓ يجب أن تفعل</p>
                  <ul className="space-y-2">
                    {logoAnalysis.doList.map((item, i) => (
                      <li key={i} className="text-slate-400 text-sm flex gap-2">
                        <span className="text-emerald-500 shrink-0">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4">
                  <p className="text-red-400 font-bold text-sm mb-3">✗ تجنّب</p>
                  <ul className="space-y-2">
                    {logoAnalysis.dontList.map((item, i) => (
                      <li key={i} className="text-slate-400 text-sm flex gap-2">
                        <span className="text-red-500 shrink-0">✗</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center pb-6">
          <button
            onClick={onGoToDesignGuide}
            className="inline-flex items-center gap-3 bg-gradient-to-l from-brand-teal to-teal-500 hover:from-teal-400 hover:to-teal-300 text-slate-900 font-bold px-10 py-5 rounded-2xl text-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-teal-500/20"
          >
            <Sparkles size={22} />
            انتقل إلى ورشة التصميم الإبداعية
            <ArrowLeft size={18} />
          </button>
          <p className="text-slate-600 text-sm mt-3">بناء الهوية البصرية · الموجز الإبداعي · لوحة الألوان</p>
        </div>
      </div>
    </div>
  );
}
