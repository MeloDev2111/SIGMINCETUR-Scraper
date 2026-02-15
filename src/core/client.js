// using native fetch (Node 18+)
const BASE_URL = 'https://sigmincetur.mincetur.gob.pe/turismo';

/**
 * Helper to make GET requests
 */
async function get(path) {
    const url = `${BASE_URL}${path}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        throw new Error(`Network Error (GET ${path}): ${error.message}`);
    }
}

/**
 * Helper to make POST requests
 */
async function post(path, body) {
    const url = `${BASE_URL}${path}`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            throw new Error(`POST ${url} failed: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        throw new Error(`Network Error (POST ${path}): ${error.message}`);
    }
}

module.exports = {
    /**
     * Fetch all regions (Ubigeo Level 1)
     */
    getRegions: async () => {
        // Based on provided curl: { "CodUbigeo": "", "Nivel": "1", "Opr": "1" }
        return post('/api/ubigeo/traeListUbigeo', { "CodUbigeo": "", "Nivel": "1", "Opr": "1" });
    },

    /**
     * Fetch metadata for departments (contains Lat/Lng)
     */
    getDepartmentMetadata: async () => {
        return get('/resource/js/json/ubigeo.Departamentos.json');
    },

    /**
     * Fetch metadata for provinces
     */
    getProvinceMetadata: async () => {
        return get('/resource/js/json/ubigeo.Provincias.json');
    },

    /**
     * Fetch main scraper data for a specific Ubigeo
     * @param {string} ubigeoCode - Region string code (e.g. "02")
     */
    fetchScraperData: async (ubigeoCode) => {
        // Original URL: .../sistema/consulta/selectData2.ashx?ubigeo=02
        // We might need to handle other query params later, but start with ubigeo
        const query = `?ubigeo=${ubigeoCode}`;
        return get(`/sistema/consulta/selectData2.ashx${query}`);
    }
};
