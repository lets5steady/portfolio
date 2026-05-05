/**
 * js/router.js
 * SPA ビュールーター — portfolio.html 専用
 *
 * data-target 属性を持つボタンのクリック／キーボード操作を受け取り、
 * 対応する data-view を持つ要素へアニメーション付きで切り替える。
 */

import { prefersReducedMotion, revealInView } from './utils.js';

/** 現在表示中のビュー名 */
let currentView = 'menu';

/**
 * 指定ビューへ切り替える
 * @param {string} targetName — 切り替え先の data-view 値
 * @param {string} direction  — 'forward'（前進）| 'back'（後退）
 */
function switchView(targetName, direction) {
  const targetView = document.querySelector(`[data-view="${targetName}"]`);
  if (!targetView || targetName === currentView) return;

  const fromView = document.querySelector(`[data-view="${currentView}"]`);

  /* ── アニメーション無効環境：即切り替え ── */
  if (prefersReducedMotion()) {
    if (fromView) fromView.hidden = true;
    targetView.hidden = false;
    currentView = targetName;
    window.scrollTo(0, 0);
    revealInView(targetView);
    return;
  }

  /* ── アニメーション有効環境 ──────────────────────────────────
     ① fromView に退場クラスを付与（opacity:0 へ）
        transitionend で hidden = true をセット
     ② targetView を画面外待機位置に置いてから入場させる
        transitionend でクリーンアップ + revealInView 呼び出し
     ─────────────────────────────────────────────────────────── */

  /* 多重クリック防止：先に currentView を更新 */
  currentView = targetName;

  /* ① fromView 退場 */
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

  /* ② targetView 入場準備（待機位置クラスは transition:none なので瞬間移動） */
  const enterClass = direction === 'back' ? 'is-entering--left' : 'is-entering--right';
  targetView.classList.add('is-entering', enterClass);
  targetView.hidden = false;

  /* ③ 2フレーム後に待機クラスを外して入場アニメーション開始 */
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

/**
 * ルーターを初期化する
 * .tracklist__list が存在しない場合（index.html 等）は何もしない
 */
export function initRouter() {

  if (!document.querySelector('.tracklist__list')) return;

  /* 初期ビュー（menu）を出現させる */
  const menuView = document.querySelector('[data-view="menu"]');
  if (menuView) revealInView(menuView);

  /* クリックイベントをドキュメント全体に委譲 */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-target]');
    if (!btn) return;

    const target    = btn.dataset.target;
    const direction = target === 'menu' ? 'back' : 'forward';
    switchView(target, direction);
  });

  /* キーボード：Enter / Space */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const btn = e.target.closest('[data-target]');
    if (!btn) return;
    e.preventDefault();
    btn.click();
  });
}
