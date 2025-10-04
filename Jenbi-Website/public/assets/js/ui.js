export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
export const on = (el, type, fn, opts) => el && el.addEventListener(type, fn, opts);
export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
