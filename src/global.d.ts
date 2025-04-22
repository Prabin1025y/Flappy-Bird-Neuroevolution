// This tells TypeScript that p5 is available globally
import * as p5Namespace from 'p5';
declare global {
  const p5: typeof p5Namespace;
  const ml5: any; // Add ml5 as a global variable
}