const fs = require('fs');
const path = require('path');

// Read files and convert to base64
const wrongFlagPath = path.join(__dirname, 'wrong-flag-small.jpg');
const officialFlagPath = path.join(__dirname, 'chrome-extension', 'flag.svg');

const wrongFlagBase64 = fs.readFileSync(wrongFlagPath).toString('base64');
const officialFlagSvg = fs.readFileSync(officialFlagPath, 'utf8');

// Extract just the inner content of the official flag SVG (without the outer <svg> tag)
const officialFlagInner = officialFlagSvg
  .replace(/<svg[^>]*>/, '')
  .replace(/<\/svg>/, '');

// Translations
const translations = {
  en: {
    title: 'Restore Iran Flag',
    subtitle: 'Browser extension for Twitter/X',
    wrongFlag: 'Wrong Flag',
    officialFlag: 'Official Flag',
    tagline: 'Flags Belong to Nations, Not Platforms',
    platforms: 'Available for Chrome • Firefox • Edge • Safari • Android',
    rtl: false
  },
  ar: {
    title: 'استعادة علم إيران',
    subtitle: 'إضافة متصفح لتويتر/إكس',
    wrongFlag: 'علم خاطئ',
    officialFlag: 'العلم الرسمي',
    tagline: 'الأعلام ملك للشعوب، لا للمنصات',
    platforms: 'متاح لـ Chrome • Firefox • Edge • Safari • Android',
    rtl: true
  },
  fa: {
    title: 'بازگردانی پرچم ایران',
    subtitle: 'افزونه مرورگر برای توییتر/ایکس',
    wrongFlag: 'پرچم اشتباه',
    officialFlag: 'پرچم رسمی',
    tagline: 'پرچم‌ها متعلق به ملت‌ها هستند، نه پلتفرم‌ها',
    platforms: 'برای Chrome • Firefox • Edge • Safari • Android',
    rtl: true
  }
};

function generateSvg(lang) {
  const t = translations[lang];
  // For RTL: wrong flag on right, official on left
  // For LTR: wrong flag on left, official on right
  // Box: 380x230, Flag: 340x194 (50% larger), centered
  const leftX = t.rtl ? 750 : 100;   // Wrong flag position
  const rightX = t.rtl ? 100 : 750;  // Official flag position
  const leftLabelX = t.rtl ? 940 : 290;   // Wrong flag label
  const rightLabelX = t.rtl ? 290 : 940;  // Official flag label
  const arrow = t.rtl ? '←' : '→';

  // Checkmark on official flag (bottom-right of official box)
  const checkX = t.rtl ? 330 : 1080;

  // Font family based on language
  const fontFamily = lang === 'fa' ? 'Vazirmatn, sans-serif'
    : lang === 'ar' ? 'Noto Sans Arabic, sans-serif'
    : 'Inter, sans-serif';

  // RTL direction attribute
  const dir = t.rtl ? ' direction="rtl"' : '';

  // Unicode RTL/LTR markers for proper text direction
  const rtlMark = t.rtl ? '\u200F' : '';  // Right-to-left mark

  return `<svg width="1280" height="640" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;family=Vazirmatn:wght@400;500;600;700;800&amp;family=Noto+Sans+Arabic:wght@400;500;600;700;800&amp;display=swap');
    </style>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f0f1a;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#1a1a2e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1280" height="640" fill="url(#bgGradient)"/>

  <text x="640" y="80" font-family="${fontFamily}" font-size="56" font-weight="700" fill="#fff" text-anchor="middle"${dir}>${rtlMark}${t.title}</text>
  <text x="640" y="120" font-family="${fontFamily}" font-size="24" fill="#888" text-anchor="middle"${dir}>${rtlMark}${t.subtitle}</text>

  <!-- Wrong flag box (Lion and Sun flag 1964) - always on left for LTR, right for RTL -->
  <g transform="translate(${leftX}, 140)">
    <rect width="380" height="230" rx="20" fill="#1a1a24" stroke="#333" stroke-width="2"/>
    <!-- Flag centered: (380-340)/2=20, (230-194)/2=18 -->
    <image href="data:image/jpeg;base64,${wrongFlagBase64}" x="20" y="18" width="340" height="194" preserveAspectRatio="xMidYMid slice"/>
    <text x="190" y="115" font-size="180" font-weight="900" fill="rgba(220,53,69,0.5)" text-anchor="middle" dominant-baseline="middle">×</text>
  </g>
  <text x="${leftLabelX}" y="400" font-family="${fontFamily}" font-size="26" font-weight="600" fill="#dc3545" text-anchor="middle"${dir}>${rtlMark}${t.wrongFlag}</text>

  <!-- Arrow -->
  <text x="640" y="270" font-size="80" fill="#239F40" text-anchor="middle">${arrow}</text>

  <!-- Official flag box - always on right for LTR, left for RTL -->
  <g transform="translate(${rightX}, 140)">
    <rect width="380" height="230" rx="20" fill="#1a1a24" stroke="#239F40" stroke-width="3"/>
    <!-- Flag centered: (380-340)/2=20, (230-194)/2=18 -->
    <svg x="20" y="18" width="340" height="194" viewBox="0 5 36 26" preserveAspectRatio="none">
      ${officialFlagInner}
    </svg>
  </g>
  <text x="${rightLabelX}" y="400" font-family="${fontFamily}" font-size="26" font-weight="600" fill="#239F40" text-anchor="middle"${dir}>${rtlMark}${t.officialFlag}</text>

  <!-- Checkmark -->
  <circle cx="${checkX}" cy="345" r="24" fill="#239F40"/>
  <path d="M${checkX - 12},345 L${checkX - 4},353 L${checkX + 12},333" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Tagline -->
  <text x="640" y="480" font-family="${fontFamily}" font-size="36" fill="#fff" text-anchor="middle" font-weight="600"${dir}>${rtlMark}${t.tagline}</text>

  <text x="640" y="530" font-family="${fontFamily}" font-size="20" fill="#666" text-anchor="middle"${dir}>${rtlMark}${t.platforms}</text>

  <text x="640" y="590" font-family="monospace" font-size="22" fill="#444" text-anchor="middle">restoir.yusef.ren</text>
</svg>`;
}

// Generate all language versions
for (const lang of Object.keys(translations)) {
  const svg = generateSvg(lang);
  const suffix = lang === 'en' ? '' : `-${lang}`;
  fs.writeFileSync(path.join(__dirname, `og-image${suffix}.svg`), svg);
  console.log(`Generated og-image${suffix}.svg`);
}
