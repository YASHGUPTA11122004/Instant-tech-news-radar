import { useState, useEffect } from "react";

const KEY = "itnr_bookmarks";

export default function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  function toggle(story) {
    setBookmarks((prev) => {
      const exists = prev.find((b) => b.id === story.id);
      if (exists) return prev.filter((b) => b.id !== story.id);
      return [story, ...prev];
    });
  }

  function isBookmarked(id) {
    return bookmarks.some((b) => b.id === id);
  }

  return { bookmarks, toggle, isBookmarked };
}
