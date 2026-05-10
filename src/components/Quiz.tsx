import { useState } from 'react';
import { ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react';
import type { QuizAnswers } from '../types';
import { QUESTIONS, ARCHETYPES, SCORE_LABELS } from '../constants';

interface Props {
  onComplete: (answers: QuizAnswers) => void;
  onBack: () => void;
}

const SCORE_OPTS = [
  { value: 1, label: 'لا أبداً',    sublabel: 'لا يمثّلنا' },
  { value: 2, label: 'جزئياً',      sublabel: 'أحياناً' },
  { value: 3, label: 'إلى حدٍّ ما', sublabel: 'غالباً' },
  { value: 4, label: 'نعم بقوة',    sublabel: 'يمثّلنا' },
  { value: 5, label: '🎯 نحن!',     sublabel: 'تماماً!' },
];

export default function Quiz({ onComplete, onBack }: Props) {
  const [current, setCurrent]     = useState(0);
  const [answers, setAnswers]     = useState<QuizAnswers>({});
  const [completing, setCompleting] = useState(false);

  const q         = QUESTIONS[Math.min(current, QUESTIONS.length - 1)];
  const archetype = ARCHETYPES[q.archetype];
  const progress  = ((current + 1) / QUESTIONS.length) * 100;
  const answered  = answers[q.id];
  const isLast    = current === QUESTIONS.length - 1;
  const completedCount = Object.keys(answers).length;

  function handleScore(score: number) {
    if (completing) return;
    const newAnswers = { ...answers, [q.id]: score };
    setAnswers(newAnswers);
    if (isLast) {
      setCompleting(true);
      setTimeout(() => onComplete(newAnswers), 450);
    } else {
      setTimeout(() => {
        setCurrent(c => Math.min(c + 1, QUESTIONS.length - 1));
      }, 240);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">

      {/* ── TOP PROGRESS BAR ─────────────────────────────────────── */}
      <div className="relative">
        <div className="h-0.5 bg-brand-border" />
        <div
          className="absolute top-0 right-0 h-0.5 bg-brand-teal transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── NAV BAR ──────────────────────────────────────────────── */}
      <div className="border-b border-brand-border px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-brand-muted hover:text-brand-subtle text-sm transition-colors"
          >
            <ChevronRight size={16} /> العودة
          </button>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-brand-muted">{completedCount} / {QUESTIONS.length}</span>
            <div className="w-px h-4 bg-brand-border" />
            <span className="text-brand-text font-medium">{current + 1}</span>
            <span className="text-brand-muted">من {QUESTIONS.length}</span>
          </div>

          <button
            onClick={() => { setAnswers({}); setCurrent(0); }}
            className="text-brand-muted hover:text-brand-subtle transition-colors"
            title="إعادة الاختبار"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* ── ARCHETYPE STRIP ───────────────────────────────────────── */}
      <div
        className="px-6 py-2.5 border-b border-brand-border flex items-center justify-center gap-2 text-sm"
        style={{ background: archetype.color + '0c' }}
      >
        <div className="w-2 h-2 rounded-full" style={{ background: archetype.color }} />
        <span className="font-medium" style={{ color: archetype.color }}>{archetype.nameAr}</span>
        <span className="text-brand-muted">—</span>
        <span className="text-brand-muted text-xs">{archetype.nameEn}</span>
      </div>

      {/* ── QUESTION AREA ─────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full" key={q.id}>

          {/* Big question number (background decoration) */}
          <div className="relative mb-8">
            <div
              className="absolute -top-6 right-0 font-black leading-none select-none pointer-events-none text-brand-text tabular-nums"
              style={{ fontSize: 'clamp(80px, 14vw, 140px)', opacity: 0.03 }}
            >
              {String(current + 1).padStart(2, '0')}
            </div>

            {/* Question text */}
            <div className="relative slide-up">
              <p
                className="text-xl md:text-2xl font-medium text-brand-text leading-relaxed text-right"
                style={{ textShadow: '0 0 40px rgba(45,212,191,0.05)' }}
              >
                {q.text}
              </p>
            </div>
          </div>

          {/* ── SCORE BUTTONS ────────────────────────────────────── */}
          <div className="grid grid-cols-5 gap-2 md:gap-3 slide-up">
            {SCORE_OPTS.map(opt => {
              const isSelected = answered === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleScore(opt.value)}
                  className={`group flex flex-col items-center gap-2 py-4 md:py-5 rounded-2xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-brand-teal bg-brand-teal text-slate-900 shadow-lg shadow-brand-teal/25 scale-[1.05]'
                      : 'border-brand-border bg-brand-surface text-brand-subtle hover:border-brand-teal/50 hover:bg-brand-teal/5 hover:text-brand-teal hover:scale-[1.02]'
                  }`}
                >
                  <span className={`text-xl font-black ${isSelected ? 'text-slate-900' : ''}`}>
                    {opt.value === 5 ? '★' : opt.value}
                  </span>
                  <span className={`text-xs font-medium text-center leading-tight hidden md:block ${
                    isSelected ? 'text-slate-800' : 'text-brand-muted group-hover:text-brand-teal'
                  }`}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Scale labels for mobile */}
          <div className="flex justify-between text-xs text-brand-muted mt-2 px-1 md:hidden">
            <span>لا أبداً</span>
            <span>يصفنا تماماً</span>
          </div>

          {/* ── NAVIGATION ───────────────────────────────────────── */}
          <div className="flex items-center justify-between mt-10">
            <button
              onClick={() => { if (current > 0) setCurrent(c => c - 1); }}
              disabled={current === 0}
              className="flex items-center gap-1.5 text-brand-muted hover:text-brand-subtle disabled:opacity-20 transition-colors text-sm"
            >
              <ChevronRight size={15} /> السابق
            </button>

            {/* Dot progress */}
            <div className="flex gap-1 items-center">
              {Array.from({ length: Math.min(Math.ceil(QUESTIONS.length / 4), 14) }, (_, g) => {
                const groupAnswered = QUESTIONS.slice(g * 4, g * 4 + 4).every(qq => answers[qq.id]);
                const isCurrent    = Math.floor(current / 4) === g;
                return (
                  <div
                    key={g}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width:   isCurrent ? 20 : groupAnswered ? 6 : 4,
                      height:  isCurrent ? 4  : 4,
                      background: groupAnswered || isCurrent ? '#2dd4bf' : '#1a1a2e',
                      opacity: isCurrent ? 1 : groupAnswered ? 0.7 : 0.4,
                    }}
                  />
                );
              })}
            </div>

            {answered && !isLast ? (
              <button
                onClick={() => setCurrent(c => c + 1)}
                className="flex items-center gap-1.5 text-brand-teal hover:text-teal-300 transition-colors text-sm font-medium"
              >
                التالي <ChevronLeft size={15} />
              </button>
            ) : (
              <div className="w-16" />
            )}
          </div>

          {/* Completing indicator */}
          {completing && (
            <div className="mt-8 flex items-center justify-center gap-2 text-brand-teal fade-in">
              <div className="w-4 h-4 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">يحسب نتائجك...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
