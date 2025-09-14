/**
 * Safe localStorage utility with error handling and in-memory fallback
 * All functions fail silently and use in-memory storage when localStorage is unavailable
 */

type StorageValue = string | number | boolean | object | null;

// In-memory fallback storage
const memoryStorage = new Map<string, string>();
let isLocalStorageChecked = false;
let localStorageAvailable = false;

/**
 * Check if localStorage is available and accessible (cached result)
 */
function isLocalStorageAvailable(): boolean {
  if (!isLocalStorageChecked) {
    if (typeof window === 'undefined') {
      localStorageAvailable = false;
    } else {
      try {
        const testKey = '__localStorage_test__';
        window.localStorage.setItem(testKey, 'test');
        window.localStorage.removeItem(testKey);
        localStorageAvailable = true;
      } catch {
        localStorageAvailable = false;
      }
    }
    isLocalStorageChecked = true;
  }
  return localStorageAvailable;
}

/**
 * Initialize memory storage with existing localStorage data
 */
function initializeMemoryFromLocalStorage(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key !== null) {
        const value = window.localStorage.getItem(key);
        if (value !== null) {
          memoryStorage.set(key, value);
        }
      }
    }
  } catch {
    // Silently fail
  }
}

// Initialize memory storage on module load
if (typeof window !== 'undefined') {
  initializeMemoryFromLocalStorage();
}

/**
 * Safely get an item from localStorage or memory fallback
 * Returns null if key doesn't exist
 */
function getItem(key: string): string | null {
  // Try localStorage first
  if (isLocalStorageAvailable()) {
    try {
      const value = window.localStorage.getItem(key);
      // Sync to memory if found
      if (value !== null) {
        memoryStorage.set(key, value);
      }
      return value;
    } catch {
      // Fall through to memory storage
    }
  }

  // Use memory storage as fallback
  return memoryStorage.get(key) ?? null;
}

/**
 * Safely get and parse a JSON item from localStorage
 * Returns the default value if key doesn't exist, parsing fails, or localStorage is unavailable
 */
function getJSONItem<T>(key: string, defaultValue: T): T {
  const item = getItem(key);
  
  if (item === null) {
    return defaultValue;
  }

  try {
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely set an item in localStorage and memory storage
 * Always stores in memory, attempts localStorage when available
 */
function setItem(key: string, value: StorageValue): void {
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  
  // Always store in memory
  memoryStorage.set(key, stringValue);

  // Try to store in localStorage
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.setItem(key, stringValue);
    } catch {
      // Silently fail - could be quota exceeded or other storage issues
      // Data is still available in memory
    }
  }
}

/**
 * Safely remove an item from localStorage and memory storage
 */
function removeItem(key: string): void {
  // Always remove from memory
  memoryStorage.delete(key);

  // Try to remove from localStorage
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Silently fail
    }
  }
}

/**
 * Safely clear all localStorage and memory storage
 */
function clear(): void {
  // Always clear memory
  memoryStorage.clear();

  // Try to clear localStorage
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.clear();
    } catch {
      // Silently fail
    }
  }
}

/**
 * Get all keys from storage (localStorage and memory combined)
 */
function getAllKeys(): string[] {
  const keys = new Set<string>();

  // Add keys from localStorage
  if (isLocalStorageAvailable()) {
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key !== null) {
          keys.add(key);
        }
      }
    } catch {
      // Silently fail and fall back to memory keys
    }
  }

  // Add keys from memory storage
  for (const key of memoryStorage.keys()) {
    keys.add(key);
  }

  return Array.from(keys);
}

/**
 * Get the approximate size of storage usage in bytes
 * Includes both localStorage and memory storage
 */
function getStorageSize(): number {
  let total = 0;

  // Add localStorage size
  if (isLocalStorageAvailable()) {
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key !== null) {
          const value = window.localStorage.getItem(key);
          if (value !== null) {
            total += key.length + value.length;
          }
        }
      }
    } catch {
      // Silently fail and fall back to memory size only
    }
  }

  // Add memory storage size
  for (const [key, value] of memoryStorage.entries()) {
    total += key.length + value.length;
  }

  return total;
}

/**
 * Check if a key exists in storage (localStorage or memory)
 */
function hasItem(key: string): boolean {
  // Check localStorage first
  if (isLocalStorageAvailable()) {
    try {
      if (window.localStorage.getItem(key) !== null) {
        return true;
      }
    } catch {
      // Fall through to memory check
    }
  }

  // Check memory storage
  return memoryStorage.has(key);
}

/**
 * Sync memory storage to localStorage when it becomes available
 * Useful for when localStorage was initially unavailable but becomes available later
 */
function syncMemoryToLocalStorage(): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    for (const [key, value] of memoryStorage.entries()) {
      window.localStorage.setItem(key, value);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the current storage mode being used
 */
function getStorageMode(): 'localStorage' | 'memory' | 'both' {
  if (isLocalStorageAvailable()) {
    return memoryStorage.size > 0 ? 'both' : 'localStorage';
  }
  return 'memory';
}

/**
 * Get statistics about storage usage
 */
function getStorageStats(): {
  mode: 'localStorage' | 'memory' | 'both';
  memoryKeys: number;
  localStorageKeys: number;
  totalSize: number;
  isLocalStorageAvailable: boolean;
} {
  let localStorageKeys = 0;
  
  if (isLocalStorageAvailable()) {
    try {
      localStorageKeys = window.localStorage.length;
    } catch {
      // Silently fail
    }
  }

  return {
    mode: getStorageMode(),
    memoryKeys: memoryStorage.size,
    localStorageKeys,
    totalSize: getStorageSize(),
    isLocalStorageAvailable: isLocalStorageAvailable(),
  };
}

// Export all functions as a single object and individually
export const localStorage = {
  isAvailable: isLocalStorageAvailable,
  getItem,
  getJSONItem,
  setItem,
  removeItem,
  clear,
  getAllKeys,
  getStorageSize,
  hasItem,
  syncMemoryToLocalStorage,
  getStorageMode,
  getStorageStats,
};

export {
  isLocalStorageAvailable,
  getItem,
  getJSONItem,
  setItem,
  removeItem,
  clear,
  getAllKeys,
  getStorageSize,
  hasItem,
  syncMemoryToLocalStorage,
  getStorageMode,
  getStorageStats,
};