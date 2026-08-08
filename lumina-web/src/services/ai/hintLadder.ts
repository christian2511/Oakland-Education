/**
 * The hint ladder.
 *
 * Level 1 asks a question. Each rung gives away a little more. Level 5 exists
 * but is a last resort, and even it describes the route rather than handing
 * over the final value — the student always writes the answer themselves.
 */

export interface Rung {
  hint: string;
  highlight?: { type: string; target: string };
}

export type Ladder = [Rung, Rung, Rung, Rung, Rung];

export const HINT_LADDERS: Record<string, Ladder> = {
  partial_distribution: [
    { hint: 'what else should the 3 multiply?', highlight: { type: 'region', target: 'parentheses' } },
    { hint: 'look at everything inside the parentheses.', highlight: { type: 'region', target: 'parentheses' } },
    {
      hint: 'the number outside needs to multiply both terms inside the parentheses.',
      highlight: { type: 'region', target: 'parentheses' },
    },
    {
      hint: 'multiply the outside number by the first term, then by the second term.',
      highlight: { type: 'token', target: 'coefficient' },
    },
    {
      hint: 'distribute across both terms, then solve the equation you are left with.',
      highlight: { type: 'region', target: 'parentheses' },
    },
  ],

  sign_error: [
    { hint: 'check the sign on that term.', highlight: { type: 'token', target: 'sign' } },
    { hint: 'what happens to a negative when it moves across the equals sign?', highlight: { type: 'token', target: 'sign' } },
    { hint: 'moving a term to the other side flips its sign.', highlight: { type: 'token', target: 'sign' } },
    {
      hint: 'subtracting a negative is the same as adding. rewrite that step with the sign flipped.',
      highlight: { type: 'step', target: 'last' },
    },
    { hint: 'redo that line watching each sign, then finish solving.', highlight: { type: 'step', target: 'last' } },
  ],

  inverse_operation: [
    { hint: 'what would undo that?', highlight: { type: 'token', target: 'operator' } },
    { hint: 'you want the variable on its own — which operation gets it there?', highlight: { type: 'token', target: 'operator' } },
    { hint: 'use the operation that reverses the one in the equation.', highlight: { type: 'token', target: 'operator' } },
    { hint: 'the equation adds, so subtract from both sides. the equation multiplies, so divide.', highlight: { type: 'step', target: 'last' } },
    { hint: 'apply the inverse operation to both sides, then read off the value.', highlight: { type: 'step', target: 'last' } },
  ],

  combine_unlike_terms: [
    { hint: 'can those two terms actually be combined?', highlight: { type: 'token', target: 'terms' } },
    { hint: 'one of them has a variable and one does not.', highlight: { type: 'token', target: 'terms' } },
    { hint: 'only terms with the same variable can be added together.', highlight: { type: 'token', target: 'terms' } },
    { hint: 'leave the constant where it is and combine only the terms that share a variable.', highlight: { type: 'step', target: 'last' } },
    { hint: 'group the variable terms on one side and the constants on the other, then solve.', highlight: { type: 'step', target: 'last' } },
  ],

  order_of_operations: [
    { hint: 'which part should come undone first?', highlight: { type: 'step', target: 'last' } },
    { hint: 'you are working backwards through the operations here.', highlight: { type: 'step', target: 'last' } },
    { hint: 'undo the addition or subtraction before the multiplication.', highlight: { type: 'token', target: 'operator' } },
    { hint: 'clear the constant from that side first, then divide by the coefficient.', highlight: { type: 'token', target: 'coefficient' } },
    { hint: 'work in reverse order: undo what was done last, first.', highlight: { type: 'step', target: 'last' } },
  ],

  divide_one_side: [
    { hint: 'did both sides get the same treatment?', highlight: { type: 'region', target: 'equation' } },
    { hint: 'an equation stays true only while it stays balanced.', highlight: { type: 'region', target: 'equation' } },
    { hint: 'whatever you do to one side, you have to do to the other.', highlight: { type: 'region', target: 'equation' } },
    { hint: 'apply that same operation to the right-hand side as well.', highlight: { type: 'region', target: 'rhs' } },
    { hint: 'rewrite the line operating on both sides, then finish.', highlight: { type: 'step', target: 'last' } },
  ],

  fraction_clearing: [
    { hint: 'what does that denominator need to multiply?', highlight: { type: 'token', target: 'denominator' } },
    { hint: 'look at every term on that side, not just one.', highlight: { type: 'region', target: 'lhs' } },
    { hint: 'multiplying to clear a fraction affects every term in the equation.', highlight: { type: 'region', target: 'equation' } },
    { hint: 'multiply each term on both sides by the denominator.', highlight: { type: 'token', target: 'denominator' } },
    { hint: 'clear the fraction across the whole equation, then solve normally.', highlight: { type: 'step', target: 'last' } },
  ],

  /** Fallback when the engine cannot name a misconception. */
  unknown: [
    { hint: 'walk me back through that step.', highlight: { type: 'step', target: 'last' } },
    { hint: 'compare that line to the one above it — what changed?', highlight: { type: 'step', target: 'last' } },
    { hint: 'something changed between those two lines that should not have.', highlight: { type: 'step', target: 'last' } },
    { hint: 'try that step again, one operation at a time.', highlight: { type: 'step', target: 'last' } },
    { hint: 'start the problem again and narrate each step as you write it.', highlight: { type: 'region', target: 'equation' } },
  ],
};

export const MAX_HINT_LEVEL = 5;

export function rungFor(misconception: string | undefined, level: number): Rung {
  const ladder = HINT_LADDERS[misconception ?? 'unknown'] ?? HINT_LADDERS.unknown;
  const index = Math.min(Math.max(level, 1), MAX_HINT_LEVEL) - 1;
  return ladder[index];
}
