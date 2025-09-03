#!/usr/bin/env node
/**
 * scripts/audit.js — быстрый аудит статичного сайта для GitHub Pages
 * Usage:
 *   node scripts/audit.js
 *   node scripts/audit.js --fix
 */
function log(msg){ console.log(msg); }


const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const ROOT = process.cwd();
const FIX = process.argv.includes('--fix');

let warnCount = 0, fixCount = 0;

(async function main(){
  title('Books Online audit');

  await checkIndexHtml();
  await checkAppJs();
  await checkBooksJson();
  await checkBookLandings();
  await checkReaderPages();
  await checkFaviconAnd404();
  await checkImages();

  line();
  log(`✅ done. warnings: ${warnCount}${fixCount ? `, fixes: ${fixCount}` : ''}`);
})().catch(e => {
  error(e.stack || e.message);
  process.exit(1);
});

// -------------------- checks --------------------

async function checkIndexHtml() {
  const file = path.join(ROOT, 'index.html');
  if (!(await exists(file))) return skip('index.html not found');
  const src = await fsp.readFile(file, 'utf8');

  let changed = src;
  let touched = false;

  // leading slashes to assets/books
  const before1 = changed;
  changed = changed.replace(/(href|src)\s*=\s*["']\/assets\//g, '$1="assets/');
  changed = changed.replace(/(href|src)\s*=\s*["']\/books\//g, '$1="books/');
  if (changed !== before1) touched = true;

  // home link /
  const before2 = changed;
  changed = changed.replace(/href\s*=\s*["']\/["']/g, 'href="./"');
  if (changed !== before2) touched = true;

  // report
  if (touched) {
    warn('index.html: has absolute paths or root link');
    if ( FIX ) {
      await fsp.writeFile(file, changed);
      fix('index.html: normalized paths (assets/books, home link)');
    }
  } else {
    ok('index.html: paths look relative');
  }
}

async function checkAppJs() {
  const file = path.join(ROOT, 'assets', 'js', 'app.js');
  if (!(await exists(file))) return skip('assets/js/app.js not found');
  const src = await fsp.readFile(file, 'utf8');

  if (/fetch\s*\(\s*['"]\/data\/books\.json['"]\s*\)/.test(src)) {
    warn('app.js: fetch("/data/books.json") should be fetch("data/books.json")');
    if ( FIX ) {
      const out = src.replace(/fetch\s*\(\s*['"]\/data\/books\.json['"]\s*\)/g, `fetch('data/books.json')`);
      await fsp.writeFile(file, out);
      fix('app.js: fetch path fixed to relative');
    }
  } else {
    ok('app.js: catalog fetch looks relative');
  }
}

async function checkBooksJson() {
  const file = path.join(ROOT, 'data', 'books.json');
  if (!(await exists(file))) return skip('data/books.json not found');
  let raw = await fsp.readFile(file, 'utf8');

  let data;
  try { data = JSON.parse(raw); }
  catch(e){ warn('books.json: invalid JSON'); return; }

  let dirty = false;
  (data || []).forEach((b, i) => {
    if (!b) return;
    if (typeof b.cover === 'string' && b.cover.startsWith('/')) {
      warn(`books.json: [${i}] cover has leading "/" (${b.cover})`);
      if ( FIX ) { b.cover = b.cover.replace(/^\/+/, ''); dirty = true; }
    }
    if (typeof b.url === 'string' && b.url.startsWith('/')) {
      warn(`books.json: [${i}] url has leading "/" (${b.url})`);
      if ( FIX ) { b.url = b.url.replace(/^\/+/, ''); dirty = true; }
    }
  });

  if (dirty) {
    await fsp.writeFile(file, JSON.stringify(data, null, 2));
    fix('books.json: removed leading slashes in cover/url');
  } else {
    ok('books.json: cover/url look relative');
  }
}

async function checkBookLandings() {
  const booksDir = path.join(ROOT, 'books');
  if (!(await exists(booksDir))) return skip('books/ not found');

  const slugs = (await fsp.readdir(booksDir, { withFileTypes: true }))
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const slug of slugs) {
    const landing = path.join(booksDir, slug, 'index.html');
    if (!(await exists(landing))) { warn(`books/${slug}/index.html missing`); continue; }
    const src = await fsp.readFile(landing, 'utf8');

    let absAssets = /(href|src)\s*=\s*["']\/assets\//.test(src);
    let homeRoot  = /href\s*=\s*["']\/["']/.test(src);

    if (absAssets || homeRoot) {
      warn(`books/${slug}/index.html: has absolute /assets or "/" home link (use ../../assets/ and ../../)`);
      // не чиним автоматически — слишком разная разметка бывает
    } else {
      ok(`books/${slug}/index.html: paths ok`);
    }
  }
}

async function checkReaderPages() {
  const pages = await globFiles(path.join(ROOT, 'books'), f => /\/pages\/\d{3}\.html$/.test(f));
  if (!pages.length) return skip('no reader pages found');

  let bad = 0, fixed = 0;
  for (const file of pages) {
    const src = await fsp.readFile(file, 'utf8');
    const hasTriple = /href=["']\.\.\/\.\.\/\.\.\/assets\//.test(src) || /src=["']\.\.\/\.\.\/\.\.\/assets\//.test(src);
    const hasDouble = /href=["']\.\.\/\.\.\/assets\//.test(src) || /src=["']\.\.\/\.\.\/assets\//.test(src);

    if (!hasTriple) {
      bad++;
      warn(rel(file) + ': assets path should be ../../../assets/...');

      if (FIX && hasDouble) {
        const out = src.replace(/\.\.\/\.\.\/assets\//g, '../../../assets/');
        await fsp.writeFile(file, out);
        fix('fixed ../../../assets/ in ' + rel(file));
        fixed++;
      }
    }
  }
  if (!bad) ok('reader pages: assets paths look fine');
}

async function checkFaviconAnd404() {
  const favIco = path.join(ROOT, 'favicon.ico');
  const fav32  = path.join(ROOT, 'favicon-32x32.png');
  const apple  = path.join(ROOT, 'apple-touch-icon.png');
  const f404   = path.join(ROOT, '404.html');

  if (await exists(favIco)) ok('favicon.ico: present'); else warn('favicon.ico: missing');
  if (await exists(fav32))  ok('favicon-32x32.png: present'); else warn('favicon-32x32.png: missing');
  if (await exists(apple))  ok('apple-touch-icon.png: present'); else warn('apple-touch-icon.png: missing');
  if (await exists(f404))   ok('404.html: present'); else warn('404.html: missing');
}

async function checkImages() {
  const covers = await globFiles(path.join(ROOT, 'books'), f => /\/img\/cover\.jpg$/i.test(f));
  const heros  = await globFiles(path.join(ROOT, 'books'), f => /\/img\/hero-wide\.jpg$/i.test(f));

  for (const f of covers) {
    const { size } = await fsp.stat(f);
    if (size > 500 * 1024) warn(`${rel(f)} is ${(size/1024).toFixed(0)} KB — consider 1280×720 / ≤300 KB`);
    else ok(`${rel(f)} size OK`);
  }
  for (const f of heros) {
    const { size } = await fsp.stat(f);
    if (size > 600 * 1024) warn(`${rel(f)} is ${(size/1024).toFixed(0)} KB — consider 1920×1080 / ≤400 KB`);
    else ok(`${rel(f)} size OK`);
  }
}

// -------------------- utils --------------------

async function exists(p) { try{ await fsp.access(p, fs.constants.F_OK); return true; } catch { return false; } }

async function globFiles(dir, filterFn) {
  const out = [];
  async function walk(d) {
    let entries;
    try { entries = await fsp.readdir(d, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) await walk(full);
      else if (e.isFile() && filterFn(full.replace(/\\/g, '/'))) out.push(full);
    }
  }
  await walk(dir);
  return out;
}

function rel(p){ return path.relative(ROOT, p).replace(/\\/g, '/'); }

function title(s){ line(); console.log('🔎 ' + s); line(); }
function line(){ console.log(''.padEnd(60, '─')); }
function ok(msg){ console.log('  ✅ ' + msg); }
function warn(msg){ warnCount++; console.log('  ⚠️  ' + msg); }
function fix(msg){ fixCount++; console.log('  🛠  ' + msg); }
function error(msg){ console.error('  ❌ ' + msg); }
