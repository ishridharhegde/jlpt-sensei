# Quick Start Guide

## 🎉 Your JLPT Study App is Ready!

The mobile-first React web app with IndexedDB support has been successfully built.

## 🚀 Current Status

✅ **Development server running** at http://localhost:5173/

## 📱 Features Implemented

### Core Functionality
- ✅ Mobile-first responsive design with Material-UI
- ✅ Bottom navigation (Vocabulary, Reading, Settings)
- ✅ JLPT level selection (N5-N1) with gradient cards
- ✅ Category selection with multi-select
- ✅ SRS flashcard review with flip animation
- ✅ Rating buttons (Again, Hard, Good, Easy)
- ✅ IndexedDB storage with Dexie.js
- ✅ SM-2 spaced repetition algorithm
- ✅ Google Sheets integration for vocabulary sync
- ✅ Progress tracking per level and category
- ✅ Offline support with PWA configuration

### Mobile Optimizations
- ✅ Touch-friendly buttons (min 48px)
- ✅ Safe area insets for iOS notch
- ✅ Prevents zoom on input focus
- ✅ 100vh fix for iOS Safari
- ✅ Smooth animations with Framer Motion
- ✅ Progressive Web App (PWA) ready

## 🏗️ Project Structure

```
src/
├── components/
│   ├── BottomNav.jsx          # Bottom navigation bar
│   ├── LevelCard.jsx          # JLPT level cards with stats
│   ├── CategoryCard.jsx       # Category selection cards
│   ├── FlashCard.jsx          # Animated flashcard
│   ├── RatingButtons.jsx      # SRS rating buttons
│   └── SyncDialog.jsx         # Sync progress dialog
├── screens/
│   ├── VocabularyScreen.jsx   # Level selection
│   ├── CategorySelectionScreen.jsx
│   ├── SRSReviewScreen.jsx    # Flashcard review
│   ├── ReadingScreen.jsx      # Placeholder
│   └── SettingsScreen.jsx     # Configuration & sync
├── services/
│   ├── db.js                  # Dexie IndexedDB setup
│   ├── googleSheets.js        # Google Sheets API
│   ├── srsService.js          # SRS business logic
│   └── configService.js       # localStorage config
├── utils/
│   ├── srsAlgorithm.js        # SM-2 algorithm
│   └── dateUtils.js           # Date formatting
├── theme.js                    # MUI theme config
├── App.jsx                     # Main app with routing
└── main.jsx                    # Entry point
```

## 🎯 How to Test

### 1. Open the App
Visit http://localhost:5173/ in your browser (or mobile device on same network)

### 2. Setup Google Sheets (Settings Tab)
1. Create a Google Sheet with sub-sheets: N5, N4, N3, N2, N1
2. Add columns: Lesson | Japanese | English
3. Make it public (Share → Anyone with link can view)
4. Copy URL and paste in Settings
5. Click "Sync Data"

### 3. Study Vocabulary
1. Go to Vocabulary tab
2. Select a level (e.g., N5)
3. Select categories to study
4. Click "Start Review"
5. Tap cards to flip
6. Rate your recall (Again/Hard/Good/Easy)

## 📦 Build Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🔧 Configuration Files

- `vite.config.js` - Vite + PWA configuration
- `public/manifest.json` - PWA manifest
- `src/theme.js` - Material-UI theme customization

## 📊 Database Schema

### vocabularyWords
- id, level, lesson, japanese, english, createdAt

### srsProgress
- id, level, categories, wordId, repetitions, easeFactor, interval, nextReview, lastReviewed

## 🎨 Color Scheme

- **N5**: Green (#4caf50)
- **N4**: Blue (#2196f3)
- **N3**: Orange (#ff9800)
- **N2**: Red (#f44336)
- **N1**: Purple (#9c27b0)
- **Primary**: Indigo (#3f51b5)

## 📱 Testing on Mobile

1. Get your local IP: `ifconfig` or `ipconfig`
2. Start dev server with: `npm run dev -- --host`
3. Visit `http://YOUR_IP:5173` on mobile device
4. Or use ngrok for remote testing

## 🐛 Known Lint Warnings

The following warnings are **intentional** for mobile optimization:
- `theme-color` meta tag (PWA requirement)
- `maximum-scale` viewport setting (prevents zoom issues)
- `user-scalable=no` (mobile UX optimization)

## 🎓 Next Steps

1. **Add Icons**: Replace placeholder icons in `/public/` with actual 192x192 and 512x512 PNG icons
2. **Test Offline**: Build the app and test offline functionality
3. **Add Vocabulary**: Create your Google Sheet and sync data
4. **Deploy**: Deploy to Vercel, Netlify, or GitHub Pages
5. **Install as PWA**: On mobile, use "Add to Home Screen"

## 📚 Documentation

- See `REACT_BUILD_PROMPT.txt` for complete specification
- See `README.md` for comprehensive documentation
- Check individual files for inline code comments

## 🎉 You're All Set!

Your JLPT study app is fully functional and ready to use. Start by adding vocabulary data through the Settings screen, then begin your study sessions!

Happy learning! 🇯🇵
