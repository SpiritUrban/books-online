#!/usr/bin/env node
/**
 * addBook.js — генератор болванки книги
 *
 * Пример:
 *   node scripts/addBook.js --title "НАСТАВНИК 11 — Личная Победа"
 *   node scripts/addBook.js --title "Data & Mind" --pages 12 --series "NASTAVNIK" --tags "philosophy,practice"
 *   node scripts/addBook.js --title "Энергия пути" --year 2025 --author "Vitalik" --slug "energia-puti"
 *
 * Что делает:
 *   1) Создаёт /books/<slug>/{index.html, book.json, /img, /pages, /extras}
 *   2) Создаёт N страниц /pages/001.html...NNN.html с минимальным контентом
 *   3) Добавляет/обновляет запись в /data/books.json (каталог)
 */

const fs = require("fs");
const fsp = fs.promises;
const path = require("path");

const argv = parseArgs(process.argv.slice(2));
if (!argv.title) {
  console.error("❌ Требуется --title \"Название книги\"");
  process.exit(1);
}

const ROOT = path.resolve(argv.root || ".");
const TITLE = String(argv.title).trim();
const SUBTITLE = (argv.subtitle ? String(argv.subtitle).trim() : "").trim();
const AUTHOR = (argv.author ? String(argv.author) : "Vitalik").trim();
const SERIES = (argv.series ? String(argv.series) : "NASTAVNIK").trim();
const TAGS = (argv.tags ? String(argv.tags).split(",").map(s=>s.trim()).filter(Boolean) : []);
const YEAR = clampInt(argv.year, new Date().getFullYear(), 1900, 9999);
const PAGES = clampInt(argv.pages, 10, 1, 999);
const FORCE = Boolean(argv.force);
const SLUG = (argv.slug ? String(argv.slug) : slugify(TITLE)).toLowerCase();

(async function main(){
  console.log("📚 Title:", TITLE);
  console.log("🔖 Slug:", SLUG);
  console.log("🗓  Year:", YEAR);
  console.log("📄 Pages:", PAGES);
  console.log("🏷️  Series:", SERIES);
  console.log("👤 Author:", AUTHOR);
  console.log("🏷️  Tags:", TAGS.join(", ") || "(none)");
  console.log("⚠️  Force overwrite:", FORCE);

  // ensure base folders
  await ensureDirs([
    path.join(ROOT, "books"),
    path.join(ROOT, "data"),
    path.join(ROOT, "assets", "css"),
    path.join(ROOT, "assets", "js"),
    path.join(ROOT, "assets", "img"),
  ]);

  // book folders
  const bookRoot = path.join(ROOT, "books", SLUG);
  await ensureDirs([
    bookRoot,
    path.join(bookRoot, "pages"),
    path.join(bookRoot, "img"),
    path.join(bookRoot, "extras"),
  ]);

  // write book.json
  const bookJsonPath = path.join(bookRoot, "book.json");
  const bookJson = makeBookJson({ title: TITLE, subtitle: SUBTITLE, author: AUTHOR, series: SERIES, pagesTotal: PAGES, slug: SLUG, tags: TAGS, year: YEAR });
  await writeFileSafe(bookJsonPath, JSON.stringify(bookJson, null, 2), FORCE);

  // write landing index.html
  const landingPath = path.join(bookRoot, "index.html");
  await writeFileSafe(landingPath, makeLandingHtml({ slug: SLUG, title: TITLE, subtitle: SUBTITLE }), FORCE);

  // image placeholders (пустые файлы для последующей замены)
  await writeFileSafe(path.join(bookRoot, "img", "cover.jpg"), "", false);
  await writeFileSafe(path.join(bookRoot, "img", "hero-wide.jpg"), "", false);
  await writeFileSafe(path.join(bookRoot, "extras", "README.txt"), "Put PDF/EPUB here later.\n", false);

  // pages
  for (let i = 1; i <= PAGES; i++) {
    const pageFile = path.join(bookRoot, "pages", pad3(i) + ".html");
    await writeFileSafe(pageFile, makePageHtml({ slug: SLUG, title: TITLE, page: i }), FORCE);
  }
  console.log(`📄 Pages created: ${PAGES}`);

  // update catalog /data/books.json
  const catalogPath = path.join(ROOT, "data", "books.json");
  await upsertCatalog(catalogPath, {
    slug: SLUG,
    title: TITLE,
    subtitle: SUBTITLE || "",
    cover: `/books/${SLUG}/img/cover.jpg`,
    tags: TAGS,
    year: YEAR,
    status: "online",
    pages: PAGES,
    url: `/books/${SLUG}/`
  });

  console.log("✅ Done. Болванка книги готова.");
})().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});

// ---------- helpers ----------

async function upsertCatalog(catalogPath, entry){
  let list = [];
  if (await fileExists(catalogPath)) {
    try {
      const raw = await fsp.readFile(catalogPath, "utf8");
      list = raw.trim() ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) list = [];
    } catch {
      list = [];
    }
  }
  const idx = list.findIndex(x => x.slug === entry.slug);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...entry }; // обновляем
    console.log("📝 Catalog updated:", entry.slug);
  } else {
    list.push(entry);
    console.log("➕ Catalog added:", entry.slug);
  }
  await fsp.writeFile(catalogPath, JSON.stringify(list, null, 2));
}

function makeBookJson({title, subtitle, author, series, pagesTotal, slug, tags, year}){
  const toc = [
    { label: "Вступление", page: 1 },
    { label: "Глава 1", page: Math.min(2, pagesTotal) }
  ];
  return {
    title,
    subtitle,
    author,
    series,
    cover: `/books/${slug}/img/cover.jpg`,
    pagesTotal,
    description: subtitle || "Описание появится позже.",
    toc,
    keywords: tags && tags.length ? tags : ["book","series"],
    cta: {
      startPage: 1,
      continueEnabled: true,
      subscribeUrl: "https://t.me/"
    },
    year
  };
}

function makeLandingHtml({ slug, title, subtitle }){
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(subtitle || "Book landing page")}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(subtitle || "")}" />
  <meta property="og:image" content="/books/${slug}/img/hero-wide.jpg" />
  <link rel="stylesheet" href="/assets/css/base.css" />
</head>
<body data-page="book-landing" data-meta="./book.json" data-slug="${slug}">
  <header class="site-header">
    <div class="container header-inner">
      <div class="brand"><a href="/">VITALIK BOOKS</a></div>
      <nav class="actions"><button id="themeToggle" class="btn btn-ghost">🌓</button></nav>
    </div>
  </header>
  <main class="container">
    <section class="hero">
      <img src="./img/hero-wide.jpg" alt="Hero" class="thumb"/>
      <h1 id="bookTitle">${escapeHtml(title)}</h1>
      <p id="bookSubtitle" class="lead">${escapeHtml(subtitle || "")}</p>
      <div class="cta-row">
        <a id="startReading" class="btn" href="./pages/001.html">Начать чтение</a>
        <a id="continueReading" class="btn btn-ghost" href="./pages/001.html">Продолжить</a>
      </div>
    </section>
    <section>
      <h2>О книге</h2>
      <p id="bookDesc">Описание появится позже.</p>
    </section>
    <section>
      <h2>Содержание</h2>
      <ol id="toc"></ol>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-inner">
      <div>© <span id="year"></span> ${new Date().getFullYear()} Виталик</div>
      <div class="footer-links"><a href="#" id="toTop">Наверх ↑</a></div>
    </div>
  </footer>
  <script src="/assets/js/app.js" defer></script>
</body>
</html>`;
}

function makePageHtml({ slug, title, page }){
  const prev = Math.max(1, page - 1);
  const next = page + 1;
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} — Стр. ${page}</title>
  <meta name="description" content="${escapeHtml(title)} — page ${page}" />
  <link rel="stylesheet" href="/assets/css/base.css" />
</head>
<body data-page="reader" data-meta="../book.json" data-slug="${slug}" data-page="${page}">
  <header class="site-header">
    <div class="container header-inner">
      <div class="brand"><a href="/">VITALIK BOOKS</a></div>
      <nav class="actions">
        <a class="btn btn-ghost" href="../index.html">Содержание</a>
        <button id="themeToggle" class="btn btn-ghost">🌓</button>
      </nav>
    </div>
  </header>

  <main class="container reader-layout">
    <aside class="reader-aside">
      <div class="reader-panel">
        <h4>Навигация</h4>
        <div class="reader-controls">
          <a id="prevBtn" class="btn btn-ghost" href="./${pad3(prev)}.html">← Предыдущая</a>
          <a id="nextBtn" class="btn" href="./${pad3(next)}.html">Следующая →</a>
        </div>
      </div>
      <div class="reader-panel">
        <h4>Настройки</h4>
        <div class="reader-controls">
          <button id="fontMinus" class="btn btn-ghost">Шрифт −</button>
          <button id="fontPlus" class="btn">Шрифт +</button>
        </div>
        <div class="progress" style="margin-top:10px"><span id="progressBar" style="width:0"></span></div>
        <p class="small">Горячие клавиши: ← →, t, +, −</p>
      </div>
      <div class="reader-panel">
        <h4>Содержание</h4>
        <ol id="tocList"></ol>
      </div>
    </aside>

    <article class="reader-main">
      <div class="reader-article">
        <h1>${escapeHtml(title)}</h1>
        <p class="meta">Стр. ${page}</p>
        <p>Текст появится позже.</p>
      </div>
      <nav class="reader-nav">
        <a id="prevBtn" class="btn btn-ghost" href="./${pad3(prev)}.html">← Назад</a>
        <a id="nextBtn" class="btn" href="./${pad3(next)}.html">Дальше →</a>
      </nav>
    </article>
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <div>© <span id="year"></span> ${new Date().getFullYear()} Виталик</div>
      <div class="footer-links"><a href="#" id="toTop">Наверх ↑</a></div>
    </div>
  </footer>
  <script src="/assets/js/app.js" defer></script>
</body>
</html>`;
}

async function ensureDirs(list){
  for (const d of list) await fsp.mkdir(d, { recursive: true });
}

async function writeFileSafe(filePath, content, force){
  const exists = await fileExists(filePath);
  if (exists && !force) return;
  await fsp.writeFile(filePath, content);
}

async function fileExists(p){
  try { await fsp.access(p, fs.constants.F_OK); return true; }
  catch { return false; }
}

function pad3(n){ return String(n).padStart(3, "0"); }

function clampInt(value, def, min, max){
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return def;
  return Math.max(min, Math.min(max, n));
}

function parseArgs(args){
  const out = {};
  for (let i=0; i<args.length; i++){
    const a = args[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = args[i+1];
    if (!next || next.startsWith("--")) out[key] = true;
    else { out[key] = next; i++; }
  }
  return out;
}

// Простой slugify с транслитерацией (ru/uk -> латиница)
function slugify(str){
  const map = {
    'а':'a','б':'b','в':'v','г':'g','ґ':'g','д':'d','е':'e','ё':'e','є':'ie','ж':'zh','з':'z','и':'i','і':'i','ї':'i','й':'y',
    'к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'c','ч':'ch',
    'ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
    'А':'a','Б':'b','В':'v','Г':'g','Ґ':'g','Д':'d','Е':'e','Ё':'e','Є':'ie','Ж':'zh','З':'z','И':'i','І':'i','Ї':'i','Й':'y',
    'К':'k','Л':'l','М':'m','Н':'n','О':'o','П':'p','Р':'r','С':'s','Т':'t','У':'u','Ф':'f','Х':'h','Ц':'c','Ч':'ch',
    'Ш':'sh','Щ':'sch','Ъ':'','Ы':'y','Ь':'','Э':'e','Ю':'yu','Я':'ya'
  };
  return str
    .split("")
    .map(ch => map[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
