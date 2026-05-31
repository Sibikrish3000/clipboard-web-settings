// ==UserScript==
// @name         Advanced Clipboard Formatter GUI (Minimal)
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Tiny trigger button with a pop-up dialog box to customize clipboard exports for ONLYOFFICE
// @author       Sibi Krishnamoorthy
// @match        https://aistudio.google.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // --- Configuration State Management ---
    const CONFIG = {
        enabled: GM_getValue('cfg_enabled', true),
        fontFamily: GM_getValue('cfg_fontFamily', 'Arial Nova Light'),
        fontSize: GM_getValue('cfg_fontSize', '11pt'),
        textAlign: GM_getValue('cfg_textAlign', 'justify'),
        lineHeight: GM_getValue('cfg_lineHeight', 'normal'),
        fontColor: GM_getValue('cfg_fontColor', 'inherit'),
        keepBoldItalic: GM_getValue('cfg_keepBoldItalic', true),
        stripLists: GM_getValue('cfg_stripLists', false)
    };

    // --- Clipboard Event Interception ---
    document.addEventListener('copy', function(e) {
        if (!CONFIG.enabled) return;

        const selection = window.getSelection();
        if (!selection.rangeCount || selection.toString().trim() === '') return;

        const container = document.createElement('div');
        for (let i = 0; i < selection.rangeCount; i++) {
            container.appendChild(selection.getRangeAt(i).cloneContents());
        }

        const allElements = container.querySelectorAll('*');
        
        container.style.fontFamily = CONFIG.fontFamily;
        container.style.fontSize = CONFIG.fontSize;
        container.style.textAlign = CONFIG.textAlign;
        container.style.lineHeight = CONFIG.lineHeight;
        container.style.color = CONFIG.fontColor;

        allElements.forEach(el => {
            if (!CONFIG.keepBoldItalic) {
                if (['B', 'STRONG', 'I', 'EM'].includes(el.tagName)) {
                    const textNode = document.createTextNode(el.textContent);
                    el.parentNode.replaceChild(textNode, el);
                    return;
                }
                el.style.fontWeight = 'normal';
                el.style.fontStyle = 'normal';
            }

            if (CONFIG.stripLists && ['UL', 'OL', 'LI'].includes(el.tagName)) {
                if (el.tagName === 'LI') {
                    const p = document.createElement('p');
                    p.innerHTML = '• ' + el.innerHTML;
                    el.parentNode.replaceChild(p, el);
                    return;
                }
            }

            el.style.fontFamily = CONFIG.fontFamily;
            el.style.fontSize = CONFIG.fontSize;
            el.style.textAlign = CONFIG.textAlign;
            el.style.lineHeight = CONFIG.lineHeight;
            el.style.color = CONFIG.fontColor;
            el.style.backgroundColor = 'transparent';
        });

        e.clipboardData.setData('text/plain', selection.toString());
        e.clipboardData.setData('text/html', container.innerHTML);
        e.preventDefault();
    }, true);

    // --- GUI Construction & Styling ---
    function initGUI() {
        // CSS Style Injector
        const style = document.createElement('style');
        style.textContent = `
            /* Tiny Trigger Button */
            #cfp-trigger-btn {
                position: fixed;
                bottom: 15px;
                right: 15px;
                width: 28px;
                height: 28px;
                background: #2b2b2b;
                color: #e0e0e0;
                border: 1px solid #444;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                z-index: 99999;
                transition: background 0.2s, transform 0.2s;
            }
            #cfp-trigger-btn:hover {
                background: #3a3a3a;
                transform: scale(1.05);
            }
            #cfp-trigger-btn svg {
                width: 16px;
                height: 16px;
                fill: currentColor;
            }

            /* Dialog Box */
            #cfp-dialog {
                position: fixed;
                bottom: 50px;
                right: 15px;
                width: 260px;
                background: #1e1e1e;
                color: #e0e0e0;
                border: 1px solid #333;
                border-radius: 8px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                font-size: 11px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.6);
                z-index: 99998;
                display: none;
                flex-direction: column;
                overflow: hidden;
                user-select: none;
            }
            .cfp-header {
                background: #2d2d2d;
                padding: 8px 12px;
                font-weight: 600;
                border-bottom: 1px solid #333;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .cfp-body {
                padding: 10px;
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            .cfp-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 8px;
            }
            .cfp-row label { flex: 1; color: #aaa; }
            .cfp-input {
                background: #2b2b2b;
                border: 1px solid #444;
                color: #fff;
                padding: 3px 6px;
                border-radius: 4px;
                width: 110px;
                font-size: 11px;
                box-sizing: border-box;
            }
            .cfp-select {
                background: #2b2b2b;
                border: 1px solid #444;
                color: #fff;
                padding: 2px 4px;
                border-radius: 4px;
                width: 110px;
                font-size: 11px;
            }
            .cfp-checkbox {
                cursor: pointer;
            }
            .cfp-toggle-btn {
                background: #3a3a3a;
                border: none;
                color: #fff;
                padding: 1px 6px;
                border-radius: 3px;
                font-size: 10px;
                cursor: pointer;
                font-weight: bold;
            }
            .cfp-toggle-btn.active {
                background: #107c41;
            }
        `;
        document.head.appendChild(style);

        // Create Trigger Button
        const btn = document.createElement('button');
        btn.id = 'cfp-trigger-btn';
        btn.title = 'Clipboard Settings';
        btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>`;
        document.body.appendChild(btn);

        // Create Dialog Window
        const dialog = document.createElement('div');
        dialog.id = 'cfp-dialog';
        dialog.innerHTML = `
            <div class="cfp-header">
                <span>Clipboard Matcher</span>
                <button id="cfp-global-toggle" class="cfp-toggle-btn ${CONFIG.enabled ? 'active' : ''}">${CONFIG.enabled ? 'ON' : 'OFF'}</button>
            </div>
            <div class="cfp-body">
                <div class="cfp-row">
                    <label>Font Family:</label>
                    <input type="text" id="cfp-font" class="cfp-input" value="${CONFIG.fontFamily}">
                </div>
                <div class="cfp-row">
                    <label>Font Size:</label>
                    <input type="text" id="cfp-size" class="cfp-input" value="${CONFIG.fontSize}">
                </div>
                <div class="cfp-row">
                    <label>Alignment:</label>
                    <select id="cfp-align" class="cfp-select">
                        <option value="justify" ${CONFIG.textAlign === 'justify' ? 'selected' : ''}>Justify</option>
                        <option value="left" ${CONFIG.textAlign === 'left' ? 'selected' : ''}>Left</option>
                        <option value="center" ${CONFIG.textAlign === 'center' ? 'selected' : ''}>Center</option>
                        <option value="right" ${CONFIG.textAlign === 'right' ? 'selected' : ''}>Right</option>
                    </select>
                </div>
                <div class="cfp-row">
                    <label>Line Height:</label>
                    <input type="text" id="cfp-lineheight" class="cfp-input" value="${CONFIG.lineHeight}">
                </div>
                <div class="cfp-row">
                    <label>Hex Color:</label>
                    <input type="text" id="cfp-color" class="cfp-input" value="${CONFIG.fontColor}">
                </div>
                <div class="cfp-row">
                    <label>Keep Bold/Italic:</label>
                    <input type="checkbox" id="cfp-bolditalic" class="cfp-checkbox" ${CONFIG.keepBoldItalic ? 'checked' : ''}>
                </div>
                <div class="cfp-row">
                    <label>Flatten Lists to P:</label>
                    <input type="checkbox" id="cfp-lists" class="cfp-checkbox" ${CONFIG.stripLists ? 'checked' : ''}>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);

        // --- Controller Interactivity ---
        const toggleDialog = (e) => {
            e.stopPropagation();
            const isOpen = dialog.style.display === 'flex';
            dialog.style.display = isOpen ? 'none' : 'flex';
        };

        btn.addEventListener('click', toggleDialog);

        // Close layout dialog when clicking outside the panel element window area
        document.addEventListener('click', (e) => {
            if (!dialog.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
                dialog.style.display = 'none';
            }
        });

        // Global Operation Toggle Switch
        const gToggle = document.getElementById('cfp-global-toggle');
        gToggle.addEventListener('click', () => {
            CONFIG.enabled = !CONFIG.enabled;
            GM_setValue('cfg_enabled', CONFIG.enabled);
            gToggle.textContent = CONFIG.enabled ? 'ON' : 'OFF';
            gToggle.className = `cfp-toggle-btn ${CONFIG.enabled ? 'active' : ''}`;
        });

        // Value Assignment Pipeline
        const bindInput = (elementId, configKey) => {
            const input = document.getElementById(elementId);
            input.addEventListener('input', () => {
                CONFIG[configKey] = input.value;
                GM_setValue(`cfg_${configKey}`, input.value);
            });
        };

        const bindCheckbox = (elementId, configKey) => {
            const cb = document.getElementById(elementId);
            cb.addEventListener('change', () => {
                CONFIG[configKey] = cb.checked;
                GM_setValue(`cfg_${configKey}`, cb.checked);
            });
        };

        bindInput('cfp-font', 'fontFamily');
        bindInput('cfp-size', 'fontSize');
        bindInput('cfp-align', 'textAlign');
        bindInput('cfp-lineheight', 'lineHeight');
        bindInput('cfp-color', 'fontColor');
        bindCheckbox('cfp-bolditalic', 'keepBoldItalic');
        bindCheckbox('cfp-lists', 'stripLists');
    }

    setTimeout(initGUI, 1000);
})();
