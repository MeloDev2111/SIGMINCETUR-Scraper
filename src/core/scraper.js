
const client = require('./client');

class LocationData {
    constructor(nombre, provincia, ubigeo, longitud, latitud, extraProps) {
        this.nombre = nombre;
        this.provincia = provincia;
        this.ubigeo = ubigeo;
        this.longitud = longitud;
        this.latitud = latitud;
        // Keep other properties if needed for the enriched dataset
        Object.assign(this, extraProps);
    }
}

/**
 * Main scraper function
 * @param {string} ubigeoCode - Region code (e.g. "02")
 * @param {object} options - { province: string }
 */
async function scrape(ubigeoCode, options = {}) {
    console.log(`[Scraper] Fetching data for Ubigeo: ${ubigeoCode}`);
    const rawData = await client.fetchScraperData(ubigeoCode);

    if (!rawData || !rawData.features) {
        throw new Error("Invalid API response: 'features' array missing");
    }

    let locations = rawData.features.map(f => f.properties);

    // 1. Clean: Remove items with null coordinates
    locations = locations.filter(loc => loc.x && loc.y);

    // 2. Filter: Apply generic filters (e.g. Province)
    if (options.province) {
        const targetProv = options.province.toUpperCase();
        locations = locations.filter(loc =>
            loc.desprov && loc.desprov.toUpperCase().includes(targetProv)
        );
    }

    // 3. Transform: Standardize object structure
    const cleanedData = locations.map(element => {
        // Map original fields to a clean structure, but keep everything available
        return new LocationData(
            element.nombre,
            element.desprov,
            element.desubigeo, // This seems to be the Province/District name in some contexts, strictly it's 'desubigeo'
            element.x,
            element.y,
            element // Spread original props to keep data rich
        );
    });

    console.log(`[Scraper] Processed ${cleanedData.length} locations.`);
    return cleanedData;
}

module.exports = { scrape };
