(function() {
  'use strict';

  // -------------------------------------------------------
  // Back to Top Button
  // -------------------------------------------------------

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

  if (shortcutsModal) {
    function openShortcuts() {
      shortcutsModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeShortcuts() {
      shortcutsModal.classList.remove('open');
      document.body.style.overflow = '';
    }

    // Open with ? key
    document.addEventListener('keydown', (e) => {
      // Don't trigger if typing in an input
      if (isInputFocused()) return;

      // Don't trigger if command palette is open
      const palette = document.getElementById('command-palette');
      if (palette && palette.classList.contains('open')) return;

      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        if (shortcutsModal.classList.contains('open')) {
          closeShortcuts();
        } else {
          openShortcuts();
        }
      }

      if (e.key === 'Escape' && shortcutsModal.classList.contains('open')) {
        e.preventDefault();
        closeShortcuts();
      }
    });

    // Close on backdrop click
    shortcutsModal.querySelector('.shortcuts-modal-backdrop').addEventListener('click', closeShortcuts);

    // Close button
    const closeBtn = shortcutsModal.querySelector('.shortcuts-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeShortcuts);
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
