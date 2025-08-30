# Internationalization (i18n) Guide

## Overview

This app has been designed to be accessible in multiple languages with a focus on icon-based UI elements to minimize language barriers.

## Supported Languages

- **English (en)** - Default language
- **Spanish (es)** - Español
- **French (fr)** - Français
- **Arabic (ar)** - العربية
- **Chinese (zh)** - 中文
- **Hindi (hi)** - हिन्दी
- **Indonesian (id)** - Bahasa Indonesia

## Key Features

### 1. Icon-Based UI
- **Navigation**: Uses universal icons (play, video, school, etc.) instead of text labels
- **Actions**: Previous/Next buttons use chevron icons
- **Status**: Loading states use refresh icons, errors use warning icons
- **Categories**: Video types use appropriate icons (videocam, play-circle, etc.)

### 2. Language Selector
- Accessible from the header on all screens
- Shows current language with flag emoji
- Modal interface for language selection
- Supports RTL languages (Arabic)

### 3. Translation System
- Uses `react-i18next` for translations
- JSON-based translation files
- Interpolation support for dynamic content
- Fallback to English for missing translations

## File Structure

```
i18n/
├── index.js                 # i18n configuration
└── locales/
    ├── en.json             # English translations
    ├── es.json             # Spanish translations
    ├── fr.json             # French translations
    ├── ar.json             # Arabic translations
    ├── zh.json             # Chinese translations
    ├── hi.json             # Hindi translations
    └── id.json             # Indonesian translations

components/
├── IconButton.js           # Reusable icon button component
└── LanguageSelector.js     # Language selection component
```

## Adding New Languages

1. Create a new translation file in `i18n/locales/[language-code].json`
2. Add the language to the `languages` array in `LanguageSelector.js`
3. Update the `locales` section in `app.json`
4. Import the new translation file in `i18n/index.js`

Example for adding German:

```javascript
// i18n/locales/de.json
{
  "app": {
    "name": "Grundlagen BT",
    "subtitle": "Schulungsvideos für Bibelübersetzung"
  }
  // ... rest of translations
}

// LanguageSelector.js
const languages = [
  // ... existing languages
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

// app.json
"locales": {
  // ... existing locales
  "de": "./i18n/locales/de.json"
}
```

## Icon Usage Guidelines

### Universal Icons Used
- **🎓 School** - Education/Training content
- **▶️ Play** - Video playback
- **📹 Videocam** - Video content
- **⏮️ Previous** - Navigation backward
- **⏭️ Next** - Navigation forward
- **📋 List** - Content listing
- **⚠️ Warning** - Error states
- **🔄 Refresh** - Loading states
- **⚙️ Settings** - Configuration
- **🌐 Language** - Language selection

### Icon Accessibility
- All icons include `accessibilityLabel` for screen readers
- Icons are paired with text where context is needed
- Color contrast meets accessibility standards
- Touch targets are appropriately sized (minimum 44x44 points)

## Best Practices

1. **Prefer Icons Over Text**: Use universally recognized icons for common actions
2. **Maintain Context**: Combine icons with minimal text when needed
3. **Consistent Sizing**: Use consistent icon sizes throughout the app
4. **Color Coding**: Use color to enhance icon meaning (red for errors, green for success)
5. **RTL Support**: Ensure proper layout for right-to-left languages
6. **Accessibility**: Always include accessibility labels for screen readers

## Testing

To test the internationalization:

1. **Language Switching**: Use the language selector in the header
2. **RTL Layout**: Test with Arabic language
3. **Long Text**: Test with languages that have longer text strings
4. **Accessibility**: Test with screen readers enabled
5. **Icon Recognition**: Verify icons are universally understandable

## Future Enhancements

- **Auto-detection**: Detect device language on first launch
- **Offline Support**: Bundle translations with the app
- **Dynamic Loading**: Load translations on-demand for large language sets
- **Voice Commands**: Add voice navigation support
- **Gesture Support**: Add gesture-based navigation for accessibility
