import { useState } from 'react';
import { BookOpen, Layers, Users, ArrowLeft } from 'lucide-react';
import { ARCHETYPES, LOGO_TYPES, QUADRANT_LABELS } from '../constants';

interface Props { onStart: () => void }

export default function IntroScreen({ onStart }: Props) {
  const [tab, setTab] = useState<'about' | 'logos' | 'archetypes'>('about');
  const [expandedArchetype, setExpandedArchetype] = useState<string | null>(null);

  const tabs = [
    { key: 'about',      label: 'المنهجية',     icon: BookOpen },
    { key: 'logos',      label: 'أنواع الشعارات', icon: Layers },
    { key: 'archetypes', label: 'الـ 12 شخصية',  icon: Users },
  ] as const;

  const quadrantGroups = {
    paradise: Object.values(ARCHETYPES).filter(a => a.quadrant === 'paradise'),
    mark:     Object.values(ARCHETYPES).filter(a => a.quadrant === 'mark'),
    others:   Object.values(ARCHETYPES).filter(a => a.quadrant === 'others'),
    structure:Object.values(ARCHETYPES).filter(a => a.quadrant === 'structure'),
  };

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-bg grid-bg">
        {/* Geometric accent rings */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[320, 500, 700].map((size, i) => (
            <div
              key={i}
              className="absolute rounded-full pulse-ring"
              style={{
                width: size, height: size,
                top: '50%', left: '30%',
                transform: 'translate(-50%, -50%)',
                border: '1px solid #2dd4bf',
              }}
            />
          ))}
        </div>

        {/* Large faded "12" decoration */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 select-none pointer-events-none font-black text-brand-teal leading-none"
          style={{ fontSize: 'clamp(160px, 22vw, 320px)', opacity: 0.03 }}
        >
          ١٢
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-16">
          {/* Text content — right side in RTL */}
          <div className="flex-1 space-y-7">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 text-xs font-medium text-brand-teal border border-brand-teal/20 bg-brand-teal/5 rounded-full px-4 py-1.5 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
              مستشار الهوية البصرية · Brand Identity Advisor
            </div>

            {/* Headline */}
            <h1 className="font-black leading-tight text-brand-text" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)' }}>
              اكتشف{' '}
              <span className="text-brand-teal relative">
                روح علامتك
                <svg className="absolute -bottom-1 right-0 w-full" height="3" viewBox="0 0 100 3" preserveAspectRatio="none">
                  <line x1="0" y1="1.5" x2="100" y2="1.5" stroke="#2dd4bf" strokeWidth="2" strokeDasharray="4 2" />
                </svg>
              </span>
              <br />وصمّم هويتها البصرية
            </h1>

            {/* Description */}
            <p className="text-brand-subtle text-lg leading-relaxed max-w-lg">
              بناءً على نظرية يونغ في علم النفس التحليلي — اكتشف شخصية علامتك الجوهرية
              وتلقَّ توجيهات احترافية للشعار والهوية البصرية.
            </p>

            {/* CTA */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onStart}
                className="btn-primary text-base px-8 py-4 rounded-2xl hover:scale-[1.02] transition-transform shadow-lg shadow-brand-teal/15"
              >
                ابدأ الاختبار الآن
                <ArrowLeft size={18} />
              </button>
              <span className="text-brand-muted text-sm">مجاني · لا يتطلب تسجيل</span>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-6 pt-2">
              {[
                { value: '48', label: 'سؤالاً' },
                { value: '12', label: 'شخصية يونغ' },
                { value: '10', label: 'دقائق تقريباً' },
                { value: '6',  label: 'مراحل تصميم' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-xl font-black text-brand-text tabular-nums">{s.value}</div>
                  <div className="text-xs text-brand-muted mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual card — left side */}
          <div className="hidden md:block w-64 shrink-0">
            <div className="card rounded-3xl p-6 space-y-3 relative">
              <div className="text-xs text-brand-teal font-medium tracking-wider uppercase mb-4">الشخصيات الـ 12</div>
              {Object.values(ARCHETYPES).slice(0, 6).map(a => (
                <div key={a.key} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: a.color }} />
                  <span className="text-sm text-brand-text">{a.nameAr}</span>
                  <span className="text-xs text-brand-muted mr-auto">{a.nameEn}</span>
                </div>
              ))}
              <div className="border-t border-brand-border my-2" />
              {Object.values(ARCHETYPES).slice(6).map(a => (
                <div key={a.key} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: a.color }} />
                  <span className="text-sm text-brand-text">{a.nameAr}</span>
                  <span className="text-xs text-brand-muted mr-auto">{a.nameEn}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TABS NAV ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-brand-bg/95 backdrop-blur-md border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-0">
            {tabs.map(t => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                    active
                      ? 'border-brand-teal text-brand-teal'
                      : 'border-transparent text-brand-muted hover:text-brand-subtle hover:border-brand-line'
                  }`}
                >
                  <Icon size={15} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── TAB CONTENT ───────────────────────────────────────────── */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">

        {/* About Tab */}
        {tab === 'about' && (
          <div className="fade-in space-y-6">
            <div className="grid md:grid-cols-2 gap-5">
              {/* Jung Theory */}
              <div className="card rounded-2xl p-7 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-xl shrink-0">
                    🧠
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-text text-lg">نظرية كارل يونغ</h3>
                    <p className="text-xs text-brand-teal mt-0.5">Carl Jung · 1875–1961</p>
                  </div>
                </div>
                <p className="text-brand-subtle text-sm leading-relaxed">
                  طوّر الطبيب النفسي السويسري نظرية اللاوعي الجمعي، التي تقول إن هناك نماذج أصيلة
                  متجذرة في الوعي الإنساني عبر كل الثقافات — تُفسّر لماذا نتفاعل مع بعض العلامات
                  بشكل غريزي.
                </p>
              </div>

              {/* Triple Framework */}
              <div className="card rounded-2xl p-7 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-xl shrink-0">
                    🏆
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-text text-lg">الإطار الثلاثي</h3>
                    <p className="text-xs text-brand-gold mt-0.5">Margaret Mark & Carol Pearson</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: 'STANDARD', desc: 'معيار الصناعة — ما يتوقعه العملاء', color: '#64748b' },
                    { label: 'CORE',     desc: 'شخصيتك الجوهرية — ما يميزك', color: '#2dd4bf' },
                    { label: 'EDGE',     desc: 'البُعد الإضافي — ما يُثري شخصيتك', color: '#f59e0b' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: item.color + '0f' }}>
                      <div className="w-1.5 h-8 rounded-full" style={{ background: item.color }} />
                      <div>
                        <span className="text-xs font-bold" style={{ color: item.color }}>{item.label} </span>
                        <span className="text-xs text-brand-subtle">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quadrants */}
            <div className="card rounded-2xl p-7">
              <h3 className="font-bold text-brand-text mb-1">الأرباع الأربعة للدوافع الإنسانية</h3>
              <p className="text-xs text-brand-muted mb-6">تصنيف الـ 12 شخصية وفق دوافعها الجوهرية</p>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(quadrantGroups).map(([key, archs]) => (
                  <div key={key} className="card-elevated rounded-xl p-4">
                    <h4 className="text-xs font-bold text-brand-teal tracking-wider uppercase mb-3">
                      {QUADRANT_LABELS[key]}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {archs.map(a => (
                        <span
                          key={a.key}
                          className="text-xs px-3 py-1 rounded-full font-medium border"
                          style={{ borderColor: a.color + '30', color: a.color, background: a.color + '10' }}
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
              <div key={lt.key} className="card rounded-2xl p-6 space-y-4 hover:border-brand-line transition-colors">
                <div>
                  <h3 className="font-bold text-brand-text text-base">{lt.nameAr}</h3>
                  <p className="text-xs text-brand-teal mt-0.5 tracking-wider uppercase">{lt.nameEn}</p>
                </div>
                <p className="text-brand-subtle text-sm leading-relaxed">{lt.description}</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-brand-muted font-medium mb-2">أمثلة عالمية</p>
                    <div className="flex flex-wrap gap-1.5">
                      {lt.examples.map(e => (
                        <span key={e} className="text-xs bg-brand-elevated border border-brand-line text-brand-subtle px-2.5 py-1 rounded-lg">
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-brand-muted font-medium mb-2">مناسب لـ</p>
                    {lt.bestFor.map(b => (
                      <p key={b} className="text-xs text-brand-subtle flex gap-2 mb-1">
                        <span className="text-brand-teal shrink-0">✓</span> {b}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Archetypes Tab */}
        {tab === 'archetypes' && (
          <div className="fade-in space-y-6">
            {Object.entries(quadrantGroups).map(([qKey, archs]) => (
              <div key={qKey}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-brand-border" />
                  <h3 className="text-xs font-bold text-brand-muted tracking-widest uppercase px-2">
                    {QUADRANT_LABELS[qKey]}
                  </h3>
                  <div className="h-px flex-1 bg-brand-border" />
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  {archs.map(a => (
                    <button
                      key={a.key}
                      onClick={() => setExpandedArchetype(expandedArchetype === a.key ? null : a.key)}
                      className="card rounded-2xl p-5 text-right hover:border-brand-line transition-all duration-200 text-start"
                      style={{ borderColor: expandedArchetype === a.key ? a.color + '40' : undefined }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                          style={{ background: a.color }}
                        />
                        <div className="flex-1 mr-3 text-right">
                          <h4 className="font-bold text-brand-text">{a.nameAr}</h4>
                          <p className="text-xs font-medium mt-0.5" style={{ color: a.color }}>{a.nameEn}</p>
                        </div>
                      </div>
                      <p className="text-xs text-brand-muted italic mb-3 text-right">{a.tagline}</p>

                      {expandedArchetype === a.key && (
                        <div className="mt-3 space-y-3 text-right fade-in border-t border-brand-border pt-3">
                          <p className="text-brand-subtle text-xs leading-relaxed">{a.description}</p>
                          <div className="flex flex-wrap gap-1.5 justify-end">
                            {a.traits.map(t => (
                              <span key={t} className="text-xs px-2 py-0.5 rounded-full"
                                style={{ background: a.color + '18', color: a.color }}>
                                {t}
                              </span>
                            ))}
                          </div>
                          <div>
                            <p className="text-xs text-brand-muted mb-1">أمثلة عالمية</p>
                            <p className="text-xs text-brand-subtle">{a.examples.join(' · ')}</p>
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

        {/* Bottom CTA */}
        <div className="mt-16 border-t border-brand-border pt-12 text-center space-y-4">
          <p className="text-brand-muted text-sm">مستعد لاكتشاف شخصية علامتك؟</p>
          <button
            onClick={onStart}
            className="btn-primary text-base px-10 py-4 rounded-2xl hover:scale-[1.02] transition-transform shadow-lg shadow-brand-teal/15"
          >
            ابدأ اختبار الشخصية
            <ArrowLeft size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
