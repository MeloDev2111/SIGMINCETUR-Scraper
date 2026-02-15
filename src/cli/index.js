#!/usr/bin / env node
const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const client = require('../core/client');
const scraper = require('../core/scraper');
const adapter = require('../core/turi_adapter');
const uploader = require('../core/uploader');
const { ensureDirectoryExistence } = require('../core/utils');

async function resolveRegion(regionInput) {
    // If it's a 2-digit code, return it directly
    if (/^\d{2}$/.test(regionInput)) {
        return regionInput;
    }

    console.log(`Resolving region name: "${regionInput}"...`);
    const regions = await client.getRegions();

    // Normalize string: remove accents, uppercase
    const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    const target = normalize(regionInput);

    const match = regions.find(r =>
        r.DesDepa && normalize(r.DesDepa) === target
    );

    if (match) {
        console.log(`Found region: ${match.DesDepa} -> ${match.CodUbigeo}`);
        // CodUbigeo is usually 6 digits like "020000". We need the first 2 for the scraper query?
        // client.js comment: value passed to ?ubigeo=XY
        // Let's assume the first 2 digits are what's needed for the query param if it expects a Departament code.
        return match.CodUbigeo.substring(0, 2);
    }

    throw new Error(`Region "${regionInput}" not found.`);
}

yargs(hideBin(process.argv))
    .command(['$0 <region> [province] [upload]'], 'Scrape tourism data from SIGMINCETUR', (yargs) => {
        return yargs
            .positional('region', {
                describe: 'Region name or code',
                type: 'string'
            })
            .positional('province', {
                describe: 'Province filter (optional)',
                type: 'string',
                default: ''
            })
            .positional('upload', {
                describe: 'Set to "upload" to send data to TuriApp',
                type: 'string'
            })
            // Keep named options for direct usage
            .option('output', {
                alias: 'o',
                describe: 'Output file path',
                type: 'string',
                default: './data/raw/data.json'
            });
    }, async (argv) => {
        try {
            // Handle "upload" keyword in province slot if province omitted
            // e.g. "npm run scrape Ancash upload" -> argv.province = "upload"
            let province = argv.province;
            let doUpload = (argv.upload === 'upload'); // Positional 'upload'

            // Also check for the named option, if it was used
            if (argv['upload-to-turiapp']) {
                doUpload = true;
            }

            if (province && province.toLowerCase() === 'upload') {
                doUpload = true;
                province = ''; // Clear province if it was actually the upload keyword
            }

            const ubigeoCode = await resolveRegion(argv.region);

            // Scrape
            const data = await scraper.scrape(ubigeoCode, { province: province });

            // Save Full Data
            ensureDirectoryExistence(argv.output);
            fs.writeFileSync(argv.output, JSON.stringify(data, null, 2));
            console.log(`Successfully saved ${data.length} items to ${argv.output}`);

            // Upload if requested
            if (doUpload) {
                console.log('Preparing data for TuriApp upload...');
                const adaptedData = adapter.adaptForTuriApp(data);

                // Save Sent Data
                const sentPath = './data/sent/data.json';
                ensureDirectoryExistence(sentPath);
                fs.writeFileSync(sentPath, JSON.stringify(adaptedData, null, 2));
                console.log(`Saved adapted data to ${sentPath}`);

                console.log(`Uploading ${adaptedData.length} items to TuriApp...`);
                try {
                    const response = await uploader.uploadToTuriApp(adaptedData);
                    console.log('Upload successful!', response);
                } catch (e) {
                    console.error(`Upload failed:`, e.message);
                }
            }
        } catch (error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    })
    .demandCommand(1)
    .help()
    .argv;
