# Nihongo Samurai - JLPT Study App

A mobile-first React web application for JLPT vocabulary study with Spaced Repetition System (SRS) and offline support.

## Features

- **📱 Mobile-First Design**: Optimized for iOS Safari and Android Chrome
- **🔄 Spaced Repetition System**: SM-2 algorithm for optimal learning
- **💾 Offline Support**: PWA with IndexedDB for offline functionality
- **📊 JLPT Levels**: Study vocabulary for N5, N4, N3, N2, and N1
- **🔗 Google Sheets Integration**: Sync vocabulary from your own spreadsheet
- **🎴 Interactive Flashcards**: Card flip animations and touch-friendly interface
- **📈 Progress Tracking**: Track your learning progress with SRS

## Tech Stack

- **React 18+** - Modern React with hooks
- **Material-UI v5** - Comprehensive UI component library
- **IndexedDB** (Dexie.js) - Offline data storage
- **React Router v6** - Client-side routing
- **PapaParse** - CSV parsing for Google Sheets
- **Framer Motion** - Smooth animations
- **Vite** - Fast build tool
- **PWA** - Progressive Web App with service worker

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Google Sheets Setup

1. Create a Google Sheet with sub-sheets named: **N5**, **N4**, **N3**, **N2**, **N1**

2. Each sub-sheet should have these columns:
   - **Lesson** - Use "KANJI" for kanji words, or "Lesson01", "Lesson02", etc.
   - **Japanese** - The Japanese word/kanji
   - **English** - English translation

3. Make the sheet public:
   - File → Share → Anyone with the link can view

4. Copy the sheet URL and paste it in Settings

5. Configure GIDs (optional):
   - GID 0 = first sheet (N5)
   - GID 1 = second sheet (N4)
   - And so on...

6. Click "Sync Data" to download vocabulary

## Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Main application screens
├── services/           # Business logic and data services
├── utils/             # Utility functions
├── theme.js           # Material-UI theme
├── App.jsx            # Main app component
└── main.jsx           # Entry point
```

## How to Use

### 1. Vocabulary Screen
- Select a JLPT level (N5-N1)
- View statistics for each level

### 2. Category Selection
- Choose which categories to study
- Multi-select support
- Start review session

### 3. SRS Review
- Flashcard interface with flip animation
- Tap to reveal English meaning
- Rate your recall:
  - **Again** (Red) - Forgot completely
  - **Hard** (Orange) - Difficult to remember
  - **Good** (Green) - Remembered correctly
  - **Easy** (Blue) - Very easy to recall

### 4. Settings
- Configure Google Sheets URL
- Sync vocabulary data
- Clear all data (danger zone)

## SRS Algorithm (SM-2)

The app uses the SuperMemo SM-2 algorithm:

- **Quality Ratings**: 1 (Again), 3 (Hard), 4 (Good), 5 (Easy)
- **Intervals**: 1 day → 6 days → progressively longer
- **Ease Factor**: Adjusts based on performance
- **Failed Cards**: Reset and shown again in 10 minutes

## Mobile Optimizations

- Touch-friendly buttons (min 48px height)
- Safe area insets for iOS notch
- Prevents zoom on input focus
- Pull-to-refresh support
- Offline-first architecture
- Progressive Web App (PWA)

## Browser Support

- iOS Safari 12+
- Chrome for Android 80+
- Desktop browsers (Chrome, Firefox, Safari, Edge)

## License

MIT License

