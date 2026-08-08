import type { Lesson, Problem, Standard } from './types';
import type { MisconceptionInfo } from './types';

/**
 * California Common Core State Standards for Mathematics (CA CCSSM).
 *
 * Grade 7 Expressions & Equations is the anchor for this first content area;
 * 6.EE and 8.EE bracket it for the review and challenge stages.
 */
export const STANDARDS: Record<string, Standard> = {
  '6.EE.B.7': {
    code: '6.EE.B.7',
    domain: 'Expressions & Equations',
    description:
      'Solve real-world and mathematical problems by writing and solving equations of the form x + p = q and px = q for cases in which p, q and x are all nonnegative rational numbers.',
  },
  '7.EE.A.1': {
    code: '7.EE.A.1',
    domain: 'Expressions & Equations',
    description:
      'Apply properties of operations as strategies to add, subtract, factor, and expand linear expressions with rational coefficients.',
  },
  '7.EE.B.4a': {
    code: '7.EE.B.4a',
    domain: 'Expressions & Equations',
    description:
      'Solve word problems leading to equations of the form px + q = r and p(x + q) = r, where p, q, and r are specific rational numbers. Solve equations of these forms fluently.',
  },
  '7.NS.A.1': {
    code: '7.NS.A.1',
    domain: 'The Number System',
    description:
      'Apply and extend previous understandings of addition and subtraction to add and subtract rational numbers, including negative numbers.',
  },
  '8.EE.C.7b': {
    code: '8.EE.C.7b',
    domain: 'Expressions & Equations',
    description:
      'Solve linear equations with rational number coefficients, including equations whose solutions require expanding expressions using the distributive property and collecting like terms.',
  },
};

/**
 * Grade 7 equations — Lumina's first content area.
 *
 * Each problem carries the misconceptions it is built to surface, so the
 * tutoring engine has a target to compare the student's working against
 * rather than only a final answer to mark.
 */

export const MISCONCEPTIONS: Record<string, MisconceptionInfo> = {
  partial_distribution: {
    id: 'partial_distribution',
    label: 'distribution',
    description: 'multiplies the first term inside the parentheses but not the rest.',
  },
  sign_error: {
    id: 'sign_error',
    label: 'negative signs',
    description: 'drops or flips a negative when moving a term across the equals sign.',
  },
  inverse_operation: {
    id: 'inverse_operation',
    label: 'inverse operations',
    description: 'applies the same operation to both sides instead of the inverse one.',
  },
  combine_unlike_terms: {
    id: 'combine_unlike_terms',
    label: 'like terms',
    description: 'adds a constant to a variable term as though they were alike.',
  },
  order_of_operations: {
    id: 'order_of_operations',
    label: 'order of operations',
    description: 'undoes multiplication before addition when solving.',
  },
  divide_one_side: {
    id: 'divide_one_side',
    label: 'balancing',
    description: 'operates on one side of the equation only.',
  },
  fraction_clearing: {
    id: 'fraction_clearing',
    label: 'clearing fractions',
    description: 'multiplies only one term by the denominator.',
  },
};

const P = (p: Problem): Problem => p;

/* --- problem bank (14 problems) ------------------------------------------- */

const oneStep: Problem[] = [
  P({
    id: 'g7-eq-01',
    standard: STANDARDS['6.EE.B.7'],
    prompt: 'solve for x',
    expression: 'x + 9 = 17',
    skill: 'one_step_equations',
    answer: 'x = 8',
    steps: ['subtract 9 from both sides', 'x = 8'],
    targets: ['inverse_operation'],
  }),
  P({
    id: 'g7-eq-02',
    standard: STANDARDS['6.EE.B.7'],
    prompt: 'solve for x',
    expression: '6x = 42',
    skill: 'one_step_equations',
    answer: 'x = 7',
    steps: ['divide both sides by 6', 'x = 7'],
    targets: ['divide_one_side'],
  }),
  P({
    id: 'g7-eq-03',
    standard: STANDARDS['7.NS.A.1'],
    prompt: 'solve for n',
    expression: 'n − 12 = −4',
    skill: 'one_step_equations',
    answer: 'n = 8',
    steps: ['add 12 to both sides', 'n = 8'],
    targets: ['sign_error'],
  }),
];

const twoStep: Problem[] = [
  P({
    id: 'g7-eq-04',
    standard: STANDARDS['7.EE.B.4a'],
    prompt: 'solve for x',
    expression: '4x + 7 = 31',
    skill: 'two_step_equations',
    answer: 'x = 6',
    steps: ['subtract 7 from both sides', '4x = 24', 'divide both sides by 4', 'x = 6'],
    targets: ['order_of_operations', 'combine_unlike_terms'],
  }),
  P({
    id: 'g7-eq-05',
    standard: STANDARDS['7.EE.B.4a'],
    prompt: 'solve for y',
    expression: '9y − 5 = 40',
    skill: 'two_step_equations',
    answer: 'y = 5',
    steps: ['add 5 to both sides', '9y = 45', 'divide both sides by 9', 'y = 5'],
    targets: ['sign_error', 'order_of_operations'],
  }),
  P({
    id: 'g7-eq-06',
    standard: STANDARDS['7.EE.B.4a'],
    prompt: 'solve for x',
    expression: 'x/3 + 2 = 11',
    skill: 'two_step_equations',
    answer: 'x = 27',
    steps: ['subtract 2 from both sides', 'x/3 = 9', 'multiply both sides by 3', 'x = 27'],
    targets: ['inverse_operation', 'fraction_clearing'],
  }),
];

const distribution: Problem[] = [
  P({
    id: 'g7-eq-07',
    standard: STANDARDS['7.EE.B.4a'],
    prompt: 'solve for x',
    expression: '3(x + 4) = 21',
    skill: 'distribution',
    answer: 'x = 3',
    steps: ['distribute the 3 to both terms', '3x + 12 = 21', 'subtract 12 from both sides', '3x = 9', 'x = 3'],
    targets: ['partial_distribution'],
  }),
  P({
    id: 'g7-eq-08',
    standard: STANDARDS['7.EE.B.4a'],
    prompt: 'solve for x',
    expression: '5(x − 2) = 35',
    skill: 'distribution',
    answer: 'x = 9',
    steps: ['distribute the 5 to both terms', '5x − 10 = 35', 'add 10 to both sides', '5x = 45', 'x = 9'],
    targets: ['partial_distribution', 'sign_error'],
  }),
  P({
    id: 'g7-eq-09',
    standard: STANDARDS['7.NS.A.1'],
    prompt: 'solve for m',
    expression: '−2(m + 6) = 8',
    skill: 'distribution',
    answer: 'm = −10',
    steps: ['distribute the −2 to both terms', '−2m − 12 = 8', 'add 12 to both sides', '−2m = 20', 'm = −10'],
    targets: ['sign_error', 'partial_distribution'],
  }),
  P({
    id: 'g7-eq-10',
    standard: STANDARDS['7.EE.B.4a'],
    prompt: 'solve for x',
    expression: '4(2x + 1) = 28',
    skill: 'distribution',
    answer: 'x = 3',
    steps: ['distribute the 4', '8x + 4 = 28', 'subtract 4 from both sides', '8x = 24', 'x = 3'],
    targets: ['partial_distribution'],
  }),
];

const multiStep: Problem[] = [
  P({
    id: 'g7-eq-11',
    standard: STANDARDS['7.EE.A.1'],
    prompt: 'solve for x',
    expression: '2x + 3x − 4 = 21',
    skill: 'multi_step_equations',
    answer: 'x = 5',
    steps: ['combine like terms', '5x − 4 = 21', 'add 4 to both sides', '5x = 25', 'x = 5'],
    targets: ['combine_unlike_terms'],
  }),
  P({
    id: 'g7-eq-12',
    standard: STANDARDS['8.EE.C.7b'],
    prompt: 'solve for x',
    expression: '7x − 3 = 4x + 12',
    skill: 'variables_both_sides',
    answer: 'x = 5',
    steps: ['subtract 4x from both sides', '3x − 3 = 12', 'add 3 to both sides', '3x = 15', 'x = 5'],
    targets: ['divide_one_side', 'sign_error'],
  }),
  P({
    id: 'g7-eq-13',
    standard: STANDARDS['8.EE.C.7b'],
    prompt: 'solve for x',
    expression: '2(x + 5) = 3x − 1',
    skill: 'variables_both_sides',
    answer: 'x = 11',
    steps: ['distribute the 2', '2x + 10 = 3x − 1', 'subtract 2x from both sides', '10 = x − 1', 'x = 11'],
    targets: ['partial_distribution', 'sign_error'],
  }),
  P({
    id: 'g7-eq-14',
    standard: STANDARDS['8.EE.C.7b'],
    prompt: 'solve for x',
    expression: '6(x − 1) = 2(x + 7)',
    skill: 'variables_both_sides',
    answer: 'x = 5',
    steps: [
      'distribute on both sides',
      '6x − 6 = 2x + 14',
      'subtract 2x from both sides',
      '4x − 6 = 14',
      '4x = 20',
      'x = 5',
    ],
    targets: ['partial_distribution', 'divide_one_side'],
  }),
];

/* --- lessons on the path --------------------------------------------------- */

export const LESSONS: Lesson[] = [
  {
    id: 'diagnostic',
    title: 'where you are',
    subtitle: 'a short look at what you already know',
    kind: 'diagnostic',
    accent: 'diagnostic',
    points: 30,
    problems: [oneStep[0], twoStep[0], distribution[0], multiStep[1]],
  },
  {
    id: 'l-one-step',
    title: 'one-step equations',
    subtitle: 'undoing a single operation',
    kind: 'lesson',
    accent: 'lesson',
    points: 20,
    problems: oneStep,
  },
  {
    id: 'l-two-step',
    title: 'two-step equations',
    subtitle: 'working backwards, in order',
    kind: 'lesson',
    accent: 'lesson',
    points: 25,
    problems: twoStep,
  },
  {
    id: 'p-balance',
    title: 'keeping the balance',
    subtitle: 'practice',
    kind: 'practice',
    accent: 'practice',
    points: 15,
    problems: [oneStep[1], twoStep[1], twoStep[2]],
  },
  {
    id: 'l-distribution',
    title: 'distribution',
    subtitle: 'multiplying across parentheses',
    kind: 'lesson',
    accent: 'lesson',
    points: 25,
    problems: distribution,
  },
  {
    id: 'r-signs',
    title: 'negative signs',
    subtitle: 'review',
    kind: 'review',
    accent: 'review',
    points: 15,
    problems: [oneStep[2], distribution[2]],
  },
  {
    id: 'c-checkpoint',
    title: 'checkpoint',
    subtitle: 'everything so far',
    kind: 'checkpoint',
    accent: 'checkpoint',
    points: 40,
    problems: [distribution[0], twoStep[0], multiStep[0]],
  },
  {
    id: 'l-multi-step',
    title: 'multi-step equations',
    subtitle: 'combining before you solve',
    kind: 'lesson',
    accent: 'lesson',
    points: 30,
    problems: multiStep,
  },
  {
    id: 'ch-both-sides',
    title: 'variables on both sides',
    subtitle: 'challenge',
    kind: 'challenge',
    accent: 'challenge',
    points: 50,
    problems: [multiStep[2], multiStep[3]],
  },
];

export function lessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export const ALL_PROBLEMS: Problem[] = [...oneStep, ...twoStep, ...distribution, ...multiStep];
