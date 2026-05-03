/**
 * js/letter.js
 * 手紙クリックアニメーション — index.html 専用
 *
 * #letterImg をクリック／Enter・Space キーで操作すると
 * is-flying クラスを付与してアニメーション後に portfolio.html へ遷移する。
 */

import { prefersReducedMotion } from './utils.js';

/**
 * 手紙トップページを初期化する
 * #letterImg が存在しない場合（portfolio.html 等）は何もしない
 */
export function initLetterTop() {
  const letter = document.querySelector('#letterImg');
  if (!letter) return;

  /** アニメーション → ページ遷移を実行する */
  function flyAndNavigate() {
    /* 二重クリック防止：リスナーを即解除 */
    letter.removeEventListener('click',   flyAndNavigate);
    letter.removeEventListener('keydown', onKeyDown);

    /* アニメーション無効環境：即遷移 */
    if (prefersReducedMotion()) {
      window.location.href = 'portfolio.html';
      return;
    }

    letter.style.willChange = 'transform, opacity';
    letter.classList.add('is-flying');

    /* CSS transition の duration（0.5s）に合わせて遷移 */
    setTimeout(() => {
      window.location.href = 'portfolio.html';
    }, 500);
  }

  /** Enter / Space キーで flyAndNavigate を発火 */
  function onKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      flyAndNavigate();
    }
  }

  letter.addEventListener('click',   flyAndNavigate);
  letter.addEventListener('keydown', onKeyDown);
}