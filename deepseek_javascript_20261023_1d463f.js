    let activeMenuTab = 'all';
    
    // Кэш DOM-элементов меню для оптимизации
    const menuElements = {
      tabs: null,
      content: null,
      section: null
    };

    function initMenu() {
      menuElements.tabs = $('#menu-tabs');
      menuElements.content = $('#menu-content');
      menuElements.section = $('#menu');
      
      renderMenuTabs();
      renderMenuContent();
    }

    function renderMenuTabs() {
      if (!menuElements.tabs) return;
      
      menuElements.tabs.innerHTML = CONFIG.menu.tabs.map(t => `
        <button class="menu-tab px-4 py-2.5 text-xs sm:text-sm uppercase tracking-widest border-b-2 border-transparent transition-colors ${t.id === activeMenuTab ? 'text-brass border-brass' : 'text-cream/50 hover:text-cream'}" data-tab="${t.id}">${t.label}</button>
      `).join('');

      // Делегирование событий (лучше, чем навешивать слушатель на каждую кнопку)
      menuElements.tabs.onclick = (e) => {
        const btn = e.target.closest('.menu-tab');
        if (!btn || btn.dataset.tab === activeMenuTab) return;
        
        activeMenuTab = btn.dataset.tab;
        renderMenuTabs();
        renderMenuContent();
        
        // Если пользователь проскроллил вниз — плавно поднимаем к началу меню
        const rect = menuElements.section.getBoundingClientRect();
        if (rect.top < -100) {
          window.scrollTo({ top: menuElements.section.offsetTop - 80, behavior: 'smooth' });
        }
      };
    }

    function renderMenuContent() {
      if (!menuElements.content) return;

      let items = [];
      
      if (activeMenuTab === 'all') {
        // Собираем все блюда и убираем дубликаты по имени (на случай, если блюдо есть в двух категориях)
        const allItems = Object.values(CONFIG.menu.items).flat();
        const seen = new Set();
        items = allItems.filter(item => {
          if (seen.has(item.name)) return false;
          seen.add(item.name);
          return true;
        });
      } else {
        items = CONFIG.menu.items[activeMenuTab] || [];
      }

      if (items.length === 0) {
        menuElements.content.innerHTML = '<p class="text-center text-cream/50 py-10">No dishes in this category yet.</p>';
        return;
      }

      menuElements.content.innerHTML = items.map(item => `
        <div class="fade-in flex items-start justify-between gap-3 sm:gap-6 py-5 border-b border-white/10 hover:bg-white/[0.02] px-2 sm:px-0 rounded-lg transition-colors">
          <div class="flex items-start gap-3 sm:gap-6 flex-1 min-w-0">
            ${item.img ? `<img src="${item.img}" alt="${item.name}" class="w-14 h-14 sm:w-20 sm:h-20 object-cover rounded-lg shrink-0 border border-white/5" loading="lazy" />` : ''}
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <h3 class="font-display text-base sm:text-xl text-cream leading-snug">${item.name}</h3>
                ${item.badge ? `<span class="text-[9px] sm:text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${item.badge === 'hot' ? 'bg-brass text-charcoal' : 'bg-cream text-charcoal'}">${item.badge}</span>` : ''}
              </div>
              <p class="text-cream/50 text-xs sm:text-sm leading-relaxed break-words">${item.desc}</p>
            </div>
          </div>
          <span class="font-display text-brass text-base sm:text-xl shrink-0 mt-1 whitespace-nowrap">${item.price}</span>
        </div>
      `).join('');
      
      // Перезапускаем анимацию появления
      requestAnimationFrame(() => {
        revealElements();
      });
    }