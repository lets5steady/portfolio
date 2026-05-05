/**
 * js/works.js
 * Works ビュー — フィーチャー切り替えロジック
 *
 * 選択された .works__item（<li>）を #worksList から #worksFeature へ移動する。
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

  listCol.querySelectorAll('.works__item').forEach(item => {
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

  // リスト列クリックを委譲（リンクのクリックは除外）
  listCol.addEventListener('click', (e) => {
    if (e.target.closest('.work-card__link')) return;
    const item = e.target.closest('.works__item');
    if (!item) return;

    const newId = item.dataset.workId;
    if (!newId || newId === activeId) return;

    const prevId = activeId;
    activeId = newId;

    moveToFeature(activeId, prevId, itemMap, featureCol);
  });
}


// ─────────────────────────────────────────────────────────────────────────────
//  内部ユーティリティ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * activeId の <li> を #worksFeature へ移動し、
 * prevId の <li> を placeholder を目印に #worksList の元の位置へ戻す
 *
 * @param {string}      activeId
 * @param {string|null} prevId
 * @param {Map}         itemMap
 * @param {HTMLElement} featureCol
 */
function moveToFeature(activeId, prevId, itemMap, featureCol) {
  // 1. 前のアイテムを元の位置（placeholderの直前）に戻す
  if (prevId) {
    const prev = itemMap.get(prevId);
    if (prev) {
      // placeholder の直前に <li> を挿入 → 元の順序に復元
      prev.placeholder.before(prev.item);
    }
  }

  // 2. featureCol の中身を空にする（念のための安全策）
  while (featureCol.firstChild) {
    featureCol.removeChild(featureCol.firstChild);
  }

  // 3. 新しいアイテムを取得し、featureCol へ移動（ここで中身が入れ替わる）
  const next = itemMap.get(activeId);
  if (!next) return;
  featureCol.appendChild(next.item);

  // 4. 移動が完了し、高さが決まった後にスクロールを実行
  const scrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';
  featureCol.scrollIntoView({
    behavior: scrollBehavior,
    block: 'start'
  });
}
