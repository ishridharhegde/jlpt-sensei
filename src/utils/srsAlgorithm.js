/**
 * SM-2 Spaced Repetition Algorithm
 * @param {Object} progress - Current SRS progress for a word
 * @param {number} quality - User rating (1=Again, 3=Hard, 4=Good, 5=Easy)
 * @returns {Object} Updated progress with new interval and next review date
 */
export function calculateNextReview(progress, quality) {
  let { repetitions = 0, easeFactor = 2500, interval = 0 } = progress;
  
  if (quality < 3) {
    // Failed - reset progress
    repetitions = 0;
    interval = 0;
  } else {
    // Success - calculate next interval
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * (easeFactor / 1000));
    }
    
    repetitions++;
    
    // Update ease factor (keep between 1.3 and 2.5)
    easeFactor = Math.max(1300, easeFactor + (100 * (5 - quality - 4)));
  }
  
  // Calculate next review date
  const nextReview = quality < 3 
    ? new Date(Date.now() + 10 * 60 * 1000) // 10 minutes for failed cards
    : new Date(Date.now() + interval * 24 * 60 * 60 * 1000); // Days for successful cards
    
  return { 
    repetitions, 
    easeFactor, 
    interval, 
    nextReview: nextReview.toISOString(),
    lastReviewed: new Date().toISOString()
  };
}

/**
 * Get cards due for review
 * @param {Array} allWords - All vocabulary words
 * @param {Array} progressRecords - SRS progress for words
 * @returns {Object} { dueCards, newCards }
 */
export function getDueCards(allWords, progressRecords) {
  const now = new Date();
  const progressMap = new Map(progressRecords.map(p => [p.wordId, p]));
  
  const dueCards = [];
  const newCards = [];
  
  allWords.forEach(word => {
    const progress = progressMap.get(word.id);
    
    if (!progress) {
      // New card (never reviewed)
      newCards.push(word);
    } else if (progress.nextReview) {
      const nextReviewDate = new Date(progress.nextReview);
      if (nextReviewDate <= now) {
        // Card is due for review
        dueCards.push({ ...word, progress });
      }
    }
  });
  
  return { dueCards, newCards };
}

/**
 * Mix new and due cards for review session
 * @param {Array} dueCards - Cards due for review
 * @param {Array} newCards - New cards never seen
 * @param {number} maxNew - Maximum number of new cards per session (Infinity for unlimited)
 * @returns {Array} Mixed array of cards to review
 */
export function mixCardsForSession(dueCards, newCards, maxNew = 20) {
  const reviewCards = [];
  
  // Add all due cards
  reviewCards.push(...dueCards);
  
  // Add new cards
  if (maxNew === Infinity) {
    // Unlimited mode - add all new cards
    reviewCards.push(...newCards);
  } else {
    // Limited mode - add up to maxNew or 20% of total, whichever is smaller
    const totalCards = dueCards.length + newCards.length;
    const newCardLimit = Math.min(maxNew, Math.ceil(totalCards * 0.2));
    const newCardsToAdd = newCards.slice(0, newCardLimit);
    reviewCards.push(...newCardsToAdd);
  }
  
  // Shuffle array
  for (let i = reviewCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [reviewCards[i], reviewCards[j]] = [reviewCards[j], reviewCards[i]];
  }
  
  return reviewCards;
}
