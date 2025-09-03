(function(){
    const qs = s => document.querySelector(s);
    const qsa = s => Array.from(document.querySelectorAll(s));
    const $year = qs('#year');
    if($year) $year.textContent = new Date().getFullYear();
    
    // Book catalog cache
    let __booksCache = null;
    function loadCatalog() {
        return __booksCache || (__booksCache = fetch('data/books.json').then(r => r.json()));
    }
  
    // Theme
    const THEME_KEY = 'theme:mode';
    const setTheme = (mode) => {
      document.documentElement.classList.toggle('light', mode === 'light');
      localStorage.setItem(THEME_KEY, mode);
    };
    
    // Get saved theme or use system preference
    const saved = localStorage.getItem(THEME_KEY);
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    setTheme(saved || (prefersLight ? 'light' : 'dark'));
    
    // Listen for system theme changes if no manual preference is set
    if (!saved && window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem(THEME_KEY)) {
          setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
    
    // Toggle button
    const $toggle = qs('#themeToggle');
    if ($toggle) {
      $toggle.addEventListener('click', () => {
        const next = document.documentElement.classList.contains('light') ? 'dark' : 'light';
        setTheme(next);
      });
    }
  
    const pageType = document.body.getAttribute('data-page');
    if(pageType === 'catalog') initCatalog();
    if(pageType === 'book-landing') initBookLanding();
    if(pageType === 'reader') {
        // Wait for reader.js to finish DOM setup
        document.addEventListener('reader:ready', initReader, { once: true });
    }

    // Initialize Continue Reading button if it exists
    const $continueBtn = document.getElementById('continueReadingBtn');
    if ($continueBtn) {
        let bestSlug = null, bestTs = 0, bestPage = 1, bestTitle = 'книгу';

        // Find the most recently visited book by timestamp
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key.startsWith('lastVisit:')) continue;
            
            const slug = key.substring('lastVisit:'.length);
            const ts = parseInt(localStorage.getItem(key), 10) || 0;
            
            if (ts > bestTs) {
                const page = parseInt(localStorage.getItem(`lastPage:${slug}`), 10) || 1;
                if (page > 1) {  // Only consider books with actual reading progress
                    bestTs = ts;
                    bestSlug = slug;
                    bestPage = page;
                    
                    // Get book title from cache if available
                    const meta = localStorage.getItem(`book:${slug}`);
                    if (meta) { 
                        try { 
                            bestTitle = JSON.parse(meta).title || bestTitle; 
                        } catch (e) {
                            console.error('Error parsing book metadata:', e);
                        } 
                    }
                }
            }
        }
        
        // If we found a book to continue reading
        if (bestSlug && bestPage > 1) {
            $continueBtn.style.display = 'inline-flex';
            $continueBtn.href = `books/${bestSlug}/pages/${String(bestPage).padStart(3, '0')}.html`;
            $continueBtn.title = `Продолжить «${bestTitle}» — стр. ${bestPage}`;
        }
    }
  
    function renderCard(b) {
      const progress = Math.min(100, Math.round(((Number(localStorage.getItem('lastPage:'+b.slug)||1)-1)/Number(b.pagesTotal||1))*100));
      return `<article class="book-card" data-tags="${(b.tags||[]).join(' ')}">
        <div class="cover">
          <img class="thumb"
               src="${b.cover || `books/${b.slug}/img/cover.jpg`}" 
               alt="Обложка ${b.title}" 
               loading="lazy"
               onerror="this.onerror=null;this.src='assets/img/cover-placeholder.jpg'"
          >
        </div>
        <div class="body">
          <h3>${b.title}</h3>
          <p>${b.subtitle||''}</p>
          <div class="tags">${(b.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
        </div>
        <div class="progress" title="Прогресс чтения: ${progress}%"><span data-w="${progress}"></span></div>
        <div class="body">
          <a class="btn" href="${'books/'+b.slug+'/'}">Открыть</a>
          <a class="btn btn-ghost" href="${'books/'+b.slug+'/pages/'+String(localStorage.getItem('lastPage:'+b.slug)||'001').padStart(3,'0')+'.html'}">Продолжить</a>
        </div>
      </article>`;
  }

  async function initCatalog() {
      const $grid = qs('#booksGrid');
      const $search = qs('#search');
      const $tags = qs('#tagFilter');
      
      try {
          const list = await loadCatalog();
          
          // Cache book metadata for continue reading
          list.forEach(book => {
              if (book.slug) {
                  localStorage.setItem(`book:${book.slug}`, JSON.stringify({ 
                      title: book.title 
                  }));
              }
          });
          
          // Fill tag filter
          const tagSet = new Set();
          list.forEach(b => (b.tags||[]).forEach(t => tagSet.add(t)));
          [...tagSet].sort().forEach(t => {
              const opt = document.createElement('option');
              opt.value = t;
              opt.textContent = t;
              if ($tags) $tags.appendChild(opt);
          });
          
          const render = () => {
              if (!$grid) return;
              const q = ($search?.value || '').toLowerCase();
              const tag = $tags?.value;
              
              const items = list.filter(b => {
                  const text = [b.title, b.subtitle, (b.tags||[]).join(' ')].join(' ').toLowerCase();
                  const matchesText = !q || text.includes(q);
                  const matchesTag = !tag || (b.tags||[]).includes(tag);
                  return matchesText && matchesTag;
              });
              
              $grid.innerHTML = items.map(renderCard).join('');
              
              // Animate progress bars
              requestAnimationFrame(() => {
                  qsa('.progress > span').forEach(el => {
                      el.style.width = el.dataset.w + '%';
                  });
              });
          };
          
          // Initial render and event listeners
          if ($search) $search.addEventListener('input', render);
          if ($tags) $tags.addEventListener('change', render);
          render();
      } catch (error) {
          console.error('Error initializing catalog:', error);
          if ($grid) $grid.innerHTML = '<p>Произошла ошибка при загрузке каталога. Пожалуйста, обновите страницу.</p>';
      }
  }
  
    function initBookLanding(){
      const slug = document.body.getAttribute('data-slug');
      const metaPath = `./book.json`;
      
      // Save book metadata for continue reading
      fetch(metaPath)
        .then(r => r.json())
        .then(book => {
          localStorage.setItem('book:'+slug, JSON.stringify({ title: book.title }));
          
          const $bookTitle = qs('#bookTitle');
          if ($bookTitle) $bookTitle.textContent = book.title;
          qs('#bookSubtitle').textContent = book.subtitle||'';
          qs('#bookDesc').textContent = book.description||'';
          const $toc = qs('#toc');
          $toc.innerHTML = book.toc.map(it=>`<li><a href="./pages/${String(it.page).padStart(3,'0')}.html">${it.label}</a></li>`).join('');
          const last = Number(localStorage.getItem('lastPage:'+slug)||book.cta?.startPage||1);
          const $start = qs('#startReading');
          $start.href = `./pages/${String(book.cta?.startPage||1).padStart(3,'0')}.html`;
          const $continue = qs('#continueReading');
          $continue.href = `./pages/${String(last).padStart(3,'0')}.html`;
          if(!book.cta?.continueEnabled) $continue.classList.add('hidden');
        });
    }
  
    function initReader(){
      const slug = document.body.getAttribute('data-slug');
      const page = parseInt(document.body.getAttribute('data-page-num') || '1', 10);
      const metaPath = `../book.json`;
      
      // Save reading progress and timestamp
      localStorage.setItem('lastPage:'+slug, String(page));
      localStorage.setItem('lastVisit:'+slug, String(Date.now()));
      
      // Save book metadata if not already present
      fetch(metaPath)
        .then(r => r.json())
        .then(book => {
          localStorage.setItem('book:'+slug, JSON.stringify({ title: book.title }));
        })
        .catch(console.error);
      
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
        const prev = Math.max(1, page-1);
        const next = Math.min(total, page+1);
        const atStart = page <= 1;
        const atEnd = page >= total;
        const toFile = n => `./${String(n).padStart(3,'0')}.html`;
        const $prev = qs('#prevBtn');
        const $next = qs('#nextBtn');
        
        // Prevent navigation when at start/end
        if ($prev && atStart) $prev.addEventListener('click', e => e.preventDefault());
        if ($next && atEnd) $next.addEventListener('click', e => e.preventDefault());
        
        if($prev){ $prev.href = toFile(prev); if(atStart) $prev.setAttribute('aria-disabled','true'); }
        if($next){ $next.href = toFile(next); if(atEnd) $next.setAttribute('aria-disabled','true'); }
        const $toc = qs('#tocList');
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