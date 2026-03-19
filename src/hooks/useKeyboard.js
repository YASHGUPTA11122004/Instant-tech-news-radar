import { useEffect } from "react";

/**
 * Keyboard shortcuts:
 *  J → next story
 *  K → previous story
 *  O → open current story in new tab
 *  C → open comments in new tab
 *  / → focus search bar
 */
export default function useKeyboard(stories, searchRef) {
  useEffect(() => {
    let currentIndex = -1;

    function handler(e) {
      // Skip if user is typing in an input
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA"
      ) return;

      switch (e.key) {
        case "j":
        case "J":
          currentIndex = Math.min(currentIndex + 1, stories.length - 1);
          scrollToStory(currentIndex);
          break;

        case "k":
        case "K":
          currentIndex = Math.max(currentIndex - 1, 0);
          scrollToStory(currentIndex);
          break;

        case "o":
        case "O":
          if (currentIndex >= 0 && stories[currentIndex]) {
            window.open(stories[currentIndex].url, "_blank", "noopener");
          }
          break;

        case "c":
        case "C":
          if (currentIndex >= 0 && stories[currentIndex]) {
            window.open(stories[currentIndex].hnUrl, "_blank", "noopener");
          }
          break;

        case "/":
          e.preventDefault();
          searchRef?.current?.focus();
          break;

        default:
          break;
      }
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [stories, searchRef]);
}

function scrollToStory(index) {
  const cards = document.querySelectorAll("article.news-card");
  if (cards[index]) {
    cards[index].scrollIntoView({ behavior: "smooth", block: "center" });
    cards[index].classList.add("keyboard-active");
    setTimeout(() => cards[index].classList.remove("keyboard-active"), 800);
  }
}
