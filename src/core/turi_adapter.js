
/**
 * Adapts the generic scraper data to the specific TuriApp format.
 * TuriApp expects: { nombre, provincia, ubigeo, longitud, latitud }
 * 
 * @param {Array} scraperData - The full dataset from the scraper
 * @returns {Array} - The transformed dataset
 */
function adaptForTuriApp(scraperData) {
    return scraperData.map(item => ({
        nombre: item.nombre,
        provincia: item.provincia, // 'desprov' in original, mapped to 'provincia' in scraper
        ubigeo: item.ubigeo,       // 'desubigeo' in original
        longitud: item.longitud,
        latitud: item.latitud
    }));
}

module.exports = { adaptForTuriApp };
