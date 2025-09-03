// assets/js/reader.js
(function () {
    const qs  = (s, r = document) => r.querySelector(s);
    const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
  
    document.addEventListener('DOMContentLoaded', init);
  
    function init() {
      // Требования к разметке страницы:
      // <body data-slug="..." data-page="N"> и <div id="reader-content">...</div>
      const body = document.body;
      const slug = body.dataset.slug;
      const page = Number(body.dataset.page || detectPageFromURL());
      if (!slug || !page) {
        console.warn('[reader] Missing slug/page. Ensure body[data-slug][data-page].');
      }
  
      // Построить каркас
      buildSkeleton();
      
      // Dispatch event when reader is ready
      document.dispatchEvent(new Event('reader:ready'));
  
      // Вставить контент
      const $contentSrc = qs('#reader-content-src'); // исходный контент пользователя
      const $article = qs('.reader-article');
      if ($contentSrc && $article) {
        $article.insertAdjacentHTML('beforeend', $contentSrc.innerHTML);
        $contentSrc.remove();
      }
  
      // Навигация и прогресс
      wireControls({ slug, page });
  
      // Загрузить meta книги (toc, pagesTotal) и дорисовать
      const metaPath = computeMetaPath(); // ../book.json относительно pages/*
      fetch(metaPath).then(r => r.json()).then(book => {
        hydrateWithBookMeta({ book, slug, page });
      }).catch(() => {
        console.warn('[reader] Failed to load book.json at', metaPath);
        // Без меты тоже работаем: хотя бы prev/next по файлу.
        minimalPrevNext({ page });
      });
  
      // Горячие клавиши и тема
      wireHotkeys();
    }
  
    function buildSkeleton() {
      // Подключаем базовые стили, если не подключены (на случай пропуска в шаблоне)
      if (!qsa('link[href$="assets/css/base.css"]').length) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = relToRoot('assets/css/base.css');
        document.head.appendChild(link);
      }
  
      // Оборачиваем контент, создаём layout
      const main = document.createElement('main');
      main.className = 'container reader-layout';
      main.innerHTML = `
        ${headerHTML()}
        ${asideHTML()}
        <article class="reader-main">
          <div class="reader-article">
            <h1 id="readerTitle"></h1>
            <p class="meta">Стр. <span id="readerPage"></span></p>
          </div>
          <nav class="reader-nav">
            <a id="prevBtn" class="btn btn-ghost" href="#">← Назад</a>
            <a id="nextBtn" class="btn" href="#">Дальше →</a>
          </nav>
        </article>
        ${footerHTML()}
      `;
  
      // Переносим исходный контент в скрытый контейнер, чтобы потом вставить внутрь .reader-article
      const userContent = qs('#reader-content') || document.body.firstElementChild;
      const stash = document.createElement('div');
      stash.id = 'reader-content-src';
      if (userContent) {
        // Если контент — сам <div id="reader-content">, берём его innerHTML
        if (userContent.id === 'reader-content') {
          stash.innerHTML = userContent.innerHTML;
          userContent.remove();
        } else {
          // Иначе переносим ноду целиком
          stash.appendChild(userContent.cloneNode(true));
          userContent.remove();
        }
      }
      document.body.prepend(main);
      document.body.appendChild(stash);
  
      // Подключаем app.js, если не подключён
      if (!qsa('script[src$="assets/js/app.js"]').length) {
        const s = document.createElement('script');
        s.src = relToRoot('assets/js/app.js');
        s.defer = true;
        document.body.appendChild(s);
      }
    }
  
    function headerHTML() {
      return `
  <header class="site-header">
    <div class="container header-inner">
      <div class="brand"><a id="homeLink" href="${relToRoot('')}">VITALIK BOOKS</a></div>
      <nav class="actions">
        <a class="btn btn-ghost" id="tocLink" href="#">Содержание</a>
        <button id="themeToggle" class="btn btn-ghost">🌓</button>
      </nav>
    </div>
  </header>`;
    }
  
    function footerHTML() {
      return `
  <footer class="site-footer">
    <div class="container footer-inner">
      <div>© <span id="year"></span> ${new Date().getFullYear()} Виталик</div>
      <div class="footer-links"><a href="#" id="toTop">Наверх ↑</a></div>
    </div>
  </footer>`;
    }
  
    function asideHTML() {
      return `
  <aside class="reader-aside">
    <div class="reader-panel">
      <h4>Навигация</h4>
      <div class="reader-controls">
        <a id="prevBtnAside" class="btn btn-ghost" href="#">← Предыдущая</a>
        <a id="nextBtnAside" class="btn" href="#">Следующая →</a>
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
  </aside>`;
    }
  
    function wireControls({ slug, page }) {
      // Заголовок и номер страницы
      qs('#readerPage').textContent = String(page);
  
      // Навигационные ссылки (подставим позже точные после загрузки book.json)
      const prevHref = toPageHref(page - 1);
      const nextHref = toPageHref(page + 1);
      setHref('#prevBtn', prevHref);
      setHref('#nextBtn', nextHref);
      setHref('#prevBtnAside', prevHref);
      setHref('#nextBtnAside', nextHref);
  
      // Ссылки Домой и Содержание
      setHref('#homeLink', relToRoot(''));
      setHref('#tocLink', '../index.html');
  
      // Кнопки шрифта
      const article = qs('.reader-article');
      const adjustFont = (d) => {
        const cur = parseFloat(localStorage.getItem('reader:font') || '1');
        const next = Math.min(1.3, Math.max(.85, cur + d * 0.05));
        article.style.fontSize = next + 'em';
        localStorage.setItem('reader:font', String(next));
      };
      const savedFont = parseFloat(localStorage.getItem('reader:font') || '1');
      if (savedFont) article.style.fontSize = savedFont + 'em';
      qs('#fontPlus')?.addEventListener('click', () => adjustFont(1));
      qs('#fontMinus')?.addEventListener('click', () => adjustFont(-1));
  
      // Кнопка «Наверх»
      qs('#toTop')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  
      // Сохранение прогресса
      if (slug && page) {
        localStorage.setItem('lastPage:' + slug, String(page));
      }
    }
  
    function hydrateWithBookMeta({ book, slug, page }) {
      // Заголовок
      const title = book?.title || document.title.replace(/ — Стр\..*/, '');
      qs('#readerTitle').textContent = title;
  
      // TOC
      const $toc = qs('#tocList');
      if (Array.isArray(book?.toc)) {
        $toc.innerHTML = book.toc
          .map(it => `<li class="small"><a href="./${pad3(it.page)}.html">${escapeHtml(it.label || ('Стр. ' + it.page))}</a></li>`)
          .join('');
      }
  
      // Прогресс
      const total = Number(book?.pagesTotal || page);
      const progress = Math.min(100, Math.round((page - 1) / total * 100));
      const bar = qs('#progressBar');
      if (bar) {
        bar.style.width = progress + '%';
        bar.parentElement.title = `Стр. ${page} из ${total} (${progress}%)`;
      }
  
      // Границы: отключить prev/next, если начало/конец
      if (page <= 1) disableLink('#prevBtn', '#prevBtnAside');
      if (page >= total) disableLink('#nextBtn', '#nextBtnAside');
    }
  
    function minimalPrevNext({ page }) {
      if (page <= 1) disableLink('#prevBtn', '#prevBtnAside');
      // next не знаем — оставим как есть
    }
  
    // ---- helpers ----
  
    function computeMetaPath() {
      // На страницах /books/<slug>/pages/NNN.html → ../book.json
      return '../book.json';
    }
  
    function toPageHref(n) {
      if (!Number.isFinite(n) || n < 1) return '#';
      return './' + pad3(n) + '.html';
    }
  
    function setHref(sel, href) {
      const el = qs(sel);
      if (el) el.setAttribute('href', href);
    }
  
    function disableLink(...sels) {
      sels.forEach(sel => {
        const el = qs(sel);
        if (el) {
          el.setAttribute('aria-disabled', 'true');
          el.addEventListener('click', (e) => e.preventDefault());
        }
      });
    }
  
    function relToRoot(path) {
      // Относительный путь до корня репозитория из pages/*: два уровня вверх
      // (для страниц чтения этого достаточно; если используешь скрипт где-то ещё, доработаем логику)
      const prefix = '../../../';
      return prefix + (path || '');
    }
  
    function detectPageFromURL() {
      const m = location.pathname.match(/\/(\d{3})\.html$/);
      return m ? parseInt(m[1], 10) : NaN;
    }
  
    function pad3(n) {
      return String(n).padStart(3, '0');
    }
  
    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    }
  
    function wireHotkeys() {
      window.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
        if (e.key === 'ArrowLeft') qs('#prevBtn')?.click();
        if (e.key === 'ArrowRight') qs('#nextBtn')?.click();
        if (e.key === 't') qs('#themeToggle')?.click();
        if (e.key === '+') qs('#fontPlus')?.click();
        if (e.key === '-') qs('#fontMinus')?.click();
      });
    }
  })();
  