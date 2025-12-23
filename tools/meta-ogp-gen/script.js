document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const pageTitleInput = document.getElementById('pageTitle');
    const pageDescInput = document.getElementById('pageDesc');
    const pageUrlInput = document.getElementById('pageUrl');
    const siteNameInput = document.getElementById('siteName');
    const ogpImageInput = document.getElementById('ogpImage');
    const twitterSiteInput = document.getElementById('twitterSite');
    const cardTypeRadios = document.querySelectorAll('input[name="cardType"]');
    const excludeTwitterCheckbox = document.getElementById('excludeTwitter');

    // Counts
    const descCount = document.getElementById('descCount');

    // Previews - Google
    const prevGoogleTitle = document.getElementById('prevGoogleTitle');
    const prevGoogleDesc = document.getElementById('prevGoogleDesc');
    const prevGoogleSiteName = document.getElementById('prevGoogleSiteName');
    const prevGoogleUrl = document.getElementById('prevGoogleUrl');

    // Previews - Twitter
    const twitterCardPreview = document.getElementById('twitterCardPreview');
    const prevTwitterImg = document.getElementById('prevTwitterImg');
    const prevTwitterImgPlaceholder = document.getElementById('prevTwitterImgPlaceholder');
    const prevTwitterTitle = document.getElementById('prevTwitterTitle');
    const prevTwitterDesc = document.getElementById('prevTwitterDesc');
    const prevTwitterDomain = document.getElementById('prevTwitterDomain');

    // Output
    const codeOutput = document.getElementById('codeOutput');
    const copyBtn = document.getElementById('copyBtn');
    const toast = document.getElementById('toast');

    // State Default Values
    const defaults = {
        title: 'ページタイトル',
        desc: 'ページの説明文がここに入ります。検索結果やSNSでシェアされた際に表示される重要な文章です。',
        siteName: 'Site Name',
        domain: 'example.com',
        url: 'https://example.com/page'
    };

    // Update Function
    function update() {
        // Read Values
        const title = pageTitleInput.value.trim();
        const desc = pageDescInput.value.trim();
        const url = pageUrlInput.value.trim();
        const siteName = siteNameInput.value.trim();
        const image = ogpImageInput.value.trim();
        const twitterUser = twitterSiteInput.value.trim();
        const cardType = document.querySelector('input[name="cardType"]:checked').value;
        const excludeTwitter = excludeTwitterCheckbox.checked;

        // Process Domain from URL
        let domain = defaults.domain;
        try {
            if (url) {
                const urlObj = new URL(url);
                domain = urlObj.hostname;
            }
        } catch (e) {
            // Invalid URL, ignore
        }

        // --- Update Previews ---

        // Google
        prevGoogleTitle.textContent = title || defaults.title;
        prevGoogleDesc.textContent = desc || defaults.desc;
        prevGoogleSiteName.textContent = siteName || defaults.siteName;

        // Google URL Logic: "Site Name > ... > ..." or just domain/path
        // Simplified for preview: Domain > path
        prevGoogleUrl.textContent = url ? url : defaults.url;


        // Twitter
        // Toggle Card Type Class
        if (cardType === 'summary') {
            twitterCardPreview.classList.remove('large');
            twitterCardPreview.classList.add('summary');
        } else {
            twitterCardPreview.classList.remove('summary');
            twitterCardPreview.classList.add('large');
        }

        prevTwitterTitle.textContent = title || defaults.title;
        prevTwitterDesc.textContent = desc || defaults.desc;
        prevTwitterDomain.textContent = domain;

        // Image Handling
        if (image) {
            prevTwitterImg.src = image;
            prevTwitterImg.style.display = 'block';
            prevTwitterImgPlaceholder.style.display = 'none';

            // Reset error handler and re-attach
            prevTwitterImg.onerror = () => {
                prevTwitterImg.style.display = 'none';
                prevTwitterImgPlaceholder.textContent = '表示できません';
                prevTwitterImgPlaceholder.style.display = 'flex';
            };
            // Clear error handler on success (load) to avoid weird state if recycled? 
            // Actually just setting src is enough, if it loads fine previous onerror won't fire.
            prevTwitterImg.onload = () => {
                // confirm it's visible
                prevTwitterImg.style.display = 'block';
                prevTwitterImgPlaceholder.style.display = 'none';
            };

        } else {
            prevTwitterImg.src = '';
            prevTwitterImg.style.display = 'none';
            prevTwitterImgPlaceholder.textContent = 'No Image';
            prevTwitterImgPlaceholder.style.display = 'flex';
        }


        // --- Update Code ---
        let code = '';

        // Standard Meta
        code += `<!-- Basic Meta Tags -->\n`;
        if (title) code += `<title>${title}</title>\n`;
        if (desc) code += `<meta name="description" content="${desc}">\n`;

        // OGP
        code += `\n<!-- OGP Meta Tags -->\n`;
        code += `<meta property="og:type" content="website">\n`;
        if (title) code += `<meta property="og:title" content="${title}">\n`;
        if (desc) code += `<meta property="og:description" content="${desc}">\n`;
        if (url) code += `<meta property="og:url" content="${url}">\n`;
        if (image) code += `<meta property="og:image" content="${image}">\n`;
        if (siteName) code += `<meta property="og:site_name" content="${siteName}">\n`;

        // Twitter Card
        if (!excludeTwitter) {
            code += `\n<!-- Twitter Card Meta Tags -->\n`;
            code += `<meta name="twitter:card" content="${cardType}">\n`;
            if (twitterUser) {
                let user = twitterUser.startsWith('@') ? twitterUser : '@' + twitterUser;
                code += `<meta name="twitter:site" content="${user}">\n`;
                // Often creator is same as site, or optional. Let's just put site for simplicity or assume it covers it.
            }
            // Twitter title/desc/image fallbacks to og: tags usually, but it's good practice to rely on og tags or exclude if redundancy is not wanted.
            // Google/Twitter recommend using og:title etc. and only adding twitter:card. 
            // However, some people explicitly want twitter:title. 
            // Let's stick to minimal recommended set: twitter:card, twitter:site. 
            // The OGP tags cover content.
        }

        codeOutput.value = code;


        // --- Update Counts ---
        const len = desc.length;
        descCount.textContent = `${len} / 120 (推奨)`;
        if (len > 120) {
            descCount.classList.add('over');
        } else {
            descCount.classList.remove('over');
        }
    }

    // Copy Function
    copyBtn.addEventListener('click', () => {
        const code = codeOutput.value;
        if (!code) return;

        navigator.clipboard.writeText(code).then(() => {
            showToast();
        }).catch(err => {
            console.error('Copy failed', err);
            // Fallback for older browsers or non-secure context if needed, but navigator.clipboard is standard now for modern tools.
            codeOutput.select();
            document.execCommand('copy');
            showToast();
        });
    });

    function showToast() {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    // Attach Listeners
    const inputs = [pageTitleInput, pageDescInput, pageUrlInput, siteNameInput, ogpImageInput, twitterSiteInput, excludeTwitterCheckbox];
    inputs.forEach(input => {
        input.addEventListener('input', update);
        input.addEventListener('change', update); // for checkbox
    });

    cardTypeRadios.forEach(radio => {
        radio.addEventListener('change', update);
    });

    // Initialize
    update();
});
