import { useState } from 'react';
import { ChevronLeft, BookOpen, Layers, Users, Play } from 'lucide-react';
import { ARCHETYPES, LOGO_TYPES, QUADRANT_LABELS } from '../constants';

interface Props { onStart: () => void }

export default function IntroScreen({ onStart }: Props) {
  const [tab, setTab] = useState<'about' | 'logos' | 'archetypes'>('about');
  const [expandedArchetype, setExpandedArchetype] = useState<string | null>(null);

  const tabs = [
    { key: 'about', label: 'عن المنهجية', icon: BookOpen },
    { key: 'logos', label: 'أنواع الشعارات', icon: Layers },
    { key: 'archetypes', label: 'الشخصيات الـ 12', icon: Users },
  ] as const;

  const quadrantGroups = {
    paradise: Object.values(ARCHETYPES).filter(a => a.quadrant === 'paradise'),
    mark: Object.values(ARCHETYPES).filter(a => a.quadrant === 'mark'),
    others: Object.values(ARCHETYPES).filter(a => a.quadrant === 'others'),
    structure: Object.values(ARCHETYPES).filter(a => a.quadrant === 'structure'),
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#0d1a2d] to-brand-bg pt-16 pb-20 px-6 text-center">
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-5 pulse-ring"
              style={{
                width: `${200 + i * 120}px`, height: `${200 + i * 120}px`,
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                border: '1px solid #2dd4bf',
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-brand-teal/10 border border-brand-teal/20 rounded-full px-4 py-2 text-brand-teal text-sm">
            <span>✦</span> مستشار الهوية البصرية للعلامات التجارية
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight text-white">
            اكتشف <span className="text-brand-teal">روح علامتك</span>
            <br />وصمّم هويتها البصرية
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            استناداً إلى نظرية يونغ في علم النفس التحليلي وأبحاث الهوية البصرية،
            اكتشف الشخصية الجوهرية لعلامتك وتلقَّ توصيات ذكية لشعارها وهويتها.
          </p>
          <button
            onClick={onStart}
            className="inline-flex items-center gap-3 bg-brand-teal hover:bg-teal-400 text-slate-900 font-bold px-8 py-4 rounded-2xl text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-teal-500/25 group"
          >
            <Play size={20} className="group-hover:translate-x-[-2px] transition-transform" />
            ابدأ الاختبار الآن
            <span className="text-sm font-normal opacity-70">48 سؤالاً · 10 دقائق</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">
        <div className="flex gap-2 mb-8 p-1 bg-brand-card rounded-2xl border border-brand-border">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  tab === t.key
                    ? 'bg-brand-teal text-slate-900 shadow-lg shadow-teal-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* About Tab */}
        {tab === 'about' && (
          <div className="fade-in space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <div className="text-3xl">🧠</div>
                <h3 className="text-xl font-bold text-brand-teal">نظرية كارل يونغ</h3>
                <p className="text-slate-400 leading-relaxed">
                  طوّر الطبيب النفسي السويسري كارل يونغ (1875-1961) نظرية اللاوعي الجمعي،
                  التي تقول إن هناك نماذج أصيلة متجذرة في الوعي الإنساني عبر كل الثقافات.
                  هذه النماذج تُفسّر لماذا نتفاعل مع بعض العلامات التجارية بشكل غريزي.
                </p>
              </div>
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <div className="text-3xl">🏆</div>
                <h3 className="text-xl font-bold text-brand-gold">الإطار الثلاثي</h3>
                <p className="text-slate-400 leading-relaxed mb-4">
                  أُبديت فكرة "البطل والمتمرد" من قِبل مارغريت مارك وكارول بيرسون
                  لتجميع الـ 12 شخصية في إطار متكامل يساعد العلامات على تحديد هويتها.
                </p>
                <div className="space-y-3">
                  {[
                    { label: 'STANDARD', desc: 'معيار الصناعة — ما يتوقعه العملاء من مجالك', color: 'border-slate-500 text-slate-300' },
                    { label: 'CORE', desc: 'شخصيتك الجوهرية — ما يميزك عن المنافسين', color: 'border-brand-teal text-brand-teal' },
                    { label: 'EDGE', desc: 'البُعد الإضافي — ما يضيف تنوعاً لشخصيتك', color: 'border-brand-gold text-brand-gold' },
                  ].map(item => (
                    <div key={item.label} className={`border rounded-xl p-3 ${item.color} border-opacity-40`}>
                      <span className="font-bold">{item.label} </span>
                      <span className="text-slate-400 text-sm">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">الأرباع الأربعة للدوافع الإنسانية</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(quadrantGroups).map(([key, archs]) => (
                  <div key={key} className="bg-slate-800/50 rounded-xl p-4">
                    <h4 className="text-brand-teal font-bold mb-3 text-sm">{QUADRANT_LABELS[key]}</h4>
                    <div className="flex flex-wrap gap-2">
                      {archs.map(a => (
                        <span
                          key={a.key}
                          className="text-xs px-3 py-1.5 rounded-full border font-medium"
                          style={{ borderColor: a.color + '50', color: a.color, background: a.color + '15' }}
                        >
                          {a.nameAr}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Logo Types Tab */}
        {tab === 'logos' && (
          <div className="fade-in grid md:grid-cols-2 gap-4">
            {LOGO_TYPES.map(lt => (
              <div key={lt.key} className="glass-card rounded-2xl p-5 space-y-3 hover:border-brand-teal/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white">{lt.nameAr}</h3>
                    <p className="text-brand-teal text-xs">{lt.nameEn}</p>
                  </div>
                </div>
                <p className="text-slate-400 text-sm">{lt.description}</p>
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 font-medium">أمثلة:</p>
                  <div className="flex flex-wrap gap-1">
                    {lt.examples.map(e => (
                      <span key={e} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-lg">{e}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">مناسب لـ:</p>
                  {lt.bestFor.map(b => (
                    <p key={b} className="text-xs text-slate-400 flex gap-1">
                      <span className="text-brand-teal">✓</span> {b}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Archetypes Tab */}
        {tab === 'archetypes' && (
          <div className="fade-in space-y-4">
            {Object.entries(quadrantGroups).map(([qKey, archs]) => (
              <div key={qKey}>
                <h3 className="text-sm font-bold text-slate-500 mb-3 px-1">{QUADRANT_LABELS[qKey]}</h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {archs.map(a => (
                    <button
                      key={a.key}
                      onClick={() => setExpandedArchetype(expandedArchetype === a.key ? null : a.key)}
                      className="glass-card rounded-2xl p-4 text-right hover:border-opacity-40 transition-all duration-200 hover:scale-[1.01]"
                      style={{ borderColor: a.color + '30' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <ChevronLeft
                          size={16}
                          className={`text-slate-500 transition-transform ${expandedArchetype === a.key ? 'rotate-[-90deg]' : ''}`}
                        />
                        <div>
                          <h4 className="font-bold text-white">{a.nameAr}</h4>
                          <p className="text-xs" style={{ color: a.color }}>{a.nameEn}</p>
                        </div>
                      </div>
                      <p className="text-xs text-brand-teal/80 italic mb-2">{a.tagline}</p>
                      {expandedArchetype === a.key && (
                        <div className="mt-3 space-y-3 text-right fade-in">
                          <p className="text-slate-400 text-xs leading-relaxed">{a.description}</p>
                          <div className="flex flex-wrap gap-1 justify-end">
                            {a.traits.map(t => (
                              <span key={t} className="text-xs px-2 py-0.5 rounded-full"
                                style={{ background: a.color + '20', color: a.color }}>
                                {t}
                              </span>
                            ))}
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">أمثلة عالمية:</p>
                            <p className="text-xs text-slate-400">{a.examples.join(' · ')}</p>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <button
            onClick={onStart}
            className="inline-flex items-center gap-3 bg-brand-teal hover:bg-teal-400 text-slate-900 font-bold px-10 py-4 rounded-2xl text-lg transition-all duration-300 hover:scale-105"
          >
            <Play size={20} />
            ابدأ اختبار الشخصية
          </button>
        </div>
      </div>
    </div>
  );
}
