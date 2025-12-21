/* ===================================
   Tailwind Class Sorter & Cleaner - Script
   Core Logic for Sorting and Cleaning Tailwind Classes
   =================================== */

// ==============================
// Tailwind Class Categories
// ==============================
// 公式推奨順序に基づくカテゴリ定義
const CLASS_CATEGORIES = {
    // 1. Layout
    layout: [
        'container', 'box-border', 'box-content', 'block', 'inline-block', 'inline', 
        'flex', 'inline-flex', 'grid', 'inline-grid', 'contents', 'flow-root', 'hidden'
    ],
    
    // 2. Positioning
    positioning: [
        'static', 'fixed', 'absolute', 'relative', 'sticky',
        'inset', 'top', 'right', 'bottom', 'left', 'z-'
    ],
    
    // 3. Flexbox & Grid
    flexGrid: [
        'flex-row', 'flex-col', 'flex-wrap', 'flex-nowrap',
        'items-', 'justify-', 'content-', 'self-', 'place-',
        'grid-cols-', 'grid-rows-', 'grid-flow-', 'auto-cols-', 'auto-rows-',
        'gap-', 'col-', 'row-'
    ],
    
    // 4. Sizing
    sizing: [
        'w-', 'min-w-', 'max-w-', 'h-', 'min-h-', 'max-h-', 'size-'
    ],
    
    // 5. Spacing
    spacing: [
        'p-', 'pt-', 'pr-', 'pb-', 'pl-', 'px-', 'py-', 'ps-', 'pe-',
        'm-', 'mt-', 'mr-', 'mb-', 'ml-', 'mx-', 'my-', 'ms-', 'me-',
        'space-'
    ],
    
    // 6. Typography
    typography: [
        'font-', 'text-', 'leading-', 'tracking-', 'line-clamp-',
        'antialiased', 'subpixel-antialiased',
        'italic', 'not-italic', 'normal-nums', 'ordinal',
        'uppercase', 'lowercase', 'capitalize', 'normal-case',
        'truncate', 'text-ellipsis', 'text-clip',
        'whitespace-', 'break-', 'hyphens-'
    ],
    
    // 7. Backgrounds
    backgrounds: [
        'bg-', 'from-', 'via-', 'to-', 'decoration-', 'underline-offset-'
    ],
    
    // 8. Borders
    borders: [
        'border', 'rounded', 'divide-', 'outline', 'ring'
    ],
    
    // 9. Effects & Filters
    effects: [
        'shadow', 'opacity-', 'mix-blend-', 'blur-', 'brightness-', 
        'contrast-', 'grayscale', 'hue-rotate-', 'invert', 'saturate-', 'sepia',
        'backdrop-', 'transition', 'duration-', 'ease-', 'delay-', 'animate-'
    ],
    
    // 10. Transforms
    transforms: [
        'scale-', 'rotate-', 'translate-', 'skew-', 'origin-'
    ],
    
    // 11. Interactivity
    interactivity: [
        'cursor-', 'select-', 'pointer-events-', 'resize', 'scroll-',
        'touch-', 'will-change-', 'appearance-'
    ],
    
    // 12. SVG
    svg: [
        'fill-', 'stroke-'
    ],
    
    // 13. Accessibility
    accessibility: [
        'sr-only', 'not-sr-only', 'forced-color-adjust-'
    ]
};

// ==============================
// Utility Functions
// ==============================

/**
 * クラス名のカテゴリを判定
 * @param {string} className - Tailwindクラス名
 * @returns {number} カテゴリのインデックス（0-13）、該当なしは999
 */
function getClassCategory(className) {
    // バリアントプレフィックス（hover:, focus: など）を除去
    const baseClass = className.split(':').pop();
    
    const categories = Object.values(CLASS_CATEGORIES);
    
    for (let i = 0; i < categories.length; i++) {
        const patterns = categories[i];
        for (const pattern of patterns) {
            // 完全一致 or プレフィックス一致
            if (baseClass === pattern || baseClass.startsWith(pattern)) {
                return i;
            }
        }
    }
    
    // マイナス値のクラス（例: -mt-4）
    if (baseClass.startsWith('-')) {
        const withoutMinus = baseClass.substring(1);
        for (let i = 0; i < categories.length; i++) {
            const patterns = categories[i];
            for (const pattern of patterns) {
                if (withoutMinus.startsWith(pattern)) {
                    return i;
                }
            }
        }
    }
    
    return 999; // カスタムクラスや未分類
}

/**
 * バリアントの優先度を取得
 * @param {string} className - Tailwindクラス名
 * @returns {number} 優先度（小さいほど優先）
 */
function getVariantPriority(className) {
    // バリアントなし（ベースクラス）が最優先
    if (!className.includes(':')) return 0;
    
    const variantPriority = {
        // Responsive
        'sm': 1, 'md': 2, 'lg': 3, 'xl': 4, '2xl': 5,
        // State
        'hover': 10, 'focus': 11, 'active': 12, 'disabled': 13,
        'focus-within': 14, 'focus-visible': 15,
        // Dark mode
        'dark': 20,
        // Other
        'group-hover': 30, 'peer-': 31
    };
    
    const variant = className.split(':')[0];
    return variantPriority[variant] || 50;
}

/**
 * Tailwindクラス名を並べ替え
 * @param {string[]} classes - クラス名の配列
 * @returns {string[]} ソート済みクラス名の配列
 */
function sortTailwindClasses(classes) {
    return classes.sort((a, b) => {
        // 1. カテゴリでソート
        const categoryA = getClassCategory(a);
        const categoryB = getClassCategory(b);
        if (categoryA !== categoryB) {
            return categoryA - categoryB;
        }
        
        // 2. バリアントでソート
        const variantA = getVariantPriority(a);
        const variantB = getVariantPriority(b);
        if (variantA !== variantB) {
            return variantA - variantB;
        }
        
        // 3. アルファベット順
        return a.localeCompare(b);
    });
}

/**
 * 入力テキストからクラス名を抽出
 * @param {string} input - 入力テキスト
 * @returns {Object} { classes: string[], isHTML: boolean }
 */
function extractClasses(input) {
    if (!input.trim()) {
        return { classes: [], isHTML: false };
    }
    
    // HTMLタグ内のclass属性を検出
    const classAttrRegex = /class(?:Name)?=["']([^"']+)["']/gi;
    const matches = [...input.matchAll(classAttrRegex)];
    
    if (matches.length > 0) {
        // HTML形式
        const allClasses = matches.map(match => match[1]).join(' ');
        const classes = allClasses.split(/\s+/).filter(c => c.length > 0);
        return { classes, isHTML: true };
    } else {
        // プレーンテキスト（クラス名のみ）
        const classes = input.split(/\s+/).filter(c => c.length > 0);
        return { classes, isHTML: false };
    }
}

/**
 * クラス名を整形（重複削除＋ソート）
 * @param {string} input - 入力テキスト
 * @returns {string} 整形後のテキスト
 */
function formatClasses(input) {
    const { classes, isHTML } = extractClasses(input);
    
    if (classes.length === 0) {
        return '';
    }
    
    // 重複削除
    const uniqueClasses = [...new Set(classes)];
    
    // ソート
    const sortedClasses = sortTailwindClasses(uniqueClasses);
    
    // 出力形式
    if (isHTML) {
        // 元のHTML構造を保持しつつクラスのみ置換
        return input.replace(
            /class(?:Name)?=["']([^"']+)["']/gi,
            (match) => {
                const quote = match.includes('"') ? '"' : "'";
                const attr = match.startsWith('className') ? 'className' : 'class';
                return `${attr}=${quote}${sortedClasses.join(' ')}${quote}`;
            }
        );
    } else {
        // プレーンテキストとして出力
        return sortedClasses.join(' ');
    }
}

// ==============================
// UI Interaction Handlers
// ==============================

/**
 * トースト通知を表示
 * @param {string} message - 表示メッセージ
 * @param {number} duration - 表示時間（ミリ秒）
 */
function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

/**
 * クラス整形処理
 */
function handleSort() {
    const inputArea = document.getElementById('inputArea');
    const outputArea = document.getElementById('outputArea');
    const input = inputArea.value;
    
    // 入力チェック
    if (!input.trim()) {
        showToast('⚠️ 入力欄にコードを入力してください');
        inputArea.focus();
        return;
    }
    
    try {
        // 整形実行
        const formatted = formatClasses(input);
        outputArea.value = formatted;
        
        // 入力と出力が同じ場合の通知
        if (input.trim() === formatted.trim()) {
            showToast('✨ すでに整形済みです！');
        } else {
            showToast('✅ 整形完了！');
        }
    } catch (error) {
        console.error('Formatting error:', error);
        showToast('❌ エラーが発生しました');
    }
}

/**
 * クリップボードにコピー
 */
function handleCopy() {
    const outputArea = document.getElementById('outputArea');
    const output = outputArea.value;
    
    if (!output.trim()) {
        showToast('⚠️ コピーする内容がありません');
        return;
    }
    
    // クリップボードAPIを使用
    navigator.clipboard.writeText(output)
        .then(() => {
            showToast('📋 コピーしました！');
        })
        .catch(err => {
            // フォールバック: 古いブラウザ対応
            outputArea.select();
            document.execCommand('copy');
            showToast('📋 コピーしました！');
        });
}

/**
 * 入力エリアをクリア
 */
function handleClear() {
    const inputArea = document.getElementById('inputArea');
    const outputArea = document.getElementById('outputArea');
    
    if (!inputArea.value.trim() && !outputArea.value.trim()) {
        return;
    }
    
    inputArea.value = '';
    outputArea.value = '';
    inputArea.focus();
    showToast('🗑️ クリアしました');
}

// ==============================
// Event Listeners
// ==============================

document.addEventListener('DOMContentLoaded', () => {
    // ボタン要素の取得
    const sortButton = document.getElementById('sortButton');
    const copyButton = document.getElementById('copyButton');
    const clearButton = document.getElementById('clearInput');
    const inputArea = document.getElementById('inputArea');
    
    // イベントリスナー登録
    sortButton.addEventListener('click', handleSort);
    copyButton.addEventListener('click', handleCopy);
    clearButton.addEventListener('click', handleClear);
    
    // キーボードショートカット
    inputArea.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter で整形実行
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSort();
        }
    });
    
    console.log('🎨 Tailwind Class Sorter & Cleaner initialized');
});
