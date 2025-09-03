

И в HTML: `href="assets/css/base.css"`, `src="assets/js/app.js"`, а не `/assets/...`.

> Альтернатива: поставить `<base href="/books-online/">` в `<head>` *всех страниц*, но тогда любые относительные пути должны быть согласованы. Проще — **везде относительные пути** без ведущего слеша.

2. **Обязательные плейсхолдеры**

* Положи пустые (или заглушки) файлы:

  * `books/*/img/cover.jpg`
  * `books/*/img/hero-wide.jpg`
* Мы уже сделали `cover-placeholder.jpg` в `assets/img/`. Если где-то нет обложки, можно подставлять его в рендере (проверкой в JS).

3. **Главная: загрузка каталога**
   В `index.html` убедись, что `app.js` делает `fetch('data/books.json')` (без `/`). Если уже так — ок.

4. **Лендинги книг**
   На страницах `books/<slug>/index.html` подключай ресурсы относительно текущей папки:

```html
<link rel="stylesheet" href="../../assets/css/base.css">
<script src="../../assets/js/app.js" defer></script>
<img src="img/hero-wide.jpg">
```

(два уровня вверх до корня репо — если ты лежишь в `/books/<slug>/`).

5. **Страницы чтения**
   В `/books/<slug>/pages/001.html`:

```html
<link rel="stylesheet" href="../../assets/css/base.css">
<script src="../../assets/js/app.js" defer></script>
<body data-page="reader" data-meta="../book.json" data-slug="<slug>" data-page="1">
```

Кнопки «Назад/Далее» — относительные `./002.html` и т. д.

6. **Размеры картинок**

* `img/cover.jpg` — 16:9, **1280×720** или **1600×900**, 150–300 KB (webp можно).
* `img/hero-wide.jpg` — **1920×1080** (или **1920×820** для 21:9), 200–400 KB.

7. **404 для прямых ссылок (не обязательно, но удобно)**
   Добавь простой `404.html` с ссылкой «Домой», чтобы прямой переход на `.../pages/003.html` из адресной строки не ломал UX.

8. **SEO-минимум**

* В `index.html` и лендингах: `<title>`, `<meta name="description">`, OG-картинка (`cover.jpg` или `hero-wide.jpg`).
* `robots.txt` (потом) и `sitemap.xml` (потом).

# Быстрые вставки-шаблоны

## book.json (болванка для двух книг)

`books/nastavnik-12-lichnaya-pobeda/book.json`

```json
{
  "title": "НАСТАВНИК 12 — Личная Победа",
  "subtitle": "",
  "author": "Виталик",
  "series": "НАСТАВНИК",
  "cover": "img/cover.jpg",
  "pagesTotal": 10,
  "description": "Описание будет позже.",
  "toc": [
    { "label": "Вступление", "page": 1 },
    { "label": "Глава 1", "page": 2 }
  ],
  "keywords": [],
  "cta": { "startPage": 1, "continueEnabled": true, "subscribeUrl": "https://t.me/" },
  "year": 2025
}
```

`books/nastavnik-13-primer/book.json` — то же, сменить title/slug.

## Заглушка героя (если хочешь текст)

`books/<slug>/img/hero-wide.jpg` — можно временно заменить на наш общий плейсхолдер и переименовать, либо я сделаю отдельный hero-placeholder (скажи — с текстом/без).

# Мелкие улучшения (по ходу)

* В `app.js` добавь проверку **обложки**: если `img` не загрузилась — подставь `assets/img/cover-placeholder.jpg`.
* На карточке книги «Продолжить» веди на сохранённую страницу:

```js
const last = localStorage.getItem('lastPage:'+slug) || '001';
href = `books/${slug}/pages/${String(last).padStart(3,'0')}.html`;
```

# Что могу сделать дальше без вопросов

1. Пройду по `index.html`, обоим лендингам и 2–3 страницам чтения — заменю пути на корректные **относительные** (готовый дифф).
2. Сгенерирую **hero-placeholder 1920×1080** под твой аккуратный стиль.
3. Добавлю минимальные OG-мета в `index.html` и оба лендинга.

Скажи — применяю сразу пакетно (правки путей + hero-placeholder), или сначала делаем только placeholder?






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
