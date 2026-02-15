const fs = require('fs');
const path = require('path');

/**
 * Ensures that the directory for the given file path exists.
 * If it doesn't exist, it creates it recursively.
 * @param {string} filePath - The full path to the file.
 * @returns {boolean|void} - Returns true if exists, matches fs.mkdirSync behavior otherwise.
 */
function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    fs.mkdirSync(dirname, { recursive: true });
}

module.exports = {
    ensureDirectoryExistence
};
