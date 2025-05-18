// ==UserScript==
// @name         Ctrl+Select Highlight with 12-Level Undo
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Highlight selected text in yellow on Ctrl+select. Undo up to 12 highlights with Ctrl+Z. Persistent until reload. No redo support yet.
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let ctrlDown = false;
    const highlightStack = [];
    const MAX_UNDOS = 12;
    const HIGHLIGHT_COLOR = 'rgb(102, 204, 0)';

    document.addEventListener('keydown', (e) => {
        if (isInEditableContext()) {
            return;
        }

        if (e.key === 'Control') {
            ctrlDown = true;
        }

        // Handle Ctrl+Z for undo
        if (e.key === 'z' && ctrlDown && highlightStack.length > 0) {
            // DO NOT call e.preventDefault()
            const lastHighlight = highlightStack.pop();
            if (lastHighlight && document.body.contains(lastHighlight)) {
                unwrapSpan(lastHighlight);
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'Control') ctrlDown = false;
    });

    function debounce(fn, delay) {
        let timer = null;
        return function() {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, arguments), delay);
        };
    }

    function unwrapSpan(span) {
        const parent = span.parentNode;
        while (span.firstChild) {
            parent.insertBefore(span.firstChild, span);
        }
        parent.removeChild(span);
    }

    function isInEditableContext() {
        const active = document.activeElement;
        return (
            active &&
            (
                active.tagName === 'TEXTAREA' ||
                active.tagName === 'INPUT' ||
                active.isContentEditable
            )
        );
    }
    document.addEventListener('selectionchange', debounce(() => {
        if (!ctrlDown) return;

        const selection = window.getSelection();
        if (!selection.rangeCount || selection.isCollapsed) return;

        const range = selection.getRangeAt(0);
        const highlight = document.createElement('span');
        highlight.style.backgroundColor = HIGHLIGHT_COLOR;
        highlight.classList.add('ctrl-highlighted');
        highlight.appendChild(range.extractContents());
        range.insertNode(highlight);

        // Maintain a bounded stack of up to 12 highlights
        highlightStack.push(highlight);
        if (highlightStack.length > MAX_UNDOS) {
            highlightStack.shift(); // drop oldest
        }

        selection.removeAllRanges();
        ctrlDown = false;
    }, 200));
})();
