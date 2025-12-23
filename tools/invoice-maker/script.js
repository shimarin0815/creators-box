document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('invoiceForm');
    const lineItemsContainer = document.getElementById('lineItemsContainer');
    const addItemBtn = document.getElementById('addItemBtn');
    
    // Inputs
    const docTypeSelect = document.getElementById('docType');
    const themeColorInput = document.getElementById('themeColor');
    const issuerNameInput = document.getElementById('issuerName');
    const issuerRegInput = document.getElementById('issuerReg');
    const issuerAddressInput = document.getElementById('issuerAddress');
    const stampUpload = document.getElementById('stampUpload');
    const removeStampBtn = document.getElementById('removeStamp');
    const clientNameInput = document.getElementById('clientName');
    const clientHonorificSelect = document.getElementById('clientHonorific');
    const subjectInput = document.getElementById('subject');
    const issueDateInput = document.getElementById('issueDate');
    const dueDateInput = document.getElementById('dueDate');
    const bankInfoInput = document.getElementById('bankInfo');
    const taxRateSelect = document.getElementById('taxRate');
    const withholdingTaxCheck = document.getElementById('withholdingTax');
    const remarksInput = document.getElementById('remarks');

    // Preview Elements
    const previewTitle = document.getElementById('previewTitle');
    const invoicePaper = document.getElementById('invoicePreview');
    const previewDate = document.getElementById('previewDate');
    const previewClientName = document.getElementById('previewClientName');
    const previewClientHonorific = document.getElementById('previewClientHonorific');
    const previewSubject = document.getElementById('previewSubject');
    const previewTotalAmount = document.getElementById('previewTotalAmount');
    const previewDueDate = document.getElementById('previewDueDate');
    const previewIssuerName = document.getElementById('previewIssuerName');
    const previewIssuerReg = document.getElementById('previewIssuerReg');
    const previewIssuerAddress = document.getElementById('previewIssuerAddress');
    const previewStampWrapper = document.getElementById('previewStampWrapper');
    const previewLineItems = document.getElementById('previewLineItems');
    const previewSubtotal = document.getElementById('previewSubtotal');
    const previewTaxRate = document.getElementById('previewTaxRate');
    const previewTaxAmount = document.getElementById('previewTaxAmount');
    const rowWithholding = document.getElementById('rowWithholding');
    const previewWithholdingAmount = document.getElementById('previewWithholdingAmount');
    const previewTotalBottom = document.getElementById('previewTotalBottom');
    const previewRemarks = document.getElementById('previewRemarks');
    const previewBankInfo = document.getElementById('previewBankInfo');

    // Default Data
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    issueDateInput.valueAsDate = today;
    dueDateInput.valueAsDate = nextMonth;

    // Formatting Helpers
    const formatCurrency = (num) => {
        return num.toLocaleString();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    };

    // State
    let lineItems = [
        { name: 'Webサイトデザイン一式', qty: 1, unit: 50000 },
        { name: 'コーディング実装', qty: 1, unit: 80000 }
    ];

    // --- Core Functions ---

    // 1. Render Line Items in Editor
    const renderEditorItems = () => {
        lineItemsContainer.innerHTML = '';
        lineItems.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = 'line-item-row';
            row.innerHTML = `
                <div>
                    <input type="text" class="input-light item-name" value="${item.name}" placeholder="品目" data-idx="${index}">
                </div>
                <div>
                    <input type="number" class="input-light item-qty" value="${item.qty}" min="0" placeholder="数" data-idx="${index}">
                </div>
                <div>
                    <input type="number" class="input-light item-unit" value="${item.unit}" min="0" placeholder="単価" data-idx="${index}">
                </div>
                <button type="button" class="btn-remove-item" data-idx="${index}">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            `;
            lineItemsContainer.appendChild(row);
        });

        // Add Event Listeners for inputs
        document.querySelectorAll('.item-name').forEach(el => {
            el.addEventListener('input', (e) => {
                lineItems[e.target.dataset.idx].name = e.target.value;
                updatePreview();
            });
        });
        document.querySelectorAll('.item-qty').forEach(el => {
            el.addEventListener('input', (e) => {
                lineItems[e.target.dataset.idx].qty = parseFloat(e.target.value) || 0;
                updatePreview();
            });
        });
        document.querySelectorAll('.item-unit').forEach(el => {
            el.addEventListener('input', (e) => {
                lineItems[e.target.dataset.idx].unit = parseFloat(e.target.value) || 0;
                updatePreview();
            });
        });
        document.querySelectorAll('.btn-remove-item').forEach(el => {
            el.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.idx);
                lineItems.splice(idx, 1);
                renderEditorItems();
                updatePreview();
            });
        });
    };

    // 2. Update Preview Logic
    const updatePreview = () => {
        // Document Type Title
        const typeMap = {
            'invoice': '請求書',
            'estimate': '見積書',
            'delivery': '納品書',
            'receipt': '領収書'
        };
        previewTitle.textContent = typeMap[docTypeSelect.value];

        // Theme Color
        const color = themeColorInput.value;
        document.documentElement.style.setProperty('--accent-color', color);
        document.getElementById('colorValue').textContent = color;

        // Basic Info
        previewDate.textContent = formatDate(issueDateInput.value);
        previewDueDate.textContent = formatDate(dueDateInput.value);
        
        previewClientName.textContent = clientNameInput.value || '（取引先名）';
        previewClientHonorific.textContent = clientHonorificSelect.value;
        previewSubject.textContent = subjectInput.value;
        
        previewIssuerName.textContent = issuerNameInput.value;
        previewIssuerReg.textContent = issuerRegInput.value ? `登録番号：${issuerRegInput.value}` : '';
        previewIssuerAddress.innerHTML = issuerAddressInput.value.replace(/\n/g, '<br>');
        
        previewRemarks.textContent = remarksInput.value;
        previewBankInfo.innerHTML = bankInfoInput.value.replace(/\n/g, '<br>');

        // Calculations
        let subtotal = 0;
        let tableHtml = '';

        lineItems.forEach(item => {
            const amount = item.qty * item.unit;
            subtotal += amount;
            tableHtml += `
                <tr>
                    <td>${item.name}</td>
                    <td class="td-qty">${item.qty}</td>
                    <td class="td-unit">¥ ${formatCurrency(item.unit)}</td>
                    <td class="td-amount">¥ ${formatCurrency(amount)}</td>
                </tr>
            `;
        });
        previewLineItems.innerHTML = tableHtml;

        // Tax Calc
        const taxRate = parseFloat(taxRateSelect.value);
        const taxAmount = Math.floor(subtotal * taxRate);
        
        // Withholding Tax Calc (10.21%)
        // Rule: Usually applied to subtotal (before consumption tax) for design fees etc.
        let withholdingAmount = 0;
        if (withholdingTaxCheck.checked) {
            withholdingAmount = Math.floor(subtotal * 0.1021);
            rowWithholding.classList.remove('hidden');
        } else {
            rowWithholding.classList.add('hidden');
        }

        const total = subtotal + taxAmount - withholdingAmount;

        // Update Totals
        previewSubtotal.textContent = formatCurrency(subtotal);
        previewTaxRate.textContent = (taxRate * 100).toString();
        previewTaxAmount.textContent = formatCurrency(taxAmount);
        previewWithholdingAmount.textContent = formatCurrency(withholdingAmount);
        
        // Final Total
        const totalFormatted = formatCurrency(total);
        previewTotalBottom.textContent = totalFormatted;
        previewTotalAmount.textContent = totalFormatted;
    };

    // 3. Image Handling
    stampUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const src = ev.target.result;
                document.getElementById('stampImageSrc').src = src;
                document.getElementById('stampPreviewArea').classList.remove('hidden');
                
                // Add to preview
                previewStampWrapper.innerHTML = `<img src="${src}" alt="stamp">`;
            };
            reader.readAsDataURL(file);
        }
    });

    removeStampBtn.addEventListener('click', () => {
        stampUpload.value = '';
        document.getElementById('stampPreviewArea').classList.add('hidden');
        previewStampWrapper.innerHTML = '';
        document.getElementById('stampImageSrc').src = '';
    });

    // 4. PDF Generation
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    
    downloadPdfBtn.addEventListener('click', async () => {
        // Show loading state
        const originalText = downloadPdfBtn.innerHTML;
        downloadPdfBtn.textContent = '生成中...';
        downloadPdfBtn.disabled = true;

        try {
            // Need to ensure the preview is visible and captured correctly.
            const canvas = await html2canvas(invoicePaper, {
                scale: 2, // High resolution
                useCORS: true, // If any weird images
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            
            // A4 Size: 210mm x 297mm
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            
            // FileName
            const dateStr = new Date().toISOString().slice(0, 10);
            const fileName = `${docTypeSelect.value}_${dateStr}.pdf`;
            
            pdf.save(fileName);

        } catch (err) {
            console.error('PDF Generation Failed', err);
            alert('PDFの生成に失敗しました。');
        } finally {
            downloadPdfBtn.innerHTML = originalText;
            downloadPdfBtn.disabled = false;
        }
    });

    // --- Init Listeners ---
    [
        docTypeSelect, themeColorInput, issuerNameInput, issuerRegInput, issuerAddressInput,
        clientNameInput, clientHonorificSelect, subjectInput, issueDateInput, dueDateInput,
        bankInfoInput, taxRateSelect, withholdingTaxCheck, remarksInput
    ].forEach(el => {
        if (el) {
            el.addEventListener('input', updatePreview);
            el.addEventListener('change', updatePreview);
        }
    });

    addItemBtn.addEventListener('click', () => {
        lineItems.push({ name: '', qty: 1, unit: 0 });
        renderEditorItems();
        updatePreview();
    });

    // Initial Render
    renderEditorItems();
    updatePreview();
});
