import Dexie from 'dexie';

const db = new Dexie('NihongoSamuraiDB');

db.version(1).stores({
  vocabularyWords: '++id, level, lesson, japanese, english, createdAt, [level+lesson+japanese]',
  srsProgress: '++id, level, categories, wordId, repetitions, easeFactor, interval, nextReview, lastReviewed, [level+categories+wordId]'
});

/**
 * VocabularyWord Schema:
 * - id: auto-increment
 * - level: string (N5, N4, N3, N2, N1)
 * - lesson: string or null (KANJI, Lesson01, etc.)
 * - japanese: string
 * - english: string
 * - createdAt: ISO timestamp
 */

/**
 * SRSProgress Schema:
 * - id: auto-increment
 * - level: string
 * - categories: comma-separated string (e.g., "KANJI,Lesson01")
 * - wordId: foreign key to vocabularyWords
 * - repetitions: number
 * - easeFactor: number (stored as 2500 = 2.5)
 * - interval: number (days)
 * - nextReview: ISO timestamp or null
 * - lastReviewed: ISO timestamp
 */

export default db;
