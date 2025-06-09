// ==UserScript==
// @name         ChatGPT Projects Scroll Fix
// @namespace    pl.4as.chatgpt
// @version      0.9
// @description  Makes the div with class "contain-inline-size" dynamically scrollable
// @author       ChatGPT
// @match        *://chatgpt.com/*
// @match        *://chat.openai.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function makeDivScrollable() {
        const scrollableDivs = document.querySelectorAll('div.contain-inline-size');

        scrollableDivs.forEach(div => {
            const rect = div.getBoundingClientRect();
            const availableHeight = window.innerHeight - rect.top - 20; // 20px padding from bottom
            div.style.overflowY = 'auto';
            div.style.maxHeight = availableHeight + 'px';
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", makeDivScrollable);
    } else {
        makeDivScrollable();
    }

    window.addEventListener('resize', makeDivScrollable);

    // Observe DOM changes to reapply if needed
    const observer = new MutationObserver(makeDivScrollable);
    observer.observe(document.body, { childList: true, subtree: true });
})();
