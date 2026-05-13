# Sarabun Thai Font - Installation Instructions

## Overview
This directory contains the Sarabun Thai font files required for offline support in the QCV application.

## Required Font Files

You need to download the following font files and place them in this directory:

### Regular Weight (400)
- `Sarabun-Regular.woff2`
- `Sarabun-Regular.woff`
- `Sarabun-Regular.ttf`

### Medium Weight (500)
- `Sarabun-Medium.woff2`
- `Sarabun-Medium.woff`
- `Sarabun-Medium.ttf`

### SemiBold Weight (600)
- `Sarabun-SemiBold.woff2`
- `Sarabun-SemiBold.woff`
- `Sarabun-SemiBold.ttf`

### Bold Weight (700)
- `Sarabun-Bold.woff2`
- `Sarabun-Bold.woff`
- `Sarabun-Bold.ttf`

## Download Instructions

### Option 1: Google Fonts (Recommended)
1. Visit: https://fonts.google.com/specimen/Sarabun
2. Click "Download family"
3. Extract the ZIP file
4. Use a font converter (like https://cloudconvert.com/ttf-to-woff2) to convert TTF files to WOFF2 and WOFF formats
5. Copy all font files to this directory

### Option 2: GitHub
1. Visit: https://github.com/cadsondemak/Sarabun
2. Navigate to the fonts folder
3. Download the TTF files
4. Convert to WOFF2 and WOFF formats using a font converter
5. Copy all font files to this directory

### Option 3: FontSquirrel Webfont Generator
1. Download Sarabun TTF files from Google Fonts or GitHub
2. Visit: https://www.fontsquirrel.com/tools/webfont-generator
3. Upload the TTF files
4. Select "Expert" mode and choose formats: TTF, WOFF, WOFF2
5. Download the generated kit
6. Copy the font files to this directory

## Verification

After placing the font files in this directory, the structure should look like:
```
client/public/fonts/
├── README.md (this file)
├── Sarabun-Regular.woff2
├── Sarabun-Regular.woff
├── Sarabun-Regular.ttf
├── Sarabun-Medium.woff2
├── Sarabun-Medium.woff
├── Sarabun-Medium.ttf
├── Sarabun-SemiBold.woff2
├── Sarabun-SemiBold.woff
├── Sarabun-SemiBold.ttf
├── Sarabun-Bold.woff2
├── Sarabun-Bold.woff
└── Sarabun-Bold.ttf
```

## Testing

To verify the fonts are loading correctly:
1. Restart your development server
2. Open the application in a browser
3. Open DevTools (F12)
4. Go to Network tab
5. Filter by "Font" or search for "Sarabun"
6. Reload the page
7. You should see the Sarabun font files being loaded

## Troubleshooting

If fonts are not loading:
1. Clear browser cache
2. Check browser console for errors
3. Verify file paths match exactly (case-sensitive)
4. Ensure all required font files are present
5. Check that files are not corrupted (try opening them)

## Font License

Sarabun is an open-source font available under the SIL Open Font License (OFL).
License: https://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL

You are free to use this font in commercial and non-commercial projects.
