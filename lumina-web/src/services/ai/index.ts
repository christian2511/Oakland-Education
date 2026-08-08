/**
 * AI binding point.
 *
 * The rest of the app imports `tutor` and `recognition` from here and never
 * reaches for a concrete implementation. Pointing these at the real engine is
 * the only change required when it lands.
 */
import { mockTutorService, type TutorService } from './tutor';
import { mockRecognitionService, type RecognitionService } from './recognition';

export const tutor: TutorService = mockTutorService;
export const recognition: RecognitionService = mockRecognitionService;

export type { TutorService } from './tutor';
export type { RecognitionService, SimulationMode } from './recognition';
export { simulateStudentWork } from './recognition';
export { rungFor, MAX_HINT_LEVEL } from './hintLadder';
