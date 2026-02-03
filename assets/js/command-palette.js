(function() {
  'use strict';

  let fuse = null;
  let searchIndex = [];
  let selectedIndex = -1;
  let results = [];

  const palette = document.getElementById('command-palette');
  const input = document.getElementById('command-palette-input');
  const resultsContainer = document.getElementById('command-palette-results');

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
          { name: 'tags', weight: 1.5 },
          { name: 'stack', weight: 1.5 }
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

  // Filter by tag
  function filterByTag(items, tag) {
    return items.filter(item => {
      const tags = (item.tags || []).map(t => t.toLowerCase());
      const stack = (item.stack || []).map(s => s.toLowerCase());
      return tags.includes(tag) || stack.includes(tag);
    });
  }

  // Search
  function search(query) {
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
      resultsContainer.innerHTML = query
        ? '<div class="command-palette-empty">No results found</div>'
        : '<div class="command-palette-empty">Type to search...</div>';
      return;
    }

    resultsContainer.innerHTML = results.slice(0, 10).map((result, i) => {
      const item = result.item;
      const tags = [...(item.tags || []), ...(item.stack || [])];
      const tagHtml = tags.length
        ? `<span class="command-palette-tags">${tags.map(t => `<span class="command-palette-tag">${escapeHtml(t)}</span>`).join('')}</span>`
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

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  // Open/close palette
  function openPalette() {
    loadIndex();
    palette.classList.add('open');
    palette.setAttribute('aria-hidden', 'false');
    input.focus();
    document.body.style.overflow = 'hidden';
  }

  function closePalette() {
    palette.classList.remove('open');
    palette.setAttribute('aria-hidden', 'true');
    input.value = '';
    results = [];
    selectedIndex = -1;
    renderResults();
    document.body.style.overflow = '';
  }

  // Navigate results
  function navigate(direction) {
    if (results.length === 0) return;
    selectedIndex = (selectedIndex + direction + results.length) % results.length;
    renderResults();
    const selected = resultsContainer.querySelector('.selected');
    if (selected) selected.scrollIntoView({ block: 'nearest' });
  }

  function selectCurrent() {
    if (selectedIndex >= 0 && results[selectedIndex]) {
      window.location.href = results[selectedIndex].item.permalink;
    }
  }

  // Event listeners
  document.addEventListener('keydown', (e) => {
    // Open with Cmd/Ctrl+K
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (palette.classList.contains('open')) {
        closePalette();
      } else {
        openPalette();
      }
      return;
    }

    // Open with / (only when not in input)
    if (e.key === '/' && !isInputFocused()) {
      e.preventDefault();
      openPalette();
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
        selectCurrent();
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
    const result = e.target.closest('.command-palette-result');
    if (result) {
      const index = parseInt(result.dataset.index, 10);
      if (!isNaN(index) && index !== selectedIndex) {
        selectedIndex = index;
        renderResults();
      }
    }
  });
})();
