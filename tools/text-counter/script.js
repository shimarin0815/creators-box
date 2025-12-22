// ===================================
// Text Counter Tool - JavaScript
// Real-time Text Analysis
// ===================================

// DOM Elements
const textInput = document.getElementById('textInput');
const totalCharsEl = document.getElementById('totalChars');
const charsNoSpaceEl = document.getElementById('charsNoSpace');
const lineCountEl = document.getElementById('lineCount');
const manuscriptPagesEl = document.getElementById('manuscriptPages');
const resetBtn = document.getElementById('resetBtn');
const copyResultBtn = document.getElementById('copyResultBtn');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// State
let stats = {
    totalChars: 0,
    charsNoSpace: 0,
    lineCount: 0,
    manuscriptPages: 0
};

// Calculate Statistics
function calculateStats(text) {
    // 総文字数
    const totalChars = text.length;

    // 空白を除いた文字数（スペース、タブ、改行を除外）
    const charsNoSpace = text.replace(/[\s\n\r\t]/g, '').length;

    // 行数（改行で分割してカウント、空文字列の場合は0行）
    const lineCount = text === '' ? 0 : text.split('\n').length;

    // 原稿用紙換算（400字詰め、小数点第2位まで表示）
    const manuscriptPages = (charsNoSpace / 400).toFixed(2);

    return {
        totalChars,
        charsNoSpace,
        lineCount,
        manuscriptPages
    };
}

// Update Display
function updateDisplay() {
    totalCharsEl.textContent = stats.totalChars.toLocaleString();
    charsNoSpaceEl.textContent = stats.charsNoSpace.toLocaleString();
    lineCountEl.textContent = stats.lineCount.toLocaleString();
    manuscriptPagesEl.textContent = stats.manuscriptPages;
}

// Handle Input
function handleInput(e) {
    const text = e.target.value;
    stats = calculateStats(text);
    updateDisplay();
}

// Reset
function handleReset() {
    textInput.value = '';
    stats = {
        totalChars: 0,
        charsNoSpace: 0,
        lineCount: 0,
        manuscriptPages: '0.00'
    };
    updateDisplay();
    showToast('リセットしました');
}

// Copy Results
function handleCopyResult() {
    const resultText = `【文字数・行数カウント結果】
総文字数: ${stats.totalChars.toLocaleString()}文字
空白除外: ${stats.charsNoSpace.toLocaleString()}文字
行数: ${stats.lineCount.toLocaleString()}行
原稿用紙: ${stats.manuscriptPages}枚 (400字詰め)`;

    // Copy to clipboard
    navigator.clipboard.writeText(resultText)
        .then(() => {
            showToast('結果をコピーしました');
        })
        .catch(err => {
            console.error('コピーに失敗しました:', err);
            showToast('コピーに失敗しました', true);
        });
}

// Show Toast Notification
function showToast(message, isError = false) {
    toastMessage.textContent = message;
    
    if (isError) {
        toast.style.background = '#ef4444'; // red
    } else {
        toast.style.background = '#0f172a'; // dark
    }

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// Event Listeners
textInput.addEventListener('input', handleInput);
resetBtn.addEventListener('click', handleReset);
copyResultBtn.addEventListener('click', handleCopyResult);

// Initialize
stats.manuscriptPages = '0.00';
updateDisplay();
