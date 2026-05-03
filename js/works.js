/**
 * js/works.js
 * Works ビュー — フィーチャー切り替えロジック
 *
 * 選択された .work-item（<li>）を #worksList から #worksFeature へ移動する。
 * 前の選択アイテムは placeholder コメントノードを目印に元の位置へ戻す。
 *
 * ノードの破棄は一切行わない（innerHTML = '' を使わない）ため、
 * イベントリスナーと DOM 参照が保持され、繰り返し選択しても正常動作する。
 *
 * 呼び出し元: main.js → initWorks()
 */

import { prefersReducedMotion } from './utils.js';

export function initWorks() {
  const featureCol = document.getElementById('worksFeature');
  const listCol    = document.getElementById('worksList');
  if (!featureCol || !listCol) return;

  /**
   * 各アイテムの情報を Map で管理
   * key:   data-work-id（文字列）
   * value: { item: <li>, card: <article>, placeholder: コメントノード }
   */
  const itemMap = new Map();

  listCol.querySelectorAll('.work-item').forEach(item => {
    const id = item.dataset.workId;
    if (!id) return;
    // <li> の直後にコメントノードを置き、元の位置のマーカーとして使う
    const placeholder = document.createComment(`work-placeholder-${id}`);
    item.after(placeholder);
    itemMap.set(id, {
      item,
      card: item.querySelector('.work-card'),
      placeholder,
    });
  });

  if (itemMap.size === 0) return;

  // 初期選択：最初のアイテム
  let activeId = itemMap.keys().next().value;
  moveToFeature(activeId, null, itemMap, featureCol);

  // 右列クリックを委譲（リンクのクリックは除外）
  listCol.addEventListener('click', (e) => {
    if (e.target.closest('.work-link')) return;
    const item = e.target.closest('.work-item');
    if (!item) return;

    const newId = item.dataset.workId;
    if (!newId || newId === activeId) return;

    const prevId = activeId;
    activeId = newId;

    moveToFeature(activeId, prevId, itemMap, featureCol);

    // アニメーション無効環境はここで終了
    if (prefersReducedMotion()) return;

    // 入場アニメーション
    const nextCard = itemMap.get(activeId)?.card;
    if (nextCard) {
      nextCard.classList.add('is-entering');
      nextCard.addEventListener('animationend', () => {
        nextCard.classList.remove('is-entering');
      }, { once: true });
    }
  });
}


// ─────────────────────────────────────────────────────────────────────────────
//  内部ユーティリティ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * activeId の <li> を #worksFeature へ移動し、
 * prevId の <li> を placeholder を目印に #worksList の元の位置へ戻す
 *
 * @param {string}               activeId
 * @param {string|null}          prevId
 * @param {Map}                  itemMap
 * @param {HTMLElement}          featureCol
 */
function moveToFeature(activeId, prevId, itemMap, featureCol) {
  // 前のアイテムを #worksList の元の位置に戻す
  if (prevId) {
    const prev = itemMap.get(prevId);
    if (prev) {
      // placeholder の直前に <li> を挿入 → 元の順序に復元
      prev.placeholder.before(prev.item);
    }
  }

  // featureCol の子を安全に除去（innerHTML = '' は使わない）
  while (featureCol.firstChild) {
    featureCol.removeChild(featureCol.firstChild);
  }

  // 新しいアイテムを #worksFeature へ移動
  const next = itemMap.get(activeId);
  if (!next) return;
  featureCol.appendChild(next.item);
}