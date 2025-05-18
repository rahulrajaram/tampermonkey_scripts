// ==UserScript==
// @name         Deep Research - copy (ChatGPT Patch)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Injects "Deep Research - copy" button on all pages, toggles highlight, and mutates requests to include system_hints=["research"] if selected independently of the native button behavior.
// @author       Rahul Rajaram
// @match        https://chatgpt.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const BUTTON_ID = 'tm-deep-research-copy';
    let deepResearchCopyEnabled = false;

    function createButton() {
        if (document.getElementById(BUTTON_ID)) return;

        const wrapper = document.createElement('div');
        wrapper.setAttribute('data-testid', 'system-hint-research-copy');
        wrapper.setAttribute('style', 'view-transition-name:var(--vt-composer-research-action)');
        wrapper.id = BUTTON_ID;

        const outerDiv = document.createElement('div');
        outerDiv.className = 'inline-flex h-9 rounded-full border text-[13px] font-medium border-token-border-default can-hover:hover:bg-token-main-surface-secondary focus-visible:outline-black dark:focus-visible:outline-white';
        outerDiv.style.cursor = 'pointer';

        const span = document.createElement('span');
        span.className = 'inline-block';
        span.dataset.state = 'closed';

        const button = document.createElement('button');
        button.className = 'flex h-full min-w-8 items-center justify-center p-2';
        button.setAttribute('aria-pressed', 'false');
        button.setAttribute('aria-label', 'Deep Research - copy');
        button.setAttribute('data-testid', 'composer-button-deep-research-copy');

        button.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg" class="h-[18px] w-[18px]">
                <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M12.47 15.652a1 1 0 0 1 1.378.318l2.5 4a1 1 0 1 1-1.696 1.06l-2.5-4a1 1 0 0 1 .318-1.378Z"
                    fill="currentColor"></path>
                <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M11.53 15.652a1 1 0 0 1 .318 1.378l-2.5 4a1 1 0 0 1-1.696-1.06l2.5-4a1 1 0 0 1 1.378-.318Z"
                    fill="currentColor"></path>
                <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M12 12.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM8.5 14a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z"
                    fill="currentColor"></path>
            </svg>
            <div class="[display:var(--force-hide-label)] ps-1 pe-1 whitespace-nowrap">Deep Research - copy</div>
        `;

        button.addEventListener('click', () => {
            deepResearchCopyEnabled = !deepResearchCopyEnabled;
            wrapper.style.backgroundColor = deepResearchCopyEnabled ? 'rgba(0, 122, 255, 0.2)' : '';
        });

        span.appendChild(button);
        outerDiv.appendChild(span);
        wrapper.appendChild(outerDiv);

        return wrapper;
    }

    function injectButton() {
        const parent = document.querySelector('[data-testid="composer-action-file-upload"]')?.parentElement;
        if (parent && !document.getElementById(BUTTON_ID)) {
            const button = createButton();
            if (button) parent.appendChild(button);
        }
    }

    function patchFetch() {
        const originalFetch = window.fetch;
        window.fetch = async function (...args) {
            const [resource, config] = args;

            if (typeof resource === 'string' && resource.includes('/backend-api/conversation')) {
                try {
                    const body = JSON.parse(config?.body);
                    if (deepResearchCopyEnabled) {
    if (!body.system_hints) body.system_hints = [];
    if (!body.system_hints.includes('research')) {
        body.system_hints.push('research');
    }

    // Also inject into message metadata
    if (Array.isArray(body.messages)) {
        for (const msg of body.messages) {
            if (!msg.metadata) msg.metadata = {};
            if (!msg.metadata.system_hints) msg.metadata.system_hints = [];
            if (!msg.metadata.system_hints.includes('research')) {
                msg.metadata.system_hints.push('research');
            }
        }
    }

    config.body = JSON.stringify(body);
}

                } catch (e) {
                    console.warn('[DeepResearch-copy] Failed to parse or modify request:', e);
                }
            }

            return originalFetch.apply(this, [resource, config]);
        };
    }

    // Observe DOM mutations in case composer loads late
    const observer = new MutationObserver(() => {
        injectButton();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Initial setup
    patchFetch();
    injectButton();
})();

