// Small motion controller loaded before app.js. It exposes one helper that
// showPage() calls after toggling the page sections.

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
let iconsTagged = false;

function tagIcons() {
  if (iconsTagged) return;
  iconsTagged = true;
  document.querySelectorAll('.icon-button, .language-toggle, .mobile-menu').forEach((node) => {
    node.classList.add('icon-hoverable');
  });
}

function playPageTransition(container) {
  tagIcons();
  if (!container || reduced.matches) return;
  container.classList.remove('page-enter');
  // Force a reflow so the animation restarts when navigating rapidly.
  void container.offsetWidth;
  container.classList.add('page-enter');
  window.setTimeout(() => container.classList.remove('page-enter'), 150);
}

window.SiyajMotion = { playPageTransition };
