import { useState } from 'react';
import type {
  Stage, ArchetypeKey, QuizAnswers, QuizResult,
  BrandInput, LogoAnalysis, BrandEssence, VisualPath,
  CreativeBrief, ColorPalette, LogoConcept,
} from './types';
import { ARCHETYPES, QUESTIONS } from './constants';
import IntroScreen from './components/IntroScreen';
import Quiz from './components/Quiz';
import Results from './components/Results';
import DesignGuideTool from './components/DesignGuideTool';

export default function App() {
  const [stage, setStage] = useState<Stage>('intro');
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [logoAnalysis, setLogoAnalysis] = useState<LogoAnalysis | null>(null);
  const [brandInput, setBrandInput] = useState<BrandInput>({
    name: '', industry: '', audience: '', values: '', standardArchetype: '',
  });
  const [brandEssence, setBrandEssence] = useState<BrandEssence | null>(null);
  const [visualPaths, setVisualPaths] = useState<VisualPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<VisualPath | null>(null);
  const [creativeBrief, setCreativeBrief] = useState<CreativeBrief | null>(null);
  const [colorPalette, setColorPalette] = useState<ColorPalette | null>(null);
  const [logoConcepts, setLogoConcepts] = useState<LogoConcept[] | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<LogoConcept | null>(null);
  const [logoSketches, setLogoSketches] = useState<(string | null)[]>([]);

  function computeScores(ans: QuizAnswers): QuizResult {
    const totals: Record<string, number> = {};
    for (const q of QUESTIONS) {
      totals[q.archetype] = (totals[q.archetype] ?? 0) + (ans[q.id] ?? 1);
    }
    const sorted = Object.entries(totals)
      .map(([archetype, score]) => ({ archetype: archetype as ArchetypeKey, score }))
      .sort((a, b) => b.score - a.score);
    return {
      coreArchetype: sorted[0].archetype,
      edgeArchetype: sorted[1].archetype,
      scores: sorted,
    };
  }

  function handleQuizComplete(ans: QuizAnswers) {
    const result = computeScores(ans);
    setAnswers(ans);
    setQuizResult(result);
    setStage('results');
  }

  function handleRestart() {
    setAnswers({});
    setQuizResult(null);
    setLogoAnalysis(null);
    setBrandInput({ name: '', industry: '', audience: '', values: '', standardArchetype: '' });
    setBrandEssence(null);
    setVisualPaths([]);
    setSelectedPath(null);
    setCreativeBrief(null);
    setColorPalette(null);
    setLogoConcepts(null);
    setSelectedConcept(null);
    setLogoSketches([]);
    setStage('intro');
  }

  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg p-8">
        <div className="glass-card rounded-2xl p-10 max-w-lg text-center space-y-4">
          <div className="text-5xl">🔑</div>
          <h2 className="text-2xl font-bold text-brand-teal">مفتاح API غير موجود</h2>
          <p className="text-slate-400 leading-relaxed">
            أضف ملف <code className="text-brand-gold bg-slate-800 px-2 py-1 rounded">.env</code> في جذر المشروع يحتوي على:
          </p>
          <code className="block bg-slate-800 text-brand-teal p-4 rounded-xl text-sm text-left ltr">
            VITE_GEMINI_API_KEY=your_key_here
          </code>
          <p className="text-slate-500 text-sm">ثم أعد تشغيل السيرفر</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg font-arabic">
      {stage === 'intro' && <IntroScreen onStart={() => setStage('quiz')} />}
      {stage === 'quiz' && <Quiz onComplete={handleQuizComplete} onBack={() => setStage('intro')} />}
      {stage === 'results' && quizResult && (
        <Results
          result={quizResult}
          logoAnalysis={logoAnalysis}
          setLogoAnalysis={setLogoAnalysis}
          onGoToDesignGuide={() => setStage('design-guide')}
          onRestart={handleRestart}
        />
      )}
      {stage === 'design-guide' && quizResult && (
        <DesignGuideTool
          quizResult={quizResult}
          brandInput={brandInput} setBrandInput={setBrandInput}
          brandEssence={brandEssence} setBrandEssence={setBrandEssence}
          visualPaths={visualPaths} setVisualPaths={setVisualPaths}
          selectedPath={selectedPath} setSelectedPath={setSelectedPath}
          creativeBrief={creativeBrief} setCreativeBrief={setCreativeBrief}
          colorPalette={colorPalette} setColorPalette={setColorPalette}
          logoConcepts={logoConcepts} setLogoConcepts={setLogoConcepts}
          selectedConcept={selectedConcept} setSelectedConcept={setSelectedConcept}
          logoSketches={logoSketches} setLogoSketches={setLogoSketches}
          onBack={() => setStage('results')}
        />
      )}
    </div>
  );
}
