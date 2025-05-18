// ==UserScript==
// @name         Resize ChatGPT Sidebar Fully + Show Full Titles
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Removes mask from history titles and unsets --sidebar-width limitation on ChatGPT sidebar. Applies min-width of 500px instead of 260px default restriction.
// @author       Rahul Rajaram
// @match        https://chatgpt.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const SIDEBAR_MIN_WIDTH = 500;

    function overrideSidebarStyles() {
        const sidebar = document.getElementById('sidebar');
        const sidebarAlt = document.querySelector('.bg-token-sidebar-surface-primary');

        [sidebar, sidebarAlt].forEach(el => {
            if (el) {
                el.style.minWidth = `${SIDEBAR_MIN_WIDTH}px`;
                el.style.overflow = 'auto';
            }
        });

        // Unset the --sidebar-width CSS variable
        const rootEl = document.documentElement; // <html>
        rootEl.style.setProperty('--sidebar-width', 'unset', 'important');
    }

    function removeMaskFromHistoryTitles() {
        const titleDivs = document.querySelectorAll('[data-history-item-link] div[style*="mask-image"]');
        for (const div of titleDivs) {
            div.style.maskImage = 'none';
            div.style.webkitMaskImage = 'none';
        }
    }

    function applyAll() {
        overrideSidebarStyles();
        removeMaskFromHistoryTitles();
    }

    const observer = new MutationObserver(applyAll);
    observer.observe(document.body, { childList: true, subtree: true });

    applyAll();
})();
