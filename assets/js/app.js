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