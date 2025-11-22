import db from './db';
import { calculateNextReview, getDueCards, mixCardsForSession } from '../utils/srsAlgorithm';
import { getRandomOrderEnabled, getUnlimitedReviews } from './configService';

/**
 * Get all vocabulary words for specific level and categories
 */
export async function getVocabularyWords(level, categories = []) {
  let words;
  
  if (categories.length === 0) {
    words = await db.vocabularyWords.where({ level }).toArray();
  } else {
    words = await db.vocabularyWords
      .where({ level })
      .filter(word => categories.includes(word.lesson))
      .toArray();
  }
  
  // Shuffle words if random order is enabled
  if (getRandomOrderEnabled()) {
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
  }
  
  return words;
}

/**
 * Get SRS progress for specific words
 */
export async function getSRSProgress(level, categories, wordIds) {
  const categoriesKey = categories.sort().join(',');
  
  return db.srsProgress
    .where({ level, categories: categoriesKey })
    .filter(p => wordIds.includes(p.wordId))
    .toArray();
}

/**
 * Get review session cards
 */
export async function getReviewSession(level, categories) {
  const words = await getVocabularyWords(level, categories);
  
  // If unlimited reviews is enabled, return ALL words without SRS filtering
  if (getUnlimitedReviews()) {
    return {
      cards: words,
      stats: {
        total: words.length,
        due: 0,
        new: words.length
      }
    };
  }
  
  // Normal SRS mode - filter by due/new cards
  const wordIds = words.map(w => w.id);
  const progress = await getSRSProgress(level, categories, wordIds);
  
  const { dueCards, newCards } = getDueCards(words, progress);
  
  // If no cards are due and no new cards, allow reviewing all cards
  // This enables reviewing completed lessons anytime
  if (dueCards.length === 0 && newCards.length === 0) {
    return {
      cards: words,
      stats: {
        total: words.length,
        due: 0,
        new: 0
      }
    };
  }
  
  const sessionCards = mixCardsForSession(dueCards, newCards, 20);
  
  return {
    cards: sessionCards,
    stats: {
      total: sessionCards.length,
      due: dueCards.length,
      new: newCards.length
    }
  };
}

/**
 * Update SRS progress after review
 */
export async function updateSRSProgress(wordId, level, categories, quality) {
  const categoriesKey = categories.sort().join(',');
  
  // Get existing progress
  let progress = await db.srsProgress
    .where({ level, categories: categoriesKey, wordId })
    .first();
  
  if (!progress) {
    // Create new progress record
    progress = {
      wordId,
      level,
      categories: categoriesKey,
      repetitions: 0,
      easeFactor: 2500,
      interval: 0,
      nextReview: null,
      lastReviewed: null
    };
  }
  
  // Calculate next review
  const updatedProgress = calculateNextReview(progress, quality);
  
  // Update or insert
  if (progress.id) {
    await db.srsProgress.update(progress.id, {
      ...progress,
      ...updatedProgress
    });
  } else {
    await db.srsProgress.add({
      ...progress,
      ...updatedProgress
    });
  }
  
  return updatedProgress;
}

/**
 * Get statistics for a level
 */
export async function getLevelStats(level) {
  const words = await db.vocabularyWords.where({ level }).toArray();
  const progress = await db.srsProgress.where({ level }).toArray();
  
  const progressMap = new Map(progress.map(p => [p.wordId, p]));
  const now = new Date();
  
  let dueCount = 0;
  let newCount = 0;
  let reviewedCount = 0;
  
  words.forEach(word => {
    const p = progressMap.get(word.id);
    if (!p) {
      newCount++;
    } else {
      reviewedCount++;
      if (p.nextReview && new Date(p.nextReview) <= now) {
        dueCount++;
      }
    }
  });
  
  return {
    total: words.length,
    due: dueCount,
    new: newCount,
    reviewed: reviewedCount
  };
}

/**
 * Get categories for a level with word counts
 */
export async function getCategoriesForLevel(level) {
  const words = await db.vocabularyWords.where({ level }).toArray();
  
  const categoryMap = new Map();
  
  words.forEach(word => {
    const category = word.lesson || 'KANJI';
    categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
  });
  
  return Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => {
      // Sort KANJI first, then by lesson number
      if (a.name === 'KANJI') return -1;
      if (b.name === 'KANJI') return 1;
      return a.name.localeCompare(b.name);
    });
}
