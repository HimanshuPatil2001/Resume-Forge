import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly PREFIX = 'resumeforge_';

  getItem<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(this.PREFIX + key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error(`[StorageService] Error reading key ${key}:`, e);
      return null;
    }
  }

  setItem<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`[StorageService] Error writing key ${key}:`, e);
      return false;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(this.PREFIX + key);
    } catch (e) {
      console.error(`[StorageService] Error removing key ${key}:`, e);
    }
  }

  clear(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.error('[StorageService] Error clearing items:', e);
    }
  }
}
