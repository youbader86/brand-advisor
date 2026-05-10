import { useState } from 'react';
import { ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react';
import type { QuizAnswers } from '../types';
import { QUESTIONS, ARCHETYPES, SCORE_LABELS } from '../constants';

interface Props {
  onComplete: (answers: QuizAnswers) => void;
  onBack: () => void;
}

export default function Quiz({ onComplete, onBack }: Props) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [hoveredScore, setHoveredScore] = useState<number | null>(null);

  const q = QUESTIONS[Math.min(current, QUESTIONS.length - 1)];
  const archetype = ARCHETYPES[q.archetype];
  const progress = ((current + 1) / QUESTIONS.length) * 100;
  const answered = answers[q.id];
  const isLast = current === QUESTIONS.length - 1;
  const [completing, setCompleting] = useState(false);

  function handleScore(score: number) {
    if (completing) return;
    const newAnswers = { ...answers, [q.id]: score };
    setAnswers(newAnswers);
    if (isLast) {
      setCompleting(true);
      setTimeout(() => onComplete(newAnswers), 400);
    } else {
      setTimeout(() => {
        setCurrent(c => Math.min(c + 1, QUESTIONS.length - 1));
        setHoveredScore(null);
      }, 250);
    }
  }

  function handlePrev() {
    if (current > 0) {
      setCurrent(c => c - 1);
      setHoveredScore(null);
    }
  }

  const completedCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="bg-brand-card border-b border-brand-border px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <button onClick={onBack} className="text-slate-500 hover:text-slate-300 flex items-center gap-1 text-sm transition-colors">
            <ChevronRight size={16} /> العودة
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>السؤال {current + 1} من {QUESTIONS.length}</span>
              <span>{completedCount} مكتمل</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-brand-teal to-teal-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => { setAnswers({}); setCurrent(0); }}
            className="text-slate-600 hover:text-slate-400 transition-colors"
            title="إعادة الاختبار"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Archetype indicator */}
      <div
        className="py-3 px-6 text-center text-sm font-medium transition-all duration-300"
        style={{ background: archetype.color + '15', color: archetype.color }}
      >
        <span className="opacity-60">الفئة: </span>
        {archetype.nameAr} — {archetype.nameEn}
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full space-y-10 fade-in" key={q.id}>
          <div className="text-center space-y-4">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl text-2xl font-black"
              style={{ background: archetype.color + '20', color: archetype.color }}
            >
              {current + 1}
            </div>
            <p className="text-xl md:text-2xl text-white leading-relaxed font-medium max-w-xl mx-auto">
              {q.text}
            </p>
          </div>

          {/* Score buttons */}
          <div className="space-y-3">
            {/* Scale labels */}
            <div className="flex justify-between text-xs text-slate-600 px-1">
              <span>لا يصفنا أبداً</span>
              <span>يصفنا تماماً</span>
            </div>
            <div className="flex gap-2 md:gap-3">
              {[1, 2, 3, 4, 5].map(score => {
                const isSelected = answered === score;
                const isHovered = hoveredScore === score;
                return (
                  <button
                    key={score}
                    onClick={() => handleScore(score)}
                    onMouseEnter={() => setHoveredScore(score)}
                    onMouseLeave={() => setHoveredScore(null)}
                    className={`flex-1 flex flex-col items-center justify-center gap-2 py-4 md:py-5 rounded-2xl border-2 font-bold text-xl transition-all duration-200 ${
                      isSelected
                        ? 'border-brand-teal bg-brand-teal text-slate-900 scale-105 shadow-lg shadow-teal-500/30'
                        : isHovered
                        ? 'border-brand-teal/60 bg-brand-teal/10 text-brand-teal scale-[1.02]'
                        : 'border-brand-border bg-brand-card text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {score}
                    <span className="text-xs font-normal hidden md:block leading-tight text-center opacity-70 w-16">
                      {score === 1 ? 'لا أبداً' : score === 2 ? 'جزئياً' : score === 3 ? 'نعم' : score === 4 ? 'بقوة' : '🎯 نحن!'}
                    </span>
                  </button>
                );
              })}
            </div>
            {/* Tooltip */}
            <div className="text-center h-6">
              {hoveredScore && (
                <span className="text-sm text-slate-400 fade-in">
                  {SCORE_LABELS[hoveredScore]}
                </span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrev}
              disabled={current === 0}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-300 disabled:opacity-30 transition-colors text-sm"
            >
              <ChevronRight size={16} /> السابق
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.ceil(QUESTIONS.length / 4) }, (_, g) => {
                const groupAnswered = QUESTIONS.slice(g * 4, g * 4 + 4).every(q => answers[q.id]);
                const isCurrentGroup = Math.floor(current / 4) === g;
                return (
                  <div
                    key={g}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      groupAnswered ? 'bg-brand-teal w-4' : isCurrentGroup ? 'bg-brand-teal/40 w-4' : 'bg-slate-700 w-2'
                    }`}
                  />
                );
              })}
            </div>
            {answered && !isLast ? (
              <button
                onClick={() => { setCurrent(c => c + 1); setHoveredScore(null); }}
                className="flex items-center gap-2 text-brand-teal hover:text-teal-300 transition-colors text-sm"
              >
                التالي <ChevronLeft size={16} />
              </button>
            ) : (
              <div className="w-16" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
