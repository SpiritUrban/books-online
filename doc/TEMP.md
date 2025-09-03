Ниже — стартовый каркас для GitHub Pages. Скопируй файловую структуру и содержимое как есть в репозиторий. После пуша на `main` сайт откроется по адресу твоего GitHub Pages.

---

## 🌲 Структура

```
/ (корень)
  index.html
  /assets/
    /css/base.css
    /js/app.js
    /img/
      cover-placeholder.jpg
      author-avatar.jpg
  /data/
    books.json
  /books/
    /nastavnik-11/
      index.html
      book.json
      /img/
        cover.jpg
        hero-wide.jpg
      /pages/
        001.html
        002.html
        003.html
      /extras/
        README.txt
```

---

## 📄 index.html (каталог книг)

```html
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Книги Виталика — каталог</title>
  <meta name="description" content="Онлайн-библиотека Виталика: книги серии НАСТАВНИК и другие проекты." />
  <meta property="og:title" content="Книги Виталика — каталог" />
  <meta property="og:description" content="Онлайн-библиотека Виталика: книги серии НАСТАВНИК и другие проекты." />
  <meta property="og:image" content="/assets/img/cover-placeholder.jpg" />
  <link rel="stylesheet" href="/assets/css/base.css" />
</head>
<body data-page="catalog">
  <header class="site-header">
    <div class="container header-inner">
      <div class="brand">
        <a href="/"><strong>VITALIK BOOKS</strong></a>
        <span class="tagline">онлайн-чтение • серия «НАСТАВНИК» • эссе, практика, философия</span>
      </div>
      <nav class="actions">
        <button id="themeToggle" class="btn btn-ghost" aria-label="Переключить тему">🌓</button>
      </nav>
    </div>
  </header>

  <main class="container">
    <section class="hero">
      <h1>Библиотека Виталика</h1>
      <p class="lead">Живые книги про разработку, мышление, практики и путь. Читай онлайн, сохраняй прогресс, подписывайся на новые главы.</p>
      <div class="cta-row">
        <a class="btn" href="#catalog">Перейти к книгам</a>
        <a class="btn btn-ghost" href="https://t.me/" target="_blank" rel="noopener">Подписаться в Telegram</a>
      </div>
    </section>

    <section id="catalog" class="catalog">
      <div class="catalog-head">
        <h2>Книги</h2>
        <div class="filters">
          <input id="search" class="input" type="search" placeholder="Поиск по названию, тегам…" />
          <select id="tagFilter" class="input">
            <option value="">Все теги</option>
          </select>
        </div>
      </div>
      <div id="booksGrid" class="grid"></div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <div>
        © <span id="year"></span> Виталик. Авторство и права защищены.
      </div>
      <div class="footer-links">
        <a href="https://youtube.com/" target="_blank" rel="noopener">YouTube</a>
        <a href="https://t.me/" target="_blank" rel="noopener">Telegram</a>
        <a href="#" id="toTop">Наверх ↑</a>
      </div>
    </div>
  </footer>

  <script src="/assets/js/app.js" defer></script>
</body>
</html>
```

---

## 🎨 assets/css/base.css

```css
:root{
  --bg:#0b0c10; --fg:#e6e6e6; --muted:#9aa0a6; --card:#15171d; --border:#23262d; --acc:#7c9cff; --acc2:#ff6b6b;
  --fw-regular: 400; --fw-medium: 500; --fw-bold: 700;
  --radius: 14px; --shadow: 0 6px 24px rgba(0,0,0,.25);
  --max-text: 76ch;
}
:root.light{
  --bg:#ffffff; --fg:#111318; --muted:#495057; --card:#f5f7fb; --border:#e8ecf3; --acc:#335cff; --acc2:#ff3b3b;
}
*{box-sizing:border-box}
html,body{height:100%}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 system-ui, -apple-system, Segoe UI, Roboto, Inter, "Noto Sans", Arial, sans-serif}
img{max-width:100%;height:auto;display:block}
.container{width:min(1200px, 92vw);margin-inline:auto}
.header-inner,.footer-inner{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 0}
.site-header{position:sticky;top:0;z-index:20;background:linear-gradient(180deg, rgba(0,0,0,.45), transparent 60%), var(--bg);backdrop-filter:saturate(1.4) blur(10px);border-bottom:1px solid var(--border)}
.brand a{color:var(--fg);text-decoration:none;font-weight:var(--fw-bold);letter-spacing:.5px}
.tagline{color:var(--muted);font-size:.9rem;margin-left:10px}
.actions{display:flex;gap:8px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;background:var(--acc);color:#fff;border:none;border-radius:999px;padding:10px 16px;font-weight:var(--fw-medium);cursor:pointer;box-shadow:var(--shadow);text-decoration:none}
.btn:hover{filter:brightness(1.05)}
.btn-ghost{background:transparent;border:1px solid var(--border);color:var(--fg);box-shadow:none}
.input{background:var(--card);color:var(--fg);border:1px solid var(--border);border-radius:999px;padding:10px 14px;min-width:220px}
.hero{padding:44px 0}
.hero h1{font-size:clamp(1.8rem, 2.5vw, 2.8rem);margin:0 0 8px}
.lead{color:var(--muted);max-width:var(--max-text)}
.cta-row{display:flex;gap:12px;margin-top:14px}
.catalog-head{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:14px 0}
.grid{display:grid;grid-template-columns:repeat(auto-fill, minmax(260px,1fr));gap:16px}
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;display:flex;flex-direction:column}
.card .thumb{aspect-ratio:16/9;object-fit:cover;background:#0e1116}
.card .body{padding:14px}
.card h3{margin:2px 0 6px;font-size:1.05rem}
.card p{margin:0;color:var(--muted);font-size:.95rem}
.card .tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.tag{border:1px solid var(--border);border-radius:999px;padding:2px 8px;color:var(--muted);font-size:.85rem}
.progress{height:6px;background:#0002}
.progress > span{display:block;height:100%;background:var(--acc);width:0}
.site-footer{border-top:1px solid var(--border);margin-top:36px}
.footer-links{display:flex;gap:12px}
main a{color:var(--acc)}
/* Reader */
.reader-layout{display:grid;grid-template-columns:280px 1fr;gap:24px}
@media (max-width: 1279px){.reader-layout{grid-template-columns:1fr}}
.reader-aside{position:sticky;top:72px;height:calc(100vh - 92px);padding-bottom:24px;display:flex;flex-direction:column;gap:12px}
.reader-panel{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:12px}
.reader-panel h4{margin:0 0 8px}
.reader-controls{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.reader-controls .btn, .reader-controls .input{width:100%}
.reader-main{min-width:0}
.reader-article{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:clamp(14px,2.2vw,26px);box-shadow:var(--shadow)}
.reader-article h1, .reader-article h2{line-height:1.2}
.reader-article .meta{color:var(--muted);font-size:.9rem;margin-top:-8px;margin-bottom:8px}
.reader-nav{display:flex;justify-content:space-between;gap:8px;margin-top:16px}
.reader-nav .btn{flex:1}
blockquote{border-left:3px solid var(--acc);margin:12px 0;padding:6px 12px;background:linear-gradient(90deg, rgba(124,156,255,.07), transparent)}
figure{margin:18px 0}
figcaption{color:var(--muted);font-size:.9rem}
/* Utilities */
.hidden{display:none !important}
.small{font-size:.9rem;color:var(--muted)}
```

---

## ⚙️ assets/js/app.js

```js
(function(){
  const qs = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));
  const $year = qs('#year');
  if($year) $year.textContent = new Date().getFullYear();

  // Theme
  const THEME_KEY = 'theme:mode';
  const setTheme = (mode) => {
    if(mode === 'light') document.documentElement.classList.add('light');
    else document.documentElement.classList.remove('light');
    localStorage.setItem(THEME_KEY, mode);
  };
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  setTheme(saved);
  const $toggle = qs('#themeToggle');
  if($toggle){
    $toggle.addEventListener('click', ()=>{
      const next = document.documentElement.classList.contains('light') ? 'dark' : 'light';
      setTheme(next);
    });
  }

  const pageType = document.body.getAttribute('data-page');
  if(pageType === 'catalog') initCatalog();
  if(pageType === 'book-landing') initBookLanding();
  if(pageType === 'reader') initReader();

  function initCatalog(){
    const $grid = qs('#booksGrid');
    const $search = qs('#search');
    const $tags = qs('#tagFilter');
    fetch('/data/books.json').then(r=>r.json()).then(list=>{
      // Fill tag filter
      const tagSet = new Set();
      list.forEach(b => (b.tags||[]).forEach(t=>tagSet.add(t)));
      [...tagSet].sort().forEach(t=>{
        const opt = document.createElement('option');
        opt.value = t; opt.textContent = t; $tags.appendChild(opt);
      });
      const render = ()=>{
        const q = ($search.value||'').toLowerCase();
        const tag = $tags.value;
        const items = list.filter(b=>{
          const text = [b.title,b.subtitle,(b.tags||[]).join(' ')].join(' ').toLowerCase();
          const matchesText = !q || text.includes(q);
          const matchesTag = !tag || (b.tags||[]).includes(tag);
          return matchesText && matchesTag;
        });
        $grid.innerHTML = items.map(renderCard).join('');
        // animate progress bars
        requestAnimationFrame(()=>{
          qsa('.progress > span').forEach(el=>{
            el.style.width = el.dataset.w + '%';
          });
        });
      };
      $search?.addEventListener('input', render);
      $tags?.addEventListener('change', render);
      render();
    });
    function renderCard(b){
      const last = Number(localStorage.getItem('lastPage:'+b.slug) || '1');
      const progress = b.pages ? Math.min(100, Math.round((last-1)/b.pages*100)) : 0;
      return `
        <article class="card">
          <a href="${b.url||('/books/'+b.slug+'/')}" aria-label="Открыть книгу ${b.title}">
            <img class="thumb" src="${b.cover}" alt="Обложка ${b.title}" loading="lazy" />
          </a>
          <div class="body">
            <h3>${b.title}</h3>
            <p>${b.subtitle||''}</p>
            <div class="tags">${(b.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
          </div>
          <div class="progress" title="Прогресс чтения: ${progress}%"><span data-w="${progress}"></span></div>
          <div class="body">
            <a class="btn" href="${'/books/'+b.slug+'/'}">Открыть</a>
            <a class="btn btn-ghost" href="${'/books/'+b.slug+'/pages/'+String(localStorage.getItem('lastPage:'+b.slug)||'001').padStart(3,'0')+'.html'}">Продолжить</a>
          </div>
        </article>`;
    }
  }

  function initBookLanding(){
    const metaPath = document.body.dataset.meta;
    const $toc = qs('#toc');
    const $start = qs('#startReading');
    const $continue = qs('#continueReading');
    const slug = document.body.dataset.slug;
    fetch(metaPath).then(r=>r.json()).then(book=>{
      qs('#bookTitle').textContent = book.title;
      qs('#bookSubtitle').textContent = book.subtitle||'';
      qs('#bookDesc').textContent = book.description||'';
      $toc.innerHTML = book.toc.map(it=>`<li><a href="./pages/${String(it.page).padStart(3,'0')}.html">${it.label}</a></li>`).join('');
      const last = Number(localStorage.getItem('lastPage:'+slug)||book.cta?.startPage||1);
      $start.href = `./pages/${String(book.cta?.startPage||1).padStart(3,'0')}.html`;
      $continue.href = `./pages/${String(last).padStart(3,'0')}.html`;
      if(!book.cta?.continueEnabled) $continue.classList.add('hidden');
    });
  }

  function initReader(){
    const slug = document.body.dataset.slug;
    const page = Number(document.body.dataset.page);
    const metaPath = document.body.dataset.meta;

    // Hotkeys
    window.addEventListener('keydown', (e)=>{
      if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if(e.key==='ArrowLeft'){ qs('#prevBtn')?.click(); }
      if(e.key==='ArrowRight'){ qs('#nextBtn')?.click(); }
      if(e.key==='t'){ qs('#themeToggle')?.click(); }
      if(e.key==='+'){ adjustFont(1); }
      if(e.key==='-'){ adjustFont(-1); }
    });

    const article = qs('.reader-article');
    const adjustFont = (d)=>{
      const cur = parseFloat(localStorage.getItem('reader:font')||'1');
      const next = Math.min(1.3, Math.max(.85, cur + d*0.05));
      article.style.fontSize = next+'em';
      localStorage.setItem('reader:font', String(next));
    };
    // restore font
    const savedFont = parseFloat(localStorage.getItem('reader:font')||'1');
    if(savedFont) article.style.fontSize = savedFont+'em';

    fetch(metaPath).then(r=>r.json()).then(book=>{
      const total = Number(book.pagesTotal || (book.toc?.at(-1)?.page||page));
      const prev = Math.max(1, page-1), next = Math.min(total, page+1);
      const atStart = page<=1, atEnd = page>=total;
      const toFile = n => `./${String(n).padStart(3,'0')}.html`;
      const $prev = qs('#prevBtn');
      const $next = qs('#nextBtn');
      const $toc = qs('#tocList');
      if($prev){ $prev.href = toFile(prev); if(atStart) $prev.setAttribute('aria-disabled','true'); }
      if($next){ $next.href = toFile(next); if(atEnd) $next.setAttribute('aria-disabled','true'); }
      $toc.innerHTML = book.toc.map(it=>`<li class="small"><a href="./${String(it.page).padStart(3,'0')}.html">${it.label}</a></li>`).join('');
      // progress
      const progress = Math.min(100, Math.round((page-1)/total*100));
      const bar = qs('#progressBar');
      if(bar){ bar.style.width = progress+'%'; bar.parentElement.title = `Стр. ${page} из ${total} (${progress}%)`; }
      // save last page
      localStorage.setItem('lastPage:'+slug, String(page));
    });

    // UI buttons
    qs('#fontPlus')?.addEventListener('click', ()=>adjustFont(1));
    qs('#fontMinus')?.addEventListener('click', ()=>adjustFont(-1));
    qs('#toTop')?.addEventListener('click', (e)=>{ e.preventDefault(); window.scrollTo({top:0,behavior:'smooth'}); });
  }
})();
```

---

## 🗂️ data/books.json

```json
[
  {
    "slug": "nastavnik-11",
    "title": "НАСТАВНИК 11 — Личная Победа",
    "subtitle": "Опыт выживания, сборки силы и чистого курса в тумане войны",
    "cover": "/books/nastavnik-11/img/cover.jpg",
    "tags": ["наставник","психология","практика"],
    "year": 2025,
    "status": "online",
    "pages": 120,
    "url": "/books/nastavnik-11/"
  }
]
```

---

## 📘 /books/nastavnik-11/index.html (лендинг книги)

```html
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>НАСТАВНИК 11 — Личная Победа</title>
  <meta name="description" content="Опыт выживания, сборки силы и чистого курса в тумане войны." />
  <meta property="og:title" content="НАСТАВНИК 11 — Личная Победа" />
  <meta property="og:description" content="Опыт выживания, сборки силы и чистого курса в тумане войны." />
  <meta property="og:image" content="/books/nastavnik-11/img/hero-wide.jpg" />
  <link rel="stylesheet" href="/assets/css/base.css" />
</head>
<body data-page="book-landing" data-meta="./book.json" data-slug="nastavnik-11">
  <header class="site-header">
    <div class="container header-inner">
      <div class="brand"><a href="/">VITALIK BOOKS</a></div>
      <nav class="actions"><button id="themeToggle" class="btn btn-ghost">🌓</button></nav>
    </div>
  </header>
  <main class="container">
    <section class="hero">
      <img src="./img/hero-wide.jpg" alt="Атмосферный арт книги" class="thumb"/>
      <h1 id="bookTitle">НАСТАВНИК 11 — Личная Победа</h1>
      <p id="bookSubtitle" class="lead"></p>
      <div class="cta-row">
        <a id="startReading" class="btn" href="#">Начать чтение</a>
        <a id="continueReading" class="btn btn-ghost" href="#">Продолжить</a>
      </div>
    </section>

    <section>
      <h2>О книге</h2>
      <p id="bookDesc">…</p>
    </section>

    <section>
      <h2>Содержание</h2>
      <ol id="toc"></ol>
    </section>

    <section>
      <h2>Подписка</h2>
      <p class="small">Новые главы — в Telegram: <a href="https://t.me/" target="_blank" rel="noopener">подписаться</a></p>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-inner">
      <div>© <span id="year"></span> Виталик</div>
      <div class="footer-links"><a href="#" id="toTop">Наверх ↑</a></div>
    </div>
  </footer>
  <script src="/assets/js/app.js" defer></script>
</body>
</html>
```

---

## 🧾 /books/nastavnik-11/book.json (метаданные книги)

```json
{
  "title": "НАСТАВНИК 11 — Личная Победа",
  "subtitle": "Опыт выживания, сборки силы и чистого курса в тумане войны",
  "author": "Виталик",
  "series": "НАСТАВНИК",
  "cover": "/books/nastavnik-11/img/cover.jpg",
  "pagesTotal": 120,
  "description": "Книга о внутренней сборке, дисциплине и пути среди внешнего хаоса. Практика, честные наблюдения, инструменты выживания и роста.",
  "toc": [
    { "label": "Вступление", "page": 1 },
    { "label": "Глава 1. Контур силы", "page": 2 },
    { "label": "Глава 2. Система и Парасистема", "page": 3 }
  ],
  "keywords": ["философия","практика","менторство"],
  "cta": {
    "startPage": 1,
    "continueEnabled": true,
    "subscribeUrl": "https://t.me/"
  }
}
```

---

## 📜 Шаблон страницы чтения (пример 001.html)

```html
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Вступление — НАСТАВНИК 11</title>
  <meta name="description" content="Вступление к книге НАСТАВНИК 11 — Личная Победа" />
  <link rel="stylesheet" href="/assets/css/base.css" />
</head>
<body data-page="reader" data-meta="../book.json" data-slug="nastavnik-11" data-page="1">
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
          <a id="prevBtn" class="btn btn-ghost" href="#">← Предыдущая</a>
          <a id="nextBtn" class="btn" href="#">Следующая →</a>
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
        <h1>Вступление</h1>
        <p class="meta">Стр. 1</p>
        <p>Это пример стартовой страницы. Здесь будет живой текст книги. Размечай подзаголовки через <code>&lt;h2&gt;</code>/<code>&lt;h3&gt;</code>, вставляй иллюстрации как <code>&lt;figure&gt;</code> с <code>&lt;figcaption&gt;</code>.</p>
        <figure>
          <img src="../img/hero-wide.jpg" alt="Атмосферная иллюстрация" loading="lazy"/>
          <figcaption>Атмосфера пути: свет через туман.</figcaption>
        </figure>
        <blockquote>«Говорить, як є». Честность — это скорость сборки.</blockquote>
        <h2>О чём эта книга</h2>
        <p>О практиках, которые собирают. О мышлении, которое удерживает курс. О навыках, которые дают опору прямо сейчас.</p>
      </div>
      <nav class="reader-nav">
        <a id="prevBtn" class="btn btn-ghost" href="#">← Назад</a>
        <a id="nextBtn" class="btn" href="./002.html">Дальше →</a>
      </nav>
    </article>
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <div>© <span id="year"></span> Виталик</div>
      <div class="footer-links"><a href="#" id="toTop">Наверх ↑</a></div>
    </div>
  </footer>
  <script src="/assets/js/app.js" defer></script>
</body>
</html>
```

---

## 📜 /books/nastavnik-11/pages/002.html

```html
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Глава 1 — Контур силы</title>
  <link rel="stylesheet" href="/assets/css/base.css" />
</head>
<body data-page="reader" data-meta="../book.json" data-slug="nastavnik-11" data-page="2">
  <header class="site-header"><div class="container header-inner"><div class="brand"><a href="/">VITALIK BOOKS</a></div><nav class="actions"><a class="btn btn-ghost" href="../index.html">Содержание</a><button id="themeToggle" class="btn btn-ghost">🌓</button></nav></div></header>
  <main class="container reader-layout">
    <aside class="reader-aside"><div class="reader-panel"><h4>Навигация</h4><div class="reader-controls"><a id="prevBtn" class="btn btn-ghost" href="./001.html">← Предыдущая</a><a id="nextBtn" class="btn" href="./003.html">Следующая →</a></div></div><div class="reader-panel"><h4>Настройки</h4><div class="reader-controls"><button id="fontMinus" class="btn btn-ghost">Шрифт −</button><button id="fontPlus" class="btn">Шрифт +</button></div><div class="progress" style="margin-top:10px"><span id="progressBar" style="width:0"></span></div><p class="small">Горячие клавиши: ← →, t, +, −</p></div><div class="reader-panel"><h4>Содержание</h4><ol id="tocList"></ol></div></aside>
    <article class="reader-main">
      <div class="reader-article">
        <h1>Глава 1. Контур силы</h1>
        <p class="meta">Стр. 2</p>
        <p>Контур силы — это привычки и ритуалы, которые удерживают тебя собранным. Простой стек: сон → вода → движение → концентрация → действие.</p>
        <h2>Мини-практика</h2>
        <ul>
          <li>15 минут быстрой ходьбы</li>
          <li>Стакан воды с солью</li>
          <li>3 ключевых дела без шума</li>
        </ul>
      </div>
      <nav class="reader-nav"><a id="prevBtn" class="btn btn-ghost" href="./001.html">← Назад</a><a id="nextBtn" class="btn" href="./003.html">Дальше →</a></nav>
    </article>
  </main>
  <footer class="site-footer"><div class="container footer-inner"><div>© <span id="year"></span> Виталик</div><div class="footer-links"><a href="#" id="toTop">Наверх ↑</a></div></div></footer>
  <script src="/assets/js/app.js" defer></script>
</body>
</html>
```

---

## 📜 /books/nastavnik-11/pages/003.html

```html
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Глава 2 — Система и Парасистема</title>
  <link rel="stylesheet" href="/assets/css/base.css" />
</head>
<body data-page="reader" data-meta="../book.json" data-slug="nastavnik-11" data-page="3">
  <header class="site-header"><div class="container header-inner"><div class="brand"><a href="/">VITALIK BOOKS</a></div><nav class="actions"><a class="btn btn-ghost" href="../index.html">Содержание</a><button id="themeToggle" class="btn btn-ghost">🌓</button></nav></div></header>
  <main class="container reader-layout">
    <aside class="reader-aside"><div class="reader-panel"><h4>Навигация</h4><div class="reader-controls"><a id="prevBtn" class="btn btn-ghost" href="./002.html">← Предыдущая</a><a id="nextBtn" class="btn" href="#" aria-disabled="true">Конец</a></div></div><div class="reader-panel"><h4>Настройки</h4><div class="reader-controls"><button id="fontMinus" class="btn btn-ghost">Шрифт −</button><button id="fontPlus" class="btn">Шрифт +</button></div><div class="progress" style="margin-top:10px"><span id="progressBar" style="width:0"></span></div><p class="small">Горячие клавиши: ← →, t, +, −</p></div><div class="reader-panel"><h4>Содержание</h4><ol id="tocList"></ol></div></aside>
    <article class="reader-main">
      <div class="reader-article">
        <h1>Глава 2. Система и Парасистема</h1>
        <p class="meta">Стр. 3</p>
        <p>Разница проста: система — то, что поддерживает жизнь; парасистема — то, что питается ею. Важно распознавать слои и держать дистанцию.</p>
        <h2>Тезисы</h2>
        <ul>
          <li>Распознавание сигналов</li>
          <li>Экономия внимания</li>
          <li>Тихая автономия</li>
        </ul>
      </div>
      <nav class="reader-nav"><a id="prevBtn" class="btn btn-ghost" href="./002.html">← Назад</a><a id="nextBtn" class="btn" href="#" aria-disabled="true">Конец</a></nav>
    </article>
  </main>
  <footer class="site-footer"><div class="container footer-inner"><div>© <span id="year"></span> Виталик</div><div class="footer-links"><a href="#" id="toTop">Наверх ↑</a></div></div></footer>
  <script src="/assets/js/app.js" defer></script>
</body>
</html>
```

---

## 🖼️ Плейсхолдеры изображений

* `/assets/img/cover-placeholder.jpg` — любая 16:9 обложка (пока можно взять пустой градиент).
* `/books/nastavnik-11/img/cover.jpg` — обложка книги (16:9 или 3:4), до 400–600 КБ.
* `/books/nastavnik-11/img/hero-wide.jpg` — широкий баннер (соотношение 21:9 или 16:9), \~200–400 КБ.

---

## 📝 /books/nastavnik-11/extras/README.txt

```
Сюда положим PDF/EPUB позже. Все внешние ссылки помечать UTM-метками.
```

---

## 🚀 Что дальше

1. Заливаем каркас в репозиторий с включёнными GitHub Pages.
2. Меняем тексты страниц на реальные главы (001.html → …).
3. Добавляем книги в `/data/books.json` и клонируем структуру папки `books/<slug>/`.
4. Потом подключим: поиск по книге, OG-картинки на лету, JSON-LD, экспорты PDF/EPUB.
