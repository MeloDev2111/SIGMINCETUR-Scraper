
document.addEventListener('DOMContentLoaded', async () => {
    const regionSelect = document.getElementById('region-select');
    const scrapeBtn = document.getElementById('scrape-btn');
    const outputArea = document.getElementById('output-area');
    const logContent = document.getElementById('log-content');
    const downloadContainer = document.getElementById('download-container');

    // Load Regions
    try {
        const res = await fetch('/api/regions');
        const regions = await res.json();
        regions.forEach(r => {
            const option = document.createElement('option');
            option.value = r.code;
            option.textContent = r.name;
            regionSelect.appendChild(option);
        });
    } catch (e) {
        log('Error loading regions: ' + e.message, 'error');
    }

    scrapeBtn.addEventListener('click', async () => {
        const region = regionSelect.value;
        const province = document.getElementById('province-input').value;
        const upload = document.getElementById('upload-check').checked;

        if (!region) {
            alert('Please select a region');
            return;
        }

        setLoading(true);
        clearLog();
        log(`Scraping Region: ${region} (Province Filter: ${province || 'None'})...`);

        try {
            // 1. Scrape
            const scrapeRes = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ region, province })
            });
            const scrapeResult = await scrapeRes.json();

            if (!scrapeResult.success) {
                throw new Error(scrapeResult.error || 'Scrape failed');
            }

            log(`Scrape successful! Found ${scrapeResult.count} items.`, 'valid');

            // Show download link
            const blob = new Blob([JSON.stringify(scrapeResult.data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `data_${region}.json`;
            a.textContent = `Download JSON (${scrapeResult.count} items)`;
            a.className = 'download-link';
            downloadContainer.innerHTML = '';
            downloadContainer.appendChild(a);

            // 2. Upload (if selected)
            if (upload) {
                log('Uploading to TuriApp...', 'info');
                const uploadRes = await fetch('/api/upload-turiapp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: scrapeResult.data })
                });
                const uploadResult = await uploadRes.json();

                if (uploadResult.success) {
                    log(`Upload successful! Service response: ${uploadResult.serviceResponse}`, 'valid');
                } else {
                    log(`Upload failed: ${uploadResult.error}`, 'error');
                }
            }

        } catch (error) {
            log(error.message, 'error');
        } finally {
            setLoading(false);
        }
    });

    function log(msg, type = 'info') {
        outputArea.style.display = 'block';
        const div = document.createElement('div');
        div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        if (type === 'error') div.style.color = '#ff6b6b';
        if (type === 'valid') div.style.color = '#51cf66';
        logContent.appendChild(div);
        logContent.scrollTop = logContent.scrollHeight;
    }

    function clearLog() {
        logContent.innerHTML = '';
        downloadContainer.innerHTML = '';
        outputArea.style.display = 'none';
    }

    function setLoading(isLoading) {
        scrapeBtn.disabled = isLoading;
        scrapeBtn.textContent = isLoading ? 'Processing...' : 'Start Scraper';
    }
});
