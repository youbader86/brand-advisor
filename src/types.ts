export type Stage = 'intro' | 'quiz' | 'results' | 'design-guide';

export type ArchetypeKey =
  | 'innocent' | 'sage' | 'explorer' | 'rebel' | 'magician' | 'hero'
  | 'lover' | 'jester' | 'everyman' | 'caregiver' | 'ruler' | 'creator';

export interface Archetype {
  key: ArchetypeKey;
  nameAr: string;
  nameEn: string;
  tagline: string;
  description: string;
  quadrant: 'paradise' | 'mark' | 'others' | 'structure';
  color: string;
  examples: string[];
  traits: string[];
}

export interface Question {
  id: number;
  archetype: ArchetypeKey;
  text: string;
}

export interface QuizAnswers {
  [questionId: number]: number;
}

export interface ArchetypeScore {
  archetype: ArchetypeKey;
  score: number;
}

export interface LogoType {
  key: string;
  nameAr: string;
  nameEn: string;
  description: string;
  examples: string[];
  bestFor: string[];
}

export interface LogoRecommendation {
  type: string;
  typeAr: string;
  score: number;
  reason: string;
  designTips: string[];
}

export interface QuizResult {
  coreArchetype: ArchetypeKey;
  edgeArchetype: ArchetypeKey;
  standardArchetype?: ArchetypeKey;
  scores: ArchetypeScore[];
}

export interface BrandInput {
  name: string;
  industry: string;
  audience: string;
  values: string;
  standardArchetype: ArchetypeKey | '';
}

export interface BrandEssence {
  essence: string;
  positioning: string;
  personality: string[];
  brandVoice: string;
  uniqueValue: string;
}

export interface VisualPath {
  title: string;
  description: string;
  mood: string;
  keywords: string[];
  colors: string[];
  fontStyle: string;
}

export interface MoodImage {
  prompt: string;
  descriptionAr: string;
  mood: string;
}

export interface ColorSwatch {
  hex: string;
  nameAr: string;
  rgb: string;
}

export interface ColorPalette {
  primary: ColorSwatch;
  secondary: ColorSwatch;
  accent: ColorSwatch;
  neutral: ColorSwatch;
  background: ColorSwatch;
  rationale: string;
  psychologyNotes: string;
  usage: {
    primary: string;
    secondary: string;
    accent: string;
  };
  combinations: Array<{ bg: string; text: string; label: string }>;
}

export interface CreativeBrief {
  projectOverview: string;
  objective: string;
  targetAudience: string;
  brandPersonality: string;
  toneOfVoice: string;
  colorPsychology: string;
  typographyDirection: string;
  logoDirection: string;
  doList: string[];
  dontList: string[];
  inspirations: string[];
  deliverables: string[];
}

export interface LogoConcept {
  id: number;
  title: string;
  description: string;
  visualElements: string[];
  symbolism: string;
  style: string;
  colorUsage: string;
  typography: string;
}

export interface LogoAnalysis {
  brandEssence: string;
  archetypeInsight: string;
  logoRecommendations: LogoRecommendation[];
  doList: string[];
  dontList: string[];
}
