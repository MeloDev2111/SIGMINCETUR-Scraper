const fs = require('fs');
const path = require('path');
const { ensureDirectoryExistence } = require('../src/core/utils');

describe('ensureDirectoryExistence', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should create directory if it does not exist', () => {
        const filePath = path.join('path', 'to', 'file.json');
        const dirPath = path.dirname(filePath);

        jest.spyOn(fs, 'existsSync').mockReturnValue(false);
        const mkdirSpy = jest.spyOn(fs, 'mkdirSync').mockImplementation(() => { });

        ensureDirectoryExistence(filePath);

        expect(mkdirSpy).toHaveBeenCalledWith(dirPath, { recursive: true });
    });

    it('should verify directory existence if it exists', () => {
        const filePath = path.join('path', 'to', 'existing', 'file.json');

        jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        const mkdirSpy = jest.spyOn(fs, 'mkdirSync').mockImplementation(() => { });

        ensureDirectoryExistence(filePath);

        expect(mkdirSpy).not.toHaveBeenCalled();
    });
});
