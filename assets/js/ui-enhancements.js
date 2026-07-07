(function() {
  'use strict';

  // -------------------------------------------------------
  // Localhost Internal Link Guard
  // -------------------------------------------------------

  const localHostnames = new Set(['localhost', '127.0.0.1', '::1']);
  const productionHostnames = new Set(['rybkr.com', 'www.rybkr.com']);
  const isLocalPreview = localHostnames.has(window.location.hostname);
  const compactNavigationMedia = window.matchMedia('(max-width: 700px), (hover: none) and (pointer: coarse)');

  function isCompactNavigationViewport() {
    return compactNavigationMedia.matches;
  }

  function localizeInternalUrl(value) {
    if (!isLocalPreview || !value) return value;

    let url;
    try {
      url = new URL(value, window.location.href);
    } catch (err) {
      return value;
    }

    if (!productionHostnames.has(url.hostname)) return value;

    return `${window.location.origin}${url.pathname}${url.search}${url.hash}`;
  }

  function localizeInternalLinks(root) {
    if (!isLocalPreview) return;

    const links = root.querySelectorAll ? root.querySelectorAll('a[href]') : [];
    links.forEach(link => {
      const localized = localizeInternalUrl(link.getAttribute('href'));
      if (localized !== link.getAttribute('href')) {
        link.setAttribute('href', localized);
      }
    });
  }

  if (isLocalPreview) {
    localizeInternalLinks(document);

    document.addEventListener('click', (event) => {
      const link = event.target.closest ? event.target.closest('a[href]') : null;
      if (!link) return;

      const localized = localizeInternalUrl(link.href);
      if (localized === link.href) return;

      event.preventDefault();
      window.location.assign(localized);
    }, true);

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.matches && node.matches('a[href]')) {
              const localized = localizeInternalUrl(node.getAttribute('href'));
              if (localized !== node.getAttribute('href')) {
                node.setAttribute('href', localized);
              }
            }
            localizeInternalLinks(node);
          }
        });
      });
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  // -------------------------------------------------------
  // Back to Top Button
  // -------------------------------------------------------

  // -------------------------------------------------------
  // Statusline
  // -------------------------------------------------------

  const statuslineMode = document.querySelector('[data-statusline-mode]');
  const statuslineCommand = document.querySelector('[data-statusline-command]');
  const statuslineCommandWrap = document.querySelector('[data-statusline-command-wrap]');
  const statuslinePosition = document.querySelector('[data-statusline-position]');
  let statuslineClearTimer = null;

  function setStatuslineMode(mode) {
    if (statuslineMode) statuslineMode.textContent = mode;
  }

  function setStatuslineCommand(command, options = {}) {
    if (!statuslineCommand) return;

    window.clearTimeout(statuslineClearTimer);
    statuslineCommand.textContent = command || '';
    statuslineCommand.classList.toggle('is-active', Boolean(command));
    if (statuslineCommandWrap) {
      statuslineCommandWrap.classList.toggle('is-active', Boolean(command));
    }

    if (command && options.clearAfter) {
      statuslineClearTimer = window.setTimeout(() => {
        setStatuslineCommand('');
      }, options.clearAfter);
    }
  }

  window.rybkrSetStatuslineMode = setStatuslineMode;
  window.rybkrSetStatuslineCommand = setStatuslineCommand;

  function updateStatuslinePosition() {
    if (!statuslinePosition) return;

    const scrollMax = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      0
    );

    if (scrollMax <= 0 || window.scrollY <= 0) {
      statuslinePosition.textContent = 'Top';
      return;
    }

    if (window.scrollY >= scrollMax - 2) {
      statuslinePosition.textContent = 'Bot';
      return;
    }

    const percent = Math.min(99, Math.max(1, Math.round((window.scrollY / scrollMax) * 100)));
    statuslinePosition.textContent = `${percent}%`;
  }

  if (statuslinePosition) {
    let statuslinePositionTicking = false;
    const requestStatuslinePositionUpdate = () => {
      if (statuslinePositionTicking) return;
      statuslinePositionTicking = true;
      window.requestAnimationFrame(() => {
        updateStatuslinePosition();
        statuslinePositionTicking = false;
      });
    };

    updateStatuslinePosition();
    window.addEventListener('scroll', requestStatuslinePositionUpdate, { passive: true });
    window.addEventListener('resize', requestStatuslinePositionUpdate);
    window.addEventListener('load', requestStatuslinePositionUpdate);
  }

  const backToTop = document.getElementById('back-to-top');

  if (backToTop) {
    let ticking = false;

    function updateBackToTop() {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateBackToTop);
        ticking = true;
      }
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // -------------------------------------------------------
  // Keyboard Shortcuts Modal
  // -------------------------------------------------------

  const shortcutsModal = document.getElementById('shortcuts-modal');

  // -------------------------------------------------------
  // Vim Navigation
  // -------------------------------------------------------

  let pendingG = false;
  let pendingGTimer = null;

  function isPaletteOpen() {
    const palette = document.getElementById('command-palette');
    return Boolean(palette && palette.classList.contains('open'));
  }

  function isShortcutsOpen() {
    return Boolean(shortcutsModal && shortcutsModal.classList.contains('open'));
  }

  function clearPendingG() {
    pendingG = false;
    window.clearTimeout(pendingGTimer);
    pendingGTimer = null;
    setStatuslineCommand('');
  }

  function scrollPageTo(position) {
    clearPendingG();
    window.scrollTo({ top: position, behavior: 'smooth' });
  }

  function scrollByAmount(amount) {
    clearPendingG();
    window.scrollBy({ top: amount, behavior: 'auto' });
  }

  function flashNavigationCommand(command) {
    setStatuslineCommand(command, { clearAfter: 850 });
  }

  function navigatePager(selector, command) {
    const link = document.querySelector(selector);
    if (!link) {
      flashNavigationCommand(`${command}: no target`);
      return;
    }

    clearPendingG();
    window.location.href = link.href;
  }

  function visibleSectionHeadings() {
    const headings = document.querySelectorAll(
      '.post-content h2, .post-content h3, .project-body h2, .project-body h3, main h2, main h3'
    );

    return Array.from(headings).filter(heading => {
      const rect = heading.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
  }

  function jumpSection(direction) {
    const headings = visibleSectionHeadings();
    if (headings.length === 0) {
      clearPendingG();
      flashNavigationCommand(direction > 0 ? '}: no section' : '{: no section');
      return;
    }

    const viewportOffset = window.innerHeight * 0.18;
    const currentY = window.scrollY + viewportOffset;
    const targets = headings
      .map(heading => ({
        heading,
        top: heading.getBoundingClientRect().top + window.scrollY
      }))
      .sort((a, b) => a.top - b.top);

    const target = direction > 0
      ? targets.find(item => item.top > currentY + 8)
      : targets.slice().reverse().find(item => item.top < currentY - 8);

    if (!target) {
      clearPendingG();
      flashNavigationCommand(direction > 0 ? '}: last section' : '{: first section');
      return;
    }

    clearPendingG();
    target.heading.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  document.addEventListener('keydown', (e) => {
    if (isInputFocused() || isPaletteOpen() || isShortcutsOpen()) return;
    if (e.metaKey || e.altKey) return;

    if (e.ctrlKey && e.key !== 'd' && e.key !== 'u') return;
    if (e.shiftKey && !['G', 'N', '{', '}'].includes(e.key)) return;

    const lineAmount = Math.max(48, Math.min(72, window.innerHeight * 0.08));
    const halfPage = Math.max(240, window.innerHeight * 0.5);

    switch (e.key) {
      case 'j':
        e.preventDefault();
        scrollByAmount(lineAmount);
        return;
      case 'k':
        e.preventDefault();
        scrollByAmount(-lineAmount);
        return;
      case 'd':
        if (!e.ctrlKey) {
          clearPendingG();
          return;
        }
        e.preventDefault();
        scrollByAmount(halfPage);
        return;
      case 'u':
        if (!e.ctrlKey) {
          clearPendingG();
          return;
        }
        e.preventDefault();
        scrollByAmount(-halfPage);
        return;
      case '}':
        e.preventDefault();
        jumpSection(1);
        return;
      case '{':
        e.preventDefault();
        jumpSection(-1);
        return;
      case 'n':
        e.preventDefault();
        navigatePager('.project-pagination .next, .pagination .next, .paginav .next, a[rel="next"]', 'n');
        return;
      case 'N':
        e.preventDefault();
        navigatePager('.project-pagination .prev, .pagination .prev, .paginav .prev, a[rel="prev"]', 'N');
        return;
      case 'G':
        e.preventDefault();
        scrollPageTo(document.documentElement.scrollHeight);
        flashNavigationCommand('G');
        return;
      case 'g':
        e.preventDefault();
        if (pendingG) {
          scrollPageTo(0);
          flashNavigationCommand('gg');
          return;
        }

        pendingG = true;
        setStatuslineCommand('g...');
        window.clearTimeout(pendingGTimer);
        pendingGTimer = window.setTimeout(clearPendingG, 900);
        return;
      default:
        clearPendingG();
    }
  });

  if (shortcutsModal) {

    function openShortcuts() {
      if (isCompactNavigationViewport()) return;
      shortcutsModal.classList.add('open');
      shortcutsModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeShortcuts() {
      shortcutsModal.classList.remove('open');
      shortcutsModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    // Open with ? key
    document.addEventListener('keydown', (e) => {
      // Don't trigger if typing in an input
      if (isInputFocused()) return;

      // Don't trigger if command palette is open
      const palette = document.getElementById('command-palette');
      if (palette && palette.classList.contains('open')) return;

      if (shortcutsModal.classList.contains('open')) {
        if (e.key === 'Escape') {
          e.preventDefault();
          clearPendingG();
          closeShortcuts();
        }
        return;
      }

      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        if (isCompactNavigationViewport()) return;
        e.preventDefault();
        clearPendingG();
        openShortcuts();
      }
    });

    // Close on backdrop click
    shortcutsModal.querySelector('.shortcuts-modal-backdrop').addEventListener('click', () => {
      clearPendingG();
      closeShortcuts();
    });

    // Close button
    const closeBtn = shortcutsModal.querySelector('.shortcuts-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        clearPendingG();
        closeShortcuts();
      });
    }
  }

  // -------------------------------------------------------
  // Copy Code Button
  // -------------------------------------------------------

  document.querySelectorAll('.highlight').forEach(block => {
    // Skip if already has a copy button
    if (block.querySelector('.copy-code')) return;

    const pre = block.querySelector('pre');
    if (!pre) return;

    const button = document.createElement('button');
    button.className = 'copy-code';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', 'Copy code to clipboard');

    button.addEventListener('click', async () => {
      const code = pre.querySelector('code');
      const text = code ? code.textContent : pre.textContent;

      try {
        await navigator.clipboard.writeText(text);
        button.textContent = 'Copied!';
        button.classList.add('copied');

        setTimeout(() => {
          button.textContent = 'Copy';
          button.classList.remove('copied');
        }, 2000);
      } catch (err) {
        button.textContent = 'Failed';
        setTimeout(() => {
          button.textContent = 'Copy';
        }, 2000);
      }
    });

    block.appendChild(button);
  });

  // -------------------------------------------------------
  // Search Hint (opens command palette)
  // -------------------------------------------------------

  function openCommandPalette() {
    if (window.rybkrOpenCommandPalette) {
      window.rybkrOpenCommandPalette({ mode: 'search' });
      return;
    }

    const palette = document.getElementById('command-palette');
    if (palette) {
      palette.classList.add('open');
      palette.setAttribute('aria-hidden', 'false');
      const input = document.getElementById('command-palette-input');
      if (input) input.focus();
      document.body.style.overflow = 'hidden';
    }
  }

  document.querySelectorAll('.search-hint').forEach(searchHint => {
    searchHint.addEventListener('click', openCommandPalette);
    searchHint.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCommandPalette();
      }
    });
  });

  document.querySelectorAll('[data-command-help]').forEach(helpHint => {
    helpHint.addEventListener('click', () => {
      if (window.rybkrOpenCommandPalette) {
        window.rybkrOpenCommandPalette({ mode: 'command', value: 'help' });
      } else {
        openCommandPalette();
      }
    });
  });

  // -------------------------------------------------------
  // Homepage Boids
  // -------------------------------------------------------

  const boidsCanvas = document.querySelector('[data-home-boids]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (boidsCanvas && !reducedMotion.matches && window.rybkrCreateBoidsCanvas) {
    const avoidElements = document.querySelectorAll('.home-intro > :not(.home-boids)');
    window.rybkrCreateBoidsCanvas(boidsCanvas, { avoidElements });
  }

  // -------------------------------------------------------
  // Email Copy Button
  // -------------------------------------------------------

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-1000px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      if (!document.execCommand('copy')) {
        throw new Error('copy failed');
      }
    } finally {
      document.body.removeChild(textarea);
    }
  }

  document.querySelectorAll('[data-email-copy]').forEach(button => {
    const email = button.dataset.email;
    const statusId = button.getAttribute('aria-describedby');
    const status = statusId ? document.getElementById(statusId) : null;

    if (!email) return;

    button.addEventListener('click', async () => {
      window.clearTimeout(button._emailCopyTimer);

      try {
        await copyText(email);
        button.classList.add('is-copied');
        if (status) {
          status.textContent = 'Copied email';
          status.setAttribute('aria-label', `Copied ${email} to clipboard.`);
          status.classList.add('is-visible');
        }
      } catch (err) {
        if (status) {
          status.textContent = email;
          status.setAttribute('aria-label', `Email address: ${email}.`);
          status.classList.add('is-visible');
        }
      }

      button._emailCopyTimer = window.setTimeout(() => {
        button.classList.remove('is-copied');
        if (status) {
          status.classList.remove('is-visible');
          status.removeAttribute('aria-label');
          status.textContent = '';
        }
      }, 2200);
    });
  });

  // -------------------------------------------------------
  // Utility
  // -------------------------------------------------------

  function isInputFocused() {
    const active = document.activeElement;
    return active && (
      active.tagName === 'INPUT' ||
      active.tagName === 'TEXTAREA' ||
      active.isContentEditable
    );
  }
})();
