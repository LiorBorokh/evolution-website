document.addEventListener('DOMContentLoaded', () => {

  /* ─── Navbar: scroll effect ─── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  /* ─── Navbar: hamburger toggle ─── */
  const toggle   = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.toggle('open');
      navLinks.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ─── Navbar: active link ─── */
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    const isIndex = href === 'index.html' || href === '../index.html' || href === '/';
    const isHome  = path === '/' || path.endsWith('/') || path.endsWith('index.html');
    if (isIndex && isHome) {
      link.classList.add('active');
    } else if (!isIndex && path.endsWith(href.replace('../', ''))) {
      link.classList.add('active');
    }
  });

  /* ─── Scroll reveal ─── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ─── DNA helix animation delays ─── */
  document.querySelectorAll('.dna-dot').forEach((dot, i) => {
    dot.style.animationDelay = `${(i * 0.18) % 2}s`;
  });
  document.querySelectorAll('.dna-line').forEach((line, i) => {
    line.style.animationDelay = `${(i * 0.18 + 0.09) % 2}s`;
  });

  /* ─── Glossary: live search ─── */
  const searchInput = document.getElementById('glossarySearch');
  if (searchInput) {
    const termCards  = document.querySelectorAll('.glossary-term');
    const emptyState = document.getElementById('glossaryEmpty');

    const filterCards = () => {
      const activeChip = document.querySelector('.chip.active');
      const category   = activeChip ? activeChip.dataset.filter : 'all';
      const query      = searchInput.value.trim().toLowerCase();
      let visible = 0;

      termCards.forEach(card => {
        const term    = (card.dataset.term   || '').toLowerCase();
        const def     = (card.querySelector('.term-definition')?.textContent || '').toLowerCase();
        const catMatch = category === 'all' || card.dataset.category === category;
        const qMatch   = !query || term.includes(query) || def.includes(query);
        const show     = catMatch && qMatch;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });

      if (emptyState) emptyState.style.display = visible === 0 ? 'block' : 'none';
    };

    searchInput.addEventListener('input', filterCards);

    /* ─── Filter chips ─── */
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        filterCards();
      });
    });
  }

});
