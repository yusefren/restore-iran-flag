const fs = require('fs');
const path = require('path');
const Mustache = require('mustache');
const archiver = require('archiver');

const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
const template = fs.readFileSync('template.html', 'utf8');
const safariTemplate = fs.readFileSync('safari-instructions-template.html', 'utf8');
const userscriptTemplate = fs.readFileSync('userscript-instructions-template.html', 'utf8');
const androidTemplate = fs.readFileSync('android-instructions-template.html', 'utf8');

// Create dist folder
if (!fs.existsSync('dist')) fs.mkdirSync('dist');
if (!fs.existsSync('dist/userscript')) fs.mkdirSync('dist/userscript');
if (!fs.existsSync('dist/chrome-extension')) fs.mkdirSync('dist/chrome-extension');

function buildPage(lang, t) {
  const langSwitcher = data.languages
    .map(l => `<a href="${l.file}"${l.code === lang ? ' class="active"' : ''}>${l.label}</a>`)
    .join('\n      ');

  // Get language-specific URLs
  const safariUrl = t.safariInstructions ? `/${t.safariInstructions.file}` : data.platforms.safari.storeUrl;
  const userscriptUrl = t.userscriptInstructions ? `/${t.userscriptInstructions.file}` : data.platforms.userscript.storeUrl;
  const androidUrl = t.androidInstructions ? `/${t.androidInstructions.file}` : data.platforms.android.storeUrl;

  const getStoreUrl = (key, p) => {
    if (key === 'safari') return safariUrl;
    if (key === 'userscript') return userscriptUrl;
    if (key === 'android') return androidUrl;
    return p.storeUrl;
  };

  const platformsJson = JSON.stringify(
    Object.fromEntries(
      Object.entries(data.platforms).map(([key, p]) => [key, {
        name: t.platforms[key].name,
        icon: p.icon,
        description: t.platforms[key].description,
        storeUrl: getStoreUrl(key, p),
        storeName: t.platforms[key].storeName
      }])
    ),
    null,
    2
  );

  const view = {
    ...t,
    langSwitcher,
    realFlag: data.assets.realFlag,
    paganFlag: data.assets.paganFlag,
    tweetUrl: data.assets.tweetUrl,
    githubUrl: data.assets.githubUrl,
    siteUrl: data.assets.siteUrl,
    ogImage: data.assets.ogImage,
    platformsJson
  };

  return Mustache.render(template, view);
}

// Build Safari instructions page
function buildSafariPage(lang, t) {
  const safari = t.safariInstructions;
  const view = {
    ...safari,
    lang: t.lang,
    dir: t.dir,
    fontFamily: t.fontFamily,
    heading: t.heading
  };
  return Mustache.render(safariTemplate, view);
}

// Build Userscript instructions page
function buildUserscriptPage(lang, t) {
  const us = t.userscriptInstructions;
  const view = {
    ...us,
    lang: t.lang,
    dir: t.dir,
    fontFamily: t.fontFamily,
    heading: t.heading
  };
  return Mustache.render(userscriptTemplate, view);
}

// Build Android instructions page
function buildAndroidPage(lang, t) {
  const android = t.androidInstructions;
  const view = {
    ...android,
    lang: t.lang,
    dir: t.dir,
    fontFamily: t.fontFamily,
    heading: t.heading
  };
  return Mustache.render(androidTemplate, view);
}

// Build all language versions
data.languages.forEach(({ code, file }) => {
  const t = data.i18n[code];
  const html = buildPage(code, t);
  fs.writeFileSync(`dist/${file}`, html);
  console.log(`Built: dist/${file}`);

  // Build Safari instructions page
  if (t.safariInstructions) {
    const safariHtml = buildSafariPage(code, t);
    fs.writeFileSync(`dist/${t.safariInstructions.file}`, safariHtml);
    console.log(`Built: dist/${t.safariInstructions.file}`);
  }

  // Build Userscript instructions page
  if (t.userscriptInstructions) {
    const userscriptHtml = buildUserscriptPage(code, t);
    fs.writeFileSync(`dist/${t.userscriptInstructions.file}`, userscriptHtml);
    console.log(`Built: dist/${t.userscriptInstructions.file}`);
  }

  // Build Android instructions page
  if (t.androidInstructions) {
    const androidHtml = buildAndroidPage(code, t);
    fs.writeFileSync(`dist/${t.androidInstructions.file}`, androidHtml);
    console.log(`Built: dist/${t.androidInstructions.file}`);
  }
});

// Copy assets to dist
fs.cpSync('chrome-extension/flag.svg', 'dist/chrome-extension/flag.svg');
fs.cpSync('chrome-extension/icon128.png', 'dist/chrome-extension/icon128.png');
fs.cpSync('userscript', 'dist/userscript', { recursive: true });
fs.cpSync('og-image.svg', 'dist/og-image.svg');
fs.cpSync('googlef1e2c57d719af19b.html', 'dist/googlef1e2c57d719af19b.html');
fs.cpSync('privacy-policy.html', 'dist/privacy-policy.html');
console.log('Copied: assets');

// Create extension ZIPs
function createZip(sourceDir, outFile) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outFile);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`Built: ${outFile} (${archive.pointer()} bytes)`);
      resolve();
    });

    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

Promise.all([
  createZip('chrome-extension', 'dist/chrome-extension.zip'),
  createZip('firefox-addon', 'dist/firefox-addon.zip')
]).then(() => {
  console.log('Build complete!');
});
