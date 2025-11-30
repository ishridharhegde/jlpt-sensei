/**
 * Reading Cache Service
 * Manages offline storage and rotation of reading content
 */

import db from './db';
import { filterKanjiByLevel } from './readingService';

// Cache configuration
const CACHE_LIMITS = {
  sentence: { min: 50, max: 100, rotateAt: 10 },  // Keep 50-100, rotate when <10 unread
  paragraph: { min: 25, max: 30, rotateAt: 5 },   // Keep 25-30, rotate when <5 unread
  full: { min: 10, max: 15, rotateAt: 3 }         // Keep 10-15, rotate when <3 unread
};

/**
 * Initialize reading cache for a level and content type
 * This is called when user starts a reading session
 */
export async function initializeReadingCache(level, contentType) {
  try {
    console.log(`[ReadingCache] Initializing cache for ${level} - ${contentType}`);
    
    // Check current cache status
    const cacheStatus = await getCacheStatus(level, contentType);
    console.log(`[ReadingCache] Current status:`, cacheStatus);
    
    // If cache is low or empty, fetch new content
    if (cacheStatus.unreadCount < CACHE_LIMITS[contentType].rotateAt) {
      console.log(`[ReadingCache] Cache low (${cacheStatus.unreadCount} unread), fetching new content...`);
      await rotateContent(level, contentType);
    }
    
    return cacheStatus;
  } catch (error) {
    console.error('[ReadingCache] Initialization error:', error);
    throw error;
  }
}

/**
 * Get cache status for a specific level and type
 */
export async function getCacheStatus(level, contentType) {
  const total = await db.readingContent
    .where('level')
    .equals(level)
    .filter(a => a.type === contentType)
    .count();
  
  const unreadCount = await db.readingContent
    .where('level')
    .equals(level)
    .filter(a => a.type === contentType && a.isRead === false)
    .count();
  
  const readCount = total - unreadCount;
  
  return {
    total,
    unreadCount,
    readCount,
    needsRotation: unreadCount < CACHE_LIMITS[contentType].rotateAt
  };
}

/**
 * Rotate content: remove read articles and fetch new ones
 * Note: Favorite articles are never deleted
 */
export async function rotateContent(level, contentType) {
  console.log(`[ReadingCache] Starting rotation for ${level} - ${contentType}`);
  
  try {
    // Step 1: Remove read articles (but keep favorites)
    const readArticles = await db.readingContent
      .where('level')
      .equals(level)
      .filter(a => a.type === contentType && a.isRead === true)
      .toArray();
    
    // Filter out favorites
    const articlesToDelete = readArticles.filter(a => !a.isFavorite);
    
    if (articlesToDelete.length > 0) {
      console.log(`[ReadingCache] Removing ${articlesToDelete.length} read articles (keeping ${readArticles.length - articlesToDelete.length} favorites)`);
      const idsToDelete = articlesToDelete.map(a => a.id);
      await db.readingContent.bulkDelete(idsToDelete);
    }
    
    // Step 2: Check how many unread articles remain
    const remainingCount = await db.readingContent
      .where('level')
      .equals(level)
      .filter(a => a.type === contentType)
      .count();
    
    // Step 3: Fetch new content to fill up to max limit
    const targetCount = CACHE_LIMITS[contentType].max;
    const needToFetch = targetCount - remainingCount;
    
    if (needToFetch > 0) {
      console.log(`[ReadingCache] Fetching ${needToFetch} new articles`);
      const newArticles = await fetchNewContent(level, contentType, needToFetch);
      
      // Store in IndexedDB
      await storeArticles(level, newArticles);
      console.log(`[ReadingCache] Stored ${newArticles.length} new articles`);
    }
    
    // Step 4: Update progress tracking
    await updateProgress(level, contentType);
    
    console.log(`[ReadingCache] Rotation complete`);
  } catch (error) {
    console.error('[ReadingCache] Rotation error:', error);
    throw error;
  }
}

/**
 * Fetch new content from external sources or mock data
 * In production, this would call various APIs (NHK, Mainichi, etc.)
 */
async function fetchNewContent(level, contentType, count) {
  // TODO: In production, fetch from real sources:
  // - NHK News Web Easy
  // - Mainichi Japanese Learning
  // - Asahi Shimbun Easy
  // - Tatoeba sentences
  // - Custom news aggregator
  
  console.log(`[ReadingCache] Fetching ${count} articles from external sources...`);
  
  // For now, generate mock content
  return await generateMockContent(level, contentType, count);
}

/**
 * Generate mock content (placeholder until real API integration)
 */
async function generateMockContent(level, contentType, count) {
  const articles = [];
  const timestamp = new Date().toISOString();
  
  for (let i = 0; i < count; i++) {
    const article = {
      articleId: `${level}-${contentType}-${Date.now()}-${i}`,
      level,
      type: contentType,
      title: generateTitle(level, contentType, i),
      content: generateContent(level, contentType),
      source: selectRandomSource(contentType),
      createdAt: timestamp,
      isRead: false,
      isFavorite: false
    };
    
    articles.push(article);
  }
  
  return articles;
}

/**
 * Generate title based on type and level
 */
function generateTitle(level, contentType, index) {
  const topics = {
    sentence: [
      '今日の予定', '週末の計画', '好きな食べ物', '趣味について', '家族の紹介',
      '日本の天気', '通勤・通学', '友達との約束', '買い物リスト', '休日の過ごし方'
    ],
    paragraph: [
      '日本の伝統文化', '現代の若者', 'テクノロジーと生活', '環境問題', '健康的な生活',
      '日本の教育システム', '都市と田舎', '交通手段の比較', '季節のイベント', '仕事とキャリア'
    ],
    full: [
      '気候変動への対応', 'AI時代の働き方', '少子高齢化社会', '持続可能な社会', 'グローバル化の影響',
      '教育改革の必要性', '地方創生の取り組み', 'デジタル社会の課題', '医療技術の進歩', '文化多様性の尊重'
    ]
  };
  
  const topicList = topics[contentType] || topics.paragraph;
  return topicList[index % topicList.length];
}

/**
 * Generate content based on type and level
 */
function generateContent(level, contentType) {
  const templates = {
    sentence: [
      '今日は{weather}です。{activity}をします。',
      '私は{frequency}{food}を食べます。とても美味しいです。',
      '{time}に{place}へ行きます。{person}と会います。',
      '週末は{activity}をしたいです。楽しみです。',
      '{item}を買いに{place}へ行きました。'
    ],
    paragraph: [
      '日本では{topic}が大切にされています。多くの人が{action}をしています。これは{reason}からです。最近では{trend}も見られます。',
      '{topic}について考えてみましょう。{statement1}。しかし、{statement2}。私たちは{action}することが重要です。',
      '最近、{topic}が注目されています。{reason1}だけでなく、{reason2}も理由の一つです。今後は{future}でしょう。'
    ],
    full: [
      '現代社会において、{topic}は重要な課題となっています。\n\n歴史的に見ると、{history}でした。しかし、時代の変化とともに状況は大きく変わりました。\n\n現在では、{current}という状況です。専門家によると、{expert}とのことです。\n\n今後の展望として、{future1}が期待されています。一方で、{concern}という懸念もあります。\n\n私たち一人一人ができることは{action}です。社会全体で取り組むことで、{result}につながるでしょう。'
    ]
  };
  
  const template = templates[contentType][Math.floor(Math.random() * templates[contentType].length)];
  
  // Fill in the template with random content
  return template
    .replace(/{weather}/g, ['晴れ', '曇り', '雨', 'いい天気'][Math.floor(Math.random() * 4)])
    .replace(/{activity}/g, ['勉強', '運動', '読書', '料理', '掃除'][Math.floor(Math.random() * 5)])
    .replace(/{food}/g, ['寿司', 'ラーメン', 'カレー', 'うどん'][Math.floor(Math.random() * 4)])
    .replace(/{time}/g, ['朝', '昼', '夕方', '夜'][Math.floor(Math.random() * 4)])
    .replace(/{place}/g, ['図書館', '公園', 'デパート', '駅'][Math.floor(Math.random() * 4)])
    .replace(/{person}/g, ['友達', '先生', '家族', '同僚'][Math.floor(Math.random() * 4)])
    .replace(/{frequency}/g, ['毎日', 'よく', '時々', 'たまに'][Math.floor(Math.random() * 4)])
    .replace(/{item}/g, ['本', '服', '食べ物', 'プレゼント'][Math.floor(Math.random() * 4)])
    .replace(/{topic}/g, ['環境保護', '健康', '教育', '文化', '技術'][Math.floor(Math.random() * 5)])
    .replace(/{action}/g, ['努力', '協力', '工夫', '実践'][Math.floor(Math.random() * 4)])
    .replace(/{reason}/g, ['便利', '大切', '必要', '重要'][Math.floor(Math.random() * 4)])
    .replace(/{trend}/g, ['新しい動き', '変化', '改善', '発展'][Math.floor(Math.random() * 4)])
    .replace(/{statement1}/g, ['多くの人がそう考えています', 'これは重要な問題です', '様々な意見があります'][Math.floor(Math.random() * 3)])
    .replace(/{statement2}/g, ['異なる視点もあります', '課題も残っています', '簡単ではありません'][Math.floor(Math.random() * 3)])
    .replace(/{reason1}/g, ['社会的な要請', '技術の進歩', '環境の変化'][Math.floor(Math.random() * 3)])
    .replace(/{reason2}/g, ['経済的な理由', '政策の変更', '国際的な動向'][Math.floor(Math.random() * 3)])
    .replace(/{future}/g, ['さらに重要になる', '大きく変わる', '新しい段階に入る'][Math.floor(Math.random() * 3)])
    .replace(/{history}/g, ['あまり注目されていませんでした', '限られた人々の関心事でした', '今とは全く違う状況でした'][Math.floor(Math.random() * 3)])
    .replace(/{current}/g, ['誰もが関心を持つテーマになっています', '社会全体で取り組む必要があります', '様々な取り組みが行われています'][Math.floor(Math.random() * 3)])
    .replace(/{expert}/g, ['今後10年が重要だ', '継続的な努力が必要だ', '革新的なアプローチが求められている'][Math.floor(Math.random() * 3)])
    .replace(/{future1}/g, ['技術革新', '制度改革', '意識の変化'][Math.floor(Math.random() * 3)])
    .replace(/{concern}/g, ['コストの問題', '時間がかかること', '様々な障壁'][Math.floor(Math.random() * 3)])
    .replace(/{result}/g, ['より良い社会', '持続可能な未来', '大きな成果'][Math.floor(Math.random() * 3)]);
}

/**
 * Select random source name
 */
function selectRandomSource(contentType) {
  const sources = {
    sentence: ['Basic Japanese', 'Daily Conversation', 'JLPT Practice', 'Japanese Pod'],
    paragraph: ['NHK Easy News', 'Mainichi Learning', 'Asahi Shimbun', 'Japanese Stories'],
    full: ['NHK World', 'Japan Times', 'Yomiuri Online', 'Research Papers', 'Cultural Magazine']
  };
  
  const sourceList = sources[contentType] || sources.paragraph;
  return sourceList[Math.floor(Math.random() * sourceList.length)];
}

/**
 * Store articles in IndexedDB with kanji filtering
 */
async function storeArticles(level, articles) {
  const articlesWithFiltering = articles.map(article => ({
    ...article,
    filteredContent: filterKanjiByLevel(article.content, level)
  }));
  
  await db.readingContent.bulkAdd(articlesWithFiltering);
}

/**
 * Update reading progress tracking
 */
async function updateProgress(level, contentType) {
  const now = new Date().toISOString();
  
  const existing = await db.readingProgress
    .where('level')
    .equals(level)
    .filter(p => p.type === contentType)
    .first();
  
  if (existing) {
    await db.readingProgress.update(existing.id, {
      lastFetchedAt: now,
      lastRotationAt: now
    });
  } else {
    await db.readingProgress.add({
      level,
      type: contentType,
      totalFetched: 0,
      totalRead: 0,
      lastFetchedAt: now,
      lastRotationAt: now
    });
  }
}

/**
 * Get next unread article from cache
 */
export async function getNextArticle(level, contentType) {
  // Check if rotation is needed
  const status = await getCacheStatus(level, contentType);
  
  if (status.needsRotation) {
    console.log('[ReadingCache] Triggering background rotation');
    // Don't await - let it happen in background
    rotateContent(level, contentType).catch(err => 
      console.error('[ReadingCache] Background rotation failed:', err)
    );
  }
  
  // Get random unread article
  const unreadArticles = await db.readingContent
    .where('level')
    .equals(level)
    .filter(a => a.type === contentType && a.isRead === false)
    .toArray();
  
  if (unreadArticles.length === 0) {
    console.log('[ReadingCache] No unread articles available');
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * unreadArticles.length);
  return unreadArticles[randomIndex];
}

/**
 * Mark article as read
 */
export async function markArticleAsRead(articleId) {
  const article = await db.readingContent
    .where('id')
    .equals(articleId)
    .first();
  
  if (article) {
    await db.readingContent.update(articleId, { isRead: true });
    
    // Update progress stats
    const progress = await db.readingProgress
      .where(['level', 'type'])
      .equals([article.level, article.type])
      .first();
    
    if (progress) {
      await db.readingProgress.update(progress.id, {
        totalRead: (progress.totalRead || 0) + 1
      });
    }
  }
}

/**
 * Toggle favorite status for an article
 */
export async function toggleFavorite(articleId) {
  const article = await db.readingContent.get(articleId);
  if (article) {
    const newFavoriteStatus = !article.isFavorite;
    await db.readingContent.update(articleId, { 
      isFavorite: newFavoriteStatus 
    });
    return newFavoriteStatus;
  }
  return false;
}

/**
 * Get all favorite articles
 */
export async function getFavoriteArticles() {
  return await db.readingContent
    .where('isFavorite')
    .equals(true)
    .toArray();
}

/**
 * Clear all cached content (for settings/reset)
 * Note: Keeps favorite articles
 */
export async function clearAllCache() {
  // Delete only non-favorite articles
  const nonFavorites = await db.readingContent
    .where('isFavorite')
    .equals(false)
    .toArray();
  
  if (nonFavorites.length > 0) {
    const idsToDelete = nonFavorites.map(a => a.id);
    await db.readingContent.bulkDelete(idsToDelete);
  }
  
  await db.readingProgress.clear();
  console.log('[ReadingCache] Cache cleared (favorites preserved)');
}

/**
 * Get cache statistics for all levels and types
 */
export async function getCacheStatistics() {
  const stats = {};
  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
  const types = ['sentence', 'paragraph', 'full'];
  
  for (const level of levels) {
    stats[level] = {};
    for (const type of types) {
      stats[level][type] = await getCacheStatus(level, type);
    }
  }
  
  return stats;
}

/**
 * Prefetch content for offline use (call when online)
 */
export async function prefetchAllLevels() {
  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
  const types = ['sentence', 'paragraph', 'full'];
  
  for (const level of levels) {
    for (const type of types) {
      try {
        await initializeReadingCache(level, type);
        console.log(`[ReadingCache] Prefetched ${level} - ${type}`);
      } catch (error) {
        console.error(`[ReadingCache] Failed to prefetch ${level} - ${type}:`, error);
      }
    }
  }
  
  console.log('[ReadingCache] Prefetch complete');
}
