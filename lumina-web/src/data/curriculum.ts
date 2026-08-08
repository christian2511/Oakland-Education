import type { LearningStyleId, SubjectId } from '@/types/user';

export interface SubjectDef {
  id: SubjectId;
  label: string;
  caption: string;
  grades: number[];
}

/** 0 stands for kindergarten; `gradeLabel` renders it. */
export const KINDERGARTEN = 0;

export const SUBJECTS: SubjectDef[] = [
  {
    id: 'math',
    label: 'math',
    caption: 'equations, reasoning, problem solving',
    grades: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  {
    id: 'english',
    label: 'english',
    caption: 'reading, writing, language',
    grades: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
];

export function gradeLabel(grade: number): string {
  return grade === KINDERGARTEN ? 'kindergarten' : `grade ${grade}`;
}

export interface TopicDef {
  id: string;
  label: string;
  caption: string;
}

const TOPIC_LIBRARY: Record<string, TopicDef> = {
  counting: { id: 'counting', label: 'counting', caption: 'numbers, order and quantity' },
  addition: { id: 'addition', label: 'adding and subtracting', caption: 'putting together and taking apart' },
  placeValue: { id: 'placeValue', label: 'place value', caption: 'tens, hundreds and beyond' },
  multiplication: { id: 'multiplication', label: 'times tables', caption: 'multiplying and dividing' },
  measurement: { id: 'measurement', label: 'measurement', caption: 'length, time, money and data' },
  decimals: { id: 'decimals', label: 'decimals', caption: 'tenths, hundredths and rounding' },
  arithmetic: { id: 'arithmetic', label: 'arithmetic', caption: 'operations and number sense' },
  fractions: { id: 'fractions', label: 'fractions', caption: 'parts, wholes and equivalence' },
  ratios: { id: 'ratios', label: 'ratios', caption: 'rates, proportion and scaling' },
  algebra: { id: 'algebra', label: 'algebra', caption: 'expressions and variables' },
  equations: { id: 'equations', label: 'equations', caption: 'solving for an unknown' },
  geometry: { id: 'geometry', label: 'geometry', caption: 'shape, angle and space' },
  statistics: { id: 'statistics', label: 'statistics', caption: 'data, spread and centre' },
  probability: { id: 'probability', label: 'probability', caption: 'chance and likelihood' },
  functions: { id: 'functions', label: 'functions', caption: 'inputs, outputs and graphs' },
  trigonometry: { id: 'trigonometry', label: 'trigonometry', caption: 'triangles and periodic change' },
  calculus: { id: 'calculus', label: 'calculus', caption: 'rates of change and accumulation' },
  // English
  phonics: { id: 'phonics', label: 'letters and sounds', caption: 'the sounds letters make' },
  earlyReading: { id: 'earlyReading', label: 'early reading', caption: 'sounding out and reading aloud' },
  reading: { id: 'reading', label: 'reading', caption: 'comprehension and close reading' },
  vocabulary: { id: 'vocabulary', label: 'vocabulary', caption: 'word meaning in context' },
  grammar: { id: 'grammar', label: 'grammar', caption: 'sentence structure and usage' },
  writing: { id: 'writing', label: 'writing', caption: 'building and revising a piece' },
  literature: { id: 'literature', label: 'literature', caption: 'theme, character and craft' },
  rhetoric: { id: 'rhetoric', label: 'rhetoric', caption: 'argument and persuasion' },
};

/** Only topics that genuinely belong to the selected grade are offered. */
const MATH_TOPICS_BY_GRADE: Record<number, string[]> = {
  0: ['counting', 'addition', 'measurement'],
  1: ['addition', 'placeValue', 'measurement'],
  2: ['addition', 'placeValue', 'measurement', 'geometry'],
  3: ['multiplication', 'fractions', 'measurement', 'geometry'],
  4: ['multiplication', 'fractions', 'decimals', 'measurement', 'geometry'],
  5: ['arithmetic', 'fractions', 'decimals', 'geometry', 'statistics'],
  6: ['arithmetic', 'fractions', 'ratios', 'algebra', 'statistics'],
  7: ['ratios', 'algebra', 'equations', 'geometry', 'probability', 'statistics'],
  8: ['equations', 'functions', 'geometry', 'statistics', 'probability'],
  9: ['algebra', 'equations', 'functions', 'statistics'],
  10: ['geometry', 'functions', 'trigonometry', 'probability'],
  11: ['functions', 'trigonometry', 'statistics', 'probability'],
  12: ['functions', 'trigonometry', 'calculus', 'statistics'],
};

const ENGLISH_TOPICS_BY_GRADE: Record<number, string[]> = {
  0: ['phonics', 'earlyReading', 'vocabulary'],
  1: ['phonics', 'earlyReading', 'vocabulary', 'writing'],
  2: ['earlyReading', 'vocabulary', 'grammar', 'writing'],
  3: ['reading', 'vocabulary', 'grammar'],
  4: ['reading', 'vocabulary', 'grammar', 'writing'],
  5: ['reading', 'vocabulary', 'grammar', 'writing'],
  6: ['reading', 'vocabulary', 'grammar', 'writing'],
  7: ['reading', 'vocabulary', 'grammar', 'writing', 'literature'],
  8: ['reading', 'grammar', 'writing', 'literature'],
  9: ['reading', 'writing', 'literature', 'rhetoric'],
  10: ['reading', 'writing', 'literature', 'rhetoric'],
  11: ['writing', 'literature', 'rhetoric'],
  12: ['writing', 'literature', 'rhetoric'],
};

export function topicsFor(subject: SubjectId, grade: number): TopicDef[] {
  const ids = subject === 'math' ? MATH_TOPICS_BY_GRADE[grade] : ENGLISH_TOPICS_BY_GRADE[grade];
  return (ids ?? []).map((id) => TOPIC_LIBRARY[id]).filter(Boolean);
}

/* --- honors ---------------------------------------------------------------
   Data-driven, never invented. If a real course does not exist for the
   subject/grade/topic combination, the app does not ask the question.       */

export interface HonorsTrack {
  subject: SubjectId;
  grade: number;
  topics: string[];
  honorsAvailable: boolean;
  honorsName: string;
  description: string;
}

export const HONORS_TRACKS: HonorsTrack[] = [
  {
    subject: 'math',
    grade: 8,
    topics: ['equations', 'functions'],
    honorsAvailable: true,
    honorsName: 'Algebra I (Accelerated)',
    description: 'moves faster and pushes further into multi-step reasoning.',
  },
  {
    subject: 'math',
    grade: 9,
    topics: ['algebra', 'equations', 'functions'],
    honorsAvailable: true,
    honorsName: 'Honors Algebra I',
    description: 'same standards, deeper problems and more proof-style reasoning.',
  },
  {
    subject: 'math',
    grade: 10,
    topics: ['geometry'],
    honorsAvailable: true,
    honorsName: 'Honors Geometry',
    description: 'adds formal proof and heavier construction work.',
  },
  {
    subject: 'math',
    grade: 11,
    topics: ['functions', 'trigonometry'],
    honorsAvailable: true,
    honorsName: 'Honors Algebra II / Trigonometry',
    description: 'extends into modelling and the unit circle in depth.',
  },
  {
    subject: 'math',
    grade: 12,
    topics: ['calculus'],
    honorsAvailable: true,
    honorsName: 'AP Calculus AB',
    description: 'college-level limits, derivatives and integrals.',
  },
  {
    subject: 'english',
    grade: 10,
    topics: ['literature', 'rhetoric'],
    honorsAvailable: true,
    honorsName: 'Honors English 10',
    description: 'a heavier reading load and more analytical writing.',
  },
  {
    subject: 'english',
    grade: 11,
    topics: ['rhetoric', 'writing'],
    honorsAvailable: true,
    honorsName: 'AP English Language & Composition',
    description: 'college-level argument and rhetorical analysis.',
  },
  {
    subject: 'english',
    grade: 12,
    topics: ['literature'],
    honorsAvailable: true,
    honorsName: 'AP English Literature & Composition',
    description: 'college-level literary analysis across periods.',
  },
];

export function honorsFor(subject: SubjectId, grade: number, topic: string | null): HonorsTrack | null {
  return (
    HONORS_TRACKS.find(
      (t) => t.subject === subject && t.grade === grade && t.honorsAvailable && (!topic || t.topics.includes(topic)),
    ) ?? null
  );
}

/* --- learning style -------------------------------------------------------- */

export interface LearningStyleDef {
  id: LearningStyleId;
  label: string;
  caption: string;
}

export const LEARNING_STYLES: LearningStyleDef[] = [
  { id: 'examples', label: 'seeing examples', caption: 'show me one worked through first' },
  { id: 'stepwise', label: 'step-by-step practice', caption: 'walk me through it one piece at a time' },
  { id: 'attempt-first', label: 'trying problems myself', caption: 'let me attempt it before any help' },
  { id: 'explanations', label: 'explanations', caption: 'tell me why it works, then I will try' },
  { id: 'visual', label: 'visual learning', caption: 'diagrams, colour and shape help it land' },
  { id: 'repetition', label: 'repetition', caption: 'the same idea a few times until it sticks' },
  { id: 'mixed', label: 'a mix of everything', caption: 'vary it depending on the problem' },
];
