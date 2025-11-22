# Icon Placeholders

The app requires two icon files for PWA functionality:

- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

## Quick Icon Generation Options

### Option 1: Use an Icon Generator
- Visit https://favicon.io/favicon-generator/
- Create your icon design
- Download and place in `/public/` folder

### Option 2: Use Existing Logo
- Resize your logo to 192x192 and 512x512
- Save as PNG format
- Place in `/public/` folder

### Option 3: Simple Text Icon
- Use any image editor (Photoshop, GIMP, Canva)
- Create 512x512 canvas with background color #3f51b5
- Add Japanese text or symbol
- Export as PNG at both sizes

### Temporary Solution
The app will still work without custom icons - browsers will use default PWA icons. Add proper icons before deploying to production.

## Icon Requirements
- Format: PNG
- Sizes: 192x192 and 512x512 pixels
- Transparent or solid background
- Purpose: any maskable (for Android adaptive icons)
