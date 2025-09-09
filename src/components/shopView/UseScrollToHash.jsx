import { useEffect } from "react";

const UseScrollToHash = () => {
  useEffect(() => {
    if (typeof window === "undefined") return; // Server side guard

    const hash = window.location.hash.replace("#", "");

    if (hash) {
      const interval = setInterval(() => {
        const section = document.getElementById(hash);
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
          clearInterval(interval); // mil gaya to stop
        }
      }, 100); // har 100ms me check karo

      // safety: agar 5 sec me nahi mila to stop
      setTimeout(() => {
        clearInterval(interval);
      }, 5000);
    }
  }, []);
};

export default UseScrollToHash;
