import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LocalstorageClient } from './localstorage-client';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('LocalstorageClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('setData', () => {
    it('should store data in localStorage', () => {
      const testData = { name: 'John', age: 30 };
      
      LocalstorageClient.setData({ key: 'user', value: testData });
      
      expect(localStorage.getItem('user')).toBe(JSON.stringify(testData));
    });

    it('should store string data', () => {
      const testData = 'hello world';
      
      LocalstorageClient.setData({ key: 'message', value: testData });
      
      expect(localStorage.getItem('message')).toBe(JSON.stringify(testData));
    });

    it('should store array data', () => {
      const testData = [1, 2, 3, 4];
      
      LocalstorageClient.setData({ key: 'numbers', value: testData });
      
      expect(localStorage.getItem('numbers')).toBe(JSON.stringify(testData));
    });

    it('should handle localStorage errors gracefully', () => {
      const mockSetItem = vi.spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => {
          throw new Error('Storage quota exceeded');
        });

      LocalstorageClient.setData({ key: 'test', value: 'data' });

      expect(toast.error).toHaveBeenCalledWith('Error saving data for test');
      expect(console.log).toHaveBeenCalled();
      
      mockSetItem.mockRestore();
    });
  });

  describe('getData', () => {
    it('should retrieve stored data', () => {
      const testData = { name: 'Jane', age: 25 };
      localStorage.setItem('user', JSON.stringify(testData));
      
      const result = LocalstorageClient.getData<typeof testData>({ key: 'user' });
      
      expect(result).toEqual(testData);
    });

    it('should return null for non-existent key', () => {
      const result = LocalstorageClient.getData({ key: 'nonexistent' });
      
      expect(result).toBeNull();
    });

    it('should retrieve string data', () => {
      const testData = 'hello world';
      localStorage.setItem('message', JSON.stringify(testData));
      
      const result = LocalstorageClient.getData<string>({ key: 'message' });
      
      expect(result).toBe(testData);
    });

    it('should retrieve array data', () => {
      const testData = [1, 2, 3, 4];
      localStorage.setItem('numbers', JSON.stringify(testData));
      
      const result = LocalstorageClient.getData<number[]>({ key: 'numbers' });
      
      expect(result).toEqual(testData);
    });

    it('should handle JSON parse errors gracefully', () => {
      localStorage.setItem('corrupted', 'invalid json');
      
      const result = LocalstorageClient.getData({ key: 'corrupted' });
      
      expect(result).toBeNull();
      expect(toast.error).toHaveBeenCalledWith('Error getting data for corrupted');
      expect(console.log).toHaveBeenCalled();
    });

    it('should handle localStorage getItem errors gracefully', () => {
      const mockGetItem = vi.spyOn(Storage.prototype, 'getItem')
        .mockImplementation(() => {
          throw new Error('Storage access denied');
        });

      const result = LocalstorageClient.getData({ key: 'test' });

      expect(result).toBeNull();
      expect(toast.error).toHaveBeenCalledWith('Error getting data for test');
      expect(console.log).toHaveBeenCalled();
      
      mockGetItem.mockRestore();
    });

    it('should return null for empty string value', () => {
      localStorage.setItem('empty', '');
      
      const result = LocalstorageClient.getData({ key: 'empty' });
      
      expect(result).toBeNull();
    });
  });
});