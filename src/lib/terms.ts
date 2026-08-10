export const TERMS = [1, 2, 3] as const;
export type Term = (typeof TERMS)[number];

export const TERM_LABELS: Record<Term, string> = {
  1: "Term 1",
  2: "Term 2",
  3: "Term 3",
};
