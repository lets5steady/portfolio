/**
 * js/logModal.js
 * 勉強記録モーダル
 *
 * <dialog> 要素を使用。
 * ブラウザが自動で行うこと：
 *   - Escape キーで閉じる
 *   - フォーカストラップ
 *   - ::backdrop の表示
 *
 * JS で行うこと：
 *   - トリガークリックで showModal()
 *   - 閉じるボタンで close()
 *   - ::backdrop クリックで close()（<dialog> は自動対応しないため）
 */

export function initLogModal() {
  const trigger  = document.getElementById('logTrigger');
  const modal    = document.getElementById('logModal');
  const closeBtn = document.getElementById('logModalClose');

  if (!trigger || !modal || !closeBtn) return;

  /* ── 開く ──────────────────────────────────────────────── */
  trigger.addEventListener('click', () => {
    modal.showModal();
  });

  /* ── 閉じるボタン ───────────────────────────────────────── */
  closeBtn.addEventListener('click', () => {
    modal.close();
  });

  /* ── ::backdrop クリックで閉じる ────────────────────────── */
  // <dialog> 自体のクリックを検知し、パネル内部でなければ閉じる
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.close();
    }
  });
}