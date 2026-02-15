
const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config(); // Load environment variables

const client = require('../core/client');
const scraper = require('../core/scraper');
const adapter = require('../core/turi_adapter');
const uploader = require('../core/uploader');
const { ensureDirectoryExistence } = require('../core/utils');

const app = express();
const PORT = process.env.PORT || 3000;

// Increase body size limit to handle large scrape datasets
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


// ...

// API: Upload to TuriApp
app.post('/api/upload-turiapp', async (req, res) => {
    const { data } = req.body;
    if (!data || !Array.isArray(data)) {
        return res.status(400).json({ error: "Valid data array is required" });
    }

    try {
        const adaptedData = adapter.adaptForTuriApp(data);

        // Save to data/sent/data.json
        const sentPath = path.join(process.cwd(), 'data', 'sent', 'data.json');
        ensureDirectoryExistence(sentPath);
        fs.writeFileSync(sentPath, JSON.stringify(adaptedData, null, 2));

        const response = await uploader.uploadToTuriApp(adaptedData);
        res.json({ success: true, message: "Uploaded to TuriApp", serviceResponse: response });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// API: Get Regions
app.get('/api/regions', async (req, res) => {
    try {
        const regions = await client.getRegions();
        // Return simplified list: { code: "02", name: "ANCASH" }
        const simplified = regions.map(r => ({
            code: r.CodUbigeo.substring(0, 2),
            name: r.DesDepa
        }));
        res.json(simplified);
    } catch (error) {
        console.error('Error fetching regions:', error);
        res.status(500).json({ error: error.message });
    }
});

// API: Scrape
app.post('/api/scrape', async (req, res) => {
    const { region, province } = req.body;
    if (!region) {
        return res.status(400).json({ error: "Region code is required" });
    }

    try {
        const data = await scraper.scrape(region, { province });

        // Save to data/raw/data.json automatically
        const rawPath = path.join(process.cwd(), 'data', 'raw', 'data.json');
        ensureDirectoryExistence(rawPath);
        fs.writeFileSync(rawPath, JSON.stringify(data, null, 2));
        console.log(`Saved ${data.length} items to ${rawPath}`);

        res.json({
            success: true,
            count: data.length,
            data: data,
            savedPath: rawPath
        });
    } catch (error) {
        console.error('Scrape error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
