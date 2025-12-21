/**
 * Web Unit Converter - JavaScript
 * Real-time PX/REM conversion and Aspect Ratio calculation
 * With copy-to-clipboard functionality and toast notifications
 */

// ========================================
// DOM Elements
// ========================================

// PX/REM Converter Elements
const baseSizeInput = document.getElementById('baseSize');
const pixelValueInput = document.getElementById('pixelValue');
const remResult = document.getElementById('remResult');
const emResult = document.getElementById('emResult');
const percentResult = document.getElementById('percentResult');

// Aspect Ratio Calculator Elements
const aspectWidthInput = document.getElementById('aspectWidth');
const aspectHeightInput = document.getElementById('aspectHeight');
const ratioResult = document.getElementById('ratioResult');
const paddingResult = document.getElementById('paddingResult');
const cssCodeBlock = document.getElementById('cssCode');
const copyCssBtn = document.getElementById('copyCssBtn');

// Toast Notification
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// ========================================
// PX/REM Converter Logic
// ========================================

/**
 * Calculate and update REM, EM, and % values
 */
function updatePxRemConversion() {
    const baseSize = parseFloat(baseSizeInput.value);
    const pixelValue = parseFloat(pixelValueInput.value);

    // Validation
    if (!baseSize || baseSize <= 0) {
        resetPxRemResults();
        return;
    }

    if (!pixelValue || pixelValue < 0) {
        resetPxRemResults();
        return;
    }

    // Calculations
    const rem = (pixelValue / baseSize).toFixed(4);
    const em = rem; // EM is same as REM when calculated from root
    const percent = ((pixelValue / baseSize) * 100).toFixed(2);

    // Update results
    remResult.textContent = `${rem}rem`;
    emResult.textContent = `${em}em`;
    percentResult.textContent = `${percent}%`;

    // Store raw values for copying
    remResult.dataset.value = `${rem}rem`;
    emResult.dataset.value = `${em}em`;
    percentResult.dataset.value = `${percent}%`;
}

/**
 * Reset PX/REM results to default state
 */
function resetPxRemResults() {
    remResult.textContent = '-';
    emResult.textContent = '-';
    percentResult.textContent = '-';

    // Clear data attributes
    delete remResult.dataset.value;
    delete emResult.dataset.value;
    delete percentResult.dataset.value;
}

// ========================================
// Aspect Ratio Calculator Logic
// ========================================

/**
 * Calculate GCD (Greatest Common Divisor) using Euclidean algorithm
 */
function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

/**
 * Calculate and update aspect ratio and padding-top value
 */
function updateAspectRatio() {
    const width = parseFloat(aspectWidthInput.value);
    const height = parseFloat(aspectHeightInput.value);

    // Validation
    if (!width || width <= 0 || !height || height <= 0) {
        resetAspectRatioResults();
        return;
    }

    // Calculate aspect ratio
    const divisor = gcd(Math.round(width), Math.round(height));
    const ratioW = Math.round(width / divisor);
    const ratioH = Math.round(height / divisor);
    const ratio = `${ratioW}:${ratioH}`;

    // Calculate padding-top percentage
    const paddingTop = ((height / width) * 100).toFixed(2);
    const padding = `${paddingTop}%`;

    // Update results
    ratioResult.textContent = ratio;
    paddingResult.textContent = padding;

    // Store raw values for copying
    ratioResult.dataset.value = ratio;
    paddingResult.dataset.value = padding;

    // Update CSS code example
    updateCssCode(ratio, paddingTop);
}

/**
 * Reset aspect ratio results to default state
 */
function resetAspectRatioResults() {
    ratioResult.textContent = '-';
    paddingResult.textContent = '-';

    // Clear data attributes
    delete ratioResult.dataset.value;
    delete paddingResult.dataset.value;

    // Reset CSS code
    updateCssCode('16:9', '56.25');
}

/**
 * Update CSS code example block
 */
function updateCssCode(ratio, paddingTop) {
    const cssCode = `.aspect-box {
  position: relative;
  width: 100%;
  padding-top: ${paddingTop}%; /* ${ratio} */
}`;

    cssCodeBlock.textContent = cssCode;
    cssCodeBlock.dataset.value = cssCode;
}

// ========================================
// Copy to Clipboard Functionality
// ========================================

/**
 * Copy text to clipboard and show toast notification
 */
async function copyToClipboard(text, label) {
    try {
        await navigator.clipboard.writeText(text);
        showToast(`${label}をコピーしました`);
    } catch (err) {
        // Fallback for older browsers
        fallbackCopyToClipboard(text);
        showToast(`${label}をコピーしました`);
    }
}

/**
 * Fallback copy method for browsers that don't support navigator.clipboard
 */
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('Fallback copy failed:', err);
    }

    document.body.removeChild(textArea);
}

/**
 * Show toast notification
 */
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');

    // Hide after 2 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// ========================================
// Event Listeners
// ========================================

// PX/REM Converter - Real-time calculation
baseSizeInput.addEventListener('input', updatePxRemConversion);
pixelValueInput.addEventListener('input', updatePxRemConversion);

// Aspect Ratio Calculator - Real-time calculation
aspectWidthInput.addEventListener('input', updateAspectRatio);
aspectHeightInput.addEventListener('input', updateAspectRatio);

// Copy functionality for result items
document.querySelectorAll('.result-item').forEach(item => {
    item.addEventListener('click', function () {
        const valueElement = this.querySelector('.result-value');
        const value = valueElement.dataset.value;
        const label = this.querySelector('.result-label').textContent;

        // Only copy if there's a value (not "-")
        if (value && value !== '-') {
            copyToClipboard(value, label);
        }
    });
});

// Copy CSS code button
copyCssBtn.addEventListener('click', function () {
    const code = cssCodeBlock.dataset.value || cssCodeBlock.textContent;
    copyToClipboard(code, 'CSSコード');
});

// ========================================
// Keyboard Accessibility
// ========================================

// Allow Enter key to copy on result items
document.querySelectorAll('.result-item').forEach(item => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');

    item.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
    });
});

// ========================================
// Initialize
// ========================================

/**
 * Initialize default values on page load
 */
function initialize() {
    // Set default base size if empty
    if (!baseSizeInput.value) {
        baseSizeInput.value = 16;
    }

    // Reset all results to default state
    resetPxRemResults();
    resetAspectRatioResults();
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

// ========================================
// Error Handling
// ========================================

// Global error handler for debugging
window.addEventListener('error', function (e) {
    console.error('Error:', e.message, e.filename, e.lineno);
});

// Prevent form submission if inputs are in a form
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    });
});
