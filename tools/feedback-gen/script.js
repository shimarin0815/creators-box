// Feedback Helper - Script
let cardCount = 0;

// Initialize with one card
document.addEventListener('DOMContentLoaded', () => {
    addFeedbackCard();
    updatePreview();
});

// Add new feedback card
document.getElementById('addCardBtn').addEventListener('click', () => {
    addFeedbackCard();
});

// Copy to clipboard
document.getElementById('copyBtn').addEventListener('click', () => {
    const previewText = document.getElementById('previewArea').textContent;

    if (previewText.includes('修正内容を入力すると')) {
        showToast('コピーする内容がありません');
        return;
    }

    navigator.clipboard.writeText(previewText).then(() => {
        showToast('クリップボードにコピーしました！');
    }).catch(() => {
        showToast('コピーに失敗しました');
    });
});

// Reset all
document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('すべての入力内容をリセットしますか？')) {
        document.getElementById('feedbackCards').innerHTML = '';
        cardCount = 0;
        addFeedbackCard();
        updatePreview();
        showToast('リセットしました');
    }
});

// Add feedback card
function addFeedbackCard() {
    cardCount++;
    const cardsContainer = document.getElementById('feedbackCards');

    const card = document.createElement('div');
    card.className = 'feedback-card';
    card.dataset.cardId = cardCount;

    card.innerHTML = `
        <div class="card-number">${cardCount}</div>
        ${cardCount > 1 ? '<button class="remove-card-btn" onclick="removeCard(this)">×</button>' : ''}
        
        <div class="form-group">
            <label class="form-label">対象ページ/画面名</label>
            <input type="text" class="form-input" placeholder="例: トップページ、お問い合わせフォーム" oninput="updatePreview()">
        </div>
        
        <div class="form-group">
            <label class="form-label">修正箇所</label>
            <input type="text" class="form-input" placeholder="例: ヘッダー、FV、フッター" oninput="updatePreview()">
        </div>
        
        <div class="form-group">
            <label class="form-label">重要度</label>
            <select class="form-select" onchange="updatePreview()">
                <option value="高">高 - 至急対応が必要</option>
                <option value="中" selected>中 - 通常対応</option>
                <option value="低">低 - 余裕があれば対応</option>
            </select>
        </div>
        
        <div class="form-group">
            <label class="form-label">修正内容</label>
            <textarea class="form-textarea" placeholder="具体的な修正内容を入力してください&#10;例: ロゴの余白を20px → 40pxに変更" oninput="updatePreview()"></textarea>
        </div>
    `;

    cardsContainer.appendChild(card);
    updatePreview();
}

// Remove feedback card
function removeCard(button) {
    const card = button.closest('.feedback-card');
    card.remove();
    renumberCards();
    updatePreview();
}

// Renumber cards after removal
function renumberCards() {
    const cards = document.querySelectorAll('.feedback-card');
    cards.forEach((card, index) => {
        const numberElement = card.querySelector('.card-number');
        if (numberElement) {
            numberElement.textContent = index + 1;
        }
    });
    cardCount = cards.length;
}

// Update preview
function updatePreview() {
    const cards = document.querySelectorAll('.feedback-card');
    const previewArea = document.getElementById('previewArea');

    let hasContent = false;
    let output = '';

    // Get current date
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}/${month}/${day}`;

    // Build output text
    const feedbacks = [];

    cards.forEach((card) => {
        const inputs = card.querySelectorAll('.form-input');
        const pageName = inputs[0] ? inputs[0].value.trim() : '';
        const section = inputs[1] ? inputs[1].value.trim() : '';
        const priority = card.querySelector('.form-select').value;
        const content = card.querySelector('.form-textarea').value.trim();

        if (pageName || section || content) {
            hasContent = true;

            let title = '';
            if (pageName && section) {
                title = `${pageName} / ${section}`;
            } else if (pageName) {
                title = pageName;
            } else if (section) {
                title = section;
            } else {
                title = '(未入力)';
            }

            feedbacks.push({
                priority,
                title,
                content: content || '(修正内容が未入力です)'
            });
        }
    });

    if (!hasContent) {
        previewArea.innerHTML = '<div class="preview-empty">修正内容を入力すると、ここにプレビューが表示されます</div>';
        return;
    }

    // Generate formatted output
    output += '-'.repeat(50) + '\n';
    output += `【修正依頼】 ${dateStr}\n`;
    output += '-'.repeat(50) + '\n';

    feedbacks.forEach((feedback) => {
        output += `■ [${feedback.priority}] ${feedback.title}\n`;

        // Split content by lines and add bullet points
        const contentLines = feedback.content.split('\n').filter(line => line.trim());
        contentLines.forEach(line => {
            output += `・${line}\n`;
        });

        output += '\n';
    });

    output += '-'.repeat(50) + '\n';
    output += '以上、よろしくお願いいたします。';

    previewArea.textContent = output;
}

// Show toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
