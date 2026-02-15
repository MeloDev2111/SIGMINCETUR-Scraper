// using native fetch (Node 18+)
const FormData = require('form-data');

async function uploadToTuriApp(data) {
    const url = process.env.TURI_APP_URL || 'http://127.0.0.1:5000/files';
    console.log(`Uploading to: ${url}`);

    // Convert data to JSON string
    const dataStr = JSON.stringify(data);
    const buffer = Buffer.from(dataStr, 'utf-8');

    try {
        const form = new FormData();
        form.append('file', buffer, { filename: 'data.json', contentType: 'application/json' });

        const response = await fetch(url, {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }
        return await response.text();

    } catch (error) {
        throw new Error(`Connection to TuriApp Service failed: ${error.message}`);
    }
}

module.exports = { uploadToTuriApp };
