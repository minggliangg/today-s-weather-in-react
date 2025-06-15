import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NetworkError } from '@/common/custom-errors';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocking
import { ApiClient } from './api-client';

describe('ApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('get', () => {
    it('should make successful GET request', async () => {
      const mockResponse = { data: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const params = new Map([['q', 'London']]);
      const result = await ApiClient.get('test-path', params);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      
      const callUrl = mockFetch.mock.calls[0][0];
      const urlString = callUrl instanceof URL ? callUrl.toString() : callUrl;
      expect(urlString).toContain('test-path');
      expect(urlString).toContain('q=London');
    });

    it('should handle URL encoding of parameters', async () => {
      const mockResponse = { data: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const params = new Map([['q', 'New York']]);
      await ApiClient.get('test-path', params);

      const callUrl = mockFetch.mock.calls[0][0];
      const urlString = callUrl instanceof URL ? callUrl.toString() : callUrl;
      expect(urlString).toMatch(/q=New(\+|%20)York/);
    });

    it('should throw NetworkError when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const params = new Map();
      
      await expect(ApiClient.get('test-path', params)).rejects.toThrow(NetworkError);
    });

    it('should handle empty parameters', async () => {
      const mockResponse = { data: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const params = new Map();
      const result = await ApiClient.get('test-path', params);

      expect(result).toEqual(mockResponse);
      
      const callUrl = mockFetch.mock.calls[0][0];
      const urlString = callUrl instanceof URL ? callUrl.toString() : callUrl;
      expect(urlString).toContain('test-path');
    });

    it('should include API key in requests', async () => {
      const mockResponse = { data: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const params = new Map();
      await ApiClient.get('test-path', params);

      const callUrl = mockFetch.mock.calls[0][0];
      const urlString = callUrl instanceof URL ? callUrl.toString() : callUrl;
      expect(urlString).toContain('appid=');
    });

    it('should include default parameters', async () => {
      const mockResponse = { data: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const params = new Map();
      await ApiClient.get('test-path', params);

      const callUrl = mockFetch.mock.calls[0][0];
      const urlString = callUrl instanceof URL ? callUrl.toString() : callUrl;
      expect(urlString).toMatch(/units=metric/);
      expect(urlString).toMatch(/lang=en/);
    });

    it('should use correct headers', async () => {
      const mockResponse = { data: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const params = new Map();
      await ApiClient.get('test-path', params);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    });
  });
});