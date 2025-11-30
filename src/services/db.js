import Dexie from 'dexie';

const db = new Dexie('NihongoSamuraiDB');

db.version(1).stores({
  vocabularyWords: '++id, level, lesson, japanese, english, createdAt, [level+lesson+japanese]',
  srsProgress: '++id, level, categories, wordId, repetitions, easeFactor, interval, nextReview, lastReviewed, [level+categories+wordId]'
});

// Add reading content tables in version 2
db.version(2).stores({
  vocabularyWords: '++id, level, lesson, japanese, english, createdAt, [level+lesson+japanese]',
  srsProgress: '++id, level, categories, wordId, repetitions, easeFactor, interval, nextReview, lastReviewed, [level+categories+wordId]',
  readingContent: '++id, articleId, level, type, title, content, filteredContent, source, createdAt, isRead, isFavorite, [level+type], [level+type+isRead], [isFavorite]',
  readingProgress: '++id, level, type, totalFetched, totalRead, lastFetchedAt, lastRotationAt, [level+type]'
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

/**
 * ReadingContent Schema:
 * - id: auto-increment
 * - articleId: string (unique identifier from source)
 * - level: string (N5, N4, N3, N2, N1)
 * - type: string (sentence, paragraph, full)
 * - title: string
 * - content: string (original content)
 * - filteredContent: string (kanji-filtered content)
 * - source: string (source name)
 * - createdAt: ISO timestamp
 * - isRead: boolean
 * - isFavorite: boolean
 */

/**
 * ReadingProgress Schema:
 * - id: auto-increment
 * - level: string (N5, N4, N3, N2, N1)
 * - type: string (sentence, paragraph, full)
 * - totalFetched: number
 * - totalRead: number
 * - lastFetchedAt: ISO timestamp
 * - lastRotationAt: ISO timestamp
 */

export default db;
