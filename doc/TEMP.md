Окей, вот **готовое ТЗ для Codex** (авто-правки по репозиторию). Коротко, структурировано, с критериями приёмки.

---

# Codex Task — “Books Online: MVP финализация”

## Контекст

Статичный сайт на GitHub Pages. Структура уже есть (`/assets`, `/data/books.json`, `/books/<slug>/{index.html, book.json, pages/*}`). Требуется довести MVP до чек-листов из ТЗ: фильтры по тегам, «Продолжить чтение», SEO-мета, фавиконки, относительные пути, оптимизация изображений.

## Ограничения (важно)

* **Все пути — относительные**, без ведущего `/`.

  * Корень: `assets/...`, `books/...`
  * Лендинги: `../../assets/...`, и ссылки домой `../../`
  * Страницы чтения: `../../../assets/...`
* Ничего не ломаем в уже работающем `reader.js` и генераторе `addBook.js`.
* Не удалять существующие файлы; только дополнять/исправлять.

---

## Изменения по файлам

### 1) `assets/js/app.js`

**Цель:** каталог книг, «Продолжить», фильтры по тегам, фолбэк обложки.

1. Убедиться, что загрузка каталога **без ведущего слеша**:

```js
const CATALOG_URL = 'data/books.json';
```

2. Вставить/обновить функции (если уже есть — аккуратно объединить):

```js
function escapeHtml(s){ return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

async function loadBooks() {
  const res = await fetch('data/books.json');
  const books = await res.json();
  renderBooks(books);
  renderTagFilters(books);
}

function renderBooks(list) {
  const grid = document.getElementById('booksGrid');
  if (!grid) return;
  grid.innerHTML = list.map(b => {
    const slug = b.slug;
    const last = localStorage.getItem('lastPage:'+slug) || '001';
    const lastUrl = `books/${slug}/pages/${String(last).padStart(3,'0')}.html`;
    const startUrl = `books/${slug}/pages/001.html`;
    const cover = b.cover || `books/${slug}/img/cover.jpg`;
    const url = b.url || `books/${slug}/`;

    return `
      <article class="card">
        <a class="cover-wrap" href="${url}">
          <img class="cover" src="${cover}" alt="${escapeHtml(b.title)}" loading="lazy"
               onerror="this.onerror=null;this.src='assets/img/cover.jpg'">
        </a>
        <div class="card-body">
          <h3 class="title"><a href="${url}">${escapeHtml(b.title)}</a></h3>
          <div class="tags">${(b.tags||[]).map(t=>`<span class="chip">${t}</span>`).join('')}</div>
          <div class="actions">
            <a class="btn" href="${startUrl}">Читать</a>
            <a class="btn btn-ghost" href="${lastUrl}">Продолжить</a>
          </div>
        </div>
      </article>`;
  }).join('');
}

function renderTagFilters(books){
  const box = document.getElementById('tagsBox');
  if (!box) return;
  const tags = new Set();
  books.forEach(b => (b.tags||[]).forEach(t => tags.add(t)));
  box.innerHTML = [...tags].map(t=>`<button class="chip" data-tag="${t}">${t}</button>`).join('');
  box.addEventListener('click', e=>{
    const t = e.target.closest('[data-tag]')?.dataset.tag; if(!t) return;
    const filtered = books.filter(b => (b.tags||[]).includes(t));
    renderBooks(filtered);
  });
}

document.addEventListener('DOMContentLoaded', loadBooks);
```

> Примечание: ожидается наличие контейнеров на главной:
> `<div id="tagsBox"></div>` и `<div id="booksGrid"></div>`.

---

### 2) `index.html` (корень)

**Цель:** OG-мета, favicon-линки, JSON-LD WebSite; убедиться в относительных путях.

В `<head>` добавить (или привести к виду):

```html
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">

<meta property="og:title" content="Books Online — NASTAVNIK series & more">
<meta property="og:description" content="Личный онлайн-каталог книг Виталика.">
<meta property="og:image" content="assets/img/cover.jpg">

<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebSite","name":"Books Online","url":"https://spiriturban.github.io/books-online/"}
</script>
```

> Проверить, что все `href/src` к ассетам — `assets/...`, к книгам — `books/...`, ссылка домой — `./`.

---

### 3) `books/*/index.html` (все лендинги)

**Цель:** относительные пути, OG-мета, favicon-линки, минимальный JSON-LD.

В `<head>` каждого лендинга добавить/нормализовать:

```html
<link rel="icon" href="../../favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="../../favicon-32x32.png">
<link rel="apple-touch-icon" href="../../apple-touch-icon.png">

<meta property="og:image" content="img/hero-wide.jpg">

<!-- опционально: минимальный JSON-LD -->
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Book","name":"{{TITLE}}","author":{"@type":"Person","name":"Виталик"},"image":"img/hero-wide.jpg"}
</script>
```

И убедиться, что подключения CSS/JS — `../../assets/...`, ссылка «домой» — `../../`.

---

### 4) `books/*/pages/*.html`

**Цель:** минимальный шаблон + правильные пути (как у нас уже согласовано).

Проверка (не переписывать работающий вид): в `<head>` есть

```html
<link rel="stylesheet" href="../../../assets/css/base.css" />
```

а внизу:

```html
<script src="../../../assets/js/app.js" defer></script>
<script src="../../../assets/js/reader.js" defer></script>
```

И в `<body>` **только** `data-slug` и `data-page` + `<div id="reader-content">…</div>`.

---

### 5) `package.json`

**Цель:** скрипты для разработки/аудита/оптимизации и dev-deps.

Добавить/синхронизировать:

```json
{
  "scripts": {
    "dev": "live-server --port=5500 --open=index.html --wait=200",
    "start": "npm run dev",
    "add:book": "node scripts/addBook.js",
    "audit": "node scripts/audit.js",
    "audit:fix": "node scripts/audit.js --fix",
    "img:opt": "node scripts/optimize-images.js",
    "img:opt:covers": "node scripts/optimize-images.js --only=covers",
    "img:opt:heroes": "node scripts/optimize-images.js --only=heroes",
    "img:webp": "node scripts/optimize-images.js --webp"
  },
  "devDependencies": {
    "live-server": "^1.2.2",
    "sharp": "^0.33.4"
  }
}
```

> `scripts/optimize-images.js` уже есть. Если нет — создать из последней версии (Node+Sharp).

---

### 6) Изображения

**Цель:** вес обложек ≤ 300 KB, hero ≤ 400 KB.

Запуск (локально, для разработчика):
`npm run img:opt`

Ничего не коммитить здесь автоматически, просто предусмотреть скрипт (он уже есть).

---

### 7) 404 и фавиконки

**Проверка/подключение:**

* `404.html` — уже есть (ничего не менять)
* Файлы в корне: `favicon.ico`, `favicon-32x32.png`, `apple-touch-icon.png` — есть; убедиться, что ссылки в `<head>` (см. п.2, п.3).

---

## Критерии приёмки

1. `npm run audit` выводит **0 warnings** (либо только уведомления о размерах, если картинки не пережаты вручную).
2. На главной:

   * Книги грузятся из `data/books.json` (без 404).
   * Кнопка «Продолжить» ведёт на последнюю страницу из `localStorage`.
   * Работает фильтр по тегам (клик по тегу — список карточек обновляется).
3. На лендингах:

   * Пути к ассетам относительные (`../../assets/...`), ссылка «домой» — `../../`.
   * Присутствуют OG-мета и фавиконки.
4. На страницах чтения:

   * Загружается `reader.js`, доклеивается шапка/панель/футер.
   * Работают хоткеи, прогресс, сохранение `lastPage:<slug>`.
5. В `index.html` присутствует JSON-LD WebSite; на лендингах — минимальный JSON-LD Book.
6. Все `fetch` и все `href/src` **без ведущего слеша**.
7. После локальной оптимизации `npm run img:opt` аудит размеров картинок в норме (или близко).

---

## Подсказки Codex (по поиску/вставкам)

* **Найти контейнеры на главной** (если нет — добавить сразу после хиро):

```html
<section class="filters"><div id="tagsBox"></div></section>
<section class="catalog"><div id="booksGrid" class="grid"></div></section>
```

* **Путь к каталогу**: искать `fetch('/data/books.json')` → заменить на `fetch('data/books.json')`.

* **Абсолютные пути** в `index.html` и `books/*/index.html`: искать `href="/assets/`, `src="/assets/`, `href="/"` → заменить на относительные (см. правила выше).

---

## Коммит-месседж

```
feat(mvp): tags filter, continue CTA, SEO meta, favicons, relative paths; add img optimization scripts

- app.js: renderBooks + renderTagFilters + localStorage “continue” + cover fallback
- index.html: OG + JSON-LD + favicons (relative paths)
- books/*/index.html: OG image + favicons (../../), relative paths
- package.json: add dev/audit/img:opt scripts, sharp as devDep
- reader pages: ensure ../../../assets paths and minimal template
```

Готово.
