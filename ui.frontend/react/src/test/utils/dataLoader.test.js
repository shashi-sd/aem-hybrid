/**
 * @jest-environment jsdom
 */

import { loadPageData, loadServiceData } from '../../utils/dataLoader';

describe('dataLoader', () => {
  const okResponse = (body) => Promise.resolve({ ok: true, json: () => Promise.resolve(body) });
  const failResponse = () => Promise.resolve({ ok: false, json: () => Promise.resolve({}) });

  beforeEach(() => {
    global.fetch = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete global.fetch;
  });

  describe('loadPageData', () => {
    test('fetches mock page data on local dev', async () => {
      global.fetch.mockImplementation(() => okResponse({ components: [1] }));
      await expect(loadPageData(true, '/page.pagedata.json')).resolves.toEqual({ components: [1] });
      expect(global.fetch).toHaveBeenCalledWith('/mock/page-data.json');
    });

    test('fetches the page JSON url outside local dev', async () => {
      global.fetch.mockImplementation(() => okResponse({ components: [2] }));
      await expect(loadPageData(false, '/page.pagedata.json')).resolves.toEqual({ components: [2] });
      expect(global.fetch).toHaveBeenCalledWith('/page.pagedata.json');
    });

    test('returns {} and logs when the response is not ok', async () => {
      global.fetch.mockImplementation(failResponse);
      await expect(loadPageData(false, '/page.pagedata.json')).resolves.toEqual({});
      expect(console.error).toHaveBeenCalled();
    });

    test('returns {} when fetch rejects', async () => {
      global.fetch.mockImplementation(() => Promise.reject(new Error('network')));
      await expect(loadPageData(false, '/page.pagedata.json')).resolves.toEqual({});
    });
  });

  describe('loadServiceData', () => {
    test('fetches mock service data on local dev', async () => {
      global.fetch.mockImplementation(() => okResponse({ components: [3] }));
      await expect(loadServiceData(true, '/page.servicedata.json')).resolves.toEqual({ components: [3] });
      expect(global.fetch).toHaveBeenCalledWith('/mock/service-data.json');
    });

    test('fetches the service JSON url outside local dev', async () => {
      global.fetch.mockImplementation(() => okResponse({ components: [4] }));
      await expect(loadServiceData(false, '/page.servicedata.json')).resolves.toEqual({ components: [4] });
      expect(global.fetch).toHaveBeenCalledWith('/page.servicedata.json');
    });

    test('returns {} without logging when the service response is not ok', async () => {
      global.fetch.mockImplementation(failResponse);
      await expect(loadServiceData(false, '/page.servicedata.json')).resolves.toEqual({});
      expect(console.error).not.toHaveBeenCalled();
    });

    test('returns {} when fetch rejects', async () => {
      global.fetch.mockImplementation(() => Promise.reject(new Error('network')));
      await expect(loadServiceData(false, '/page.servicedata.json')).resolves.toEqual({});
    });
  });
});
