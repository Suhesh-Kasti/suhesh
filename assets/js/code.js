var scriptBundle = document.getElementById('script-bundle');
var copyText = scriptBundle && scriptBundle.getAttribute('data-copy') ? scriptBundle.getAttribute('data-copy') : '📋 Copy';
var copiedText = scriptBundle && scriptBundle.getAttribute('data-copied') ? scriptBundle.getAttribute('data-copied') : '✓ Copied!';

function getLanguageLabel(highlightDiv) {
    // First try to get language from Chroma (Hugo's syntax highlighter)
    const preElement = highlightDiv.querySelector('pre');
    if (preElement) {
        const classes = preElement.className.split(' ');
        for (const cls of classes) {
            // Check for Chroma's language class (language-python, language-js, etc.)
            if (cls.startsWith('language-')) {
                return cls.replace('language-', '').toUpperCase();
            }
            // Check for Chroma's specific class (chroma-python, chroma-javascript, etc.)
            if (cls.startsWith('chroma-')) {
                return cls.replace('chroma-', '').toUpperCase();
            }
        }
    }

    // Then check highlight div classes
    const highlightClasses = Array.from(highlightDiv.classList);
    for (const cls of highlightClasses) {
        if (cls.startsWith('language-')) {
            return cls.replace('language-', '').toUpperCase();
        }
    }

    // Finally check for code element classes
    const codeElement = highlightDiv.querySelector('code');
    if (codeElement) {
        const codeClasses = Array.from(codeElement.classList);
        for (const cls of codeClasses) {
            if (cls.startsWith('language-')) {
                return cls.replace('language-', '').toUpperCase();
            }
        }
    }

    return 'CODE';
}

function createCodeHeader(highlightDiv) {
    const header = document.createElement('div');
    header.className = 'code-header';
    
    const languageLabel = document.createElement('span');
    languageLabel.className = 'language-label';
    languageLabel.textContent = getLanguageLabel(highlightDiv);
    
    const button = document.createElement('button');
    button.className = 'copy-button';
    button.type = 'button';
    button.setAttribute('aria-label', copyText);
    button.innerText = copyText;
    button.addEventListener('click', () => copyCodeToClipboard(button, highlightDiv));
    
    header.appendChild(languageLabel);
    header.appendChild(button);
    return header;
}

async function copyCodeToClipboard(button, highlightDiv) {
    // Get the code content - look for <code> element first, fallback to last child
    const codeElement = highlightDiv.querySelector('code') || highlightDiv.querySelector(':last-child');
    const codeToCopy = codeElement.innerText;
    
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(codeToCopy);
            codeWasCopied(button);
        } else {
            copyCodeBlockExecCommand(codeToCopy, highlightDiv);
            codeWasCopied(button);
        }
    } catch (err) {
        console.error('Failed to copy code:', err);
        copyCodeBlockExecCommand(codeToCopy, highlightDiv);
        codeWasCopied(button);
    }
}

function copyCodeBlockExecCommand(codeToCopy, highlightDiv) {
    const textArea = document.createElement('textarea');
    textArea.value = codeToCopy;
    textArea.className = 'copy-textarea';
    highlightDiv.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        highlightDiv.removeChild(textArea);
    } catch (err) {
        console.error('Failed to copy code:', err);
    }
}

function codeWasCopied(button) {
    button.blur();
    const originalText = button.innerText;
    button.innerText = copiedText;
    setTimeout(() => {
        button.innerText = originalText;
    }, 2000);
}

function wrapHighlight(highlightDiv) {
    const wrapper = document.createElement('div');
    wrapper.className = 'highlight-wrapper';
    highlightDiv.parentNode.insertBefore(wrapper, highlightDiv);
    wrapper.appendChild(highlightDiv);
    
    const header = createCodeHeader(highlightDiv);
    wrapper.insertBefore(header, highlightDiv);
}

function getThemeColors() {
    // Get a code block element
    const codeBlock = document.querySelector('.highlight pre');
    if (!codeBlock) return null;

    // Get computed styles
    const styles = window.getComputedStyle(codeBlock);
    return {
        background: styles.backgroundColor,
        color: styles.color
    };
}

function updateHeaderColors() {
    const colors = getThemeColors();
    if (!colors) return;

    // Get all code headers
    const headers = document.querySelectorAll('.code-header');
    headers.forEach(header => {
        header.style.backgroundColor = colors.background;
        
        // Get copy buttons within headers
        const copyButton = header.querySelector('.copy-button');
        if (copyButton) {
            // Make button slightly lighter than background
            const rgb = colors.background.match(/\d+/g);
            if (rgb) {
                const lighterBg = `rgb(${Math.min(parseInt(rgb[0]) + 20, 255)}, ${Math.min(parseInt(rgb[1]) + 20, 255)}, ${Math.min(parseInt(rgb[2]) + 20, 255)})`;
                copyButton.style.backgroundColor = lighterBg;
                copyButton.style.color = colors.color;
            }
        }
    });
}

function codeWasCopied(button) {
    button.blur();
    const originalText = button.innerText;
    button.classList.add('copied');
    button.innerText = '✓ Copied!';
    
    setTimeout(() => {
        button.classList.remove('copied');
        // Wait for the removal animation to complete before changing text
        setTimeout(() => {
            button.innerText = originalText;
        }, 300);
    }, 2000);
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.highlight').forEach(wrapHighlight);
    updateHeaderColors(); 
});


