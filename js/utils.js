/**
 * js/utils.js
 * 共通ユーティリティ
 * すべてのモジュールから import して使う
 */

/**
 * prefers-reduced-motion が有効かどうかを確認する
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * view 内の .js-reveal 要素を stagger で出現させる
 * @param {Element} viewEl — 対象となるルート要素
 */
export function revealInView(viewEl) {
  const targets = viewEl.querySelectorAll('.js-reveal');
  if (!targets.length) return;

  /* アニメーション無効環境：即表示 */
  if (prefersReducedMotion()) {
    targets.forEach(el => el.classList.add('is-visible'));
    return;
  }

  /* 各要素を 80ms ずつずらして出現（stagger） */
  targets.forEach((el, i) => {
    el.style.willChange = 'opacity, transform';

    setTimeout(() => {
      requestAnimationFrame(() => el.classList.add('is-visible'));
    }, i * 80);

    /* transition 完了後に will-change を解除 */
    el.addEventListener('transitionend', function onEnd() {
      el.style.willChange = 'auto';
      el.removeEventListener('transitionend', onEnd);
    }, { once: true });
  });
}