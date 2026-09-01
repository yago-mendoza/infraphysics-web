// Lightweight public barrel. Heavy route views are imported directly and lazily
// from App.tsx so adding an export here cannot pull their data into the entry chunk.

export * from './HomeView';
export * from './WritingView';
export * from './AboutView';
export * from './ContactView';
export * from './ThanksView';
