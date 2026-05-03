/**
 * main.js — エントリーポイント
 *
 * 各モジュールを import し、ページに応じた初期化を実行する。
 * initLetterTop / initRouter はそれぞれ対象要素の有無を内部で確認するため、
 * どちらのページで読み込んでも安全に動作する。
 */

import { initLetterTop } from './letter.js';
import { initRouter }    from './router.js';
import { initWorks } from './works.js';

/* index.html：手紙クリックアニメーション */
initLetterTop();

/* portfolio.html：SPA ビュールーター */
initRouter();

/* portfolio.html：<template id="works-data">  */
initWorks();