// ==UserScript==
// @name         ChatGPT Project Chats Scroll Fix
// @namespace    pl.4as.chatgpt
// @version      0.8
// @description  Makes the <ol> element after "Chats in this project" header scrollable dynamically.
//               Current behaviour is for the ChatGPT interface to suppress scrolling. It makes it
//               painful to locate specific chats as the only alternatives are to zoom out, or move
//               chats outside projects, or search. This should hopefully get fixed at some point
//               soon. See:
//               https://community.openai.com/t/cant-scroll-chat-list-in-project-page/1139754/7
// @author       Rahul Rajaram
// @match        *://chatgpt.com/*
// @match        *://chat.openai.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function makeOlScrollable() {
        const headers = document.querySelectorAll('h3');

        headers.forEach(h3 => {
            if (h3.textContent.trim() === 'Chats in this project') {
                const olElement = h3.nextElementSibling;
                if (olElement && olElement.tagName.toLowerCase() === 'ol') {
                    const rect = olElement.getBoundingClientRect();
                    const availableHeight = window.innerHeight - rect.top - 20; // 20px padding from bottom
                    olElement.style.overflowY = 'auto';
                    olElement.style.maxHeight = availableHeight + 'px';
                }
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", makeOlScrollable);
    } else {
        makeOlScrollable();
    }

    window.addEventListener('resize', makeOlScrollable);

    // Observe DOM changes to reapply if needed
    const observer = new MutationObserver(makeOlScrollable);
    observer.observe(document.body, { childList: true, subtree: true });
})();
