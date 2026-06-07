/**
 * js/lightbox.js
 * ライトボックス（モーダル画像拡大）— portfolio.html 専用
 *
 * .js-lightbox-trigger を持つ要素をクリックすると
 * #lightboxDialog を開き、data-lightbox-src の画像を表示する。
 *
 * 対応機能:
 *  - ネイティブ <dialog> による自動フォーカストラップ
 *  - Escape キーで閉じる（ブラウザ標準）
 *  - backdrop クリックで閉じる
 *  - prefers-reduced-motion 対応
 *  - 二重オープン防止
 */

import { prefersReducedMotion } from './utils.js';

export function initLightbox() {
    const dialog = document.getElementById('lightboxDialog');
    if (!dialog) return;

    const img = dialog.querySelector('.lightbox__img');
    const caption = dialog.querySelector('.lightbox__caption');
    const closeBtn = dialog.querySelector('.lightbox__close');

    /** ダイアログを開く */
    function openDialog(src, captionText) {
        if (dialog.open) return; // 二重オープン防止

        img.src = src;
        img.alt = captionText ?? '';
        caption.textContent = captionText ?? '';

        dialog.showModal();

        if (!prefersReducedMotion()) {
            /* 次フレームでクラスを付与してトランジションを発火させる */
            requestAnimationFrame(() => {
                requestAnimationFrame(() => dialog.classList.add('is-open'));
            });
        } else {
            dialog.classList.add('is-open');
        }
    }

    /** ダイアログを閉じる */
    function closeDialog() {
        if (!dialog.open) return;

        if (prefersReducedMotion()) {
            dialog.classList.remove('is-open');
            dialog.close();
            return;
        }

        dialog.classList.remove('is-open');
        dialog.addEventListener('transitionend', function onEnd(e) {
            if (e.propertyName !== 'opacity') return;
            dialog.removeEventListener('transitionend', onEnd);
            dialog.close();
        });
    }

    /* ── トリガークリック（委譲） ──────────────────────────────── */
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.js-lightbox-trigger');
        if (!trigger) return;
        const src = trigger.dataset.lightboxSrc;
        const cap = trigger.dataset.lightboxCaption ?? '';
        if (src) openDialog(src, cap);
    });

    /* ── 閉じるボタン ──────────────────────────────────────────── */
    closeBtn.addEventListener('click', closeDialog);

    /* ── backdrop クリックで閉じる ─────────────────────────────── */
    dialog.addEventListener('click', (e) => {
        /* dialog 要素自体（＝backdrop 領域）をクリックした場合のみ閉じる */
        if (e.target === dialog) closeDialog();
    });

    /* ── Escape キーのデフォルト動作（close()）発火後の後処理 ──── */
    dialog.addEventListener('close', () => {
        dialog.classList.remove('is-open');
    });
}