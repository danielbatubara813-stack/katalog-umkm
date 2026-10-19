"use client";

import { useEffect, useState } from "react";

export default function InstalasiPWA() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsIOS(/iphone|ipad|ipod/i.test(window.navigator.userAgent));
    setInstalled(
      window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
    );

    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setInstallPrompt(event);
    }

    function handleAppInstalled() {
      setInstalled(true);
      setInstallPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function pasangAplikasi() {
    if (!installPrompt) return;

    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  if (installed) return null;

  return (
    <div className="flex items-center gap-3">
      {installPrompt && (
        <button
          type="button"
          onClick={pasangAplikasi}
          className="rounded-lg bg-utama px-3 py-2 text-sm font-semibold text-white hover:bg-utama-gelap"
        >
          Install App
        </button>
      )}
      {!installPrompt && (
        <details className="relative">
          <summary className="cursor-pointer text-sm font-semibold text-utama">
            Cara memasang
          </summary>
          <p className="absolute right-0 z-10 mt-2 w-64 rounded-xl border border-garis bg-latar p-3 text-sm text-teks shadow-lg">
            {isIOS
              ? "Di Safari, ketuk Bagikan lalu pilih Tambahkan ke Layar Utama."
              : "Buka menu browser, lalu pilih Instal aplikasi atau Tambahkan ke layar utama jika tersedia."}
          </p>
        </details>
      )}
    </div>
  );
}
