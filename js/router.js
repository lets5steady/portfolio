import { prefersReducedMotion, revealInView } from './utils.js';

let currentView = 'menu';

function switchView(targetName, direction, pushHistory = true) {
  const targetView = document.querySelector(`[data-view="${targetName}"]`);
  if (!targetView || targetName === currentView) return;

  const fromView = document.querySelector(`[data-view="${currentView}"]`);

  currentView = targetName;

  // ── 履歴に積む（popstate 経由の場合は積まない）──────────
  if (pushHistory) {
    history.pushState({ view: targetName }, '', `#${targetName}`);
  }

  if (prefersReducedMotion()) {
    if (fromView) fromView.hidden = true;
    targetView.hidden = false;
    window.scrollTo(0, 0);
    revealInView(targetView);
    return;
  }

  if (fromView) {
    fromView.style.willChange = 'transform, opacity';
    fromView.classList.add('is-leaving');
    fromView.classList.add(direction === 'back' ? 'is-leaving--right' : 'is-leaving--left');

    fromView.addEventListener('transitionend', function onLeave(e) {
      if (e.propertyName !== 'opacity') return;
      fromView.removeEventListener('transitionend', onLeave);
      fromView.hidden = true;
      fromView.classList.remove('is-leaving', 'is-leaving--left', 'is-leaving--right');
      fromView.style.willChange = 'auto';
    });
  }

  const enterClass = direction === 'back' ? 'is-entering--left' : 'is-entering--right';
  targetView.classList.add('is-entering', enterClass);
  targetView.hidden = false;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      targetView.style.willChange = 'transform, opacity';
      targetView.classList.remove('is-entering', enterClass);

      targetView.addEventListener('transitionend', function onEnter(e) {
        if (e.propertyName !== 'opacity') return;
        targetView.removeEventListener('transitionend', onEnter);
        targetView.style.willChange = 'auto';
        window.scrollTo(0, 0);
        revealInView(targetView);
      });
    });
  });
}

export function initRouter() {
  if (!document.querySelector('.tracklist__list')) return;

  // ── 初期状態を履歴に記録 ──────────────────────────────────
  // ハッシュがあればそのビューから開始、なければ menu
  const initialView = location.hash.replace('#', '') || 'menu';
  history.replaceState({ view: initialView }, '', `#${initialView}`);

  // initialView が menu 以外なら該当ビューを表示
  if (initialView !== 'menu') {
    const menuView = document.querySelector('[data-view="menu"]');
    if (menuView) menuView.hidden = true;
    const startView = document.querySelector(`[data-view="${initialView}"]`);
    if (startView) {
      startView.hidden = false;
      currentView = initialView;
      revealInView(startView);
    }
  } else {
    const menuView = document.querySelector('[data-view="menu"]');
    if (menuView) revealInView(menuView);
  }

  // ── popstate：ブラウザの戻る／進むボタン対応 ──────────────
  window.addEventListener('popstate', (e) => {
    const target = e.state?.view ?? 'menu';
    const direction = target === 'menu' ? 'back' : 'forward';
    switchView(target, direction, false); // 履歴は積まない
  });

  // ── クリック委譲 ──────────────────────────────────────────
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-target]');
    if (!btn) return;
    const target    = btn.dataset.target;
    const direction = target === 'menu' ? 'back' : 'forward';
    switchView(target, direction);
  });

  // ── キーボード ────────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const btn = e.target.closest('[data-target]');
    if (!btn) return;
    e.preventDefault();
    btn.click();
  });
}