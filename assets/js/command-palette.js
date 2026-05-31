(function() {
  'use strict';

  let fuse = null;
  let searchIndex = [];
  let selectedIndex = -1;
  let results = [];
  let mode = 'search';

  const palette = document.getElementById('command-palette');
  const input = document.getElementById('command-palette-input');
  const resultsContainer = document.getElementById('command-palette-results');
  const COMMANDS = [
    {
      name: 'home',
      aliases: ['h', 'index'],
      description: 'Go to the home page',
      run: () => { window.location.href = '/'; }
    },
    {
      name: 'projects',
      aliases: ['p'],
      description: 'Open projects',
      run: () => { window.location.href = '/projects/'; }
    },
    {
      name: 'library',
      aliases: ['l'],
      description: 'Open library',
      run: () => { window.location.href = '/library/'; }
    },
    {
      name: 'writing',
      aliases: ['w'],
      description: 'Open writing',
      run: () => { window.location.href = '/library/writing/'; }
    },
    {
      name: 'resume',
      aliases: ['r', 'cv'],
      description: 'Open resume',
      run: () => { window.location.href = '/resume/'; }
    },
    {
      name: 'search',
      aliases: ['s', 'find'],
      description: 'Switch to search',
      run: () => openPalette({ mode: 'search' })
    },
    {
      name: 'top',
      aliases: ['gg'],
      description: 'Scroll to top',
      run: () => {
        closePalette();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    {
      name: 'theme',
      aliases: ['toggle-theme'],
      description: 'Toggle light and dark theme',
      run: () => {
        closePalette();
        const toggle = document.getElementById('theme-toggle');
        if (toggle) toggle.click();
      }
    },
    {
      name: 'colorscheme',
      aliases: ['colo', 'colors'],
      description: 'Set colorscheme: light or dark',
      run: (args) => setColorscheme(args)
    },
    {
      name: 'dark',
      aliases: [],
      description: 'Use dark theme',
      run: () => setTheme('dark')
    },
    {
      name: 'light',
      aliases: [],
      description: 'Use light theme',
      run: () => setTheme('light')
    },
    {
      name: 'help',
      aliases: ['?', 'shortcuts'],
      description: 'Show navigation help',
      run: () => {
        closePalette();
        const shortcuts = document.getElementById('shortcuts-modal');
        if (shortcuts) {
          shortcuts.classList.add('open');
          shortcuts.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';
        }
      }
    }
  ];

  // Fetch search index
  async function loadIndex() {
    if (searchIndex.length > 0) return;
    try {
      const response = await fetch('/index.json');
      searchIndex = await response.json();
      fuse = new Fuse(searchIndex, {
        keys: [
          { name: 'title', weight: 2 },
          { name: 'summary', weight: 1 },
          { name: 'tags', weight: 1.5 }
        ],
        threshold: 0.3,
        ignoreLocation: true,
        includeScore: true,
        includeMatches: true
      });
    } catch (e) {
      console.error('Failed to load search index:', e);
    }
  }

  // Parse query for /tag prefix
  function parseQuery(query) {
    const tagMatch = query.match(/^\/(\S+)\s*(.*)?$/);
    if (tagMatch) {
      return {
        tag: tagMatch[1].toLowerCase(),
        search: (tagMatch[2] || '').trim()
      };
    }
    return { tag: null, search: query.trim() };
  }

  // Filter by tag (strict - only tags, not stack)
  function filterByTag(items, tag) {
    return items.filter(item => {
      const tags = (item.tags || []).map(t => t.toLowerCase());
      return tags.includes(tag);
    });
  }

  // Search
  function search(query) {
    if (mode === 'command') {
      renderCommands(query, true);
      return;
    }

    if (!fuse || !query) {
      results = [];
      renderResults();
      return;
    }

    const { tag, search: searchTerm } = parseQuery(query);

    if (tag && !searchTerm) {
      // Only tag filter, no search term
      results = filterByTag(searchIndex, tag).map(item => ({ item }));
    } else if (tag && searchTerm) {
      // Tag filter + fuzzy search
      const filtered = filterByTag(searchIndex, tag);
      const tagFuse = new Fuse(filtered, {
        keys: [
          { name: 'title', weight: 2 },
          { name: 'summary', weight: 1 }
        ],
        threshold: 0.3,
        ignoreLocation: true,
        includeScore: true
      });
      results = tagFuse.search(searchTerm);
    } else {
      // Regular fuzzy search
      results = fuse.search(searchTerm);
    }

    selectedIndex = results.length > 0 ? 0 : -1;
    renderResults();
  }

  // Render results
  function renderResults() {
    if (results.length === 0) {
      const query = input.value.trim();
      const { tag } = parseQuery(query);

      if (tag && !query.includes(' ')) {
        // Show available tags when user types /
        const allTags = getAllTags();
        const matchingTags = allTags.filter(t => t.toLowerCase().includes(tag.toLowerCase()));

        if (matchingTags.length > 0) {
          resultsContainer.innerHTML = `
            <div class="command-palette-tag-suggestions">
              <div class="command-palette-hint">Filter by tag:</div>
              ${matchingTags.slice(0, 8).map(t =>
                `<button class="command-palette-tag-btn" data-tag="${escapeHtml(t)}">${escapeHtml(t)}</button>`
              ).join('')}
            </div>
          `;
          return;
        }
      }

      resultsContainer.innerHTML = query
        ? '<div class="command-palette-empty">No results found</div>'
        : '<div class="command-palette-empty">Type to search, or /tag to filter</div>';
      return;
    }

    resultsContainer.innerHTML = results.slice(0, 10).map((result, i) => {
      const item = result.item;
      const tags = item.tags || [];
      const tagHtml = tags.length
        ? `<span class="command-palette-tags">${tags.map(t => `<button class="command-palette-tag" data-tag="${escapeHtml(t)}">${escapeHtml(t)}</button>`).join('')}</span>`
        : '';

      return `
        <a href="${escapeHtml(item.permalink)}"
           class="command-palette-result ${i === selectedIndex ? 'selected' : ''}"
           data-index="${i}">
          <span class="command-palette-title">${escapeHtml(item.title)}</span>
          <span class="command-palette-meta">
            <span class="command-palette-section">${escapeHtml(item.section)}</span>
            ${tagHtml}
          </span>
        </a>
      `;
    }).join('');
  }

  // Get all unique tags from index (strict - only tags, not stack)
  function getAllTags() {
    const tagSet = new Set();
    searchIndex.forEach(item => {
      (item.tags || []).forEach(t => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  function commandTokens(command) {
    return [command.name].concat(command.aliases);
  }

  function parseCommandInput(value) {
    const trimmed = value.trim().replace(/^:/, '');
    const parts = trimmed.split(/\s+/).filter(Boolean);
    return {
      name: (parts[0] || '').toLowerCase(),
      args: parts.slice(1)
    };
  }

  function getMatchingCommands(query) {
    const parsed = parseCommandInput(query);
    if (!parsed.name) return COMMANDS;

    return COMMANDS.filter(command => {
      return commandTokens(command).some(token => token.includes(parsed.name)) ||
        command.description.toLowerCase().includes(parsed.name);
    });
  }

  function renderCommands(query, resetSelection = false) {
    results = getMatchingCommands(query);
    if (resetSelection || selectedIndex >= results.length) {
      selectedIndex = results.length > 0 ? 0 : -1;
    }

    if (results.length === 0) {
      resultsContainer.innerHTML = '<div class="command-palette-empty">No command found</div>';
      return;
    }

    const isEmpty = !query.trim();
    resultsContainer.innerHTML = `
      <div class="command-palette-command-list ${isEmpty ? 'is-muted' : ''}">
        ${results.map((command, i) => {
          const aliases = command.aliases.length
            ? `<span class="command-palette-command-aliases">${command.aliases.map(alias => ':' + escapeHtml(alias)).join(' ')}</span>`
            : '';

          return `
            <button
              type="button"
              class="command-palette-command ${i === selectedIndex ? 'selected' : ''}"
              data-command="${escapeHtml(command.name)}"
            >
              <span class="command-palette-command-name">:${escapeHtml(command.name)}</span>
              ${aliases}
              <span class="command-palette-command-description">${escapeHtml(command.description)}</span>
            </button>
          `;
        }).join('')}
      </div>
    `;
  }

  function setTheme(theme) {
    document.querySelector('html').dataset.theme = theme;
    localStorage.setItem('pref-theme', theme);
    closePalette();
  }

  function getCurrentTheme() {
    return document.querySelector('html').dataset.theme || 'light';
  }

  function setColorscheme(args) {
    const requested = (args[0] || '').toLowerCase();

    if (requested === 'dark' || requested === 'light') {
      setTheme(requested);
      return;
    }

    if (!requested) {
      setTheme(getCurrentTheme() === 'dark' ? 'light' : 'dark');
      return;
    }

    resultsContainer.innerHTML = '<div class="command-palette-empty">Try :colorscheme light or :colorscheme dark</div>';
  }

  // Open/close palette
  function openPalette(options = {}) {
    mode = options.mode || 'search';
    const initialValue = options.value || '';
    palette.dataset.mode = mode;
    palette.classList.add('open');
    palette.setAttribute('aria-hidden', 'false');
    input.value = initialValue;
    selectedIndex = -1;
    input.placeholder = mode === 'command' ? 'command' : 'Search... (use /tag to filter)';
    input.focus();
    document.body.style.overflow = 'hidden';

    if (mode === 'command') {
      renderCommands(initialValue, true);
    } else {
      loadIndex().then(() => search(initialValue));
    }
  }

  function closePalette() {
    palette.classList.remove('open');
    palette.setAttribute('aria-hidden', 'true');
    input.value = '';
    results = [];
    selectedIndex = -1;
    mode = 'search';
    palette.dataset.mode = mode;
    input.placeholder = 'Search... (use /tag to filter)';
    renderResults();
    document.body.style.overflow = '';
  }

  // Navigate results
  function navigate(direction) {
    if (results.length === 0) return;
    selectedIndex = (selectedIndex + direction + results.length) % results.length;
    if (mode === 'command') {
      renderCommands(input.value);
      scrollSelectedIntoView();
      return;
    }

    renderResults();
    scrollSelectedIntoView();
  }

  function scrollSelectedIntoView() {
    const selected = resultsContainer.querySelector('.selected');
    if (selected) selected.scrollIntoView({ block: 'nearest' });
  }

  function selectCurrent() {
    if (mode === 'command') {
      const command = results[selectedIndex];
      if (command) command.run();
      return;
    }

    if (selectedIndex >= 0 && results[selectedIndex]) {
      window.location.href = results[selectedIndex].item.permalink;
    }
  }

  function executeTypedCommand() {
    const parsed = parseCommandInput(input.value);
    if (!parsed.name) {
      selectCurrent();
      return;
    }

    const exactMatch = COMMANDS.find(command => {
      return command.name === parsed.name || command.aliases.includes(parsed.name);
    });

    if (exactMatch) {
      exactMatch.run(parsed.args);
      return;
    }

    selectCurrent();
  }

  // Event listeners
  document.addEventListener('keydown', (e) => {
    // Open with Cmd/Ctrl+K
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (palette.classList.contains('open')) {
        closePalette();
      } else {
        openPalette({ mode: 'search' });
      }
      return;
    }

    // Open with / (only when not in input)
    if (e.key === '/' && !isInputFocused()) {
      const shortcuts = document.getElementById('shortcuts-modal');
      if (shortcuts && shortcuts.classList.contains('open')) return;

      e.preventDefault();
      openPalette({ mode: 'search' });
      return;
    }

    // Open Vim-style command mode with : (only when not in input)
    if (e.key === ':' && !e.metaKey && !e.ctrlKey && !e.altKey && !isInputFocused()) {
      const shortcuts = document.getElementById('shortcuts-modal');
      if (shortcuts && shortcuts.classList.contains('open')) return;

      e.preventDefault();
      openPalette({ mode: 'command' });
      return;
    }

    // Handle keys when palette is open
    if (!palette.classList.contains('open')) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        closePalette();
        break;
      case 'ArrowDown':
        e.preventDefault();
        navigate(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        navigate(-1);
        break;
      case 'Enter':
        e.preventDefault();
        if (mode === 'command') {
          executeTypedCommand();
        } else {
          selectCurrent();
        }
        break;
    }
  });

  function isInputFocused() {
    const active = document.activeElement;
    return active && (
      active.tagName === 'INPUT' ||
      active.tagName === 'TEXTAREA' ||
      active.isContentEditable
    );
  }

  // Close on backdrop click
  palette.querySelector('.command-palette-backdrop').addEventListener('click', closePalette);

  // Search on input
  input.addEventListener('input', (e) => {
    search(e.target.value);
  });

  // Click on result
  resultsContainer.addEventListener('click', (e) => {
    const command = e.target.closest('.command-palette-command');
    if (command) {
      const found = COMMANDS.find(item => item.name === command.dataset.command);
      if (found) found.run();
      return;
    }

    const result = e.target.closest('.command-palette-result');
    if (result) {
      const index = parseInt(result.dataset.index, 10);
      if (!isNaN(index)) {
        selectedIndex = index;
        selectCurrent();
      }
    }
  });

  // Hover to select
  resultsContainer.addEventListener('mousemove', (e) => {
    const command = e.target.closest('.command-palette-command');
    if (command) {
      const commandIndex = results.findIndex(item => item.name === command.dataset.command);
      if (commandIndex >= 0 && commandIndex !== selectedIndex) {
        selectedIndex = commandIndex;
        renderCommands(input.value);
      }
      return;
    }

    const result = e.target.closest('.command-palette-result');
    if (result) {
      const index = parseInt(result.dataset.index, 10);
      if (!isNaN(index) && index !== selectedIndex) {
        selectedIndex = index;
        renderResults();
      }
    }
  });

  // Click on tag to filter
  resultsContainer.addEventListener('click', (e) => {
    const tagBtn = e.target.closest('[data-tag]');
    if (tagBtn) {
      e.preventDefault();
      e.stopPropagation();
      const tag = tagBtn.dataset.tag;
      input.value = '/' + tag;
      input.focus();
      search(input.value);
    }
  });

  window.rybkrOpenCommandPalette = openPalette;
})();
