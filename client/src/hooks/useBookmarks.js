import { useState, useEffect } from 'react';

const STORAGE_KEY = 'fxpulse_bookmarked_currencies';
const DEFAULT_BOOKMARKS = ['USD', 'EUR', 'GBP', 'JPY'];

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse bookmarks from storage', e);
    }
    return DEFAULT_BOOKMARKS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    } catch (e) {
      console.warn('Failed to save bookmarks to storage', e);
    }
  }, [bookmarks]);

  const toggleBookmark = (code) => {
    if (!code) return;
    setBookmarks((prev) => {
      if (prev.includes(code)) {
        return prev.filter((c) => c !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  const addBookmark = (code) => {
    if (!code) return;
    setBookmarks((prev) => (prev.includes(code) ? prev : [...prev, code]));
  };

  const removeBookmark = (code) => {
    if (!code) return;
    setBookmarks((prev) => prev.filter((c) => c !== code));
  };

  const isBookmarked = (code) => {
    return bookmarks.includes(code);
  };

  return {
    bookmarks,
    toggleBookmark,
    addBookmark,
    removeBookmark,
    isBookmarked
  };
}
