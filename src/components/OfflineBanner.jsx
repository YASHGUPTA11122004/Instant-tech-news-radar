import { useState, useEffect } from "react";

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    function goOnline() {
      setIsOnline(true);
      if (wasOffline) {
        setShowBack(true);
        setTimeout(() => {
          setShowBack(false);
          setWasOffline(false);
        }, 3000);
      }
    }

    function goOffline() {
      setIsOnline(false);
      setWasOffline(true);
    }

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [wasOffline]);

  if (isOnline && !showBack) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-[100] flex items-center
                     justify-center gap-2 py-2 text-xs font-bold tracking-widest
                     uppercase transition-all duration-500
                     ${isOnline
                       ? "bg-emerald-500/90 text-emerald-950"
                       : "bg-red-500/90 text-white"
                     }`}>
      <span className={`w-2 h-2 rounded-full ${
        isOnline ? "bg-emerald-900" : "bg-white animate-pulse"
      }`} />
      {isOnline ? "Back Online" : "You are offline — showing cached data"}
    </div>
  );
}
