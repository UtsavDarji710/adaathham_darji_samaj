"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Download, X, Share, PlusSquare, Sparkles, Smartphone, CheckCircle } from "lucide-react";

export default function MobileAppInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Check if app is already running in standalone PWA mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      setIsInstalled(true);
      return; // Do not show banner if already running as installed application
    }

    // 2. Check if device is mobile (strictly show only on mobile devices)
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || "";
    const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent);
    const isSmallScreen = window.innerWidth <= 768;
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    const isMobile = (isMobileUA || isSmallScreen) && hasTouch;

    if (!isMobile) {
      return; // Strictly only show on mobile devices
    }

    // 3. Detect iOS specifically for custom Add-to-Home-Screen instructions
    const isAppleDevice = /iphone|ipad|ipod/i.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isAppleDevice);

    // 4. Check if user recently dismissed banner in this session
    const dismissed = sessionStorage.getItem("ad8_pwa_dismissed");
    if (dismissed === "true") {
      return;
    }

    // 5. Android / Chrome beforeinstallprompt event listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // For iOS or browsers that don't fire beforeinstallprompt on first load,
    // show banner after a small delay if on mobile
    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 1500);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback instruction for browsers where deferredPrompt is unavailable
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("ad8_pwa_dismissed", "true");
  };

  if (!showBanner || isInstalled) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom Mobile App Banner (Displays Strictly on Mobile) */}
      <div className="fixed bottom-3 left-3 right-3 z-50 md:hidden animate-in slide-in-from-bottom duration-300">
        <div className="bg-gradient-to-r from-charcoal-900 via-charcoal-800 to-saffron-950 text-white rounded-3xl p-3.5 sm:p-4 shadow-2xl border-2 border-saffron-500/50 flex items-center justify-between gap-3">
          {/* App Logo */}
          <div className="relative flex-shrink-0">
            <img
              src="/icon-192x192.png"
              alt="ADSS App"
              width={48}
              height={48}
              style={{ width: "48px", height: "48px", minWidth: "48px" }}
              className="w-12 h-12 object-contain rounded-2xl bg-white p-0.5 shadow-md border border-saffron-400"
            />
            <span className="absolute -top-1 -right-1 bg-saffron-500 text-white p-0.5 rounded-full shadow-sm">
              <Sparkles className="w-2.5 h-2.5" />
            </span>
          </div>

          {/* Text Information */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-xs sm:text-sm text-white truncate leading-tight">
                ADSS ઍપ
              </h4>
              <span className="text-[9px] font-bold bg-saffron-500/30 text-saffron-300 px-1.5 py-0.2 rounded-full border border-saffron-400/40">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-charcoal-300 leading-tight mt-0.5 truncate">
              ADSS પોર્ટલ તમારા મોબાઇલમાં ઇન્સ્ટોલ કરો
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ઇન્સ્ટોલ</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-xl hover:bg-white/10 text-charcoal-400 hover:text-white transition-colors"
              title="બંધ કરો"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS / General Safari Add-To-Home-Screen Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-charcoal-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-ivory-300 p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-saffron-100 text-saffron-800">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-charcoal-900">
                    મોબાઇલમાં ઍપ ઇન્સ્ટોલ કરો
                  </h3>
                  <p className="text-[10px] text-charcoal-500">Add to Home Screen</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-charcoal-700">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-ivory-50 border border-ivory-200">
                <span className="w-6 h-6 rounded-full bg-saffron-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  ૧
                </span>
                <div>
                  <p className="font-bold text-charcoal-900">બ્રાઉઝરના &lsquo;Share&rsquo; બટન પર ટેપ કરો</p>
                  <p className="text-[11px] text-charcoal-500 mt-0.5 flex items-center gap-1">
                    નીચે અથવા ઉપર આપેલા <Share className="w-3.5 h-3.5 text-blue-600 inline" /> આઇકન પર ક્લિક કરો.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-ivory-50 border border-ivory-200">
                <span className="w-6 h-6 rounded-full bg-saffron-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  ૨
                </span>
                <div>
                  <p className="font-bold text-charcoal-900">&lsquo;Add to Home Screen&rsquo; પસંદ કરો</p>
                  <p className="text-[11px] text-charcoal-500 mt-0.5 flex items-center gap-1">
                    મેનુમાંથી <PlusSquare className="w-3.5 h-3.5 text-forest-700 inline" /> &lsquo;હોમ સ્ક્રીન પર ઉમેરો&rsquo; પર ક્લિક કરો.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-forest-50 border border-forest-200 text-forest-900 text-[11px] flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-forest-600 flex-shrink-0" />
                <span>હવે ઍપ તમારા મોબાઇલમાં સીધી ઉપલબ્ધ થઈ જશે!</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowIOSModal(false);
                setShowBanner(false);
                sessionStorage.setItem("ad8_pwa_dismissed", "true");
              }}
              className="w-full py-2.5 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              સમજાઈ ગયું (Done)
            </button>
          </div>
        </div>
      )}
    </>
  );
}

