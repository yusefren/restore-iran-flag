const fs = require('fs');
const path = require('path');
const Mustache = require('mustache');
const archiver = require('archiver');

const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
const template = fs.readFileSync('template.html', 'utf8');
const safariTemplate = fs.readFileSync('safari-instructions-template.html', 'utf8');

// Create dist folder
if (!fs.existsSync('dist')) fs.mkdirSync('dist');
if (!fs.existsSync('dist/userscript')) fs.mkdirSync('dist/userscript');
if (!fs.existsSync('dist/chrome-extension')) fs.mkdirSync('dist/chrome-extension');

function buildPage(lang, t) {
  const langSwitcher = data.languages
    .map(l => `<a href="${l.file}"${l.code === lang ? ' class="active"' : ''}>${l.label}</a>`)
    .join('\n      ');

  // Get Safari URL for this language
  const safariUrl = t.safariInstructions ? `/${t.safariInstructions.file}` : data.platforms.safari.storeUrl;

  const platformsJson = JSON.stringify(
    Object.fromEntries(
      Object.entries(data.platforms).map(([key, p]) => [key, {
        name: t.platforms[key].name,
        icon: p.icon,
        description: t.platforms[key].description,
        storeUrl: key === 'safari' ? safariUrl : p.storeUrl,
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
