/**
 * Service for fetching and managing reading content
 * Uses offline-first approach with IndexedDB caching
 */

import { 
  initializeReadingCache, 
  getNextArticle, 
  markArticleAsRead,
  getCacheStatus
} from './readingCacheService';
import { getKanjiReading, hasKanjiReading } from './kanjiReadings';

// JLPT Kanji lists (approximate - can be expanded)
const JLPT_KANJI = {
  N5: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千', '万', '円', '年', '月', '日', '時', '分', '人', '男', '女', '子', '学', '生', '先', '私', '今', '何', '大', '小', '中', '本', '出', '見', '行', '来', '食', '飲', '話', '聞', '読', '書', '買', '売', '会', '作', '入', '外', '国', '語', '天', '気', '雨', '電', '車', '駅', '道', '山', '川', '水', '火', '木', '金', '土', '手', '耳', '目', '口', '足', '上', '下', '左', '右', '前', '後', '北', '南', '東', '西', '高', '安', '新', '古', '白', '赤', '青', '黒'],
  N4: ['色', '頭', '顔', '声', '体', '心', '力', '親', '兄', '姉', '弟', '妹', '家', '族', '主', '夫', '婦', '部', '屋', '台', '所', '風', '呂', '店', '社', '員', '仕', '事', '働', '休', '終', '始', '起', '寝', '朝', '昼', '夜', '午', '週', '曜', '春', '夏', '秋', '冬', '去', '々', '半', '毎', '今', '明', '晩', '方', '同', '間', '場', '所', '近', '遠', '速', '走', '歩', '止', '待', '持', '使', '借', '返', '開', '閉', '立', '座', '住', '洗', '死', '知', '思', '考', '教', '習', '勉', '強', '答', '質', '問', '意', '味', '便', '利', '不', '好', '悪', '美', '元', '暑', '寒', '冷', '温', '暖', '涼', '重', '軽', '多', '少', '早', '遅', '若', '難', '易'],
  N3: ['昔', '最', '初', '全', '部', '他', '別', '特', '違', '帰', '送', '迎', '変', '化', '増', '減', '進', '育', '付', '落', '消', '残', '参', '加', '無', '有', '必', '要', '可', '能', '不', '可', '許', '禁', '止', '確', '認', '絶', '対', '反', '賛', '成', '失', '敗', '成', '功', '試', '験', '努', '力', '経', '験', '関', '係', '接', '触', '連', '絡', '約', '束', '予', '定', '計', '画', '準', '備', '用', '意', '願', '希', '望', '期', '待', '信', '頼', '感', '情', '愛', '怒', '悲', '喜', '困', '迷', '驚', '恐', '怖', '怪', '珍', '奇', '妙', '普', '通', '以', '当', '然', '自', '然', '景', '色', '静', '黙', '静', '騒', '音'],
  N2: ['徐', '段', '階', '順', '序', '位', '置', '状', '態', '条', '件', '限', '程', '度', '的', '比', '較', '差', '似', '等', '均', '平', '均', '標', '準', '基', '準', '基', '礎', '根', '拠', '因', '理', '由', '原', '因', '結', '果', '効', '果', '影', '響', '傾', '向', '性', '質', '値', '価', '格', '費', '用', '負', '担', '支', '払', '収', '入', '得', '損', '益', '財', '産', '資', '源', '材', '料', '製', '品', '商', '貿', '易', '輸', '出', '輸', '入', '法', '律', '規', '則', '制', '度', '政', '治', '経', '済', '文', '化', '歴', '史', '伝', '統', '現', '代', '将', '来', '未'],
  N1: ['暫', '頃', '傾', '概', '況', '域', '範', '囲', '領', '境', '界', '率', '割', '含', '占', '抱', '握', '捉', '把', '施', '措', '置', '処', '理', '解', '析', '評', '価', '批', '判', '推', '測', '仮', '説', '論', '証', '拠', '裏', '背', '景', '趨', '勢', '傾', '向', '普', '及', '拡', '縮', '減', '衰', '退', '廃', '滅', '亡', '興', '盛', '栄', '繁', '昌', '隆', '振', '興', '促', '抑', '奨', '励', '妨', '阻', '障', '遅', '延', '滞', '停', '維', '持', '保', '存', '継', '続', '承', '諾', '拒', '否', '却', '辞', '遠', '慮', '配', '慮', '考', '慮', '検', '討']
};

/**
 * Get all kanji allowed for a specific JLPT level
 * @param {string} level - JLPT level (N5, N4, N3, N2, N1)
 * @returns {Set} Set of allowed kanji characters
 */
export function getAllowedKanji(level) {
  const allowedKanji = new Set();
  
  // Add all kanji from this level and easier levels
  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
  const levelIndex = levels.indexOf(level);
  
  for (let i = 0; i <= levelIndex; i++) {
    JLPT_KANJI[levels[i]].forEach(kanji => allowedKanji.add(kanji));
  }
  
  return allowedKanji;
}

/**
 * Convert kanji to have furigana based on settings
 * @param {string} text - Japanese text
 * @param {string} level - JLPT level
 * @param {boolean} showAllFurigana - If true, show furigana for ALL kanji
 * @returns {string} HTML string with ruby tags for furigana
 */
export function filterKanjiByLevel(text, level, showAllFurigana = false) {
  const allowedKanji = getAllowedKanji(level);
  let result = '';
  
  for (const char of text) {
    // Check if character is kanji (Unicode range)
    const isKanji = char >= '\u4e00' && char <= '\u9faf';
    
    if (isKanji) {
      const isOutsideLevel = !allowedKanji.has(char);
      
      // Add furigana if: kanji is outside level OR showAllFurigana is enabled
      if (isOutsideLevel || showAllFurigana) {
        const reading = getKanjiReading(char);
        if (reading) {
          // Use ruby tag for furigana display
          result += `<ruby>${char}<rt>${reading}</rt></ruby>`;
        } else {
          // No reading available, just show the kanji
          result += char;
        }
      } else {
        result += char;
      }
    } else {
      result += char;
    }
  }
  
  return result;
}

/**
 * Mock data for reading content
 * In production, this would fetch from NHK News Web Easy, Mainichi, Asahi, etc.
 */
const MOCK_ARTICLES = [
  // Sentences
  {
    id: 1,
    title: '今日はいい天気です',
    content: '今日は天気がとてもいいです。空が青くて、雲が少しあります。公園で子供たちが遊んでいます。',
    level: 'N5',
    type: 'sentence',
    source: 'Basic Japanese'
  },
  {
    id: 5,
    title: '朝の習慣',
    content: '私は毎朝六時に起きます。顔を洗って、朝ごはんを食べます。それから学校に行きます。',
    level: 'N5',
    type: 'sentence',
    source: 'Daily Life'
  },
  {
    id: 11,
    title: '週末の計画',
    content: '明日は土曜日です。友達と映画を見に行きます。その後、レストランで晩ごはんを食べます。',
    level: 'N5',
    type: 'sentence',
    source: 'Weekend Plans'
  },
  
  // Paragraphs
  {
    id: 2,
    title: '日本の食べ物',
    content: '日本には美味しい食べ物がたくさんあります。寿司、ラーメン、天ぷらなどが有名です。多くの外国人が日本の料理を食べに来ます。最近は日本食のレストランが世界中で人気になっています。',
    level: 'N4',
    type: 'paragraph',
    source: 'Japanese Culture'
  },
  {
    id: 3,
    title: '東京の交通',
    content: '東京の電車はとても便利です。毎日たくさんの人が電車で通勤しています。朝と夕方の電車はとても混んでいますが、時間通りに来るので便利です。電車の中では静かにすることがマナーです。',
    level: 'N4',
    type: 'paragraph',
    source: 'City Life'
  },
  {
    id: 4,
    title: '日本の四季',
    content: '日本には春、夏、秋、冬の四つの季節があります。春には桜が咲きます。夏は暑くて海に行く人が多いです。秋は紅葉がきれいです。冬は雪が降る地方もあります。それぞれの季節に楽しみがあります。',
    level: 'N3',
    type: 'paragraph',
    source: 'Seasons'
  },
  
  // Full Articles
  {
    id: 6,
    title: '日本の伝統文化：茶道について',
    content: '茶道は日本の伝統的な文化の一つです。茶道では、お茶を入れて飲むだけでなく、その過程全体を大切にします。茶道の歴史は古く、約500年前に始まりました。\n\n茶室は静かで落ち着いた空間です。お客様をもてなす心が最も大切だと言われています。お茶を飲む前に、和菓子を食べます。そして、抹茶という緑のお茶を飲みます。\n\n茶道には多くの決まりがあります。お茶碗の持ち方、お辞儀の仕方、歩き方まで細かく決められています。これらの決まりは、相手を思いやる気持ちから生まれました。\n\n現代でも、多くの日本人が茶道を習っています。外国からも茶道を学びに来る人が増えています。茶道を通じて、日本の心を理解することができます。',
    level: 'N3',
    type: 'full',
    source: 'Cultural Magazine'
  },
  {
    id: 7,
    title: '環境問題：プラスチックごみを減らそう',
    content: '最近、プラスチックごみが大きな問題になっています。海には毎年800万トンものプラスチックが流れ込んでいます。この問題は世界中で深刻になっています。\n\nプラスチックは便利ですが、自然の中ではなかなか分解されません。海に流れたプラスチックは、魚や鳥が食べてしまうことがあります。これは動物たちにとって危険です。\n\n私たちにできることはたくさんあります。買い物の時、エコバッグを使うことができます。ペットボトルの代わりに、水筒を使うこともできます。レストランでは、プラスチックのストローを断ることもできます。\n\n日本では、多くの店でレジ袋が有料になりました。これにより、プラスチックの使用量が減りました。一人一人が小さなことから始めることが大切です。\n\n環境を守るために、今日から行動を始めましょう。未来の地球のために、私たちができることをしていきましょう。',
    level: 'N3',
    type: 'full',
    source: 'Environmental News'
  },
  {
    id: 8,
    title: '働き方改革：日本の新しい働き方',
    content: '日本では今、働き方が大きく変わっています。以前は、会社で長時間働くことが普通でした。しかし、最近では仕事と生活のバランスが重要だと考えられています。\n\nリモートワークが増えています。コロナウイルスの影響で、多くの会社が在宅勤務を導入しました。家で仕事をすることで、通勤時間がなくなり、時間を有効に使えるようになりました。\n\nフレックスタイム制度も人気です。この制度では、社員が自分で勤務時間を決めることができます。朝早く来て早く帰る人もいれば、遅く来て遅く帰る人もいます。\n\n副業を認める会社も増えています。一つの会社だけで働くのではなく、複数の仕事を持つ人が増えています。これにより、様々なスキルを身につけることができます。\n\nこれらの変化により、働く人々の満足度が上がっています。仕事の生産性も向上しています。日本の働き方は、これからもっと多様になっていくでしょう。',
    level: 'N2',
    type: 'full',
    source: 'Business Today'
  },
  {
    id: 9,
    title: '人工知能の発展と社会への影響',
    content: '人工知能（AI）の技術は急速に発展しています。AIは私たちの生活の様々な場面で使われるようになりました。スマートフォンの音声アシスタント、オンラインショッピングの推薦システム、自動運転車など、AIの応用範囲は広がっています。\n\n医療分野でもAIの活用が進んでいます。AIは病気の診断を手助けし、医師の負担を軽減しています。また、新しい薬の開発にもAIが使われています。これにより、より効果的な治療法が見つかる可能性が高まっています。\n\n一方で、AIの発展には課題もあります。AIが人間の仕事を奪うのではないかという懸念があります。また、AIの判断が人間の価値観と合わない場合、どのように対処すべきかという問題もあります。\n\nプライバシーの問題も重要です。AIは大量のデータを必要とします。個人情報の保護と技術の発展のバランスを取ることが求められています。\n\nAIと人間が共存する社会を作るためには、適切なルール作りが必要です。技術の利点を活かしながら、リスクを最小限に抑える努力が続けられています。これからの社会では、AIとどのように付き合っていくかが重要な課題となるでしょう。',
    level: 'N2',
    type: 'full',
    source: 'Technology Review'
  },
  {
    id: 10,
    title: '日本の少子高齢化問題と今後の展望',
    content: '日本は世界で最も高齢化が進んでいる国の一つです。2023年の統計によると、65歳以上の人口が全体の約30%を占めています。同時に出生率は低下し続けており、少子高齢化は日本社会の最も深刻な課題となっています。\n\nこの問題は経済に大きな影響を与えています。労働人口が減少し、社会保障費が増加しています。年金制度や医療保険制度の持続可能性が懸念されています。企業も人材不足に悩んでおり、外国人労働者の受け入れを拡大する動きが見られます。\n\n政府は様々な対策を実施しています。子育て支援の充実、保育所の増設、育児休暇制度の改善などが進められています。また、高齢者が長く働けるよう、定年延長や再雇用制度の整備も行われています。\n\n地方では特に深刻な状況です。若者が都市部に移住し、地方の人口が減少しています。空き家が増え、地域のコミュニティが維持できなくなる場所もあります。地方創生のための様々な取り組みが試みられていますが、効果的な解決策を見つけることは容易ではありません。\n\nテクノロジーの活用も期待されています。介護ロボットや遠隔医療システムなど、技術革新によって高齢者の生活を支援する試みが進んでいます。\n\n少子高齢化は一朝一夕には解決できない複雑な問題です。しかし、社会全体で取り組むことで、持続可能な未来を築くことができるでしょう。多様な働き方の実現、外国人との共生、テクノロジーの活用など、多角的なアプローチが必要とされています。',
    level: 'N1',
    type: 'full',
    source: 'Policy Research'
  },
  {
    id: 12,
    title: '地球温暖化と気候変動対策',
    content: '地球温暖化は現代社会が直面する最も重大な環境問題の一つです。産業革命以降、人間活動による温室効果ガスの排出が増加し、地球の平均気温が上昇しています。この傾向が続けば、今世紀末までに地球の気温は2度以上上昇すると予測されています。\n\n気候変動の影響は既に世界中で観察されています。異常気象の頻度が増加し、洪水、干ばつ、熱波などの自然災害が深刻化しています。海面上昇により、低地の国々や島嶼国は存続の危機に直面しています。また、生態系への影響も深刻で、多くの種が絶滅の危機にさらされています。\n\n国際社会はパリ協定を通じて、気温上昇を1.5度以内に抑える目標を掲げています。各国は温室効果ガスの削減目標を設定し、様々な施策を実施しています。再生可能エネルギーへの転換、省エネルギー技術の開発、森林保護などが進められています。\n\n日本も2050年までにカーボンニュートラルを実現することを宣言しました。太陽光発電や風力発電などの再生可能エネルギーの導入が加速しています。また、電気自動車の普及促進や建物の省エネ化なども推進されています。\n\n企業の役割も重要です。多くの企業がESG（環境・社会・ガバナンス）を重視した経営を行うようになりました。サプライチェーン全体での温室効果ガス削減、循環型経済への移行などが進められています。\n\n個人レベルでも行動が求められています。省エネルギーを心がける、公共交通機関を利用する、地産地消を実践するなど、日常生活での小さな選択が積み重なって大きな変化を生み出します。\n\n気候変動対策は待ったなしの課題です。政府、企業、個人が一体となって取り組むことで、持続可能な未来を実現できるでしょう。技術革新と社会変革を組み合わせた総合的なアプローチが必要とされています。',
    level: 'N1',
    type: 'full',
    source: 'Climate Science Journal'
  }
];

/**
 * Get a random article for the specified level
 * Uses offline-first approach with IndexedDB cache
 * @param {string} level - JLPT level
 * @param {string} contentType - 'sentence', 'paragraph', or 'full'
 * @param {boolean} showAllFurigana - If true, show furigana for ALL kanji
 * @returns {Promise<Object>} Random article from cache
 */
export async function getRandomArticle(level, contentType = 'paragraph', showAllFurigana = false) {
  try {
    // Initialize cache if needed (first time or low on content)
    await initializeReadingCache(level, contentType);
    
    // Get next unread article from cache
    const article = await getNextArticle(level, contentType);
    
    if (!article) {
      console.warn('[ReadingService] No articles available in cache, falling back to mock');
      // Fallback to mock data if cache is empty
      return getFallbackArticle(level, contentType, showAllFurigana);
    }
    
    // Re-filter content if showAllFurigana setting changed
    if (showAllFurigana) {
      article.filteredContent = filterKanjiByLevel(article.content, level, true);
    }
    
    return article;
  } catch (error) {
    console.error('[ReadingService] Error fetching article:', error);
    // Fallback to mock data on error
    return getFallbackArticle(level, contentType, showAllFurigana);
  }
}

/**
 * Fallback to mock articles if cache fails
 */
function getFallbackArticle(level, contentType, showAllFurigana = false) {
  const filtered = MOCK_ARTICLES.filter(article => {
    if (contentType === 'full') return article.type === 'full';
    return article.type === contentType;
  });
  
  if (filtered.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * filtered.length);
  const article = filtered[randomIndex];
  
  return {
    ...article,
    filteredContent: filterKanjiByLevel(article.content, level, showAllFurigana)
  };
}

/**
 * Mark article as read in the cache
 * @param {number} articleId - Article ID from IndexedDB
 */
export async function markAsRead(articleId) {
  if (!articleId) return;
  
  try {
    await markArticleAsRead(articleId);
  } catch (error) {
    console.error('[ReadingService] Error marking article as read:', error);
  }
}

/**
 * Get cache status for display
 * @param {string} level - JLPT level
 * @param {string} contentType - Content type
 * @returns {Promise<Object>} Cache status
 */
export async function getContentCacheStatus(level, contentType) {
  try {
    return await getCacheStatus(level, contentType);
  } catch (error) {
    console.error('[ReadingService] Error getting cache status:', error);
    return { total: 0, unreadCount: 0, readCount: 0, needsRotation: false };
  }
}

/**
 * Fetch reading content for a specific level (DEPRECATED - kept for backward compatibility)
 * @param {string} level - JLPT level
 * @param {string} contentType - 'sentence' or 'paragraph'
 * @returns {Promise<Array>} Array of reading content
 */
export async function fetchReadingContent(level, contentType = 'paragraph') {
  // This function is deprecated but kept for backward compatibility
  // New code should use getRandomArticle instead
  console.warn('[ReadingService] fetchReadingContent is deprecated, use getRandomArticle instead');
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = MOCK_ARTICLES.filter(article => {
        if (contentType === 'full') return true;
        return article.type === contentType;
      });
      resolve(filtered);
    }, 500);
  });
}

/**
 * Future implementation: Scrape NHK News Web Easy
 * This will require a proxy or CORS-enabled endpoint
 */
export async function scrapeNHKNewsWebEasy() {
  // TODO: Implement NHK scraper
  // This would require:
  // 1. Proxy server or CORS-enabled endpoint
  // 2. HTML parsing
  // 3. Article extraction
  throw new Error('NHK scraper not yet implemented');
}
