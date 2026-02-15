const client = require('../src/core/client');

global.fetch = jest.fn();

describe('SIGMINCETUR Client', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    it('should fetch regions', async () => {
        const mockResponse = { ok: true, json: async () => [{ CodUbigeo: '01', DesDepa: 'AMAZONAS' }] };
        fetch.mockResolvedValue(mockResponse);

        const result = await client.getRegions();
        expect(result).toEqual([{ CodUbigeo: '01', DesDepa: 'AMAZONAS' }]);
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/ubigeo/traeListUbigeo'), expect.anything());
    });

    it('should handle fetch errors', async () => {
        fetch.mockResolvedValue({ ok: false, status: 500, statusText: 'Internal Server Error' });
        await expect(client.getRegions()).rejects.toThrow('POST');
    });
});
