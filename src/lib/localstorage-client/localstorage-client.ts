import { toast } from 'sonner';

export const LocalstorageClient = {
  setData<T>({ key, value }: { key: string; value: T }) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      toast.error(`Error saving data for ${key}`);
      console.log(e);
    }
  },

  getData<T>({ key }: { key: string }): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch (e) {
      toast.error(`Error getting data for ${key}`);
      console.log(e);
      return null;
    }
  },
};
