'use client';

import { useCallback, useRef, useEffect } from 'react';

interface TurnstileWidgetProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (el: string | HTMLElement, opts: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

export default function TurnstileWidget({ siteKey, onVerify, onError }: TurnstileWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const scriptLoaded = useRef(false);

  const renderWidget = useCallback(() => {
    if (!widgetRef.current || !window.turnstile) return;

    if (widgetIdRef.current) {
      window.turnstile.reset(widgetIdRef.current);
    }

    widgetIdRef.current = window.turnstile.render(widgetRef.current, {
      sitekey: siteKey,
      theme: 'dark',
      size: 'normal',
      callback: (token: string) => {
        onVerify(token);
      },
      'error-callback': () => {
        onError?.();
      },
    });
  }, [siteKey, onVerify, onError]);

  useEffect(() => {
    if (scriptLoaded.current && window.turnstile) {
      renderWidget();
      return;
    }

    // Avoid double-loading the script
    if (document.querySelector('script[src*="turnstile"]')) {
      scriptLoaded.current = true;
      // Wait a tick for turnstile to be ready
      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          renderWidget();
        }
      }, 200);
      return () => clearInterval(interval);
    }

    window.onTurnstileLoad = () => {
      scriptLoaded.current = true;
      renderWidget();
    };

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      delete window.onTurnstileLoad;
    };
  }, [renderWidget]);

  return <div ref={widgetRef} />;
}
