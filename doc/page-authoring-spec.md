# Артефакт: стандарт генерации и наполнения страниц чтения

Этот документ фиксирует подход к созданию и наполнению книг и страниц в проекте **Books Online**. Используем как основу для генератора, ручной верстки и ревью PR.

---

## 1) Роли страниц и данные

* **Главная (каталог)** `index.html`

  * Источник данных: `data/books.json` — массив книг.
  * Фильтры/поиск: по `title`, `subtitle`, `tags`.
  * CTA «Продолжить» — на основании localStorage (см. §5).

* **Лендинг книги** `books/<slug>/index.html`

  * Источник данных: `books/<slug>/book.json`.
  * Показывает обложку/hero, аннотацию, TOC, кнопки «Начать/Продолжить».

* **Страница чтения** `books/<slug>/pages/NNN.html`

  * Мини-шаблон, основная разметка вставляется скриптом `reader.js`.
  * Контент страницы — только внутри `#reader-content`.

**JSON-форматы**

* `data/books.json` (каталог): `{ slug, title, subtitle, cover, tags, year, status, pages, url }` — **все пути относительные**.
* `books/<slug>/book.json` (книга): `{ title, subtitle, author, series, cover, pagesTotal, description, toc[], keywords[], cta{ startPage, continueEnabled, subscribeUrl }, year }`.

---

## 2) Конвенции путей (GitHub Pages)

* **Без ведущих слешей.**
* Главная → `assets/...`, `books/...`.
* Лендинг → `../../assets/...` (два уровня вверх), «домой» → `../../`.
* Страницы чтения → `../../../assets/...` (три уровня вверх).

---

## 3) Генерация структуры (скрипт `scripts/addBook.js`)

При вызове `node scripts/addBook.js --title "…"` скрипт:

1. Создает папки: `books/<slug>/{pages,img,extras}`.
2. Копирует плейсхолдеры из `assets/img/` → `books/<slug>/img/{cover.jpg, hero-wide.jpg}` (если есть).
3. Пишет `book.json` (с `cover: "img/cover.jpg"`).
4. Пишет лендинг `books/<slug>/index.html` (OG и пути относительные).
5. Генерирует `pages/NNN.html` по минимальному шаблону (см. §4).
6. Обновляет `data/books.json` (без ведущих слешей в `cover`, `url`).

> Рекоммендация: оптимизировать изображения `npm run img:opt` (см. §9).

---

## 4) Мини-шаблон страницы чтения

**Файл:** `books/<slug>/pages/NNN.html`

```html
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{{TITLE}} — Стр. {{N}}</title>
  <meta name="description" content="{{TITLE}} — page {{N}}" />
  <link rel="stylesheet" href="../../../assets/css/base.css" />
</head>
<body data-slug="{{SLUG}}" data-page="{{N}}">
  <div id="reader-content">
    <h1 style="display:none">{{TITLE}}</h1>
    <!-- Контент страницы: параграфы/подзаголовки/фигуры/цитаты. -->
  </div>
  <script src="../../../assets/js/app.js" defer></script>
  <script src="../../../assets/js/reader.js" defer></script>
</body>
</html>
```

**Правила контента внутри `#reader-content`:**

* Заголовки уровня **H2/H3** для структуры.
* Абзацы `<p>`: 60–85 знаков в строке (управляется CSS), без лишних инлайновых стилей.
* Цитаты `<blockquote>` с короткими источниками.
* Списки `<ul>/<ol>` — по делу; максимум 5–7 пунктов.
* Иллюстрации через `<figure><img/><figcaption/></figure>` (см. §6).
* Допустим `aside.callout` для «врезок» (советы/CTA).

---

## 5) Состояние и «Продолжить»

**Ключи localStorage** (строго такие):

* `lastPage:<slug>` — номер последней страницы (строка, zero-padded при построении URL).
* `lastVisit:<slug>` — timestamp `Date.now()` последнего визита.
* `book:<slug>` — JSON `{ title }` (заголовок для подсказок/подписи CTA).

**Сохранение прогресса** — в `initReader()` после вычисления `page/total`:

```js
localStorage.setItem('lastPage:'+slug, String(page));
localStorage.setItem('lastVisit:'+slug, String(Date.now()));
```

**Кнопка «Продолжить» на главной** выбирает **по свежести** `lastVisit:*` (а не по максимальному номеру страницы).

---

## 6) Иллюстрации и внешние источники

* Можно использовать внешние изображения (например, Unsplash) **с указанием `loading="lazy"`** и разумным `w`/`q` в URL.
* Рекомендуемые размеры:

  * **Обложка (cover.jpg)** — до `1600×900`, JPEG, 150–300 KB.
  * **Hero (hero-wide.jpg)** — до `1920×1080`, JPEG, 200–400 KB.
* Разметка блока:

```html
<figure>
  <img src="https://images.unsplash.com/photo-...?...&w=1600&q=80"
       alt="Краткое альтернативное описание"
       loading="lazy" style="width:100%;height:auto;border-radius:12px" />
  <figcaption class="small" style="opacity:.75;margin-top:.5rem">
    Короткая подпись — зачем читателю эта иллюстрация.
  </figcaption>
</figure>
```

> **Опционально:** для своих ассетов — рядом создавать `.webp` и подключать через `<picture>`.

---

## 7) Дублирование каркаса исключаем

* `reader.js` отвечает за шапку/панель/навигацию/футер на странице чтения.
* В `NNN.html` — только **контент** (см. §4), никаких дублей хедера/футера.
* Синхронизация: после сборки DOM `reader.js` диспатчит `document.dispatchEvent(new Event('reader:ready'))`;
  `app.js` слушает это событие, прежде чем дергать `initReader()`.

---

## 8) SEO-минимум

* **Главная:** один `<title>`, одна `<meta name="description">`, OG (`og:type=website`, `og:url` и `og:image` — **абсолютные** URL), JSON-LD `WebSite`.
* **Лендинг:** `<title>` и `<meta description>` по книге; OG (`og:type=book`, абсолютные `og:url` и `og:image`), JSON-LD `Book`.
* **Страницы чтения:** свой `<title>` с номером страницы; описания короткие; остальное — наследуется строем сайта.

---

## 9) Оптимизация изображений (npm)

* Скрипт `scripts/optimize-images.js` (на **Sharp**) пережимает `cover.jpg` до 1600×900 и `hero-wide.jpg` до 1920×1080.
* Команды:

  * `npm run img:opt` — все cover/hero.
  * `npm run img:opt:covers` — только обложки.
  * `npm run img:webp` — дополнительно создает `.webp` рядом.

---

## 10) Чек-лист перед коммитом

* [ ] Пути **относительные** (нет ведущих `/`).
* [ ] В `books.json` и `book.json` корректные `cover`, `url`.
* [ ] Страницы чтения имеют минимальный шаблон (без дублей каркаса), `data-slug`, `data-page`.
* [ ] Внутри `#reader-content` — только контент (H2/H3, p, figure, blockquote, lists, aside).
* [ ] Изображения ленивые (`loading="lazy"`), с `alt` и разумным весом.
* [ ] `localStorage` обновляется: `lastPage:`, `lastVisit:`, `book:` (при наличии).
* [ ] На главной «Продолжить» находит **последнюю посещенную** книгу.
* [ ] `npm run audit` — без предупреждений по путям/иконкам.

---

## 11) Мини-FAQ по наполнению

**Можно ли ставить внешние картинки?** — Да. Желательно с параметрами `w` и `q` (Unsplash) и `loading="lazy"`.

**Где хранить большие иллюстрации?** — Либо в `books/<slug>/img/`, либо внешние URL; для своих ассетов после заливки — `npm run img:opt`.

**Сколько текста на страницу?** — В среднем 800–1200 слов, но ориентируйся на смысловые блоки; верстка адаптируется.

**Как делать цитаты/врезки?** — `blockquote` и `aside.callout` (см. §4), не злоупотреблять.

---

## 12) Пример фейкового наполнения (фрагмент)

```html
<h2>1. С чего начинается путь</h2>
<p>Любая глава начинается с контейнера внимания…</p>
<figure>
  <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80"
       alt="Экран с кодом — концентрация" loading="lazy" />
  <figcaption class="small">Ритм, обратная связь, движение.</figcaption>
</figure>
<blockquote>
  «Фокус — это не напряжение, а отсутствие лишнего».
</blockquote>
```

---

## 13) Коммит-месседжи (шаблоны)

* `feat(reader): add page 003 with figures and callout`
* `chore(img): optimize covers via sharp (img:opt)`
* `fix(landing): relative og:image + canonical`
* `feat(catalog): tag filter + continue CTA by lastVisit`

---

Документ — живой. Если что-то меняем в пайплайне (например, добавляем Markdown-конвертер) — вносим сюда правило и пример.
