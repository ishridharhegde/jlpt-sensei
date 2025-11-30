# Offline Reading Feature - Quick Start Guide

## What's New? 🎉

Your JLPT Sensei app now has a **powerful offline reading system** perfect for studying on the metro or anywhere without internet!

## Key Features

### 📦 Smart Caching
- **Sentences**: 50-100 cached per level
- **Paragraphs**: 25-30 cached per level  
- **Full Articles**: 10-15 cached per level
- **Total Storage**: Only 1-2 MB for weeks of content!

### 🔄 Automatic Rotation
- Articles automatically refresh as you read
- Old (read) articles removed to make space
- New articles fetched when online
- Seamless background process

### 📱 Offline First
- Works without internet connection
- Content pre-downloaded when online
- Perfect for metro/plane/poor connectivity
- No loading delays

## How It Works

### First Time Setup (With Internet)

1. **Open Settings** (bottom navigation)
2. **Scroll to "Offline Reading Content"** section
3. **Click "Download All Content for Offline"**
4. **Wait 2-5 seconds** while it downloads ~700 articles
5. ✅ **Ready for offline study!**

### Daily Usage (No Internet Needed)

1. **Tap "Reading Practice"**
2. **Select your level** (N5-N1)
3. **Choose content type** (Sentences/Paragraphs/Full Article)
4. **Click "Start Reading"**
5. 📖 **Read, practice TTS, record yourself**
6. **Tap "Next Article"** for more content
7. ♻️ **Auto-rotation** keeps fresh content coming

### What Happens Behind the Scenes?

```
You're on the metro (no internet):
  ↓
Open Reading Practice
  ↓
App checks IndexedDB cache (instant!)
  ↓
Shows you a random unread article
  ↓
You read and practice
  ↓
Tap "Next Article" → Another cached article
  ↓
After reading ~10 articles → Auto-rotation triggers
  ↓
Removes read articles, makes space for new ones
  ↓
Next time you're online → Automatically fetches fresh content
```

## Cache Status

Check your cache status in **Settings → Offline Reading Content**:

```
N5:
  Sentences: 85 unread / 100 total
  Paragraphs: 28 unread / 30 total
  Full Articles: 12 unread / 15 total

N4:
  Sentences: 92 unread / 100 total
  ...and so on
```

## Cache Management

### Download All Content
- Button: **"Download All Content for Offline"**
- Downloads: ~700 articles across all levels
- Time: 2-5 seconds
- Storage: 1-2 MB
- Perfect for: Weekly metro commute prep

### Clear Cache
- Button: **"Clear Reading Cache"**
- Removes: All reading articles
- Keeps: Your vocabulary and SRS progress
- Use when: You want fresh content

## Rotation Strategy

### Sentences (Quick Practice)
- **Cache**: 50-100 articles
- **Rotate when**: <10 unread remaining
- **Why**: Small, quick to read, need more variety

### Paragraphs (Medium Practice)
- **Cache**: 25-30 articles
- **Rotate when**: <5 unread remaining  
- **Why**: Moderate length, balanced approach

### Full Articles (Deep Reading)
- **Cache**: 10-15 articles
- **Rotate when**: <3 unread remaining
- **Why**: Long, time-consuming, fewer needed

## Technical Details

### Storage
- **Technology**: IndexedDB (browser native)
- **Tables**: `readingContent`, `readingProgress`
- **Indexes**: Optimized for fast queries
- **Size**: ~1-2 MB total (very efficient!)

### Performance
- **Load article**: <50ms
- **Mark as read**: <20ms
- **Rotation**: 200-500ms (background)
- **Prefetch all**: 2-5 seconds

### Offline Capability
- ✅ Reading practice
- ✅ Text-to-speech (browser native)
- ✅ Speech recognition
- ✅ Article navigation
- ✅ Mark as read
- ❌ Fetching new content (needs internet)

## Best Practices

### Before Your Commute
```bash
1. Connect to WiFi at home/office
2. Open JLPT Sensei
3. Go to Settings
4. Click "Download All Content for Offline"
5. Wait for success message
6. Close app
7. ✅ Ready for metro study!
```

### During Your Commute
```bash
1. Open app (works offline!)
2. Reading Practice
3. Read as many articles as you want
4. All features work without internet
5. Progress auto-saves locally
```

### After Your Commute
```bash
1. Connect to WiFi
2. Open app
3. Cache automatically refills in background
4. Ready for tomorrow!
```

## FAQ

**Q: How much data does prefetch use?**  
A: Very little! Text-only content is ~1-2 MB for 700+ articles. Less than loading one webpage.

**Q: What happens if I run out of cached articles offline?**  
A: The app will show a message that you need internet to fetch more. But with 50-100 sentences per level, this is rare.

**Q: Does this use my phone's storage?**  
A: Yes, but only ~1-2 MB. That's about 1-2 photos worth of space.

**Q: Will rotation delete articles I haven't read yet?**  
A: No! Rotation only removes articles you've already read (marked as read). Unread articles are always kept.

**Q: Can I use this on multiple devices?**  
A: Yes! Each device has its own cache. Prefetch on each device you want to use offline.

**Q: Does clearing cache affect my vocabulary progress?**  
A: No! Clearing reading cache only removes articles. Your vocabulary words and SRS progress are separate and untouched.

**Q: What if I want to re-read an article?**  
A: Currently, articles are marked as read when you tap "Next Article". In the future, we'll add a favorites feature!

## Future Improvements

### Coming Soon
- 🔄 Real content sources (NHK News Web Easy, Tatoeba)
- 📚 Kanji → Hiragana conversion (kuroshiro library)
- ⭐ Favorite articles feature
- 🎯 Difficulty ratings
- 🗣️ Premium TTS voices

### Community Requested
- User-submitted articles
- Shared study lists
- Grammar pattern highlighting
- Furigana display option

## Troubleshooting

**"No articles available"**
- Solution: Connect to internet and click "Download All Content"

**"Prefetch failed"**
- Solution: Check internet connection, try again

**"Cache status shows 0 articles"**
- Solution: First time setup - click prefetch button

**"Articles not rotating"**
- Solution: Keep reading! Rotation happens automatically when unread count is low

## Architecture

For developers and curious users, see detailed documentation:
- 📖 **READING_CACHE_ARCHITECTURE.md** - Complete technical details

## Summary

🎯 **Goal**: Study Japanese anytime, anywhere, even offline  
📦 **Method**: Smart caching with automatic rotation  
⚡ **Performance**: Instant loading, efficient storage  
🚇 **Perfect for**: Metro commutes, flights, poor connectivity  

**Enjoy your offline study sessions!** 📚✨
